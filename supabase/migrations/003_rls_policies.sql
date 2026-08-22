-- ============================================================================
-- Migration 003: Row Level Security Policies
-- Backend Forge - Defense-in-depth RLS for all tables
-- ============================================================================
-- SECURITY MODEL:
--   - ALL direct table access revoked from anon/authenticated roles
--   - ALL access goes through Edge Functions (service role bypasses RLS)
--   - RLS policies are defense-in-depth: if someone bypasses Edge Functions,
--     RLS still blocks unauthorized access
--   - Double server check: Edge Function verifies JWT + checks business logic
-- ============================================================================

-- ============================================================================
-- PROFILES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

-- Users can only update their own name and avatar
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Admins can read all profiles (optimized with select wrap)
CREATE POLICY "profiles_admin_select"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- ============================================================================
-- COURSE TRACKS (read-only for all authenticated users)
-- ============================================================================
ALTER TABLE public.course_tracks ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read published tracks
CREATE POLICY "tracks_select_published"
  ON public.course_tracks FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Only admins can modify tracks (optimized with select wrap)
CREATE POLICY "tracks_admin_insert"
  ON public.course_tracks FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "tracks_admin_update"
  ON public.course_tracks FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "tracks_admin_delete"
  ON public.course_tracks FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin()));

-- ============================================================================
-- COURSE LABS (read-only for authenticated, gated by pro for is_pro labs)
-- ============================================================================
ALTER TABLE public.course_labs ENABLE ROW LEVEL SECURITY;

-- Free labs: any authenticated user can read
-- Pro labs: only pro/admin users can read (optimized with select wrap)
CREATE POLICY "labs_select_access"
  ON public.course_labs FOR SELECT
  TO authenticated
  USING (
    is_pro = false
    OR (SELECT public.has_pro_access())
  );

-- Only admins can modify labs (optimized with select wrap)
CREATE POLICY "labs_admin_insert"
  ON public.course_labs FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "labs_admin_update"
  ON public.course_labs FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "labs_admin_delete"
  ON public.course_labs FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin()));

-- ============================================================================
-- USER LAB PROGRESS (users see only their own progress)
-- ============================================================================
ALTER TABLE public.user_lab_progress ENABLE ROW LEVEL SECURITY;

-- Users can only read their own lab progress
CREATE POLICY "lab_progress_select_own"
  ON public.user_lab_progress FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Users can only insert their own progress (Edge Function handles this)
CREATE POLICY "lab_progress_insert_own"
  ON public.user_lab_progress FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can only update their own progress
CREATE POLICY "lab_progress_update_own"
  ON public.user_lab_progress FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Admins can see all progress (analytics) (optimized with select wrap)
CREATE POLICY "lab_progress_admin_select"
  ON public.user_lab_progress FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- ============================================================================
-- USER TRACK PROGRESS
-- ============================================================================
ALTER TABLE public.user_track_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "track_progress_select_own"
  ON public.user_track_progress FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "track_progress_insert_own"
  ON public.user_track_progress FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "track_progress_update_own"
  ON public.user_track_progress FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "track_progress_admin_select"
  ON public.user_track_progress FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- ============================================================================
-- CERTIFICATES (users see only their own, admins see all)
-- ============================================================================
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certificates_select_own"
  ON public.certificates FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "certificates_admin_select"
  ON public.certificates FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- Only Edge Functions can insert certificates (verified completion)
-- No INSERT policy for authenticated role = only service role can write

-- ============================================================================
-- USER STATE (users see only their own)
-- ============================================================================
ALTER TABLE public.user_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_state_select_own"
  ON public.user_state FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "user_state_insert_own"
  ON public.user_state FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "user_state_update_own"
  ON public.user_state FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "user_state_admin_select"
  ON public.user_state FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- ============================================================================
-- STARTER KITS (read-only for all authenticated)
-- ============================================================================
ALTER TABLE public.starter_kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "starter_kits_select_published"
  ON public.starter_kits FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "starter_kits_admin_all"
  ON public.starter_kits FOR ALL
  TO authenticated
  USING ((SELECT public.is_admin()));

-- ============================================================================
-- WORKSHOPS (read-only for all authenticated)
-- ============================================================================
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workshops_select_published"
  ON public.workshops FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "workshops_admin_all"
  ON public.workshops FOR ALL
  TO authenticated
  USING ((SELECT public.is_admin()));

-- ============================================================================
-- TEARDOWNS (read-only for all authenticated)
-- ============================================================================
ALTER TABLE public.teardowns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teardowns_select_published"
  ON public.teardowns FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "teardowns_admin_all"
  ON public.teardowns FOR ALL
  TO authenticated
  USING ((SELECT public.is_admin()));

-- ============================================================================
-- COACHING SESSIONS (users see only their own)
-- ============================================================================
ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coaching_select_own"
  ON public.coaching_sessions FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "coaching_insert_own"
  ON public.coaching_sessions FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- AI USAGE LOG (users see only their own usage)
-- ============================================================================
ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_usage_select_own"
  ON public.ai_usage_log FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "ai_usage_admin_select"
  ON public.ai_usage_log FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- No client INSERT/UPDATE policies - only Edge Functions (service role) can write

-- ============================================================================
-- AUDIT LOG (admin-only)
-- ============================================================================
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_admin_select"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

CREATE POLICY "audit_log_admin_all"
  ON public.audit_log FOR ALL
  TO authenticated
  USING ((SELECT public.is_admin()));

-- ============================================================================
-- SECURITY DEFINER FUNCTIONS (optimized RLS helpers)
-- ============================================================================

-- Optimized: returns all lab IDs a user has completed
CREATE OR REPLACE FUNCTION public.get_completed_lab_ids(p_user_id UUID)
RETURNS SETOF TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lab_id FROM public.user_lab_progress
  WHERE user_id = p_user_id AND completed = true;
$$;

-- Optimized: check if user owns a specific lab progress record
CREATE OR REPLACE FUNCTION public.user_owns_lab_progress(p_lab_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_lab_progress
    WHERE user_id = auth.uid() AND lab_id = p_lab_id
  );
$$;

-- Optimized: get user's current tier
CREATE OR REPLACE FUNCTION public.get_user_tier()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT tier FROM public.user_state WHERE user_id = auth.uid()),
    'free'::text
  );
$$;
