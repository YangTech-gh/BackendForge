-- ============================================================================
-- Backend Forge Master Seed
-- Auto-run by `supabase db reset` after migrations.
-- Also runnable manually: psql -f supabase/seed.sql
-- ============================================================================

-- 1. Track definitions (16 tracks across 4 tiers)
\i supabase/seed-tracks.sql

-- 2. Labs (34 labs across 16 tracks, modularized)
\i supabase/seed-labs.sql

-- 3. Starter kits (code templates for each track)
\i supabase/seed-starter-kits.sql

-- 4. Workshops (3 live workshops)
\i supabase/seed-workshops.sql

-- 5. Teardown articles (3 architecture teardowns)
\i supabase/seed-teardowns.sql
