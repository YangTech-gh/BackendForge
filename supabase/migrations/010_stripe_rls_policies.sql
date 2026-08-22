-- ============================================================================
-- Migration 010: Stripe Table RLS Policies (Defense-in-Depth)
-- Backend Forge - Prevent direct client access to payment tables
-- ============================================================================
-- SECURITY MODEL:
--   - All Stripe table writes go through Edge Functions (service role bypasses RLS)
--   - Users can only read their own payment records
--   - No client-side INSERT/UPDATE/DELETE allowed
-- ============================================================================

-- ============================================================================
-- STRIPE CUSTOMERS
-- ============================================================================
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

-- Users can only read their own Stripe customer record
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'stripe_customers_select_own' AND tablename = 'stripe_customers'
  ) THEN
    CREATE POLICY "stripe_customers_select_own"
      ON public.stripe_customers FOR SELECT
      TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;
END $$;

-- No client INSERT/UPDATE/DELETE - only Edge Functions (service role) can write

-- ============================================================================
-- STRIPE CHECKOUT SESSIONS
-- ============================================================================
ALTER TABLE public.stripe_checkout_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own checkout sessions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'stripe_checkout_select_own' AND tablename = 'stripe_checkout_sessions'
  ) THEN
    CREATE POLICY "stripe_checkout_select_own"
      ON public.stripe_checkout_sessions FOR SELECT
      TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;
END $$;

-- No client INSERT/UPDATE/DELETE - only Edge Functions (service role) can write

-- ============================================================================
-- PAYMENTS
-- ============================================================================
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can only read their own payment records
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'payments_select_own' AND tablename = 'payments'
  ) THEN
    CREATE POLICY "payments_select_own"
      ON public.payments FOR SELECT
      TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;
END $$;

-- Admins can read all payments (for support/analytics)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'payments_admin_select' AND tablename = 'payments'
  ) THEN
    CREATE POLICY "payments_admin_select"
      ON public.payments FOR SELECT
      TO authenticated
      USING ((SELECT public.is_admin()));
  END IF;
END $$;

-- No client INSERT/UPDATE/DELETE - only Edge Functions (service role) can write

-- ============================================================================
-- STRIPE WEBHOOK EVENTS (admin-only, no user access)
-- ============================================================================
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- No client access at all - only service role can read/write
-- This prevents webhook event data leakage
