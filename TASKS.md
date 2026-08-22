# TASKS.md - SQL Migration & Seed Restoration

## Status: COMPLETE

---

## Summary

| # | Task | Status |
|---|------|--------|
| 1 | seed-labs.sql → modularized into 16 track files (34 labs) | DONE |
| 2 | seed-teardowns.sql — 3 articles (Stripe, Vercel, Cloudflare) | DONE |
| 3 | seed.sql — master loader (all 5 includes) | DONE |
| 4 | seed-all.sql — deleted (merged into seed.sql) | DONE |
| 5 | seed-tracks.sql — fixed 7 mismatched track IDs (9,11-16) | DONE |
| 6 | TABLES.md — 17 tables, 35 indexes, all columns, RLS | DONE |
| 7 | check_seed.py — verification script (ALL CHECKS PASSED) | DONE |

---

## Verification Results

```
Tables:      17 migrations = 17 TABLES.md        ✓
Indexes:     35 migrations = 35 TABLES.md         ✓
Track IDs:   16 tracks = 16 lab references        ✓
Lab files:   16 track files present               ✓
Lab count:   34 labs total                        ✓
Kits:        16 (matches 16 tracks)               ✓
Edge funcs:  16 table references valid            ✓
Seed loader: seed.sql includes all 5 files        ✓
```

---

## File Structure

```
supabase/
  seed.sql                  ← master loader (auto-run by supabase db reset)
  seed-tracks.sql           ← 16 tracks across 4 tiers
  seed-labs.sql             ← modular loader
  seed-labs/
    track-01.sql .. track-16.sql   ← 34 labs total
  seed-starter-kits.sql     ← 16 kits
  seed-workshops.sql        ← 3 workshops
  seed-teardowns.sql        ← 3 teardown articles
  seed-user-data.sql        ← demo progress (manual only)
  migrations/
    001 .. 008              ← all verified correct
```

## Run verification

```bash
python3 check_seed.py
```
