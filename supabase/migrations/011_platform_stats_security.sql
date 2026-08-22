-- ============================================================================
-- Migration 011: Secure Platform Stats Materialized View
-- Backend Forge - Restrict direct access to platform_stats
-- ============================================================================
-- SECURITY ISSUE: platform_stats materialized view was publicly accessible
-- FIX: Revoke direct access, create SECURITY DEFINER function for controlled access
-- ============================================================================

-- Revoke direct access from anon and authenticated roles
REVOKE ALL ON public.platform_stats FROM anon;
REVOKE ALL ON public.platform_stats FROM authenticated;

-- Grant usage only to service_role (for edge functions)
GRANT SELECT ON public.platform_stats TO service_role;

-- Create a SECURITY DEFINER function for controlled access
-- This allows authenticated users to read stats without direct table access
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS TABLE (
  total_users BIGINT,
  pro_users BIGINT,
  total_certificates BIGINT,
  total_labs_completed BIGINT,
  total_xp_awarded BIGINT,
  refreshed_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    total_users,
    pro_users,
    total_certificates,
    total_labs_completed,
    total_xp_awarded,
    refreshed_at
  FROM public.platform_stats;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_platform_stats() TO authenticated;

-- Add comment explaining the security model
COMMENT ON MATERIALIZED VIEW public.platform_stats IS
  'Aggregated platform statistics. Direct access revoked. Use get_platform_stats() function instead.';
