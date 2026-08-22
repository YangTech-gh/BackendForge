# RLS.md - Row Level Security Documentation

## Overview

Row Level Security (RLS) is the primary defense layer that ensures data isolation between users. Even if someone bypasses Edge Functions and queries Supabase directly, RLS policies prevent unauthorized access.

**Key Principle:** Every table with user data has RLS enabled. No data is accessible without an explicit policy.

---

## Security Architecture

```
Browser (anon key) → RLS policies filter queries
       ↓
Edge Functions (service role) → Bypasses RLS, double server check
       ↓
PostgreSQL (RLS enforced) → Defense-in-depth
```

### Defense Layers

1. **Layer 1 - JWT Authentication:** Verify user identity via Supabase Auth
2. **Layer 2 - Edge Function Logic:** Business logic validation (pro access, ownership, rate limits)
3. **Layer 3 - RLS Policies:** Database-level row filtering
4. **Layer 4 - Database Constraints:** Foreign keys, CHECK constraints, UNIQUE

---

## Table-by-Table RLS Policies

### profiles

| Policy | Operation | Rule | Purpose |
|--------|-----------|------|---------|
| `profiles_select_own` | SELECT | `auth.uid() = id` | Users see only their own profile |
| `profiles_update_own` | UPDATE | `auth.uid() = id` | Users edit only their own profile |
| `profiles_admin_select` | SELECT | `is_admin()` | Admins see all profiles |

### course_tracks

| Policy | Operation | Rule | Purpose |
|--------|-----------|------|---------|
| `tracks_select_published` | SELECT | `is_published = true` | Any authenticated user sees published tracks |
| `tracks_admin_insert` | INSERT | `is_admin()` | Only admins create tracks |
| `tracks_admin_update` | UPDATE | `is_admin()` | Only admins modify tracks |
| `tracks_admin_delete` | DELETE | `is_admin()` | Only admins delete tracks |

### course_labs

| Policy | Operation | Rule | Purpose |
|--------|-----------|------|---------|
| `labs_select_access` | SELECT | `is_pro = false OR has_pro_access()` | Free labs for all, pro labs only for pro users |
| `labs_admin_insert` | INSERT | `is_admin()` | Only admins create labs |
| `labs_admin_update` | UPDATE | `is_admin()` | Only admins modify labs |
| `labs_admin_delete` | DELETE | `is_admin()` | Only admins delete labs |

**Critical:** The `labs_select_access` policy is the core gating mechanism. It checks the user's role in the `profiles` table to determine if they can see pro-gated labs.

### user_lab_progress

| Policy | Operation | Rule | Purpose |
|--------|-----------|------|---------|
| `lab_progress_select_own` | SELECT | `auth.uid() = user_id` | Users see only their own progress |
| `lab_progress_insert_own` | INSERT | `auth.uid() = user_id` | Users can only insert own progress |
| `lab_progress_update_own` | UPDATE | `auth.uid() = user_id` | Users can only update own progress |
| `lab_progress_admin_select` | SELECT | `is_admin()` | Admins see all progress |

**Note:** In production, INSERT/UPDATE should be restricted to service role only (via Edge Functions). The client INSERT/UPDATE policies exist for backward compatibility but should be removed once all logic moves to Edge Functions.

### user_track_progress

| Policy | Operation | Rule | Purpose |
|--------|-----------|------|---------|
| `track_progress_select_own` | SELECT | `auth.uid() = user_id` | Users see only their own track progress |
| `track_progress_insert_own` | INSERT | `auth.uid() = user_id` | Users can only insert own track progress |
| `track_progress_update_own` | UPDATE | `auth.uid() = user_id` | Users can only update own track progress |
| `track_progress_admin_select` | SELECT | `is_admin()` | Admins see all track progress |

### certificates

| Policy | Operation | Rule | Purpose |
|--------|-----------|------|---------|
| `certificates_select_own` | SELECT | `auth.uid() = user_id` | Users see only their own certificates |
| `certificates_admin_select` | SELECT | `is_admin()` | Admins see all certificates |

**No INSERT/UPDATE/DELETE policies:** Certificates are only issued by the `submit-lab-completion` Edge Function using the service role key.

### user_state

| Policy | Operation | Rule | Purpose |
|--------|-----------|------|---------|
| `user_state_select_own` | SELECT | `auth.uid() = user_id` | Users see only their own state |
| `user_state_insert_own` | INSERT | `auth.uid() = user_id` | Users can insert own state record |
| `user_state_update_own` | UPDATE | `auth.uid() = user_id` | Users can update own state |
| `user_state_admin_select` | SELECT | `is_admin()` | Admins see all user states |

### starter_kits, workshops, teardowns

| Policy | Operation | Rule | Purpose |
|--------|-----------|------|---------|
| `*_select_published` | SELECT | `is_published = true` | Any authenticated user sees published content |
| `*_admin_all` | ALL | `is_admin()` | Full admin access |

### coaching_sessions

| Policy | Operation | Rule | Purpose |
|--------|-----------|------|---------|
| `coaching_select_own` | SELECT | `auth.uid() = user_id` | Users see only their own sessions |
| `coaching_insert_own` | INSERT | `auth.uid() = user_id` | Users can book own sessions |

### ai_usage_log

| Policy | Operation | Rule | Purpose |
|--------|-----------|------|---------|
| `ai_usage_select_own` | SELECT | `auth.uid() = user_id` | Users see only their own usage |
| `ai_usage_admin_select` | SELECT | `is_admin()` | Admins see all usage |

**No client INSERT:** Only Edge Functions (service role) can write AI usage logs.

### audit_log

| Policy | Operation | Rule | Purpose |
|--------|-----------|------|---------|
| `audit_log_admin_select` | SELECT | `is_admin()` | Admins only |
| `audit_log_admin_all` | ALL | `is_admin()` | Admins only |

### Stripe Tables

| Table | Policy | Operation | Rule | Purpose |
|-------|--------|-----------|------|---------|
| `stripe_customers` | `stripe_customers_select_own` | SELECT | `auth.uid() = user_id` | Users see only their own Stripe data |
| `stripe_checkout_sessions` | `stripe_checkout_select_own` | SELECT | `auth.uid() = user_id` | Users see only their own checkouts |
| `payments` | `payments_select_own` | SELECT | `auth.uid() = user_id` | Users see only their own payments |
| `payments` | `payments_admin_select` | SELECT | `is_admin()` | Admins see all payments |
| `stripe_webhook_events` | `webhook_events_admin_select` | SELECT | `is_admin()` | Admins only (no client access) |

---

## Security Definer Functions

These functions run with the creator's privileges (higher than the calling user), allowing optimized RLS checks:

### user_role()
```sql
-- Returns the current user's role from profiles table
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS app_role
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'student'::app_role
  );
$$;
```

### has_pro_access()
```sql
-- Checks if user has pro or admin role
CREATE OR REPLACE FUNCTION public.has_pro_access()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT public.user_role() IN ('pro_student', 'admin');
$$;
```

### is_admin()
```sql
-- Checks if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT public.user_role() = 'admin'::app_role;
$$;
```

---

## Performance Optimizations

### 1. Use `(SELECT auth.uid())` instead of `auth.uid()`

```sql
-- SLOW: auth.uid() called for every row
CREATE POLICY "slow" ON documents FOR SELECT
  USING (auth.uid() = user_id);

-- FAST: auth.uid() evaluated once, cached
CREATE POLICY "fast" ON documents FOR SELECT
  USING ((SELECT auth.uid()) = user_id);
```

### 2. Index all RLS columns

```sql
-- Index columns used in RLS policies
CREATE INDEX idx_profiles_id ON public.profiles(id);
CREATE INDEX idx_user_lab_progress_user ON public.user_lab_progress(user_id);
CREATE INDEX idx_user_state_user ON public.user_state(user_id);
CREATE INDEX idx_certificates_user ON public.certificates(user_id);
CREATE INDEX idx_stripe_customers_user ON public.stripe_customers(user_id);
```

### 3. Use SECURITY DEFINER for complex lookups

```sql
-- Optimized: returns user's team IDs (for multi-tenant apps)
CREATE OR REPLACE FUNCTION public.get_completed_lab_ids(p_user_id UUID)
RETURNS SETOF TEXT
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT lab_id FROM public.user_lab_progress
  WHERE user_id = p_user_id AND completed = true;
$$;
```

---

## Testing RLS Policies

### Test as specific user

```sql
-- Set JWT claims to test as a specific user
SELECT set_config('request.jwt.claims', json_build_object(
  'sub', 'user-uuid-here',
  'role', 'authenticated'
)::text, true);

-- Now queries run as that user
SELECT * FROM course_labs; -- RLS filters results

-- Reset
RESET ROLE;
```

### Test as anonymous

```sql
SET ROLE anon;
SELECT * FROM course_labs; -- Should return nothing (no anon policies)
RESET ROLE;
```

### Test with pgTAP

```sql
BEGIN;
SELECT plan(4);

-- Test 1: Anon cannot see any labs
SET LOCAL role TO anon;
SELECT results_eq(
  'SELECT count(*) FROM course_labs',
  ARRAY[0::bigint],
  'Anon sees no labs'
);

-- Test 2: Authenticated user sees only free labs
SET LOCAL role TO authenticated;
-- ... (requires JWT claims setup)

ROLLBACK;
```

---

## Common RLS Mistakes to Avoid

1. **Missing RLS on new tables:** Always enable RLS before deploying
2. **Trusting client-side filtering:** Client filters are UX, not security
3. **Using `auth.uid()` without `(SELECT ...)`:** Performance hit per row
4. **Not indexing RLS columns:** Sequential scans on large tables
5. **Forgetting `to authenticated` clause:** Policies apply to all roles
6. **Overly permissive policies:** Start with deny-all, add minimal access
7. **Not testing with two accounts:** Admin vs regular user vs anonymous
