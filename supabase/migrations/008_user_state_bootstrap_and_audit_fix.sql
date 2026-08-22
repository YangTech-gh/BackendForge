-- ============================================================================
-- Migration 008: User State Bootstrap + Audit Trigger Fix
-- Backend Forge - Ensures user_state row created on signup; fixes audit
-- ============================================================================

-- ============================================================================
-- 1. FIX: Create user_state + profile on new user signup
-- ============================================================================
-- handle_new_user only created profiles; user_state was never created,
-- breaking: stripe-checkout validate_pro_upgrade (403), webhook upgrade
-- (0 rows updated), save-starter-kit (500), coaching validator (403)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture', ''),
    'student'
  );

  INSERT INTO public.user_state (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. Backfill: create user_state + profiles for any existing users missing them
-- ============================================================================
INSERT INTO public.user_state (user_id)
SELECT u.id
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_state us WHERE us.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, avatar_url, role)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', ''),
  COALESCE(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture', ''),
  'student'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. FIX: Remove random-user fallback from audit_trigger_func
-- ============================================================================
-- Previously: COALESCE(auth.uid(), (SELECT id FROM auth.users LIMIT 1))
-- This attributed service-role writes (webhooks) to an arbitrary user.
-- Now: use NULL when auth.uid() is unavailable (schema allows NULL).
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
      auth.uid(),
      'INSERT',
      TG_TABLE_NAME,
      (NEW.id)::text,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (
      auth.uid(),
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
      auth.uid(),
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
