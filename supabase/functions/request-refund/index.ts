// ============================================================================
// Request Refund - Process refund requests via Stripe
// Deploy: supabase functions deploy request-refund
// Security: JWT required, business logic validation, idempotent
// ============================================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@22";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  handleCors,
  getCorsHeaders,
  safeReadBody,
  errorResponse,
} from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2026-07-29.dahlia",
});

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    if (req.method !== "POST") {
      return errorResponse("Method not allowed", 405, req);
    }

    // 1. Verify JWT
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

    // 2. Read body
    const bodyText = await safeReadBody(req);
    let parsed: { reason?: string };
    try {
      parsed = JSON.parse(bodyText);
    } catch {
      return errorResponse("Invalid JSON", 400, req);
    }

    // 3. Service role client for DB reads
    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 4. Verify user is pro tier
    const { data: userState, error: stateError } = await adminSupabase
      .from("user_state")
      .select("tier, stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (stateError || !userState) {
      return errorResponse("User state not found", 404, req);
    }

    if (userState.tier !== "pro") {
      return errorResponse("Only Pro users can request refunds", 403, req);
    }

    if (!userState.stripe_customer_id) {
      return errorResponse("No Stripe customer found for this account", 404, req);
    }

    // 5. Find the most recent succeeded payment for this user
    const { data: payment, error: paymentError } = await adminSupabase
      .from("payments")
      .select("id, stripe_payment_intent, amount, status")
      .eq("user_id", user.id)
      .eq("status", "succeeded")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!payment) {
      return errorResponse("No completed payment found to refund", 404, req);
    }

    // 6. Check if already refunded
    const { data: existingRefund } = await adminSupabase
      .from("payments")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "refunded")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingRefund) {
      return errorResponse("A refund has already been processed for this account", 409, req);
    }

    // 7. Create Stripe refund
    let refund: Stripe.Refund;
    try {
      refund = await stripe.refunds.create({
        payment_intent: payment.stripe_payment_intent!,
        reason: "requested_by_customer",
        metadata: {
          supabase_user_id: user.id,
          reason: parsed.reason || "No reason provided",
        },
      });
    } catch (stripeErr: unknown) {
      const msg = stripeErr instanceof Error ? stripeErr.message : "unknown";
      console.error("Stripe refund creation failed:", msg);
      return errorResponse("Failed to process refund with Stripe", 500, req);
    }

    // 8. Record refund in payments table
    const { error: refundRecordError } = await adminSupabase
      .from("payments")
      .insert({
        user_id: user.id,
        stripe_payment_intent: payment.stripe_payment_intent,
        amount: -payment.amount,
        currency: "usd",
        status: "refunded",
        description: `Refund: ${parsed.reason || "Customer requested refund"}`,
        metadata: {
          refund_id: refund.id,
          original_payment_id: payment.id,
          reason: parsed.reason || "No reason provided",
        },
      });

    if (refundRecordError) {
      console.error("Failed to record refund:", refundRecordError.message);
      // Non-fatal: refund was created in Stripe
    }

    // 9. Downgrade user tier
    const { error: downgradeError } = await adminSupabase
      .from("user_state")
      .update({ tier: "free", coaching_calls_remaining: 0 })
      .eq("user_id", user.id);

    if (downgradeError) {
      console.error("Failed to downgrade user tier:", downgradeError.message);
    }

    // 10. Update profile role
    const { error: roleError } = await adminSupabase
      .from("profiles")
      .update({ role: "student" })
      .eq("id", user.id);

    if (roleError) {
      console.error("Failed to update profile role:", roleError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        refundId: refund.id,
        message: "Refund processed successfully. Your access has been downgraded to Free tier.",
      }),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Refund request failed";
    console.error("Refund error:", message);
    return errorResponse("Refund request failed", 500, req);
  }
});
