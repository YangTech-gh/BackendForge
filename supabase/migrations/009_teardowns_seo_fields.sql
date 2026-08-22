-- ============================================================================
-- Migration 009: Teardown SEO Fields - Slug, FAQ Pairs, Keywords, Metadata
-- Backend Forge - SEO optimization for teardown articles
-- ============================================================================

-- Add SEO columns to teardowns table
ALTER TABLE public.teardowns
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Backend Forge Team',
  ADD COLUMN IF NOT EXISTS faq_pairs JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS keywords JSONB NOT NULL DEFAULT '[]';

-- Unique index on slug for URL routing
CREATE UNIQUE INDEX IF NOT EXISTS idx_teardowns_slug ON public.teardowns(slug);

-- Index on published_at for ordering
CREATE INDEX IF NOT EXISTS idx_teardowns_published ON public.teardowns(published_at DESC);
