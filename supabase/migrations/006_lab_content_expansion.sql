-- ============================================================================
-- Migration 006: Lab Content Expansion - Scaffolding, Tips, Lessons, Exercises
-- Backend Forge - Richer educational content and progressive learning paths
-- ============================================================================

-- Scaffolding: guided progression metadata for each lab
ALTER TABLE public.course_labs 
  ADD COLUMN IF NOT EXISTS scaffolding JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tips JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS lessons JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS exercises JSONB NOT NULL DEFAULT '[]';
