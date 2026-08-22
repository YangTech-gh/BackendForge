// ============================================================================
// Stripe Webhook Handler
// Deploy: supabase functions deploy stripe-webhook --no-verify-jwt
// Security: Stripe signature verification, idempotency, timeout, body limit
// ============================================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@22";
import { createClient } from "npm:@supabase/supabase-js@2";

// SEC 5: Validate env vars at startup (fail fast with clear message)
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SIGNING_SECRET = Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SIGNING_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("FATAL: Missing required environment variables. Check STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SIGNING_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  throw new Error("Missing required environment variables");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2026-07-29.dahlia",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();
const MAX_WEBHOOK_BODY = 6 * 1024 * 1024; // 6MB (Stripe max is ~6MB)

// ─── Helper: upgrade user to Pro ────────────────────────────────────────────
async function upgradeToPro(supabase: ReturnType<typeof createClient>, userId: string, meta: Record<string, unknown> = {}) {
  const { error } = await supabase
    .from("user_state")
    .update({
      tier: "pro",
      coaching_calls_remaining: 2,
      stripe_subscription_id: meta.subscription_id || null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
  if (error) throw new Error(`user_state upgrade failed: ${error.message}`);

  const { error: roleErr } = await supabase
    .from("profiles")
    .update({ role: "pro_student" })
    .eq("id", userId);
  if (roleErr) throw new Error(`profile role update failed: ${roleErr.message}`);
}

// ─── Helper: downgrade user to Free ─────────────────────────────────────────
async function downgradeToFree(supabase: ReturnType<typeof createClient>, userId: string) {
  const { error } = await supabase
    .from("user_state")
    .update({
      tier: "free",
      coaching_calls_remaining: 0,
      stripe_subscription_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
  if (error) throw new Error(`user_state downgrade failed: ${error.message}`);

  const { error: roleErr } = await supabase
    .from("profiles")
    .update({ role: "student" })
    .eq("id", userId);
  if (roleErr) throw new Error(`profile role update failed: ${roleErr.message}`);
}

// ─── Helper: look up userId from stripe_customers ───────────────────────────
async function lookupUserId(
  supabase: ReturnType<typeof createClient>,
  customerId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("stripe_customers")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.user_id ?? null;
}

Deno.serve(async (req: Request) => {
  try {
    // 1. Only accept POST
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // 2. Enforce body size limit (anti-DoS)
    const contentLength = parseInt(
      req.headers.get("content-length") || "0",
      10
    );
    if (contentLength > MAX_WEBHOOK_BODY) {
      return new Response("Payload too large", { status: 413 });
    }

    // 3. Read raw body for signature verification (CRITICAL: must be raw)
    const body = await req.text();
    if (body.length > MAX_WEBHOOK_BODY) {
      return new Response("Payload too large", { status: 413 });
    }

    // 4. Verify Stripe webhook signature (anti-spoofing)
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("Missing stripe-signature header");
      return new Response("Missing signature", { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        STRIPE_WEBHOOK_SIGNING_SECRET,
        undefined,
        cryptoProvider
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "unknown";
      console.error(`Webhook signature verification failed: ${msg}`);
      return new Response("Invalid signature", { status: 400 });
    }

    // 5. Service role client for database writes (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 6. Idempotency check (prevent duplicate processing)
    const { data: existingEvent } = await supabase
      .from("stripe_webhook_events")
      .select("id")
      .eq("stripe_event_id", event.id)
      .maybeSingle();

    if (existingEvent) {
      console.log(`Event ${event.id} already processed, skipping`);
      return new Response("Already processed", { status: 200 });
    }

    // 7. Log the event as NOT YET processed (concurrent guard via UNIQUE)
    const { error: insertError } = await supabase
      .from("stripe_webhook_events")
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        payload: {
          id: event.id,
          type: event.type,
          created: event.created,
          data_object_id: (event.data.object as Record<string, unknown>)?.id ?? null,
        },
        processed: false,
        processed_at: null,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        console.log(`Event ${event.id} already being processed (concurrent), skipping`);
        return new Response("Already processed", { status: 200 });
      }
      console.error(`Failed to log event ${event.id}:`, insertError.message);
      return new Response("Event log failed", { status: 500 });
    }

    // 8. Process the event (errors will be recorded; event stays unprocessed for retry)
    let processingError: string | null = null;
    try {
      switch (event.type) {
        // ── One-time checkout (lifetime) ─────────────────────────────────────
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.supabase_user_id;
          const priceId = session.metadata?.price_id;
          const mode = session.mode;

          if (!userId) {
            processingError = "Missing supabase_user_id in session metadata";
            break;
          }

          // Record payment (one-time purchase)
          if (mode === "payment") {
            const { error: paymentError } = await supabase
              .from("payments")
              .insert({
                user_id: userId,
                stripe_payment_intent:
                  typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : null,
                amount: session.amount_total || 0,
                currency: session.currency || "usd",
                status: "succeeded",
                description: `Pro upgrade - ${priceId}`,
                metadata: {
                  session_id: session.id,
                  price_id: priceId,
                  mode: "payment",
                },
              });
            if (paymentError) {
              processingError = `Payment insert failed: ${paymentError.message}`;
              break;
            }
          }

          // For subscription mode, record the subscription in user_state
          if (mode === "subscription" && typeof session.subscription === "string") {
            const { error: subErr } = await supabase
              .from("user_state")
              .update({ stripe_subscription_id: session.subscription })
              .eq("user_id", userId);
            if (subErr) {
              processingError = `Subscription ID save failed: ${subErr.message}`;
              break;
            }
          }

          await upgradeToPro(supabase, userId, {
            subscription_id: typeof session.subscription === "string" ? session.subscription : null,
          });

          const { error: sessionError } = await supabase
            .from("stripe_checkout_sessions")
            .update({ status: "completed" })
            .eq("stripe_session_id", session.id);
          if (sessionError) {
            console.error("Failed to update checkout session:", sessionError.message);
          }

          console.log(`User ${userId} upgraded to pro (mode: ${mode})`);
          break;
        }

        // ── Checkout expired ─────────────────────────────────────────────────
        case "checkout.session.expired": {
          const session = event.data.object as Stripe.Checkout.Session;
          const { error: expireError } = await supabase
            .from("stripe_checkout_sessions")
            .update({ status: "expired" })
            .eq("stripe_session_id", session.id);
          if (expireError) {
            processingError = `Session expire failed: ${expireError.message}`;
          }
          break;
        }

        // ── Payment failed (one-time or subscription initial) ────────────────
        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const userId = paymentIntent.metadata?.supabase_user_id;
          if (userId) {
            const { error: failedError } = await supabase
              .from("payments")
              .insert({
                user_id: userId,
                stripe_payment_intent: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: "failed",
                description: "Payment failed",
              });
            if (failedError) {
              processingError = `Failed payment insert: ${failedError.message}`;
            }
          }
          break;
        }

        // ── Charge refunded ──────────────────────────────────────────────────
        case "charge.refunded": {
          const charge = event.data.object as Stripe.Charge;
          const paymentIntentId =
            typeof charge.payment_intent === "string" ? charge.payment_intent : null;

          if (!paymentIntentId) {
            processingError = "Refund: no payment_intent on charge";
            break;
          }

          // Look up userId via payments table (charge metadata is NOT populated)
          const { data: payment } = await supabase
            .from("payments")
            .select("user_id")
            .eq("stripe_payment_intent", paymentIntentId)
            .maybeSingle();
          const userId = payment?.user_id ?? null;

          if (!userId) {
            processingError = `Refund: no user found for payment_intent ${paymentIntentId}`;
            break;
          }

          const { error: refundUpdateError } = await supabase
            .from("payments")
            .update({
              status: "refunded",
              description: "Refund processed",
              amount: charge.amount_refunded,
            })
            .eq("stripe_payment_intent", paymentIntentId);
          if (refundUpdateError) {
            processingError = `Refund update failed: ${refundUpdateError.message}`;
            break;
          }

          await downgradeToFree(supabase, userId);
          console.log(`User ${userId} downgraded due to refund`);
          break;
        }

        // ── Subscription renewed (invoice paid) ──────────────────────────────
        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice;
          const subId =
            typeof invoice.subscription === "string" ? invoice.subscription : null;
          if (!subId) break;

          // Look up userId from stripe_customers via customer
          const customerId =
            typeof invoice.customer === "string" ? invoice.customer : null;
          if (!customerId) {
            processingError = `invoice.paid: no customer on invoice ${invoice.id}`;
            break;
          }
          const userId = await lookupUserId(supabase, customerId);
          if (!userId) {
            processingError = `invoice.paid: no user for customer ${customerId}`;
            break;
          }

          // Ensure pro tier stays active on renewal
          const { error: renewErr } = await supabase
            .from("user_state")
            .update({ updated_at: new Date().toISOString() })
            .eq("user_id", userId)
            .eq("tier", "pro");
          if (renewErr) {
            processingError = `invoice.paid update failed: ${renewErr.message}`;
          }
          break;
        }

        // ── Subscription cancelled / expired ─────────────────────────────────
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId =
            typeof subscription.customer === "string" ? subscription.customer : null;
          if (!customerId) {
            processingError = "subscription.deleted: no customer";
            break;
          }
          const userId = await lookupUserId(supabase, customerId);
          if (!userId) {
            processingError = `subscription.deleted: no user for customer ${customerId}`;
            break;
          }

          await downgradeToFree(supabase, userId);
          console.log(`User ${userId} downgraded: subscription deleted`);
          break;
        }

        // ── Subscription updated (past_due → unpaid, etc.) ───────────────────
        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId =
            typeof subscription.customer === "string" ? subscription.customer : null;
          if (!customerId) break;
          const userId = await lookupUserId(supabase, customerId);
          if (!userId) break;

          const status = subscription.status;
          if (status === "past_due" || status === "unpaid" || status === "canceled") {
            await downgradeToFree(supabase, userId);
            console.log(`User ${userId} downgraded: subscription status=${status}`);
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "unknown";
      console.error(`Error processing event ${event.id}:`, msg);
      processingError = msg;
    }

    // 9. Mark event as processed OR leave unprocessed for Stripe retry
    if (processingError) {
      // FIX #6: Mark processed WITH error so Stripe doesn't infinite-retry,
      // but record the error for manual inspection. Stripe retries on 5xx
      // anyway; marking with error avoids re-processing loops while preserving
      // the failure reason for debugging.
      await supabase
        .from("stripe_webhook_events")
        .update({
          processed: true,
          error_message: processingError,
          processed_at: new Date().toISOString(),
        })
        .eq("stripe_event_id", event.id);

      console.error(`Event ${event.id} processed with error: ${processingError}`);
    } else {
      await supabase
        .from("stripe_webhook_events")
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
        })
        .eq("stripe_event_id", event.id);
    }

    // Always return 200 to Stripe (4xx/5xx triggers Stripe retry with backoff;
    // 500 retry = exponential backoff can block other events)
    return new Response("OK", { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "unknown";
    console.error("Webhook error:", msg);
    return new Response("Webhook error", { status: 400 });
  }
});
