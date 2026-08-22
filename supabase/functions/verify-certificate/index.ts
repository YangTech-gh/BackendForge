// ============================================================================
// Verify Certificate (public verification endpoint)
// Deploy: supabase functions deploy verify-certificate
// Security: No auth (public), IP-based rate limit, input validation
// ============================================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  handleCors,
  getCorsHeaders,
  sanitizeString,
  errorResponse,
  snakeToCamel,
} from "../_shared/cors.ts";

// ─── IP Rate Limiter (in-memory, per-instance) ──────────────────────────────
// Max 30 requests per minute per IP. Acceptable for certificate verification.
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;

function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const recent = timestamps.filter((t) => t > windowStart);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

// Periodic cleanup to prevent memory leak
setInterval(() => {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
  for (const [ip, timestamps] of rateLimitMap) {
    const recent = timestamps.filter((t) => t > cutoff);
    if (recent.length === 0) rateLimitMap.delete(ip);
    else rateLimitMap.set(ip, recent);
  }
}, RATE_LIMIT_WINDOW_MS);

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    if (req.method !== "GET") {
      return errorResponse("Method not allowed", 405, req);
    }

    // Rate limit by IP
    const clientIp = getClientIp(req);
    if (isRateLimited(clientIp)) {
      return errorResponse("Too many requests. Try again later.", 429, req);
    }

    const url = new URL(req.url);
    const certId = sanitizeString(url.searchParams.get("certId"), 100);

    if (!certId) {
      return errorResponse("certId is required", 400, req);
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(certId)) {
      return errorResponse("Invalid certificate ID format", 400, req);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: cert, error } = await supabase
      .from("certificates")
      .select("id, student_name, track_title, issued_at, is_verified")
      .eq("id", certId)
      .single();

    if (error || !cert) {
      return errorResponse("Certificate not found", 404, req);
    }

    return new Response(
      JSON.stringify({
        valid: true,
        certificate: snakeToCamel(cert),
      }),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Verify certificate error:", error);
    return errorResponse("Verification failed", 500, req);
  }
});
