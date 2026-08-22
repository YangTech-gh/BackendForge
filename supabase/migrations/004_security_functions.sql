-- ============================================================================
-- Migration 004: Security Functions & Audit Triggers
-- Backend Forge - Server-side verification helpers
-- ============================================================================

-- ============================================================================
-- 1. AUDIT TRIGGER FUNCTION (logs all writes to audit_log)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, new_data)
    VALUES (
      COALESCE(auth.uid(), (SELECT id FROM auth.users LIMIT 1)),
      'INSERT',
      TG_TABLE_NAME,
      (NEW.id)::text,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (
      COALESCE(auth.uid(), (SELECT id FROM auth.users LIMIT 1)),
      'UPDATE',
      TG_TABLE_NAME,
      (NEW.id)::text,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_data)
    VALUES (
      COALESCE(auth.uid(), (SELECT id FROM auth.users LIMIT 1)),
      'DELETE',
      TG_TABLE_NAME,
      (OLD.id)::text,
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_user_state
  AFTER INSERT OR UPDATE OR DELETE ON public.user_state
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_certificates
  AFTER INSERT OR UPDATE OR DELETE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_lab_progress
  AFTER INSERT OR UPDATE ON public.user_lab_progress
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- ============================================================================
-- 2. LAB COMPLETION VALIDATOR (double server check)
-- ============================================================================
-- Called by Edge Function to verify a lab submission is valid before awarding XP
CREATE OR REPLACE FUNCTION public.validate_lab_completion(
  p_user_id UUID,
  p_lab_id TEXT,
  p_code TEXT,
  p_score INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lab RECORD;
  v_user_state RECORD;
  v_existing RECORD;
  v_result JSONB;
BEGIN
  -- 1. Verify the lab exists
  SELECT * INTO v_lab FROM public.course_labs WHERE id = p_lab_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Lab not found');
  END IF;

  -- 2. Check if user already completed this lab
  SELECT * INTO v_existing
  FROM public.user_lab_progress
  WHERE user_id = p_user_id AND lab_id = p_lab_id AND completed = true;

  IF FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Lab already completed');
  END IF;

  -- 3. Check pro access for pro labs
  IF v_lab.is_pro THEN
    SELECT * INTO v_user_state FROM public.user_state WHERE user_id = p_user_id;
    IF NOT FOUND OR v_user_state.tier = 'free' THEN
      RETURN jsonb_build_object('valid', false, 'error', 'Pro access required');
    END IF;
  END IF;

  -- 4. Validate score is reasonable (anti-cheat: score must be between 0-100)
  IF p_score < 0 OR p_score > 100 THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid score');
  END IF;

  -- 5. All checks passed
  RETURN jsonb_build_object(
    'valid', true,
    'lab_id', v_lab.id,
    'track_id', v_lab.track_id,
    'is_pro', v_lab.is_pro,
    'xp_to_award', 150
  );
END;
$$;

-- ============================================================================
-- 3. CERTIFICATE ISSUANCE VALIDATOR
-- ============================================================================
CREATE OR REPLACE FUNCTION public.validate_certificate_issuance(
  p_user_id UUID,
  p_track_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_labs INTEGER;
  v_completed_labs INTEGER;
  v_track RECORD;
  v_user_state RECORD;
  v_existing_cert RECORD;
BEGIN
  -- 1. Check if certificate already issued
  SELECT * INTO v_existing_cert
  FROM public.certificates
  WHERE user_id = p_user_id AND track_id = p_track_id;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'valid', true,
      'certificate_id', v_existing_cert.id,
      'already_issued', true
    );
  END IF;

  -- 2. Count total labs in track
  SELECT COUNT(*) INTO v_total_labs
  FROM public.course_labs
  WHERE track_id = p_track_id;

  -- 3. Count completed labs for user in this track
  SELECT COUNT(*) INTO v_completed_labs
  FROM public.user_lab_progress ulp
  JOIN public.course_labs cl ON cl.id = ulp.lab_id
  WHERE ulp.user_id = p_user_id
    AND cl.track_id = p_track_id
    AND ulp.completed = true;

  -- 4. Check if all labs are completed
  IF v_completed_labs < v_total_labs THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Not all labs completed',
      'completed', v_completed_labs,
      'total', v_total_labs
    );
  END IF;

  -- 5. Check pro access if any labs are pro-only
  SELECT * INTO v_track FROM public.course_tracks WHERE id = p_track_id;
  IF EXISTS (
    SELECT 1 FROM public.course_labs
    WHERE track_id = p_track_id AND is_pro = true
  ) THEN
    SELECT * INTO v_user_state FROM public.user_state WHERE user_id = p_user_id;
    IF NOT FOUND OR v_user_state.tier = 'free' THEN
      RETURN jsonb_build_object('valid', false, 'error', 'Pro access required for certificate');
    END IF;
  END IF;

  -- 6. All checks passed - ready to issue certificate
  RETURN jsonb_build_object(
    'valid', true,
    'track_title', v_track.title,
    'total_labs', v_total_labs,
    'already_issued', false
  );
END;
$$;

-- ============================================================================
-- 4. RATE LIMIT CHECKER (per-user, per-endpoint)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 30,
  p_window_seconds INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    SELECT COUNT(*)
    FROM public.ai_usage_log
    WHERE user_id = p_user_id
      AND endpoint = p_endpoint
      AND request_time > now() - (p_window_seconds || ' seconds')::interval
  ) < p_max_requests;
$$;

-- ============================================================================
-- 5. COACHING SESSION BOOKING VALIDATOR
-- ============================================================================
CREATE OR REPLACE FUNCTION public.validate_coaching_booking(
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_state RECORD;
  v_upcoming_count INTEGER;
BEGIN
  -- Check pro access
  SELECT * INTO v_user_state FROM public.user_state WHERE user_id = p_user_id;
  IF NOT FOUND OR v_user_state.tier = 'free' THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Pro access required for coaching');
  END IF;

  -- Check remaining coaching calls
  IF v_user_state.coaching_calls_remaining <= 0 THEN
    RETURN jsonb_build_object('valid', false, 'error', 'No coaching calls remaining');
  END IF;

  -- Check for existing scheduled sessions (prevent double-booking)
  SELECT COUNT(*) INTO v_upcoming_count
  FROM public.coaching_sessions
  WHERE user_id = p_user_id
    AND status = 'scheduled'
    AND session_date > now();

  IF v_upcoming_count >= 1 THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Already have a scheduled session');
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'calls_remaining', v_user_state.coaching_calls_remaining
  );
END;
$$;

-- ============================================================================
-- 6. XP CALCULATOR (server-side only)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.calculate_total_xp(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(xp_earned), 0)::integer
  FROM public.user_lab_progress
  WHERE user_id = p_user_id AND completed = true;
$$;

-- ============================================================================
-- 7. REFRESH MATERIALIZED VIEW for dashboard stats (optional)
-- ============================================================================
-- For dashboard performance, cache aggregate stats
CREATE MATERIALIZED VIEW IF NOT EXISTS public.platform_stats AS
SELECT
  (SELECT COUNT(*) FROM public.profiles) AS total_users,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'pro_student' OR role = 'admin') AS pro_users,
  (SELECT COUNT(*) FROM public.certificates) AS total_certificates,
  (SELECT COUNT(*) FROM public.user_lab_progress WHERE completed = true) AS total_labs_completed,
  (SELECT COALESCE(SUM(xp_earned), 0) FROM public.user_lab_progress WHERE completed = true) AS total_xp_awarded,
  now() AS refreshed_at;

-- Function to refresh the stats (call periodically or on-demand)
CREATE OR REPLACE FUNCTION public.refresh_platform_stats()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.platform_stats;
END;
$$;
