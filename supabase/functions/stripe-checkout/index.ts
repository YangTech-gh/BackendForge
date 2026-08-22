// ============================================================================
// Stripe Checkout - Create Checkout Session
// Deploy: supabase functions deploy stripe-checkout
// Security: JWT + business logic double check, body size limit, timeout
// ============================================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@22";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  handleCors,
  getCorsHeaders,
  safeReadBody,
  validateRequired,
  errorResponse,
  snakeToCamel,
} from "../_shared/cors.ts";

// SEC 5: Validate env vars at startup (fail fast with clear message)
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_PRICE_PRO_LIFETIME = Deno.env.get("STRIPE_PRICE_PRO_LIFETIME");
const STRIPE_PRICE_PRO_MONTHLY = Deno.env.get("STRIPE_PRICE_PRO_MONTHLY");
const APP_URL = Deno.env.get("APP_URL");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_PUBLISHABLE_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!STRIPE_SECRET_KEY || !APP_URL || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("FATAL: Missing required environment variables. Check STRIPE_SECRET_KEY, APP_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY");
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

    // 2. Verify JWT (double server check #1: JWT validation)
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

    // 3. Read and validate body (body size limit enforced)
    const bodyText = await safeReadBody(req);
    let parsed: { price_id?: string };
    try {
      parsed = JSON.parse(bodyText);
    } catch {
      return errorResponse("Invalid JSON", 400, req);
    }

    const validationError = validateRequired(parsed, ["price_id"]);
    if (validationError) {
      return errorResponse(validationError, 400, req);
    }

    // 4. Double server check #2: Business logic validation
    const { data: upgradeValid, error: upgradeError } = await supabase.rpc(
      "validate_pro_upgrade",
      { p_user_id: user.id }
    );

    if (upgradeError || !upgradeValid?.valid) {
      return errorResponse(
        upgradeValid?.error || "Upgrade validation failed",
        403,
        req
      );
    }

    // 5. Validate price_id against server-side whitelist (never trust client)
    const validPrices = [STRIPE_PRICE_PRO_LIFETIME, STRIPE_PRICE_PRO_MONTHLY].filter(
      Boolean
    );

    if (!validPrices.includes(parsed.price_id!)) {
      return errorResponse("Invalid price", 400, req);
    }

    // 6. Service role client for DB writes (created once)
    const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 7. Get or create Stripe customer
    let customerId: string | null = null;
    const { data: existingCustomer } = await supabase
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.stripe_customer_id;
    } else {
      let customer: Stripe.Customer;
      try {
        customer = await stripe.customers.create({
          email: user.email || "",
          metadata: { supabase_user_id: user.id },
        });
      } catch (stripeErr: unknown) {
        const msg =
          stripeErr instanceof Error ? stripeErr.message : "unknown";
        console.error("Stripe customer creation failed:", msg);
        return errorResponse("Failed to create customer", 500, req);
      }

      if (!customer.id) {
        console.error("Stripe returned customer without id");
        return errorResponse("Failed to create customer", 500, req);
      }

      customerId = customer.id;

      const { error: upsertError } = await adminSupabase.rpc(
        "upsert_stripe_customer",
        {
          p_user_id: user.id,
          p_stripe_customer_id: customerId,
          p_email: user.email || "",
        }
      );

      if (upsertError) {
        console.error("Failed to upsert customer:", upsertError.message);
        return errorResponse("Failed to save customer", 500, req);
      }
    }

    // 8. Determine checkout mode from price_id
    const isMonthly = parsed.price_id === STRIPE_PRICE_PRO_MONTHLY;
    const checkoutMode: "payment" | "subscription" = isMonthly ? "subscription" : "payment";

    // 9. Create Stripe Checkout Session
    let session: Stripe.Checkout.Session;
    try {
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        customer: customerId!,
        mode: checkoutMode,
        line_items: [{ price: parsed.price_id!, quantity: 1 }],
        success_url: `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${APP_URL}/cancel`,
        metadata: {
          supabase_user_id: user.id,
          price_id: parsed.price_id!,
        },
      };

      // For subscriptions, attach metadata to subscription for webhook lookup
      if (checkoutMode === "subscription") {
        sessionParams.subscription_data = {
          metadata: {
            supabase_user_id: user.id,
            price_id: parsed.price_id!,
          },
        };
      }

      session = await stripe.checkout.sessions.create(
        sessionParams,
        {
          // FIX: deterministic idempotency key (same user + same price = same key)
          idempotencyKey: `checkout-${user.id}-${parsed.price_id}`,
        }
      );
    } catch (stripeErr: unknown) {
      const msg =
        stripeErr instanceof Error ? stripeErr.message : "unknown";
      console.error("Stripe checkout session creation failed:", msg);
      return errorResponse("Failed to create checkout session", 500, req);
    }

    // 10. Log checkout attempt
    const { error: logError } = await adminSupabase
      .from("stripe_checkout_sessions")
      .insert({
        user_id: user.id,
        stripe_session_id: session.id,
        stripe_customer_id: customerId,
        price_id: parsed.price_id!,
        mode: checkoutMode,
        status: "pending",
        amount_total: session.amount_total || 0,
        currency: session.currency || "usd",
        success_url: session.success_url,
        cancel_url: session.cancel_url,
      });

    if (logError) {
      console.error("Failed to log checkout session:", logError.message);
      // Non-fatal: session was created in Stripe, user can still complete it
    }

    return new Response(JSON.stringify(snakeToCamel({ url: session.url })), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Checkout failed";
    console.error("Stripe checkout error:", message);
    return errorResponse("Checkout failed", 500, req);
  }
});
