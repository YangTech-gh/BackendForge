# TASKS.md - SQL Migration & Seed Restoration

## Status: COMPLETE

---

## Final State

| Metric | Count |
|--------|-------|
| Tracks | 21 |
| Labs | 48 (4 free + 2 pro on Rust) |
| Starter Kits | 21 |
| Workshops | 6 |
| Teardowns | 6 |
| Tables | 17 |
| Indexes | 35 |

---

## Track List (21)

| # | Track | Labs | Tier |
|---|-------|------|------|
| 1 | API Blueprint | 3 | Fundamentals |
| 2 | Node/TypeScript | 3 | Fundamentals |
| 3 | Database Mastery | 2 | Fundamentals |
| 4 | Auth & Security | 2 | Fundamentals |
| 5 | Python Backend | 2 | Paradigm Stacks |
| 6 | Rails | 2 | Paradigm Stacks |
| 7 | Go Service | 2 | Paradigm Stacks |
| 8 | Enterprise Java | 2 | Paradigm Stacks |
| 9 | Infrastructure as Code | 2 | Architecture |
| 10 | Observability | 2 | Architecture |
| 11 | API Gateway | 2 | Architecture |
| 12 | CI/CD | 2 | Architecture |
| 13 | **Rust Systems** | **6 (4 free + 2 pro)** | Paradigm Stacks |
| 14 | Service Mesh | 2 | Specialization |
| 15 | Chaos Engineering | 2 | Specialization |
| 16 | Capstone | 2 | Specialization |
| 17 | Docker & Containers | 2 | Architecture |
| 18 | API Security | 2 | Architecture |
| 19 | Feature Flags | 2 | Architecture |
| 20 | Data Pipelines | 2 | Specialization |
| 21 | Testing & Contracts | 2 | Architecture |

---

## Rust Track (13) - 6 Labs

| # | Lab | Difficulty | Free? |
|---|-----|-----------|-------|
| 1 | Tokio Async Runtime Fundamentals | Intermediate | Free |
| 2 | Axum REST API with Type-Safe Routing | Intermediate | Free |
| 3 | Serde and Zero-Copy Deserialization | Intermediate | Free |
| 4 | Lock-Free Concurrency with Atomics | Advanced | Pro |
| 5 | FFI and Unsafe Rust Patterns | Advanced | Pro |
| 6 | Performance Profiling and Optimization | Advanced | Pro |

---

## Verification

```bash
python3 check_seed.py
# ALL CHECKS PASSED
```

## UI Data-Driven Fixes

- [x] App.tsx: Default IDs now resolve from first available data (not hardcoded)
- [x] TracksCatalogView: Track count uses `courses.length` (not hardcoded "16")
- [x] InteractiveLab: Constants use paradigm-keyed lookup (not lab ID substring matching)
- [x] InteractiveLab: Default files use paradigm-aware fallback (not hardcoded `main.py`)

## Suggested Next Steps

- [ ] Verify Workshop and Teardown pages load from Supabase edge functions
- [ ] **Build remaining missing pages**: AI Chat, Pricing, Settings
- [ ] **Implement real gamification logic**: XP calculation, unlock conditions, progress tracking
- [ ] **Build GitHub OAuth flow**: Login, session management, user sync
- [ ] **Create production seed script** (not just demo)
- [ ] **Set up Supabase RLS policies** for multi-user security
