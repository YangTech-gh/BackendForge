// ============================================================================
// Upgrade to Pro (legacy endpoint - redirects to Stripe Checkout)
// Deploy: supabase functions deploy upgrade-pro
// Security: JWT, method check
// ============================================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  handleCors,
  getCorsHeaders,
  errorResponse,
  snakeToCamel,
} from "../_shared/cors.ts";

// SEC 5: Validate env vars at startup
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_PUBLISHABLE_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY");

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error("FATAL: Missing required environment variables. Check SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY");
  throw new Error("Missing required environment variables");
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // 1. Only accept POST
    if (req.method !== "POST") {
      return errorResponse("Method not allowed", 405, req);
    }

    // 2. Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse("Missing authorization", 401, req);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401, req);
    }

    // 3. Return 410 Gone — this endpoint is deprecated
    return new Response(
      JSON.stringify(
        snakeToCamel({
          error: "This endpoint is deprecated. Use /functions/v1/stripe-checkout instead.",
          checkout_url: "/functions/v1/stripe-checkout",
        })
      ),
      {
        status: 410,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Upgrade error:", error);
    return errorResponse("Upgrade failed", 500, req);
  }
});
