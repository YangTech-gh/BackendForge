-- Backend Forge Seed Data - User Progress (Demo User)
-- Sample progress for a demo user in Track 2 (Node.js)
-- Run: psql -f supabase/seed-user-data.sql
--
-- NOTE: The demo user must exist in auth.users first (created via signup).
-- This seed assumes a demo user with id = '00000000-0000-0000-0000-000000000001'.

-- Ensure the demo user has a user_state row
INSERT INTO public.user_state (user_id, tier, xp_points)
VALUES ('00000000-0000-0000-0000-000000000001', 'free', 3500)
ON CONFLICT (user_id) DO UPDATE SET
  tier = EXCLUDED.tier,
  xp_points = EXCLUDED.xp_points;

-- Lab progress for Track 2 (Node.js) - partially completed
INSERT INTO public.user_lab_progress (user_id, lab_id, completed, completed_at, xp_earned, score)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'lab-rest-api-design',       true,  '2026-08-12T15:00:00Z', 150, 92),
  ('00000000-0000-0000-0000-000000000001', 'lab-event-loop-profiling',  true,  '2026-08-15T14:30:00Z', 150, 95),
  ('00000000-0000-0000-0000-000000000001', 'lab-webhook-idempotency',   true,  '2026-08-16T15:00:00Z', 150, 88),
  ('00000000-0000-0000-0000-000000000001', 'lab-multi-tenant-billing',  false, NULL, 0, NULL),
  ('00000000-0000-0000-0000-000000000001', 'lab-graphql-schema',        false, NULL, 0, NULL)
ON CONFLICT (user_id, lab_id) DO UPDATE SET
  completed     = EXCLUDED.completed,
  completed_at  = EXCLUDED.completed_at,
  xp_earned     = EXCLUDED.xp_earned,
  score         = EXCLUDED.score;

-- Track progress (aggregated)
INSERT INTO public.user_track_progress (user_id, track_id, labs_completed, total_labs, is_track_completed)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'track-2-node-ts', 3, 5, false)
ON CONFLICT (user_id, track_id) DO UPDATE SET
  labs_completed   = EXCLUDED.labs_completed,
  total_labs       = EXCLUDED.total_labs,
  is_track_completed = EXCLUDED.is_track_completed;
