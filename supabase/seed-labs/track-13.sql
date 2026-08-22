-- Track 13: Rust Systems Programming (6 labs: 4 free + 2 pro)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-tokio-async', 'track-13-rust-systems', 'Tokio Async Runtime Fundamentals', 50, 'Intermediate', false, 'Master async Rust with Tokio: tasks, channels, timers, and graceful shutdown patterns.', '{}', '## Tokio Async Runtime Fundamentals

Master the Tokio runtime for building asynchronous Rust applications.

### Objectives
- Understand Tokio task spawning and scheduling
- Implement channel-based communication between tasks
- Build graceful shutdown with signal handling
- Design task pools with backpressure

### Requirements
1. Create a multi-producer single-consumer channel pipeline
2. Implement a task pool with bounded concurrency
3. Build graceful shutdown using tokio::signal::ctrl_c
4. Add timeout handling with tokio::time::timeout

`bash
cargo test
cargo run --example channel_pipeline
`', '[{"id":"tc-1","description":"Channel delivers all messages in order","order":1,"required":true},{"id":"tc-2","description":"Task pool respects concurrency limit of N workers","order":2,"required":true},{"id":"tc-3","description":"Graceful shutdown completes in-flight tasks within 5s","order":3,"required":true},{"id":"tc-4","description":"Timeout cancels slow operations without leaking","order":4,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 6, "learningObjective": "Master Tokio async primitives for concurrent Rust applications", "buildsToward": "High-Performance Rust Service"}', '["Tokio tasks are lightweight green threads - spawn thousands freely but respect OS thread limits via the runtime pool","Channels are the primary inter-task communication mechanism: mpsc for fan-in, broadcast for pub-sub, oneshot for single replies","Always use bounded channels for backpressure - unbounded channels cause OOM under load spikes","Cross-reference lab-axum-api: Tokio runtime powers Axum; understanding task scheduling helps debug request handling","Connect to lab-lock-free-concurrency: channels use atomic operations internally; understanding memory ordering clarifies channel guarantees"]', '["Async Rust is zero-cost at runtime but has compile-time overhead; monomorphization generates specialized code per future","Pin is the internal representation of async blocks - prevents self-referential struct movement in memory","tokio::spawn requires static lifetime and Send plus Sync - use Arc for shared state across tasks","The channel pipeline pattern here builds on lab-serde-serialization: serialize messages for cross-service communication","For production, combine with lab-rust-profiling: use tokio-console to monitor task runtime behavior in real-time"]', '["Implement structured concurrency with JoinSet for managed task lifecycles instead of raw tokio::spawn","Use tokio::select! for multiplexing multiple async operations - great for combining timers with channels","Add tracing-subscriber for structured async logging with span context propagation across tasks","Build a work-stealing task pool that distributes work across runtime threads dynamically","Implement a graceful shutdown coordinator that drains channels before terminating tasks"]'),

('lab-axum-api', 'track-13-rust-systems', 'Axum REST API with Type-Safe Routing', 55, 'Intermediate', false, 'Build production REST APIs with Axum extractors, middleware, and tower service composition.', '{}', '## Axum REST API with Type-Safe Routing

Build production REST APIs with Axum type-safe routing and extractors.

### Objectives
- Design RESTful routes with Axum type-safe handlers
- Implement custom extractors for validation and auth
- Build middleware with Tower service composition

### Requirements
1. Create CRUD routes for a products resource
2. Implement a custom JsonBody extractor with validation
3. Build JWT auth middleware using tower::Layer

`bash
cargo test
`', '[{"id":"tc-1","description":"Type-safe path params reject invalid IDs at compile time","order":1,"required":true},{"id":"tc-2","description":"Custom extractor validates request body before handler","order":2,"required":true},{"id":"tc-3","description":"Auth middleware rejects unauthenticated requests with 401","order":3,"required":true}]', 2, '{"prerequisiteLabId": "lab-tokio-async", "stage": "Building", "estimatedHours": 6, "learningObjective": "Build type-safe REST APIs with Axum extractors", "buildsToward": "High-Performance Rust Service"}', '["Axum uses Tower services - understand the Service trait to build custom middleware; middleware is just a function wrapping the handler","Extractors run in parallel where possible - design them to be idempotent and fail fast with clear error messages","State sharing uses axum::extract::State with Arc - thread-safe shared state without per-request allocation","This builds on lab-tokio-async: Axum runs on the Tokio runtime; understanding task scheduling helps with concurrent request handling","Connect to lab-serde-serialization: request/response bodies use Serde for JSON - zero-copy deserialization improves throughput"]', '["Axum is built on Tower - middleware is just a Service wrapper; understanding Tower layers enables composable request processing","Path and Query extractors validate at the handler level - reject bad input before business logic runs","Response is IntoResponse - any type that can become a Response; use () for empty 200 responses","For production, combine with lab-tokio-async: Axum handlers should be non-blocking; offload blocking work with spawn_blocking","Cross-reference lab-rust-profiling: profile handler latency to identify extraction or serialization bottlenecks"]', '["Add tower-http middleware for CORS, compression, and tracing - these are production essentials for any API","Use axum-extra for cookie, typed-header, and query extractors - avoids reinventing common patterns","Implement graceful shutdown with axum::serve and tokio::signal from lab-tokio-async for clean connection draining","Build a custom extractor that validates JWT tokens and extracts user claims for downstream handlers","Create a rate-limiting middleware using Tower that integrates with the patterns from lab-kong-plugins"]'),

('lab-serde-serialization', 'track-13-rust-systems', 'Serde and Zero-Copy Deserialization', 45, 'Intermediate', false, 'Master Serde for efficient serialization: zero-copy, custom implementations, and schema evolution.', '{}', '## Serde and Zero-Copy Deserialization

Master Serde for efficient, type-safe serialization in Rust.

### Objectives
- Derive Serialize/Deserialize for complex types
- Implement zero-copy deserialization with borrowed data
- Build custom Serde implementations for domain types

### Requirements
1. Serialize and deserialize nested structs with enums
2. Implement zero-copy deserialization using borrowed str
3. Handle schema evolution with serde(default) and rename

`bash
cargo test
`', '[{"id":"tc-1","description":"Zero-copy deserialization avoids allocation for borrowed fields","order":1,"required":true},{"id":"tc-2","description":"Custom implementation correctly handles edge cases","order":2,"required":true},{"id":"tc-3","description":"serde(default) handles missing fields gracefully","order":3,"required":true}]', 3, '{"prerequisiteLabId": "lab-axum-api", "stage": "Building", "estimatedHours": 4, "learningObjective": "Master Serde for efficient serialization", "buildsToward": "High-Performance Rust Service"}', '["Zero-copy serde borrows from input - the input must outlive the struct; this is critical for high-throughput deserialization","serde(default) is essential for forward compatibility - missing fields get default values instead of parse errors","flatten and remote are powerful for schema evolution without breaking existing consumers","This lab directly supports lab-axum-api: Axum JSON extractors use Serde under the hood for request body deserialization","Connect to lab-ffi-unsafe: custom Serde implementations sometimes need unsafe for transmute optimizations on known-layout types"]', '["Serde is compile-time - derive macros generate optimized code with no runtime reflection overhead","JSON is not the only format - bincode, postcard, and rmp are alternatives; choose based on your performance needs","Serializer trait allows custom formats without changing struct definitions - useful for wire protocol design","For lab-axum-api integration, ensure your API request/response types derive both Serialize and Deserialize","Cross-reference lab-lock-free-concurrency: Serde serialization of lock-free queue elements should be allocation-free"]', '["Implement Serialize with custom Visitor for complex types like non-self-describing formats","Use serde_with for advanced field transformations like hex-encoded bytes or optional flattening","Benchmark serde_json vs simd-json for performance - simd-json can be 2-4x faster on large payloads","Build a schema evolution test suite that verifies old clients can read new message formats","Implement a zero-copy network packet parser using borrowed Cow fields for variable-length data"]'),

('lab-lock-free-concurrency', 'track-13-rust-systems', 'Lock-Free Concurrency with Atomics', 60, 'Advanced', true, 'Build lock-free data structures using atomic operations, memory ordering, and the crossbeam crate.', '{}', '## Lock-Free Concurrency with Atomics

Build concurrent data structures without locks using Rust atomics.

### Objectives
- Understand Rust memory ordering (Relaxed, Acquire, Release, SeqCst)
- Implement lock-free stack and queue with atomics
- Design ABA-problem-resistant data structures

### Requirements
1. Implement a lock-free Treiber stack with Compare-and-Swap
2. Build an MPMC queue using atomic indices
3. Handle the ABA problem with tagged pointers

`bash
cargo test
`', '[{"id":"tc-1","description":"Lock-free stack handles 100k concurrent pushes/pops","order":1,"required":true},{"id":"tc-2","description":"MPMC queue maintains FIFO ordering under contention","order":2,"required":true},{"id":"tc-3","description":"ABA-resistant implementation passes stress test","order":3,"required":true}]', 4, '{"prerequisiteLabId": "lab-tokio-async", "stage": "Mastery", "estimatedHours": 8, "learningObjective": "Build lock-free data structures with atomic operations", "buildsToward": "High-Performance Rust Service"}', '["Relaxed ordering is sufficient for counters and flags - it guarantees atomicity but not visibility ordering","Acquire/Release pairs establish happens-before relationships - essential for producer-consumer patterns","SeqCst is the safest but slowest - use only when you need total global ordering across all atomics","Connect to lab-tokio-async: Tokio channels use atomic operations internally; this lab reveals the mechanics underneath","Cross-reference lab-serde-serialization: when serializing lock-free structures, you need snapshot consistency via atomic reads"]', '["Lock-free does not mean wait-free - starvation is still possible under extreme contention","crossbeam provides well-tested concurrent primitives like SegQueue and Epoch-based reclamation","Read-write locks are better than mutexes for read-heavy workloads but still not truly lock-free","For lab-axum-api: shared state behind Arc plus lock-free structures can eliminate lock contention in hot paths","Combine with lab-ffi-unsafe: atomic operations on raw pointers are the foundation of safe FFI wrappers"]', '["Use parking_lot for faster mutex implementations when lock-free is not practical","Implement hazard pointers for safe memory reclamation without garbage collection","Benchmark lock-free vs lock-based for your workload - lock-free wins only under high contention","Build a lock-free bounded MPMC queue using CAS loops with exponential backoff","Implement a wait-free ring buffer for single-producer single-consumer scenarios"]'),

('lab-ffi-unsafe', 'track-13-rust-systems', 'FFI and Unsafe Rust Patterns', 55, 'Advanced', true, 'Interface with C libraries using FFI, understand unsafe Rust boundaries, and build safe abstractions.', '{}', '## FFI and Unsafe Rust Patterns

Interface with C code and build safe abstractions over unsafe operations.

### Objectives
- Call C functions from Rust using extern and FFI
- Implement safe wrappers around unsafe code
- Understand unsafe semantics and transmute

### Requirements
1. Bind to a C library (e.g., zlib) using bindgen
2. Build a safe Rust wrapper around unsafe C calls
3. Implement a safe abstraction over raw pointer arithmetic

`bash
cargo test
`', '[{"id":"tc-1","description":"Safe wrapper correctly calls C function and handles errors","order":1,"required":true},{"id":"tc-2","description":"Wrapper prevents undefined behavior through bounds checking","order":2,"required":true},{"id":"tc-3","description":"No unsafe leaks outside the safe abstraction boundary","order":3,"required":true}]', 5, '{"prerequisiteLabId": "lab-serde-serialization", "stage": "Mastery", "estimatedHours": 7, "learningObjective": "Interface with C code through safe Rust abstractions", "buildsToward": "High-Performance Rust Service"}', '["Unsafe is not a code smell - it is the correct tool for FFI and low-level systems programming","Always document safety invariants in unsafe functions with SAFETY comments explaining why the code is sound","Use bindgen to generate FFI bindings automatically - manual bindings are error-prone and hard to maintain","Connect to lab-serde-serialization: custom Serde implementations may use unsafe transmute for zero-copy on known-layout types","Cross-reference lab-lock-free-concurrency: raw pointer atomics are the foundation of lock-free data structures"]', '["transmute is the most dangerous function - avoid it when possible; prefer pointer casts or from_raw_parts","Raw pointers are not null-safe - use NonNull for non-null guarantees and Option for nullable pointers","unsafe blocks must have clear safety invariants documented - reviewers should be able to verify soundness","For lab-rust-profiling: FFI boundaries affect profiling; C calls show up as external symbols in flamegraphs","Combine with lab-axum-api: FFI wrappers for C libraries can be exposed as Axum handlers for high-performance endpoints"]', '["Use cbindgen to expose Rust to C consumers - enables incremental adoption of Rust in C codebases","Implement Drop for proper C memory cleanup - RAII prevents leaks across the FFI boundary","Test FFI code with Miri for undefined behavior detection - Miri catches UB that tests miss","Build a safe wrapper around a C cryptography library with proper error handling and memory safety","Implement a zero-copy parser that borrows directly from a memory-mapped file using unsafe pointers"]'),

('lab-rust-profiling', 'track-13-rust-systems', 'Performance Profiling and Optimization', 50, 'Advanced', true, 'Profile Rust applications with cargo-flamegraph, optimize hot paths, and reduce binary size.', '{}', '## Performance Profiling and Optimization

Profile and optimize Rust applications for maximum performance.

### Objectives
- Profile CPU usage with cargo-flamegraph
- Optimize hot paths using SIMD and branch prediction
- Reduce binary size with strip and LTO

### Requirements
1. Generate flamegraph and identify top-3 hot functions
2. Optimize a hot loop using SIMD intrinsics
3. Reduce binary size by 50% using LTO and strip

`bash
cargo flamegraph
cargo test
`', '[{"id":"tc-1","description":"Flamegraph clearly shows hot path through the application","order":1,"required":true},{"id":"tc-2","description":"SIMD optimization achieves 2x speedup on vector operations","order":2,"required":true},{"id":"tc-3","description":"Binary size reduced by 50% with LTO and strip","order":3,"required":true}]', 6, '{"prerequisiteLabId": "lab-lock-free-concurrency", "stage": "Mastery", "estimatedHours": 6, "learningObjective": "Profile and optimize Rust applications for production performance", "buildsToward": "High-Performance Rust Service"}', '["cargo-flamegraph is the best Rust profiling tool - it generates interactive SVG flamegraphs from perf data","SIMD is available through std::simd in nightly or packed_simd crate; always benchmark to verify actual speedup","LTO (Link-Time Optimization) reduces binary size significantly by eliminating dead code across crate boundaries","Cross-reference lab-tokio-async: profile async task scheduling to identify runtime bottlenecks and busy-wait loops","Connect to lab-axum-api: use flamegraphs to find slow Axum handlers, extractors, or serialization hotspots"]', '["Profile before optimizing - do not guess where bottlenecks are; data-driven optimization saves time","Branch prediction hints (likely/unlikely) help the optimizer but check with benchmarks first","Binary size matters for embedded and WASM targets - use cargo-bloat to identify large dependencies","For lab-lock-free-concurrency: profile contention patterns to determine if lock-free or lock-based is actually faster","Combine with lab-ffi-unsafe: C FFI calls show as opaque blocks in flamegraphs - optimize batch sizes to reduce call overhead"]', '["Use perf stat for Linux-specific profiling metrics like cache miss rate and branch prediction accuracy","Implement cache-friendly data structures (SoA vs AoS) for better memory locality in hot loops","Consider jemalloc or mimalloc for allocator performance - default allocator can be a bottleneck","Profile your Axum API from lab-axum-api under load with wrk to find real-world bottlenecks","Build a benchmarking suite that runs before and after each optimization to prevent regressions"]');
