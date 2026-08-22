-- Migration 007: Add tier column to course_tracks
-- Adds tier grouping for the 4-tier course structure

-- Add tier column
ALTER TABLE public.course_tracks ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'fundamentals';

-- Add check constraint for valid tiers
ALTER TABLE public.course_tracks ADD CONSTRAINT course_tracks_tier_check
  CHECK (tier IN ('fundamentals', 'paradigm_stacks', 'architecture', 'specialization'));

-- Add comment
COMMENT ON COLUMN public.course_tracks.tier IS 'Course tier: fundamentals (Tier 1), paradigm_stacks (Tier 2), architecture (Tier 3), specialization (Tier 4)';

-- Update existing tracks with correct tiers
UPDATE public.course_tracks SET tier = 'fundamentals' WHERE track_number IN (1, 2, 3, 4);
UPDATE public.course_tracks SET tier = 'paradigm_stacks' WHERE track_number IN (5, 6, 7, 8, 13);
UPDATE public.course_tracks SET tier = 'architecture' WHERE track_number IN (9, 10, 11, 12, 17, 18, 19, 21);
UPDATE public.course_tracks SET tier = 'specialization' WHERE track_number IN (14, 15, 16, 20);

-- Add index for tier queries
CREATE INDEX IF NOT EXISTS idx_course_tracks_tier ON public.course_tracks (tier);
