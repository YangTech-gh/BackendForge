-- ============================================================================
-- Migration 005: Stripe Integration Tables & Functions
-- Backend Forge - Payment processing with Stripe Checkout + Webhooks
-- ============================================================================

-- ============================================================================
-- 1. STRIPE CUSTOMERS (link Supabase users to Stripe)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id    TEXT NOT NULL UNIQUE,
  email                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stripe_customers_user ON public.stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe ON public.stripe_customers(stripe_customer_id);

-- ============================================================================
-- 2. STRIPE CHECKOUT SESSIONS (track checkout attempts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.stripe_checkout_sessions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id     TEXT NOT NULL UNIQUE,
  stripe_customer_id    TEXT,
  price_id              TEXT NOT NULL,
  mode                  TEXT NOT NULL DEFAULT 'payment' CHECK (mode IN ('payment','subscription')),
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','expired','cancelled')),
  amount_total          INTEGER,
  currency              TEXT DEFAULT 'usd',
  success_url           TEXT,
  cancel_url            TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stripe_checkout_user ON public.stripe_checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_checkout_session ON public.stripe_checkout_sessions(stripe_session_id);

-- ============================================================================
-- 3. PAYMENTS (completed payment records)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent   TEXT,  -- BUG C FIX: No UNIQUE constraint — allows refund updates to coexist
  stripe_invoice_id       TEXT,
  amount                  INTEGER NOT NULL,
  currency                TEXT NOT NULL DEFAULT 'usd',
  status                  TEXT NOT NULL CHECK (status IN ('succeeded','pending','failed','refunded')),
  description             TEXT,
  metadata                JSONB DEFAULT '{}',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
-- Index for refund lookups by payment_intent (used in charge.refunded webhook)
CREATE INDEX IF NOT EXISTS idx_payments_payment_intent ON public.payments(stripe_payment_intent);

-- ============================================================================
-- 4. STRIPE WEBHOOK EVENTS (idempotency & audit)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id       TEXT NOT NULL UNIQUE,
  event_type            TEXT NOT NULL,
  payload               JSONB NOT NULL,
  processed             BOOLEAN NOT NULL DEFAULT false,
  error_message         TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_event_id ON public.stripe_webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_type ON public.stripe_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_processed ON public.stripe_webhook_events(processed);
-- IMP 1: Index for cleanup of old webhook events (e.g., DELETE WHERE created_at < now() - interval '30 days')
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_created_at ON public.stripe_webhook_events(created_at);

-- ============================================================================
-- 5. RLS POLICIES FOR STRIPE TABLES
-- ============================================================================

-- Stripe Customers: users see only their own
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stripe_customers_select_own"
  ON public.stripe_customers FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "stripe_customers_admin_select"
  ON public.stripe_customers FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Checkout Sessions: users see only their own
ALTER TABLE public.stripe_checkout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stripe_checkout_select_own"
  ON public.stripe_checkout_sessions FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Payments: users see only their own
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_select_own"
  ON public.payments FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "payments_admin_select"
  ON public.payments FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Webhook Events: admin only (no client access)
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhook_events_admin_select"
  ON public.stripe_webhook_events FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- 6. STRIPE CUSTOMER CREATION HELPER (called from Edge Function)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.upsert_stripe_customer(
  p_user_id UUID,
  p_stripe_customer_id TEXT,
  p_email TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  -- SEC 2: Validate stripe_customer_id format (must start with "cus_")
  IF p_stripe_customer_id !~ '^cus_[A-Za-z0-9]+$' THEN
    RAISE EXCEPTION 'Invalid Stripe customer ID format: %', p_stripe_customer_id;
  END IF;

  INSERT INTO public.stripe_customers (user_id, stripe_customer_id, email)
  VALUES (p_user_id, p_stripe_customer_id, p_email)
  ON CONFLICT (user_id) DO UPDATE
    SET stripe_customer_id = EXCLUDED.stripe_customer_id,
        email = EXCLUDED.email,
        updated_at = now()
  RETURNING id INTO v_id;

  -- Also update user_state with stripe_customer_id
  UPDATE public.user_state
  SET stripe_customer_id = p_stripe_customer_id,
      updated_at = now()
  WHERE user_id = p_user_id;

  RETURN v_id;
END;
$$;

-- ============================================================================
-- 7. PRO UPGRADE VALIDATOR
-- ============================================================================
CREATE OR REPLACE FUNCTION public.validate_pro_upgrade(
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_state RECORD;
BEGIN
  SELECT * INTO v_user_state FROM public.user_state WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'User state not found');
  END IF;

  IF v_user_state.tier != 'free' THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Already has pro access');
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'current_tier', v_user_state.tier,
    'user_id', p_user_id
  );
END;
$$;

-- ============================================================================
-- 8. UPDATED_AT AUTO-UPDATE TRIGGERS FOR STRIPE TABLES
-- ============================================================================
-- The set_updated_at() function is defined in migration 002.
-- We apply it here because these tables were created after the dynamic
-- trigger loop in 002 ran, so they weren't picked up automatically.

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.stripe_customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.stripe_checkout_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 9. APPLY AUDIT TRIGGERS TO STRIPE TABLES
-- ============================================================================

CREATE TRIGGER audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_stripe_checkout
  AFTER INSERT OR UPDATE ON public.stripe_checkout_sessions
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
