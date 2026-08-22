# CHANGES.md - Frontend-to-Backend Migration Audit

## Executive Summary

This document catalogs **every piece of data, logic, and functionality** currently exposed on the frontend of Backend Forge that must be moved to server-guarded Edge Functions for production security.

**Current State:** 100% frontend prototype with localStorage persistence, hardcoded course data, simulated payments, and no authentication.

**Target State:** Full Supabase backend with Edge Functions for all DB access, Stripe Checkout for payments, Google OAuth for auth, and defense-in-depth RLS.

---

## 1. CRITICAL: Data Currently Exposed in Frontend Source Code

### 1.1 All Course Data (coursesData.ts - 1599 lines)

| Data | Current Location | Risk | Migration |
|------|-----------------|------|-----------|
| 8 course tracks | `src/data/coursesData.ts` | Anyone can read all course content by inspecting JS bundle | Move to `course_tracks` table, serve via `get-courses` Edge Function |
| 26 labs with full code | `src/data/coursesData.ts` | Complete source code for all labs exposed in bundle | Move to `course_labs` table with `initial_files` as JSONB |
| Lab instructions | `src/data/coursesData.ts` | All instructions exposed | Move to `course_labs.instructions` JSONB column |
| Lab test cases | `src/data/coursesData.ts` | Expected outcomes exposed (allows gaming) | Move to `course_labs.test_cases` JSONB column, hide expected outcomes for uncompleted labs |
| Lab code templates | `src/data/coursesData.ts` | Complete starter code visible | Move to `course_labs.initial_files` JSONB column |
| Pro lab status (isPro) | `src/data/coursesData.ts` | Pro gating is client-side only | Move to DB, enforce via RLS policy |
| Learning goals | `src/data/coursesData.ts` | Content exposed | Move to `course_tracks.learning_goals` JSONB column |
| Deliverable projects | `src/data/coursesData.ts` | Content exposed | Move to `course_tracks.deliverable` JSONB column |

**Impact:** A competitor can copy all course content by viewing page source. A student can access pro labs by toggling client-side flags.

### 1.2 Teardown Articles (teardownsData.ts)

| Data | Current Location | Risk | Migration |
|------|-----------------|------|-----------|
| 3 teardown articles | `src/data/teardownsData.ts` | All content in bundle | Move to `teardowns` table, serve via Edge Function |
| Architecture overviews | `src/data/teardownsData.ts` | Full text exposed | Move to `teardowns.architecture_overview` column |
| Code snippets | `src/data/teardownsData.ts` | Complete RFC code exposed | Move to `teardowns.rfc_code_snippet` column |
| Key insights | `src/data/teardownsData.ts` | All insights exposed | Move to `teardowns.key_insights` JSONB column |

### 1.3 Starter Kits (starterKitsData.ts)

| Data | Current Location | Risk | Migration |
|------|-----------------|------|-----------|
| 4 starter kits | `src/data/starterKitsData.ts` | All metadata in bundle | Move to `starter_kits` table |
| GitHub repo URLs | `src/data/starterKitsData.ts` | Direct repo access | Move to DB, track downloads server-side |
| Tech stack details | `src/data/starterKitsData.ts` | Full stack exposed | Move to DB columns |

### 1.4 Workshops (workshopsData.ts)

| Data | Current Location | Risk | Migration |
|------|-----------------|------|-----------|
| 3 workshop events | `src/data/workshopsData.ts` | All event data in bundle | Move to `workshops` table |
| Speaker info | `src/data/workshopsData.ts` | Speaker details exposed | Move to DB columns |
| Attendee counts | `src/data/workshopsData.ts` | Metrics exposed | Move to DB, update server-side |

---

## 2. CRITICAL: Security Logic Currently Client-Side Only

### 2.1 User Tier / Pro Access Gating

| Current Implementation | Problem | Required Change |
|----------------------|---------|-----------------|
| `userState.tier` stored in `localStorage` | Any user can set `tier: 'pro'` via DevTools | Store in `user_state` table, verified by JWT in Edge Functions |
| Pro lab access checked client-side | `lab.isPro` checked in React components, trivially bypassed | RLS policy: `is_pro = false OR has_pro_access()` |
| `handleUpgradeProSuccess()` sets tier in localStorage | No real payment verification | Stripe Checkout -> Webhook -> server-side tier update |
| Coaching calls tracked in localStorage | User can set any value | Store in `user_state.coaching_calls_remaining`, decremented by Edge Function |

### 2.2 Lab Completion & XP

| Current Implementation | Problem | Required Change |
|----------------------|---------|-----------------|
| `handleCompleteLab()` adds lab ID to `completedLabs[]` in state | Any user can mark any lab complete | `submit-lab-completion` Edge Function with `validate_lab_completion()` |
| XP awarded client-side (+150 per lab) | User can set any XP value | Server calculates XP via `calculate_total_xp()` |
| `completedLabs` array in localStorage | User can add any lab ID | `user_lab_progress` table with DB constraints |
| Track completion detected client-side | User can trigger completion | `validate_certificate_issuance()` server function |

### 2.3 Certificate Issuance

| Current Implementation | Problem | Required Change |
|----------------------|---------|-----------------|
| Certificate issued when all labs complete (client-side) | User can forge certificates | `certificates` table, issued by `submit-lab-completion` Edge Function |
| Certificate displays `studentName="Alex Vance"` | Hardcoded name | Use actual user profile name from DB |
| No verification system | Certificates can be faked | `verify-certificate` Edge Function with public verification URL |

---

## 3. HIGH: API Endpoints Currently Unprotected

### 3.1 Express API Routes (server.ts)

| Endpoint | Current State | Required Change |
|----------|--------------|-----------------|
| `POST /api/ai/system-review` | No auth, no rate limiting | Move to `ai-system-review` Edge Function with JWT + rate limit |
| `POST /api/ai/lab-evaluator` | No auth, no rate limiting | Move to `ai-lab-evaluator` Edge Function with JWT + rate limit + pro check |
| `POST /api/ai/ask-tutor` | No auth, no rate limiting | Move to `ai-ask-tutor` Edge Function with JWT + rate limit |
| `GET /api/health` | Public | Can remain, but add auth check for sensitive info |

### 3.2 Gemini API Key Exposure

| Current State | Risk | Required Change |
|--------------|------|-----------------|
| `GEMINI_API_KEY` in `.env` file, used server-side only | Key is in server process memory, no rotation | Store as Supabase secret, inject into Edge Functions |
| No request validation | Malformed prompts could cause issues | Server-side input validation + sanitization |
| No usage tracking | Cannot monitor AI usage per user | `ai_usage_log` table with per-user tracking |

---

## 4. HIGH: State Management Vulnerabilities

### 4.1 localStorage as Single Source of Truth

| Data Stored | Risk | Migration |
|-------------|------|-----------|
| `backend_forge_user_state` | User can modify any field via DevTools console | Move to `user_state` table, sync via Edge Functions |
| `tier: 'free' | 'pro' | 'enterprise'` | Trivially changed to bypass payment | Stripe webhook sets tier server-side |
| `completedLabs: string[]` | User can add any lab ID to the array | `user_lab_progress` table with DB constraints |
| `xpPoints: number` | User can set any XP value | Calculated server-side from completed labs |
| `unlockedCertificates: string[]` | User can add any certificate ID | `certificates` table with issuance logic |
| `coachingCallsRemaining: number` | User can set any value | Server-side counter, decremented by Edge Function |
| `savedStarterKits: string[]` | User can save any kit ID | `user_state.saved_starter_kits` JSONB column |

### 4.2 Navigation State

| Current | Risk | Migration |
|---------|------|-----------|
| `selectedTrackId` in useState | Low risk (UI state only) | Can remain client-side |
| `selectedLabId` in useState | Low risk (UI state only) | Can remain client-side |
| `selectedTeardownId` in useState | Low risk (UI state only) | Can remain client-side |

---

## 5. MEDIUM: Content & Pricing Exposure

### 5.1 Pricing Model

| Current | Problem | Migration |
|---------|---------|-----------|
| `$199` price shown in `PricingUpgradeModal.tsx` | Price visible in bundle | Fetch from DB or Stripe Price ID server-side |
| Price ID not used | No Stripe integration | Use `STRIPE_PRICE_PRO_LIFETIME` env var, validated server-side |
| No tax handling | Missing for EU/international | Stripe Tax or manual tax calculation in Edge Function |

### 5.2 User Profile

| Current | Problem | Migration |
|---------|---------|-----------|
| No user profile page | Missing functionality | `profiles` table with Google OAuth data |
| No email display | Missing | `profiles` table with email from auth.users |
| No avatar display | Missing | `profiles.avatar_url` from Google OAuth |
| Hardcoded `studentName="Alex Vance"` | Not personalized | Use `profiles.full_name` |

---

## 6. MEDIUM: Missing Production Features

### 6.1 Authentication

| Missing | Required Implementation |
|---------|----------------------|
| No login/signup pages | Google OAuth via Supabase Auth |
| No session management | Supabase Auth handles JWT sessions |
| No password reset | Supabase Auth built-in |
| No email verification | Supabase Auth built-in |
| No logout flow | `supabase.auth.signOut()` |

### 6.2 Database

| Missing | Required Implementation |
|---------|------------------------|
| No database | Supabase PostgreSQL |
| No data persistence | All data in Supabase tables |
| No data relationships | Foreign keys + RLS |
| No data validation | Database constraints + Edge Functions |

### 6.3 Payments

| Missing | Required Implementation |
|---------|------------------------|
| No real payment processing | Stripe Checkout via Edge Function |
| No webhook handling | `stripe-webhook` Edge Function |
| No refund handling | Webhook processes `charge.refunded` |
| No billing portal | `stripe-portal` Edge Function |
| No invoice generation | Stripe built-in invoicing |

### 6.4 Rate Limiting

| Missing | Required Implementation |
|---------|------------------------|
| No rate limiting on AI endpoints | `check_rate_limit()` function |
| No abuse prevention | Per-user rate limits in Edge Functions |
| No usage analytics | `ai_usage_log` table |

### 6.5 Audit & Security

| Missing | Required Implementation |
|---------|------------------------|
| No audit trail | `audit_log` table with triggers |
| No input validation | Server-side validation in Edge Functions |
| No CORS configuration | Proper CORS headers in Edge Functions |
| No CSP headers | Add to deployment config |

---

## 7. Complete Migration Checklist

### Phase 1: Database & Auth (Critical)
- [ ] Run migrations 001-005
- [ ] Configure Google OAuth in Supabase Dashboard
- [ ] Set up Stripe webhook endpoint
- [ ] Seed course data from `coursesData.ts` into DB
- [ ] Seed teardown data from `teardownsData.ts` into DB
- [ ] Seed starter kit data from `starterKitsData.ts` into DB
- [ ] Seed workshop data from `workshopsData.ts` into DB

### Phase 2: Edge Functions (Critical)
- [ ] Deploy all Edge Functions
- [ ] Update frontend to use Edge Functions instead of direct imports
- [ ] Remove hardcoded data files (or keep as seed scripts only)
- [ ] Remove localStorage-based state management
- [ ] Implement Supabase client in frontend

### Phase 3: Stripe Integration (Critical)
- [ ] Create Stripe product and price in dashboard
- [ ] Configure Stripe webhook to point to Edge Function
- [ ] Implement Stripe Checkout flow in frontend
- [ ] Test with Stripe test mode

### Phase 4: Security Hardening (High)
- [ ] Enable RLS on all tables (done in migrations)
- [ ] Test RLS policies with two accounts (admin + student)
- [ ] Add rate limiting to all Edge Functions
- [ ] Implement audit logging
- [ ] Test certificate verification flow

### Phase 5: Production (Medium)
- [ ] Add error tracking (Sentry)
- [ ] Add analytics (Plausible/PostHog)
- [ ] Set up CI/CD for Edge Function deployment
- [ ] Configure CSP headers
- [ ] Load testing
- [ ] Security audit

---

## 8. Files to Remove After Migration

| File | Reason |
|------|--------|
| `src/data/coursesData.ts` | Replaced by `course_tracks` + `course_labs` tables |
| `src/data/teardownsData.ts` | Replaced by `teardowns` table |
| `src/data/starterKitsData.ts` | Replaced by `starter_kits` table |
| `src/data/workshopsData.ts` | Replaced by `workshops` table |
| `server.ts` (Express API routes) | Replaced by Edge Functions |
| `localStorage` persistence code | Replaced by Supabase DB |
