-- ============================================================================
-- Migration 002: Core Tables - Courses, Labs, Progress, Certificates
-- Backend Forge - All course data moved from frontend to database
-- ============================================================================

-- ============================================================================
-- 1. COURSE TRACKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.course_tracks (
  id              TEXT PRIMARY KEY,
  track_number    INTEGER NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  tagline         TEXT NOT NULL,
  paradigm        TEXT NOT NULL,
  badge_color     TEXT NOT NULL DEFAULT 'border-zinc-500/40 text-zinc-400 bg-zinc-500/10',
  icon_name       TEXT NOT NULL DEFAULT 'BookOpen',
  description     TEXT NOT NULL,
  learning_goals  JSONB NOT NULL DEFAULT '[]',
  deliverable     JSONB NOT NULL DEFAULT '{}',
  is_published    BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_course_tracks_number ON public.course_tracks(track_number);
CREATE INDEX IF NOT EXISTS idx_course_tracks_published ON public.course_tracks(is_published);

-- ============================================================================
-- 2. COURSE LABS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.course_labs (
  id                  TEXT PRIMARY KEY,
  track_id            TEXT NOT NULL REFERENCES public.course_tracks(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  duration_minutes    INTEGER NOT NULL DEFAULT 45,
  difficulty          TEXT NOT NULL DEFAULT 'Intermediate'
                        CHECK (difficulty IN ('Intermediate','Advanced','Senior','Staff','Principal')),
  is_pro              BOOLEAN NOT NULL DEFAULT false,
  concept_summary     TEXT NOT NULL,
  initial_files       JSONB NOT NULL DEFAULT '[]',
  instructions        JSONB NOT NULL DEFAULT '[]',
  test_cases          JSONB NOT NULL DEFAULT '[]',
  sort_order          INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_labs_track ON public.course_labs(track_id);
CREATE INDEX IF NOT EXISTS idx_course_labs_pro ON public.course_labs(is_pro);
CREATE INDEX IF NOT EXISTS idx_course_labs_sort ON public.course_labs(track_id, sort_order);

-- ============================================================================
-- 3. USER PROGRESS (per-lab completion tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_lab_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_id          TEXT NOT NULL REFERENCES public.course_labs(id) ON DELETE CASCADE,
  completed       BOOLEAN NOT NULL DEFAULT false,
  completed_at    TIMESTAMPTZ,
  xp_earned       INTEGER NOT NULL DEFAULT 0,
  score           INTEGER CHECK (score >= 0 AND score <= 100),
  ai_feedback     JSONB,
  code_snapshot   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lab_id)
);

CREATE INDEX IF NOT EXISTS idx_user_lab_progress_user ON public.user_lab_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lab_progress_lab ON public.user_lab_progress(lab_id);
CREATE INDEX IF NOT EXISTS idx_user_lab_progress_completed ON public.user_lab_progress(user_id, completed);

-- ============================================================================
-- 4. USER TRACK PROGRESS (aggregated per-track status)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_track_progress (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id              TEXT NOT NULL REFERENCES public.course_tracks(id) ON DELETE CASCADE,
  labs_completed        INTEGER NOT NULL DEFAULT 0,
  total_labs            INTEGER NOT NULL DEFAULT 0,
  is_track_completed    BOOLEAN NOT NULL DEFAULT false,
  certificate_issued    BOOLEAN NOT NULL DEFAULT false,
  certificate_id        UUID,
  started_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, track_id)
);

CREATE INDEX IF NOT EXISTS idx_user_track_progress_user ON public.user_track_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_track_progress_track ON public.user_track_progress(track_id);

-- ============================================================================
-- 5. CERTIFICATES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.certificates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id        TEXT NOT NULL REFERENCES public.course_tracks(id) ON DELETE CASCADE,
  student_name    TEXT NOT NULL,
  track_title     TEXT NOT NULL,
  issued_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  certificate_url TEXT,
  is_verified     BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, track_id)
);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_track ON public.certificates(track_id);

-- ============================================================================
-- 6. USER STATE (XP, tier, coaching, saved kits - replaces localStorage)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_state (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tier                        TEXT NOT NULL DEFAULT 'free'
                                CHECK (tier IN ('free','pro','enterprise')),
  xp_points                   INTEGER NOT NULL DEFAULT 0,
  coaching_calls_remaining    INTEGER NOT NULL DEFAULT 0,
  saved_starter_kits          JSONB NOT NULL DEFAULT '[]',
  in_progress_track_id        TEXT,
  active_lab_id               TEXT,
  stripe_customer_id          TEXT,
  stripe_subscription_id      TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_state_user ON public.user_state(user_id);
CREATE INDEX IF NOT EXISTS idx_user_state_tier ON public.user_state(tier);
CREATE INDEX IF NOT EXISTS idx_user_state_stripe ON public.user_state(stripe_customer_id);

-- ============================================================================
-- 7. STARTER KITS (download tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.starter_kits (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  paradigm        TEXT NOT NULL,
  db              TEXT NOT NULL,
  queue           TEXT NOT NULL,
  auth_method     TEXT NOT NULL,
  description     TEXT NOT NULL,
  stars           INTEGER NOT NULL DEFAULT 0,
  github_repo_url TEXT,
  is_published    BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 8. WORKSHOP EVENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workshops (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  event_date      DATE NOT NULL,
  event_time      TEXT NOT NULL,
  speaker         TEXT NOT NULL,
  speaker_role    TEXT NOT NULL,
  topic           TEXT NOT NULL,
  attendees_count INTEGER NOT NULL DEFAULT 0,
  is_live         BOOLEAN NOT NULL DEFAULT false,
  is_published    BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 9. TEARDOWN ARTICLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.teardowns (
  id                    TEXT PRIMARY KEY,
  company               TEXT NOT NULL,
  logo_color            TEXT NOT NULL DEFAULT '#6366f1',
  title                 TEXT NOT NULL,
  read_time             TEXT NOT NULL,
  summary               TEXT NOT NULL,
  key_insights          JSONB NOT NULL DEFAULT '[]',
  architecture_overview TEXT NOT NULL,
  rfc_code_snippet      TEXT NOT NULL,
  tags                  JSONB NOT NULL DEFAULT '[]',
  is_published          BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 10. COACHING SESSIONS (Pro feature tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.coaching_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date    TIMESTAMPTZ NOT NULL,
  status          TEXT NOT NULL DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled','completed','cancelled','no_show')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coaching_sessions_user ON public.coaching_sessions(user_id);

-- ============================================================================
-- 11. AI USAGE LOG (rate limiting & analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ai_usage_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint        TEXT NOT NULL,
  tokens_used     INTEGER NOT NULL DEFAULT 0,
  request_time    TIMESTAMPTZ NOT NULL DEFAULT now(),
  response_time_ms INTEGER,
  success         BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON public.ai_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_time ON public.ai_usage_log(request_time);

-- ============================================================================
-- 12. AUDIT LOG (all write operations tracked)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,
  table_name      TEXT NOT NULL,
  record_id       TEXT,
  old_data        JSONB,
  new_data        JSONB,
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_time ON public.audit_log(created_at);

-- ============================================================================
-- Auto-update triggers for updated_at columns
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to all tables with updated_at column
DO $$ DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'updated_at'
      AND table_schema = 'public'
      AND table_name NOT LIKE 'pg_%'
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      t
    );
  END LOOP;
END $$;
