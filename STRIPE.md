# STRIPE.md - Stripe Integration Documentation

## Overview

Backend Forge uses **Stripe Checkout** for one-time Pro lifetime purchases ($199). The integration uses:

- **Stripe Checkout Sessions** for payment collection
- **Webhooks** for payment verification and user upgrades
- **Edge Functions** for all Stripe API calls (secret key never exposed to client)
- **Database tables** for payment records and idempotency

---

## Architecture

```
Frontend                    Edge Functions              Stripe
   │                            │                        │
   │  1. Click "Go Pro"         │                        │
   │───────────────────────────>│                        │
   │                            │  2. Create Checkout    │
   │                            │     Session            │
   │                            │───────────────────────>│
   │                            │                        │
   │  3. Redirect to Stripe     │                        │
   │<───────────────────────────│                        │
   │                            │                        │
   │  4. Complete Payment       │                        │
   │────────────────────────────────────────────────────>│
   │                            │                        │
   │                            │  5. Webhook:           │
   │                            │     checkout.session   │
   │                            │     .completed         │
   │                            │<───────────────────────│
   │                            │                        │
   │                            │  6. Verify signature   │
   │                            │  7. Update user tier   │
   │                            │  8. Record payment     │
   │                            │                        │
   │  9. Refresh page           │                        │
   │<───────────────────────────│                        │
```

---

## Setup Steps

### 1. Create Stripe Account

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Create account or log in
3. Note: Use **Test Mode** during development

### 2. Create Product & Price

1. Go to **Products** → **Add Product**
2. Name: "Backend Forge Pro - Lifetime"
3. Add price: $199.00, One-time
4. Copy the **Price ID** (starts with `price_`)

### 3. Get API Keys

1. Go to **Developers** → **API Keys**
2. Copy **Publishable Key** (`pk_test_...`)
3. Copy **Secret Key** (`sk_test_...`)

### 4. Set Up Webhook

1. Go to **Developers** → **Webhooks** → **Add Endpoint**
2. Endpoint URL: `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy **Webhook Signing Secret** (`whsec_...`)

### 5. Configure Supabase Secrets

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key
supabase secrets set STRIPE_WEBHOOK_SIGNING_SECRET=whsec_your_secret
supabase secrets set STRIPE_PRICE_PRO_LIFETIME=price_your_price_id
supabase secrets set APP_URL=https://your-app-url.com
```

### 6. Deploy Edge Functions

```bash
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook --no-verify-jwt
supabase functions deploy stripe-portal
```

---

## Edge Functions

### stripe-checkout (JWT Required)

**Purpose:** Create a Stripe Checkout Session for Pro upgrade.

**Request:**
```json
POST /functions/v1/stripe-checkout
Authorization: Bearer <supabase_access_token>
Content-Type: application/json

{
  "price_id": "price_xxx"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/pay/cs_test_xxx"
}
```

**Security Checks:**
1. Verify JWT (double server check #1)
2. Validate upgrade eligibility via `validate_pro_upgrade()` (double server check #2)
3. Validate `price_id` against server-side whitelist
4. Create or retrieve Stripe customer
5. Log checkout attempt

### stripe-webhook (No JWT - Stripe Signature)

**Purpose:** Process Stripe webhook events for payment verification.

**Events Handled:**
- `checkout.session.completed` → Upgrade user to Pro, record payment
- `checkout.session.expired` → Mark checkout as expired
- `payment_intent.payment_failed` → Record failed payment
- `charge.refunded` → Downgrade user, record refund

**Security:**
1. Verify Stripe webhook signature (prevents spoofed requests)
2. Idempotency check via `stripe_webhook_events` table
3. Use service role key for database writes (bypasses RLS)

### stripe-portal (JWT Required)

**Purpose:** Create a Stripe Customer Portal session for managing billing.

**Request:**
```json
POST /functions/v1/stripe-portal
Authorization: Bearer <supabase_access_token>
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/session/xxx"
}
```

---

## Database Tables

### stripe_customers
Links Supabase users to Stripe customer IDs.

```sql
CREATE TABLE stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### stripe_checkout_sessions
Tracks checkout attempts for debugging and analytics.

```sql
CREATE TABLE stripe_checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  stripe_session_id TEXT UNIQUE NOT NULL,
  price_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  amount_total INTEGER,
  currency TEXT DEFAULT 'usd',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### payments
Complete payment history for auditing and refunds.

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  stripe_payment_intent TEXT UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT CHECK (status IN ('succeeded','pending','failed','refunded')),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### stripe_webhook_events
Idempotency tracking for webhook processing.

```sql
CREATE TABLE stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Payment Flow

### Pro Upgrade Flow

1. User clicks "Go Pro - $199"
2. Frontend calls `stripe-checkout` Edge Function with price_id
3. Edge Function validates user eligibility (not already pro)
4. Edge Function creates Stripe Checkout Session
5. User redirected to Stripe-hosted checkout page
6. User completes payment on Stripe
7. Stripe sends `checkout.session.completed` webhook
8. `stripe-webhook` Edge Function:
   - Verifies webhook signature
   - Checks idempotency (prevents duplicate processing)
   - Records payment in `payments` table
   - Updates `user_state.tier` to 'pro'
   - Updates `profiles.role` to 'pro_student'
   - Grants 2 coaching calls
9. User returns to app, sees Pro features

### Refund Flow

1. Admin processes refund in Stripe Dashboard
2. Stripe sends `charge.refunded` webhook
3. `stripe-webhook` Edge Function:
   - Records refund in `payments` table
   - Downgrades `user_state.tier` to 'free'
   - Updates `profiles.role` to 'student'
   - Revokes coaching calls

---

## Security Considerations

### Never Expose to Client
- `STRIPE_SECRET_KEY` → Stored as Supabase secret
- `STRIPE_WEBHOOK_SIGNING_SECRET` → Stored as Supabase secret
- Stripe customer creation logic → Edge Function only
- Payment processing → Edge Function only

### Always Verify Server-Side
- Webhook signature verification
- Price ID validation against whitelist
- User eligibility checks before checkout
- Idempotency checks on webhook events

### Rate Limiting
- Checkout endpoint: 5 requests per minute per user
- Webhook endpoint: No rate limit (Stripe controls retry)

---

## Testing

### Stripe Test Mode

1. Use test API keys (`sk_test_...`, `pk_test_...`)
2. Use [test card numbers](https://docs.stripe.com/testing#general-testing):
   - Success: `4242 4242 4242 4242`
   - Failure: `4000 0000 0000 0002`
   - Requires 3D Secure: `4000 0025 0000 3155`

### Local Webhook Testing

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local Edge Functions
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger charge.refunded
```

### Testing Checklist

- [ ] Create checkout session as authenticated user
- [ ] Complete payment with test card
- [ ] Verify webhook updates user tier
- [ ] Verify payment recorded in database
- [ ] Test idempotency (send same webhook twice)
- [ ] Test refund flow
- [ ] Test customer portal access
- [ ] Test rate limiting on checkout endpoint

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `STRIPE_SECRET_KEY` | Stripe API secret key | Yes |
| `STRIPE_WEBHOOK_SIGNING_SECRET` | Webhook signature secret | Yes |
| `STRIPE_PRICE_PRO_LIFETIME` | Price ID for lifetime access | Yes |
| `STRIPE_PRICE_PRO_MONTHLY` | Price ID for monthly (optional) | No |
| `APP_URL` | Your app's base URL | Yes |
