-- Track 2: The Ubiquitous Backend (3 labs)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-event-loop-profiling', 'track-2-node-ts', 'Node.js Event Loop Profiling', 50, 'Intermediate', false, 'Understand Node.js event loop phases, identify blocking operations, and optimize CPU-intensive work with worker threads.', '{"src/server.ts":"import Fastify from ''fastify'';\nconst app = Fastify();","src/worker/processor.ts":"// CPU-intensive task processor","src/profiling/block-detector.ts":"// Event loop lag detector"}', '## Node.js Event Loop Profiling

Master the Node.js event loop to build high-performance non-blocking servers.

### Objectives
- Profile event loop phases (timers, poll, check, close)
- Detect and fix blocking operations in request handlers
- Implement worker threads for CPU-intensive tasks
- Measure event loop lag and set up alerting

### Requirements
1. Build an event loop lag monitor using `perf_hooks`
2. Move CPU-intensive work to a Worker Thread
3. Profile a Fastify server under 10,000 req/sec load
4. Identify and fix top-3 blocking patterns

`bash
npm run test
npm run profile
`', '[{"id":"tc-1","description":"Event loop lag stays under 5ms under 10k RPS","order":1,"required":true},{"id":"tc-2","description":"Worker thread handles CPU task without blocking main thread","order":2,"required":true},{"id":"tc-3","description":"Blocking detection fires within 100ms of stall","order":3,"required":true},{"id":"tc-4","description":"CPU profiling output shows no hot paths over 50ms","order":4,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 5, "learningObjective": "Understand event loop phases and eliminate blocking operations", "buildsToward": "Multi-Tenant Idempotent SaaS Webhook Engine"}', '["Never block the event loop with sync I/O or CPU computation","Use --inspect flag with Chrome DevTools for CPU profiling","Worker Threads share memory via SharedArrayBuffer for zero-copy","Event loop profiling directly impacts lab-webhook-idempotency throughput","The libuv thread pool defaults to 4 threads - adjust UV_THREADPOOL_SIZE for I/O heavy workloads"]', '["Event loop lag is the single most important Node.js metric","Even 10ms blocks cause cascading latency under high concurrency","JSON.parse/stringify are blocking for large payloads - use streaming parsers","Worker threads are ideal for the CPU work that lab-multi-tenant-billing will need for pricing calculations","Understanding event loop phases helps you choose between setTimeout, setImmediate, and process.nextTick"]', '["Implement event loop monitoring in production with Prometheus","Use AsyncLocalStorage for request-scoped context without threading","Profile under realistic load, not just benchmarks","Build a blocking operation detector that alerts on >50ms stalls","Write a benchmark comparing main thread vs worker thread for image processing"]'),

('lab-webhook-idempotency', 'track-2-node-ts', 'Idempotent Webhook Ingestion', 55, 'Advanced', false, 'Build a production webhook processor with Redis SETNX locks, idempotency keys, and exactly-once processing semantics.', '{"src/processor/webhook-handler.ts":"// Main webhook handler","src/locks/redis-lock.ts":"// Distributed lock with Redis SETNX","src/idempotency/key-store.ts":"// Idempotency key management","src/queue/bullmq-setup.ts":"// BullMQ queue configuration"}', '## Idempotent Webhook Ingestion

Build a webhook ingestion service that handles duplicates gracefully with exactly-once semantics.

### Objectives
- Implement Redis SETNX distributed locks for concurrent processing
- Build idempotency key store with TTL expiration
- Design a retry queue with exponential backoff
- Handle Stripe-style webhook deduplication

### Requirements
1. Implement distributed lock acquisition with Redis SETNX + PX
2. Build idempotency key store with 24-hour TTL
3. Create BullMQ worker with retry and backoff policies
4. Process webhook events atomically with lock release

`bash
npm run test
docker-compose up -d redis
npm run test:integration
`', '[{"id":"tc-1","description":"Duplicate webhook processed only once within 24h window","order":1,"required":true},{"id":"tc-2","description":"Concurrent identical requests acquire lock and process serially","order":2,"required":true},{"id":"tc-3","description":"Failed jobs retry 3 times with exponential backoff","order":3,"required":true},{"id":"tc-4","description":"Lock auto-releases after processing even on crash","order":4,"required":true}]', 2, '{"prerequisiteLabId": "lab-event-loop-profiling", "stage": "Building", "estimatedHours": 6, "learningObjective": "Implement exactly-once processing with distributed locks and idempotency", "buildsToward": "Multi-Tenant Idempotent SaaS Webhook Engine"}', '["Redis SETNX with PX (expiry) prevents deadlocks from crashed workers","Idempotency keys should include the event type + external ID","Always release locks in a finally block, not just on success","Worker thread utilization from lab-event-loop-profiling keeps webhook processing non-blocking","BullMQ leverages the event loop understanding from lab-event-loop-profiling for optimal concurrency"]', '["Webhook providers (Stripe, GitHub) may send duplicates - always deduplicate","Distributed locks are probabilistic - design for Byzantine failures","BullMQ is superior to Bull for TypeScript: better typing and Redis sentinel support","This lab''s idempotency patterns are critical for lab-multi-tenant-billing''s Stripe integration","Redis locks and idempotency keys are the foundation for any distributed system"]', '["Implement a dead-letter queue for permanently failed events","Add webhook signature verification before idempotency checks","Monitor lock contention with Redis INFO command metrics","Build a webhook replay tool for debugging failed events","Write integration tests that simulate 100 concurrent duplicate webhooks"]'),

('lab-multi-tenant-billing', 'track-2-node-ts', 'Multi-Tenant SaaS Billing Engine', 60, 'Staff', true, 'Build a multi-tenant billing system with per-tenant metering, usage-based pricing, and Stripe subscription management.', '{"src/billing/metering.ts":"// Usage metering per tenant","src/billing/pricing-engine.ts":"// Tiered pricing calculator","src/billing/stripe-sync.ts":"// Stripe subscription sync","src/middleware/tenant-resolver.ts":"// Tenant context from JWT or header"}', '## Multi-Tenant SaaS Billing Engine

Design a production billing engine that handles per-tenant metering and usage-based pricing.

### Objectives
- Resolve tenant context from JWT claims or subdomain
- Implement usage metering with PostgreSQL aggregate queries
- Design tiered pricing with overage calculations
- Sync billing state with Stripe subscriptions

### Requirements
1. Build tenant resolver middleware extracting tenant_id from JWT
2. Implement usage metering table with efficient aggregation queries
3. Design pricing tiers with monthly rollover and overage billing
4. Sync metered usage to Stripe subscription items

`bash
npm run test
npm run test:billing
`', '[{"id":"tc-1","description":"Tenant isolation prevents cross-tenant data access","order":1,"required":true},{"id":"tc-2","description":"Usage metering aggregates correctly per billing period","order":2,"required":true},{"id":"tc-3","description":"Overage calculation matches pricing tier thresholds","order":3,"required":true},{"id":"tc-4","description":"Stripe subscription reflects metered usage","order":4,"required":true}]', 3, '{"prerequisiteLabId": "lab-webhook-idempotency", "stage": "Mastery", "estimatedHours": 8, "learningObjective": "Design multi-tenant billing with metering and Stripe integration", "buildsToward": "Multi-Tenant Idempotent SaaS Webhook Engine"}', '["Tenant isolation is non-negotiable - test with actual cross-tenant attempts","Meter at write time, not read time, for accurate billing","Always cache pricing calculations but invalidate on plan changes","Stripe webhook handling uses the same idempotency patterns from lab-webhook-idempotency","Worker threads from lab-event-loop-profiling handle pricing calculation without blocking"]', '["Stripe billing is complex - use their metered billing API correctly","Keep billing state eventually consistent with a sync worker","Audit every billing event - financial data requires perfect traceability","The distributed locking from lab-webhook-idempotency prevents double-metering","Event loop awareness from lab-event-loop-profiling ensures metering writes do not block API responses"]', '["Implement billing alerts before overage thresholds","Build a billing portal for tenant self-service","Design for proration when tenants upgrade mid-period","Create a billing reconciliation job that compares local metering with Stripe records","Write load tests that simulate 1000 tenants metering simultaneously"]');

(End of file)
