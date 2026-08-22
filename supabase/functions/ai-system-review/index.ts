// ============================================================================
// AI System Architecture Review
// Deploy: supabase functions deploy ai-system-review
// Security: JWT, rate limit, input validation, timeout, body size limit
// ============================================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  handleCors,
  getCorsHeaders,
  safeReadBody,
  sanitizeString,
  fetchWithTimeout,
  errorResponse,
  snakeToCamel,
} from "../_shared/cors.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_TIMEOUT_MS = 25000;
const MAX_INPUT_LENGTH = 50000;

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // 1. Only accept POST
    if (req.method !== "POST") {
      return errorResponse("Method not allowed", 405, req);
    }

    // 2. Verify JWT (double server check #1)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse("Missing authorization", 401, req);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401, req);
    }

    // 3. Rate limit check (double server check #2)
    const { data: rateOk } = await supabase.rpc("check_rate_limit", {
      p_user_id: user.id,
      p_endpoint: "ai-system-review",
      p_max_requests: 20,
      p_window_seconds: 60,
    });

    if (!rateOk) {
      return errorResponse("Rate limit exceeded. Try again later.", 429, req);
    }

    // 4. Parse and validate input with body size limit
    const bodyText = await safeReadBody(req);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(bodyText);
    } catch {
      return errorResponse("Invalid JSON", 400, req);
    }

    const { nodes, connections, targetRps, latencyBudgetMs, systemGoal } =
      parsed;

    if (!nodes || !Array.isArray(nodes)) {
      return errorResponse("Invalid nodes data: must be an array", 400, req);
    }

    if (nodes.length > 50) {
      return errorResponse("Too many nodes (max 50)", 400, req);
    }

    // 5. Check Gemini API key
    if (!GEMINI_API_KEY) {
      return errorResponse("AI service not configured", 503, req);
    }

    // 6. Build prompt with sanitized inputs
    const safeGoal = sanitizeString(systemGoal, 500);
    const prompt = `You are a Principal Backend Systems Architect at a high-scale tech enterprise.
Analyze this system architecture:
- Goal: ${safeGoal || "High-throughput backend"}
- Target RPS: ${typeof targetRps === "number" ? targetRps : 10000}
- Latency Budget: ${typeof latencyBudgetMs === "number" ? latencyBudgetMs : 50}ms
- Nodes: ${JSON.stringify(nodes).slice(0, 10000)}
- Connections: ${JSON.stringify(connections || []).slice(0, 10000)}

Return JSON with: rfcTitle, spofs[], concurrencyAnalysis, capTradeoffs, estimatedMonthlyCost, recommendations[], generatedCodeSnippet.`;

    // 7. Call Gemini API with timeout
    const response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
      GEMINI_TIMEOUT_MS
    );

    const geminiData = await response.json();
    const text =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const result = JSON.parse(text);

    // 8. Log AI usage (server-side only)
    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    await adminSupabase.from("ai_usage_log").insert({
      user_id: user.id,
      endpoint: "ai-system-review",
      tokens_used: geminiData?.usageMetadata?.totalTokenCount || 0,
      success: true,
    });

    return new Response(JSON.stringify(snakeToCamel(result)), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("AI system review error:", error);
    return errorResponse("AI review failed", 500, req);
  }
});
