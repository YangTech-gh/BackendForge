# INTEGRATIONS.md - Complete Integration Guide

## Overview

Backend Forge integrates 4 external services through Supabase Edge Functions:

1. **Supabase Auth** - Google OAuth authentication
2. **Supabase Database** - PostgreSQL with RLS
3. **Stripe** - Payment processing
4. **Google Gemini** - AI-powered features

---

## Integration Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                   │
│  - Supabase JS Client (auth + anon key)                │
│  - Stripe.js (checkout redirect only)                  │
│  - All UI rendering                                    │
└───────────────┬─────────────────────────┬───────────────┘
                │ JWT + anon key          │
                ▼                         ▼
┌───────────────────────┐   ┌────────────────────────────┐
│   Supabase Auth       │   │   Supabase Edge Functions  │
│   - Google OAuth      │   │   - JWT verification       │
│   - JWT generation    │   │   - Business logic         │
│   - Session mgmt      │   │   - RLS bypass (service)   │
└───────────────────────┘   │   - External API calls     │
                            └────┬───────┬───────┬───────┘
                                 │       │       │
                    ┌────────────┘       │       └────────────┐
                    ▼                    ▼                    ▼
          ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
          │  PostgreSQL  │    │    Stripe    │    │  Gemini API  │
          │  (Supabase)  │    │   (Payments) │    │  (AI Review) │
          └──────────────┘    └──────────────┘    └──────────────┘
```

---

## 1. Supabase Auth (Google OAuth)

### Setup

1. **Supabase Dashboard** -> Authentication -> Providers -> Google
2. Enable Google provider
3. Enter OAuth credentials from Google Cloud Console:
   - Client ID
   - Client Secret
4. Set redirect URL: `https://<project>.supabase.co/auth/v1/callback`

### Google Cloud Console Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://<project>.supabase.co/auth/v1/callback`
   - `http://localhost:54321/auth/v1/callback` (for local dev)

### Frontend Integration

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://<project>.supabase.co',
  '<publishable-key>'
)

// Sign in with Google
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'http://localhost:3000/auth/callback'
  }
})

// Sign out
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

### Auto-Profile Creation

Trigger `on_auth_user_created` automatically creates a `profiles` row:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

This copies Google OAuth metadata (name, avatar) to the profiles table.

### JWT Claims

Supabase Auth includes these in the JWT:
- `sub` - User ID
- `email` - User email
- `role` - 'authenticated'
- `app_metadata.role` - Custom role (student/pro_student/admin)

Edge Functions access these via `supabase.auth.getUser()`.

---

## 2. Supabase Database (PostgreSQL)

### Connection

```typescript
// Client-side (anon key, RLS enforced)
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

// Edge Function (service role, bypasses RLS)
const adminSupabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)
```

### Schema

See `TABLES.md` for complete schema documentation.

Key tables:
- `profiles` - User identity
- `course_tracks` / `course_labs` - Course content
- `user_lab_progress` / `user_track_progress` - Progress tracking
- `certificates` - Issued certificates
- `user_state` - Master user state
- `payments` / `stripe_customers` - Payment records

### RLS Policies

See `RLS.md` for complete RLS documentation.

**Key rule:** All tables have RLS enabled. No data accessible without explicit policy.

### Migrations

```bash
# Run all migrations
supabase db push

# Reset database
supabase db reset

# Create new migration
supabase migration new <name>
```

---

## 3. Stripe Integration

### Setup

See `STRIPE.md` for complete Stripe documentation.

**Quick Start:**
1. Create Stripe account
2. Create Product + Price ($199 lifetime)
3. Get API keys (test mode)
4. Set up webhook endpoint
5. Configure Supabase secrets

### Flow

```
User clicks "Go Pro"
  → Frontend calls stripe-checkout Edge Function
    → Edge Function creates Checkout Session
      → User redirected to Stripe
        → Payment completed
          → Stripe sends webhook
            → stripe-webhook Edge Function processes
              → User tier updated in database
```

### Environment Variables

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_WEBHOOK_SIGNING_SECRET=whsec_xxx
supabase secrets set STRIPE_PRICE_PRO_LIFETIME=price_xxx
supabase secrets set APP_URL=https://your-app.com
```

### Testing

```bash
# Stripe CLI
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger charge.refunded
```

---

## 4. Google Gemini AI

### Setup

1. Get API key from [aistudio.google.com](https://aistudio.google.com)
2. Set Supabase secret:
   ```bash
   supabase secrets set GEMINI_API_KEY=your-key
   ```

### Usage in Edge Functions

```typescript
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  }
)
```

### Endpoints

| Function | Purpose | Rate Limit |
|----------|---------|------------|
| ai-system-review | Architecture evaluation | 20/min per user |
| ai-lab-evaluator | Code review | 15/min per user |
| ai-ask-tutor | Q&A tutor | 25/min per user |

### Rate Limiting

Implemented via `check_rate_limit()` database function:

```sql
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 30,
  p_window_seconds INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT (
    SELECT COUNT(*)
    FROM public.ai_usage_log
    WHERE user_id = p_user_id
      AND endpoint = p_endpoint
      AND request_time > now() - (p_window_seconds || ' seconds')::interval
  ) < p_max_requests;
$$;
```

### Usage Tracking

All AI requests logged to `ai_usage_log` table:
- User ID
- Endpoint name
- Tokens used
- Success/failure
- Response time

---

## 5. Frontend Integration

### Install Dependencies

```bash
npm install @supabase/supabase-js
```

### Initialize Client

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)
```

### Auth State

```typescript
// src/hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

### Calling Edge Functions

```typescript
// With user JWT
const { data, error } = await supabase.functions.invoke('get-courses')

// With custom body
const { data, error } = await supabase.functions.invoke('submit-lab-completion', {
  body: { labId: 'lab-id', code: '...', score: 95 }
})
```

### Data Fetching Pattern

```typescript
// src/hooks/useCourses.ts
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase.functions.invoke('get-courses')
      if (!error) setCourses(data.courses)
      setLoading(false)
    }
    fetchCourses()
  }, [])

  return { courses, loading }
}
```

---

## 6. Deployment Checklist

### Supabase

- [ ] Create Supabase project
- [ ] Run migrations (001-005)
- [ ] Configure Google OAuth provider
- [ ] Set all secrets via CLI
- [ ] Deploy all Edge Functions
- [ ] Test RLS policies

### Stripe

- [ ] Create Stripe account
- [ ] Create Product + Price
- [ ] Get API keys
- [ ] Set up webhook endpoint
- [ ] Test with Stripe CLI
- [ ] Verify payment flow

### Frontend

- [ ] Install @supabase/supabase-js
- [ ] Configure environment variables
- [ ] Implement auth flow
- [ ] Replace localStorage with Supabase
- [ ] Replace data imports with Edge Functions
- [ ] Test all features

### Security

- [ ] Verify RLS on all tables
- [ ] Test with two accounts (admin + student)
- [ ] Verify rate limiting works
- [ ] Check audit logs
- [ ] Test certificate verification

---

## 7. Environment Variables

### Supabase (set via CLI)

```bash
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SIGNING_SECRET=whsec_xxx
STRIPE_PRICE_PRO_LIFETIME=price_xxx
APP_URL=https://your-app.com
GEMINI_API_KEY=your-gemini-key
```

### Frontend (.env)

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

---

## 8. Monitoring

### Supabase Dashboard

- **Database** -> Query logs, performance
- **Edge Functions** -> Function logs, invocations
- **Auth** -> User management, sessions
- **Storage** -> File uploads (if used)

### Stripe Dashboard

- **Payments** -> Transaction history
- **Webhooks** -> Event delivery logs
- **Customers** -> Customer management

### Key Metrics to Monitor

| Metric | Where | Alert Threshold |
|--------|-------|-----------------|
| Edge Function errors | Supabase Dashboard | > 5% error rate |
| AI API failures | ai_usage_log table | > 10% failure rate |
| Webhook processing | stripe_webhook_events | Unprocessed > 5 min |
| RLS policy violations | PostgreSQL logs | Any occurrence |
