# TABLES.md - Database Schema Reference

## Overview

17 PostgreSQL tables in 4 categories, managed via 8 migrations (001-008).

---

## Table List

| # | Table | Category |
|---|-------|----------|
| 1 | profiles | Auth & Profiles |
| 2 | course_tracks | Course Content |
| 3 | course_labs | Course Content |
| 4 | user_lab_progress | User Progress |
| 5 | user_track_progress | User Progress |
| 6 | certificates | User Progress |
| 7 | user_state | User Progress |
| 8 | starter_kits | Course Content |
| 9 | workshops | Course Content |
| 10 | teardowns | Course Content |
| 11 | coaching_sessions | User Progress |
| 12 | ai_usage_log | Security & Audit |
| 13 | audit_log | Security & Audit |
| 14 | stripe_customers | Payments |
| 15 | stripe_checkout_sessions | Payments |
| 16 | payments | Payments |
| 17 | stripe_webhook_events | Payments |

---

## 1. profiles

Extends `auth.users` with app-specific data. Auto-created on signup via trigger.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID PK | — | FK → auth.users(id) |
| full_name | TEXT | '' | From Google OAuth |
| avatar_url | TEXT | '' | From Google OAuth |
| role | app_role | 'student' | student, pro_student, admin |
| created_at | TIMESTAMPTZ | now() | |
| updated_at | TIMESTAMPTZ | now() | Auto-updated via trigger |

---

## 2. course_tracks

All 16 tracks across 4 tiers.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | TEXT PK | — | e.g., 'track-1-api-blueprint' |
| track_number | INTEGER UNIQUE | — | Display order 1–16 |
| title | TEXT | — | |
| tagline | TEXT | — | |
| paradigm | TEXT | — | Technology stack |
| tier | TEXT | 'fundamentals' | fundamentals, paradigm_stacks, architecture, specialization |
| badge_color | TEXT | — | CSS classes |
| icon_name | TEXT | 'BookOpen' | Lucide icon |
| description | TEXT | — | |
| learning_goals | JSONB | '[]' | String array |
| deliverable | JSONB | '{}' | {title, description, techStack[]} |
| is_published | BOOLEAN | true | |
| created_at | TIMESTAMPTZ | now() | |
| updated_at | TIMESTAMPTZ | now() | |

**Tier mapping:** Tracks 1–4 = fundamentals, 5–8 = paradigm_stacks, 9–12 = architecture, 13–16 = specialization.

---

## 3. course_labs

34 labs across 16 tracks.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | TEXT PK | — | e.g., 'lab-rest-api-design' |
| track_id | TEXT FK | — | → course_tracks(id) |
| title | TEXT | — | |
| duration_minutes | INTEGER | 45 | |
| difficulty | TEXT | 'Intermediate' | Intermediate / Advanced / Staff |
| is_pro | BOOLEAN | false | Pro-gated content |
| concept_summary | TEXT | — | |
| initial_files | JSONB | '[]' | {filename: code} map |
| instructions | TEXT | — | Markdown |
| test_cases | JSONB | '[]' | [{id, description, order, required}] |
| sort_order | INTEGER | 0 | Order within track |
| scaffolding | JSONB | '{}' | {prerequisiteLabId, stage, estimatedHours, learningObjective, buildsToward} |
| tips | JSONB | '[]' | Pro tips |
| lessons | JSONB | '[]' | Key lessons learned |
| exercises | JSONB | '[]' | Extension exercises |
| created_at | TIMESTAMPTZ | now() | |
| updated_at | TIMESTAMPTZ | now() | |

---

## 4. user_lab_progress

Per-lab completion tracking.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID PK | gen_random_uuid() | |
| user_id | UUID FK | — | → auth.users(id) |
| lab_id | TEXT FK | — | → course_labs(id) |
| completed | BOOLEAN | false | |
| completed_at | TIMESTAMPTZ | — | |
| xp_earned | INTEGER | 0 | 150 if passed |
| score | INTEGER | — | 0–100 |
| ai_feedback | JSONB | — | |
| code_snapshot | TEXT | — | |
| created_at | TIMESTAMPTZ | now() | |
| updated_at | TIMESTAMPTZ | now() | |

**UNIQUE:** (user_id, lab_id)

---

## 5. user_track_progress

Aggregated per-track status.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID PK | gen_random_uuid() | |
| user_id | UUID FK | — | → auth.users(id) |
| track_id | TEXT FK | — | → course_tracks(id) |
| labs_completed | INTEGER | 0 | |
| total_labs | INTEGER | 0 | |
| is_track_completed | BOOLEAN | false | |
| certificate_issued | BOOLEAN | false | |
| certificate_id | UUID | — | → certificates(id) |
| started_at | TIMESTAMPTZ | now() | |
| completed_at | TIMESTAMPTZ | — | |
| created_at | TIMESTAMPTZ | now() | |
| updated_at | TIMESTAMPTZ | now() | |

**UNIQUE:** (user_id, track_id)

---

## 6. certificates

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID PK | gen_random_uuid() | |
| user_id | UUID FK | — | → auth.users(id) |
| track_id | TEXT FK | — | → course_tracks(id) |
| student_name | TEXT | — | |
| track_title | TEXT | — | |
| issued_at | TIMESTAMPTZ | now() | |
| certificate_url | TEXT | — | |
| is_verified | BOOLEAN | true | |
| created_at | TIMESTAMPTZ | now() | |

**UNIQUE:** (user_id, track_id)

---

## 7. user_state

Master user state (replaces localStorage).

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID PK | gen_random_uuid() | |
| user_id | UUID FK UNIQUE | — | → auth.users(id) |
| tier | TEXT | 'free' | free, pro, enterprise |
| xp_points | INTEGER | 0 | |
| coaching_calls_remaining | INTEGER | 0 | |
| saved_starter_kits | JSONB | '[]' | Kit ID array |
| in_progress_track_id | TEXT | — | |
| active_lab_id | TEXT | — | |
| stripe_customer_id | TEXT | — | |
| stripe_subscription_id | TEXT | — | |
| created_at | TIMESTAMPTZ | now() | |
| updated_at | TIMESTAMPTZ | now() | |

---

## 8. starter_kits

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | TEXT PK | — | |
| name | TEXT | — | |
| paradigm | TEXT | — | |
| db | TEXT | — | |
| queue | TEXT | — | |
| auth_method | TEXT | — | |
| description | TEXT | — | |
| stars | INTEGER | 0 | |
| github_repo_url | TEXT | — | |
| is_published | BOOLEAN | true | |
| created_at | TIMESTAMPTZ | now() | |

---

## 9. workshops

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | TEXT PK | — | |
| title | TEXT | — | |
| event_date | DATE | — | |
| event_time | TEXT | — | |
| speaker | TEXT | — | |
| speaker_role | TEXT | — | |
| topic | TEXT | — | |
| attendees_count | INTEGER | 0 | |
| is_live | BOOLEAN | false | |
| is_published | BOOLEAN | true | |
| created_at | TIMESTAMPTZ | now() | |

---

## 10. teardowns

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | TEXT PK | — | |
| company | TEXT | — | |
| logo_color | TEXT | '#6366f1' | |
| title | TEXT | — | |
| read_time | TEXT | — | e.g., '12 min read' |
| summary | TEXT | — | |
| key_insights | JSONB | '[]' | String array |
| architecture_overview | TEXT | — | |
| rfc_code_snippet | TEXT | — | |
| tags | JSONB | '[]' | String array |
| is_published | BOOLEAN | true | |
| created_at | TIMESTAMPTZ | now() | |

---

## 11. coaching_sessions

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID PK | gen_random_uuid() | |
| user_id | UUID FK | — | → auth.users(id) |
| session_date | TIMESTAMPTZ | — | |
| status | TEXT | 'scheduled' | scheduled / completed / cancelled / no_show |
| notes | TEXT | — | |
| created_at | TIMESTAMPTZ | now() | |
| updated_at | TIMESTAMPTZ | now() | |

---

## 12. ai_usage_log

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID PK | gen_random_uuid() | |
| user_id | UUID FK | — | → auth.users(id) |
| endpoint | TEXT | — | Edge function name |
| tokens_used | INTEGER | 0 | |
| request_time | TIMESTAMPTZ | now() | |
| response_time_ms | INTEGER | — | |
| success | BOOLEAN | true | |

---

## 13. audit_log

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID PK | gen_random_uuid() | |
| user_id | UUID FK | — | → auth.users(id) |
| action | TEXT | — | INSERT / UPDATE / DELETE |
| table_name | TEXT | — | |
| record_id | TEXT | — | |
| old_data | JSONB | — | |
| new_data | JSONB | — | |
| ip_address | INET | — | |
| user_agent | TEXT | — | |
| created_at | TIMESTAMPTZ | now() | |

---

## 14. stripe_customers

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID PK | gen_random_uuid() | |
| user_id | UUID FK UNIQUE | — | → auth.users(id) |
| stripe_customer_id | TEXT UNIQUE | — | cus_xxx |
| email | TEXT | — | |
| created_at | TIMESTAMPTZ | now() | |
| updated_at | TIMESTAMPTZ | now() | |

---

## 15. stripe_checkout_sessions

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID PK | gen_random_uuid() | |
| user_id | UUID FK | — | → auth.users(id) |
| stripe_session_id | TEXT UNIQUE | — | cs_xxx |
| stripe_customer_id | TEXT | — | |
| price_id | TEXT | — | |
| mode | TEXT | 'payment' | payment / subscription |
| status | TEXT | 'pending' | pending / completed / expired / cancelled |
| amount_total | INTEGER | — | Cents |
| currency | TEXT | 'usd' | |
| success_url | TEXT | — | |
| cancel_url | TEXT | — | |
| created_at | TIMESTAMPTZ | now() | |
| updated_at | TIMESTAMPTZ | now() | |

---

## 16. payments

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID PK | gen_random_uuid() | |
| user_id | UUID FK | — | → auth.users(id) |
| stripe_payment_intent | TEXT | — | pi_xxx (UNIQUE constraint) |
| stripe_invoice_id | TEXT | — | |
| amount | INTEGER | — | Cents |
| currency | TEXT | 'usd' | |
| status | TEXT | — | succeeded / pending / failed / refunded |
| description | TEXT | — | |
| metadata | JSONB | '{}' | |
| created_at | TIMESTAMPTZ | now() | |
| updated_at | TIMESTAMPTZ | now() | |

---

## 17. stripe_webhook_events

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID PK | gen_random_uuid() | |
| stripe_event_id | TEXT UNIQUE | — | evt_xxx |
| event_type | TEXT | — | e.g., checkout.session.completed |
| payload | JSONB | — | Full event payload |
| processed | BOOLEAN | false | |
| error_message | TEXT | — | |
| created_at | TIMESTAMPTZ | now() | |
| processed_at | TIMESTAMPTZ | — | |

---

## Indexes

| Table | Index | Columns |
|-------|-------|---------|
| profiles | idx_profiles_id | id |
| profiles | idx_profiles_role | role |
| course_tracks | idx_course_tracks_number | track_number |
| course_tracks | idx_course_tracks_published | is_published |
| course_tracks | idx_course_tracks_tier | tier |
| course_labs | idx_course_labs_track | track_id |
| course_labs | idx_course_labs_pro | is_pro |
| course_labs | idx_course_labs_sort | track_id, sort_order |
| user_lab_progress | idx_user_lab_progress_user | user_id |
| user_lab_progress | idx_user_lab_progress_lab | lab_id |
| user_lab_progress | idx_user_lab_progress_completed | user_id, completed |
| user_track_progress | idx_user_track_progress_user | user_id |
| user_track_progress | idx_user_track_progress_track | track_id |
| certificates | idx_certificates_user | user_id |
| certificates | idx_certificates_track | track_id |
| user_state | idx_user_state_user | user_id |
| user_state | idx_user_state_tier | tier |
| user_state | idx_user_state_stripe | stripe_customer_id |
| coaching_sessions | idx_coaching_sessions_user | user_id |
| ai_usage_log | idx_ai_usage_user | user_id |
| ai_usage_log | idx_ai_usage_time | request_time |
| audit_log | idx_audit_log_user | user_id |
| audit_log | idx_audit_log_action | action |
| audit_log | idx_audit_log_time | created_at |
| stripe_customers | idx_stripe_customers_user | user_id |
| stripe_customers | idx_stripe_customers_stripe | stripe_customer_id |
| stripe_checkout_sessions | idx_stripe_checkout_user | user_id |
| stripe_checkout_sessions | idx_stripe_checkout_session | stripe_session_id |
| payments | idx_payments_user | user_id |
| payments | idx_payments_payment_intent | stripe_payment_intent |
| payments | idx_payments_status | status |
| stripe_webhook_events | idx_stripe_webhook_event_id | stripe_event_id |
| stripe_webhook_events | idx_stripe_webhook_created_at | created_at |
| stripe_webhook_events | idx_stripe_webhook_type | event_type |
| stripe_webhook_events | idx_stripe_webhook_processed | processed |
| teardowns | idx_teardowns_slug | slug |
| teardowns | idx_teardowns_published | published_at DESC |

---

## RLS Policies

All tables have Row Level Security enabled. Policies:

| Table | Policy | Operation |
|-------|--------|-----------|
| profiles | profiles_select_own | SELECT (auth.uid() = id) |
| profiles | profiles_update_own | UPDATE (auth.uid() = id) |
| course_tracks | tracks_select_published | SELECT (is_published = true) |
| course_labs | labs_select_published | SELECT (track is published) |
| user_lab_progress | progress_select_own | SELECT (user_id = auth.uid()) |
| user_lab_progress | progress_insert_own | INSERT (user_id = auth.uid()) |
| user_lab_progress | progress_update_own | UPDATE (user_id = auth.uid()) |
| user_track_progress | track_progress_select_own | SELECT |
| user_track_progress | track_progress_insert_own | INSERT |
| user_track_progress | track_progress_update_own | UPDATE |
| certificates | certs_select_own | SELECT |
| user_state | state_select_own | SELECT |
| user_state | state_insert_own | INSERT |
| user_state | state_update_own | UPDATE |
| starter_kits | kits_select_published | SELECT |
| workshops | workshops_select_published | SELECT |
| teardowns | teardowns_select_published | SELECT |
| ai_usage_log | ai_usage_select_own | SELECT |
| ai_usage_log | ai_usage_insert_own | INSERT |
| audit_log | audit_select_admin | SELECT (role = 'admin') |
| stripe_customers | stripe_customers_select_own | SELECT |
| stripe_checkout_sessions | stripe_checkout_select_own | SELECT |
| payments | payments_select_own | SELECT |
| stripe_webhook_events | webhook_events_admin | ALL (role = 'admin') |
