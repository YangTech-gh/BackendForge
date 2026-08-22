# EDGE_FUNCTIONS.md - Edge Functions Documentation

## Overview

Backend Forge uses **12 Supabase Edge Functions** as the sole backend layer. All database access, AI API calls, and Stripe operations go through these Deno-based serverless functions.

**Architecture:** Frontend -> Edge Function (JWT check + business logic) -> Database/External APIs

---

## Edge Functions List

| Function | Auth Required | Purpose | Rate Limit |
|----------|--------------|---------|------------|
| stripe-checkout | Yes | Create Stripe Checkout Session | 5/min |
| stripe-webhook | No (Stripe signature) | Process Stripe webhook events | None |
| stripe-portal | Yes | Create billing portal session | 5/min |
| request-refund | Yes | Process refund requests via Stripe | 3/min |
| ai-system-review | Yes | AI architecture evaluation | 20/min |
| ai-lab-evaluator | Yes | AI code review for labs | 15/min |
| ai-ask-tutor | Yes | AI tutor Q&A | 25/min |
| get-courses | Yes | Fetch all tracks + labs | 30/min |
| get-lab | Yes | Fetch single lab details | 30/min |
| submit-lab-completion | Yes | Mark lab complete + XP + cert | 10/min |
| get-user-progress | Yes | Dashboard progress data | 30/min |
| upgrade-pro | Yes | Redirect to Stripe Checkout | 5/min |
| verify-certificate | No | Public certificate verification | 60/min |

---

## Function Details

### 1. stripe-checkout

Creates a Stripe Checkout Session for Pro upgrade.

**Deploy:**
```bash
supabase functions deploy stripe-checkout
```

**Request:**
```json
POST /functions/v1/stripe-checkout
Authorization: Bearer <supabase_token>
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

**Security Flow:**
1. Extract JWT from Authorization header
2. Call `supabase.auth.getUser()` to verify identity
3. Call `validate_pro_upgrade()` RPC to check eligibility
4. Validate `price_id` against server-side whitelist
5. Get or create Stripe customer
6. Create Checkout Session with user metadata
7. Log checkout attempt in database

**Code Location:** `supabase/functions/stripe-checkout/index.ts`

---

### 2. stripe-webhook

Processes Stripe webhook events. Deployed with `--no-verify-jwt` since Stripe sends unauthenticated requests.

**Deploy:**
```bash
supabase functions deploy stripe-webhook --no-verify-jwt
```

**Events Handled:**
- `checkout.session.completed` - Upgrade user, record payment
- `checkout.session.expired` - Mark checkout expired
- `payment_intent.payment_failed` - Record failed payment
- `charge.refunded` - Downgrade user, record refund

**Security Flow:**
1. Read raw body text
2. Verify Stripe signature using `webhooks.constructEventAsync()`
3. Check idempotency in `stripe_webhook_events` table
4. Process event with service role (bypasses RLS)
5. Return 200 OK immediately

**Code Location:** `supabase/functions/stripe-webhook/index.ts`

---

### 3. stripe-portal

Creates a Stripe Customer Portal session for managing billing.

**Deploy:**
```bash
supabase functions deploy stripe-portal
```

**Request:**
```json
POST /functions/v1/stripe-portal
Authorization: Bearer <supabase_token>
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/session/xxx"
}
```

**Code Location:** `supabase/functions/stripe-portal/index.ts`

---

### 4. request-refund

Processes refund requests for Pro users via Stripe.

**Deploy:**
```bash
supabase functions deploy request-refund
```

**Request:**
```json
POST /functions/v1/request-refund
Authorization: Bearer <supabase_token>
Content-Type: application/json

{
  "reason": "No longer needed"
}
```

**Response:**
```json
{
  "success": true,
  "refundId": "re_xxx",
  "message": "Refund processed successfully. Your access has been downgraded to Free tier."
}
```

**Security Flow:**
1. Verify JWT
2. Check user is Pro tier
3. Verify user has a Stripe customer ID
4. Find most recent succeeded payment
5. Check no prior refund exists
6. Create Stripe refund via API
7. Record refund in payments table
8. Downgrade user tier to free
9. Update profile role to student

**Code Location:** `supabase/functions/request-refund/index.ts`

---

### 5. ai-system-review

AI-powered architecture evaluation using Gemini API.

**Deploy:**
```bash
supabase functions deploy ai-system-review
```

**Request:**
```json
POST /functions/v1/ai-system-review
Authorization: Bearer <supabase_token>
Content-Type: application/json

{
  "nodes": [...],
  "connections": [...],
  "targetRps": 10000,
  "latencyBudgetMs": 50,
  "systemGoal": "High-throughput payment processing"
}
```

**Response:**
```json
{
  "rfcTitle": "RFC: Payment Processing Architecture",
  "spofs": ["..."],
  "concurrencyAnalysis": "...",
  "capTradeoffs": "...",
  "estimatedMonthlyCost": "$420 - $850 / month",
  "recommendations": ["..."],
  "generatedCodeSnippet": "// TypeScript code..."
}
```

**Security Flow:**
1. Verify JWT
2. Rate limit check via `check_rate_limit()` RPC
3. Validate input (nodes must be array)
4. Call Gemini API with sanitized prompt
5. Log AI usage to `ai_usage_log`
6. Return result

**Code Location:** `supabase/functions/ai-system-review/index.ts`

---

### 6. ai-lab-evaluator

AI-powered code review for lab submissions.

**Deploy:**
```bash
supabase functions deploy ai-lab-evaluator
```

**Request:**
```json
POST /functions/v1/ai-lab-evaluator
Authorization: Bearer <supabase_token>
Content-Type: application/json

{
  "labId": "lab-idempotency-engine",
  "code": "...",
  "language": "typescript"
}
```

**Response:**
```json
{
  "passed": true,
  "score": 94,
  "feedback": "...",
  "securitySuggestions": ["..."],
  "performanceTips": ["..."],
  "improvedCode": "..."
}
```

**Security Flow:**
1. Verify JWT
2. Rate limit check
3. Verify lab exists in database
4. Check pro access if lab is pro-gated
5. Call Gemini API
6. Log AI usage
7. Return result

**Code Location:** `supabase/functions/ai-lab-evaluator/index.ts`

---

### 7. ai-ask-tutor

AI tutor Q&A for architecture mentorship.

**Deploy:**
```bash
supabase functions deploy ai-ask-tutor
```

**Request:**
```json
POST /functions/v1/ai-ask-tutor
Authorization: Bearer <supabase_token>
Content-Type: application/json

{
  "question": "How do I implement idempotency in a distributed system?",
  "contextTrack": "Node.js & TypeScript"
}
```

**Response:**
```json
{
  "answer": "### Idempotency in Distributed Systems\n\n..."
}
```

**Security Flow:**
1. Verify JWT
2. Rate limit check
3. Sanitize input (limit to 2000 chars)
4. Call Gemini API with system prompt
5. Log AI usage
6. Return answer

**Code Location:** `supabase/functions/ai-ask-tutor/index.ts`

---

### 8. get-courses

Fetches all published tracks and labs from database.

**Deploy:**
```bash
supabase functions deploy get-courses
```

**Request:**
```json
GET /functions/v1/get-courses
Authorization: Bearer <supabase_token>
```

**Response:**
```json
{
  "courses": [
    {
      "id": "track-1-node-ts",
      "title": "The Ubiquitous Backend",
      "labs": [
        {
          "id": "lab-idempotency-engine",
          "title": "Lab 1.1: Idempotency Keys",
          "completed": false,
          "score": null
        }
      ]
    }
  ],
  "userTier": "free",
  "xpPoints": 0
}
```

**Security Flow:**
1. Verify JWT
2. Fetch tracks (RLS filters by `is_published`)
3. Fetch labs (RLS handles pro gating)
4. Fetch user progress
5. Fetch user state
6. Assemble and return

**Code Location:** `supabase/functions/get-courses/index.ts`

---

### 9. get-lab

Fetches a single lab with full details.

**Deploy:**
```bash
supabase functions deploy get-lab
```

**Request:**
```json
GET /functions/v1/get-lab?labId=lab-idempotency-engine
Authorization: Bearer <supabase_token>
```

**Response:**
```json
{
  "lab": {
    "id": "lab-idempotency-engine",
    "title": "Lab 1.1: Idempotency Keys",
    "initial_files": [...],
    "instructions": [...],
    "test_cases": [...]
  },
  "track": {
    "id": "track-1-node-ts",
    "title": "The Ubiquitous Backend"
  },
  "progress": {
    "completed": false,
    "score": null,
    "ai_feedback": null
  }
}
```

**Security Flow:**
1. Verify JWT
2. Fetch lab (RLS handles pro access)
3. Fetch user progress for this lab
4. Return lab + progress

**Code Location:** `supabase/functions/get-lab/index.ts`

---

### 10. submit-lab-completion

Validates and records lab completion with double server check.

**Deploy:**
```bash
supabase functions deploy submit-lab-completion
```

**Request:**
```json
POST /functions/v1/submit-lab-completion
Authorization: Bearer <supabase_token>
Content-Type: application/json

{
  "labId": "lab-idempotency-engine",
  "code": "...",
  "score": 94
}
```

**Response:**
```json
{
  "success": true,
  "passed": true,
  "xpAwarded": 150,
  "totalXp": 150,
  "certificateIssued": null
}
```

**Double Server Check:**
1. Verify JWT
2. Call `validate_lab_completion()` RPC:
   - Verify lab exists
   - Check not already completed
   - Verify pro access if needed
   - Validate score range
3. Verify score >= 80 for passing
4. Insert/update `user_lab_progress`
5. Recalculate total XP via `calculate_total_xp()`
6. Check if track is complete
7. Issue certificate if all labs done
8. Return result

**Code Location:** `supabase/functions/submit-lab-completion/index.ts`

---

### 11. get-user-progress

Fetches all user progress data for dashboard.

**Deploy:**
```bash
supabase functions deploy get-user-progress
```

**Request:**
```json
GET /functions/v1/get-user-progress
Authorization: Bearer <supabase_token>
```

**Response:**
```json
{
  "userState": {
    "tier": "pro",
    "xp_points": 2400,
    "coaching_calls_remaining": 1
  },
  "labProgress": [...],
  "trackProgress": [...],
  "certificates": [...]
}
```

**Code Location:** `supabase/functions/get-user-progress/index.ts`

---

### 12. upgrade-pro

Legacy endpoint that redirects to Stripe Checkout.

**Deploy:**
```bash
supabase functions deploy upgrade-pro
```

**Code Location:** `supabase/functions/upgrade-pro/index.ts`

---

### 13. verify-certificate

Public endpoint for certificate verification (no auth required).

**Deploy:**
```bash
supabase functions deploy verify-certificate
```

**Request:**
```json
GET /functions/v1/verify-certificate?certId=uuid-here
```

**Response:**
```json
{
  "valid": true,
  "certificate": {
    "id": "uuid",
    "studentName": "Alex Vance",
    "trackTitle": "The Ubiquitous Backend",
    "issuedAt": "2026-01-15T00:00:00Z",
    "isVerified": true
  }
}
```

**Code Location:** `supabase/functions/verify-certificate/index.ts`

---

## Deployment

### Install Supabase CLI
```bash
npm install -g supabase
```

### Initialize Project
```bash
supabase init
```

### Link to Project
```bash
supabase link --project-ref <your-project-ref>
```

### Run Migrations
```bash
supabase db push
```

### Deploy All Functions
```bash
supabase functions deploy
```

### Deploy Single Function
```bash
supabase functions deploy <function-name>
```

### Set Secrets
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_WEBHOOK_SIGNING_SECRET=whsec_xxx
supabase secrets set GEMINI_API_KEY=xxx
supabase secrets set APP_URL=https://your-app.com
```

### Local Development
```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve --env-file .env
```

---

## CORS Configuration

All Edge Functions include these CORS headers:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

**Production:** Change `Allow-Origin` to your domain.

---

## Error Handling

All functions return structured errors:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad request (invalid input)
- `401` - Unauthorized (missing/invalid JWT)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `429` - Rate limit exceeded
- `500` - Internal server error
- `503` - Service unavailable (AI API not configured)

---

## Environment Variables

| Variable | Function | Description |
|----------|----------|-------------|
| SUPABASE_URL | All | Supabase project URL |
| SUPABASE_ANON_KEY | All | Supabase anon key |
| SUPABASE_SERVICE_ROLE_KEY | All | Service role key (bypasses RLS) |
| STRIPE_SECRET_KEY | stripe-* | Stripe API key |
| STRIPE_WEBHOOK_SIGNING_SECRET | stripe-webhook | Webhook signature secret |
| STRIPE_PRICE_PRO_LIFETIME | stripe-checkout | Price ID for Pro |
| APP_URL | stripe-* | Your app's base URL |
| GEMINI_API_KEY | ai-* | Google Gemini API key |
