// ============================================================================
// AI Lab Code Evaluator
// Deploy: supabase functions deploy ai-lab-evaluator
// Security: JWT, rate limit, pro access check, input validation, timeout
// Contract: { results: { id: string, passed: boolean, output: string }[], score: number }
// ============================================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  handleCors,
  getCorsHeaders,
  safeReadBody,
  sanitizeString,
  validateRequired,
  fetchWithTimeout,
  errorResponse,
  snakeToCamel,
} from "../_shared/cors.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_TIMEOUT_MS = 25000;
const MAX_CODE_LENGTH = 100000;

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    if (req.method !== "POST") {
      return errorResponse("Method not allowed", 405, req);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse("Missing authorization", 401, req);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401, req);
    }

    const { data: rateOk } = await supabase.rpc("check_rate_limit", {
      p_user_id: user.id,
      p_endpoint: "ai-lab-evaluator",
      p_max_requests: 15,
      p_window_seconds: 60,
    });

    if (!rateOk) {
      return errorResponse("Rate limit exceeded", 429, req);
    }

    const bodyText = await safeReadBody(req);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(bodyText);
    } catch {
      return errorResponse("Invalid JSON", 400, req);
    }

    const validationError = validateRequired(parsed, ["labId", "code"]);
    if (validationError) {
      return errorResponse(validationError, 400, req);
    }

    const labId = sanitizeString(parsed.labId, 100);
    const code = sanitizeString(parsed.code, MAX_CODE_LENGTH);

    // 1. Fetch lab with test_cases from DB (authoritative source, not client)
    const { data: lab } = await supabase
      .from("course_labs")
      .select("id, title, track_id, is_pro, test_cases")
      .eq("id", labId)
      .single();

    if (!lab) {
      return errorResponse("Lab not found", 404, req);
    }

    if (lab.is_pro) {
      const { data: userState } = await supabase
        .from("user_state")
        .select("tier")
        .eq("user_id", user.id)
        .single();

      if (!userState || userState.tier === "free") {
        return errorResponse("Pro access required", 403, req);
      }
    }

    if (!GEMINI_API_KEY) {
      return errorResponse("AI service not configured", 503, req);
    }

    // 2. Build test-case array from DB; fall back to single generic check
    const testCases: { id: string; description: string }[] =
      Array.isArray(lab.test_cases) && lab.test_cases.length > 0
        ? lab.test_cases.map((tc: Record<string, unknown>, i: number) => ({
            id: tc.id || `tc-${i + 1}`,
            description: tc.description || tc.name || `Test case ${i + 1}`,
          }))
        : [{ id: "tc-general", description: "Code compiles and runs without errors" }];

    const testCaseBlock = testCases
      .map((tc) => `- [${tc.id}] ${tc.description}`)
      .join("\n");

    // 3. Call Gemini for per-test-case evaluation
    const prompt = `You are a Senior Staff Code Reviewer for "Backend Forge".
Evaluate this student code for lab "${lab.title}" (Course: ${lab.track_id}).

Student Code:
\`\`\`
${code}
\`\`\`

For EACH test case below, determine if the student code passes it.
${testCaseBlock}

Return a JSON object with exactly this shape:
{
  "results": [
    { "id": "<test-case-id>", "passed": true/false, "output": "<brief explanation>" }
  ]
}

Rules:
- Return exactly one result entry per test case, using the same id.
- "output" should be a 1-2 sentence explanation of why it passed or failed.
- Be strict: partial correctness = failed for that case.
- Do NOT wrap in markdown; return raw JSON only.`;

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

    let parsedResult: { results?: { id: string; passed: boolean; output: string }[] };
    try {
      parsedResult = JSON.parse(text);
    } catch {
      parsedResult = {};
    }

    // 4. Normalize: ensure results array matches expected test cases
    const rawResults = Array.isArray(parsedResult.results)
      ? parsedResult.results
      : [];

    const normalizedResults = testCases.map((tc) => {
      const found = rawResults.find(
        (r: { id: string }) => r.id === tc.id
      );
      return {
        id: tc.id,
        passed: Boolean(found?.passed),
        output: found?.output || "Evaluation failed to produce a result for this test case.",
      };
    });

    const passedCount = normalizedResults.filter((r) => r.passed).length;
    const score =
      normalizedResults.length > 0
        ? Math.round((passedCount / normalizedResults.length) * 100)
        : 0;

    // 5. Log AI usage
    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    await adminSupabase.from("ai_usage_log").insert({
      user_id: user.id,
      endpoint: "ai-lab-evaluator",
      tokens_used: geminiData?.usageMetadata?.totalTokenCount || 0,
      success: true,
    });

    return new Response(
      JSON.stringify({ results: normalizedResults, score }),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Lab evaluator error:", error);
    return errorResponse("Evaluation failed", 500, req);
  }
});
