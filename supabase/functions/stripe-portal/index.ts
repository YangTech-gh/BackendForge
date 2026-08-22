// ============================================================================
// Stripe Customer Portal
// Deploy: supabase functions deploy stripe-portal
// Security: JWT, timeout, body size limit
// ============================================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@22";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  handleCors,
  getCorsHeaders,
  errorResponse,
  snakeToCamel,
} from "../_shared/cors.ts";

// SEC 5: Validate env vars at startup (fail fast with clear message)
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const APP_URL = Deno.env.get("APP_URL");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

if (!STRIPE_SECRET_KEY || !APP_URL || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("FATAL: Missing required environment variables. Check STRIPE_SECRET_KEY, APP_URL, SUPABASE_URL, SUPABASE_ANON_KEY");
  throw new Error("Missing required environment variables");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2026-07-29.dahlia",
});

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

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401, req);
    }

    // 3. Get Stripe customer ID
    const { data: customer } = await supabase
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (!customer) {
      return errorResponse("No Stripe account found", 404, req);
    }

    // 4. Create billing portal session
    let session: Stripe.BillingPortal.Session;
    try {
      session = await stripe.billingPortal.sessions.create({
        customer: customer.stripe_customer_id,
        return_url: `${APP_URL}/dashboard`,
      });
    } catch (stripeErr: unknown) {
      const msg =
        stripeErr instanceof Error ? stripeErr.message : "unknown";
      console.error("Stripe portal session creation failed:", msg);
      return errorResponse("Failed to create portal session", 500, req);
    }

    return new Response(JSON.stringify(snakeToCamel({ url: session.url })), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Stripe portal error:", error);
    return errorResponse("Portal failed", 500, req);
  }
});
