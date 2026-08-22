-- Track 22: Rust Systems Programming (6 labs: 4 free + 2 pro)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-tokio-async', 'track-22-rust-systems', 'Tokio Async Runtime Fundamentals', 50, 'Intermediate', false, 'Master async Rust with Tokio: tasks, channels, timers, and graceful shutdown patterns.', '{}', '## Tokio Async Runtime Fundamentals

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
`', '[{"id":"tc-1","description":"Channel delivers all messages in order","order":1,"required":true},{"id":"tc-2","description":"Task pool respects concurrency limit of N workers","order":2,"required":true},{"id":"tc-3","description":"Graceful shutdown completes in-flight tasks within 5s","order":3,"required":true},{"id":"tc-4","description":"Timeout cancels slow operations without leaking","order":4,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 6, "learningObjective": "Master Tokio async primitives for concurrent Rust applications", "buildsToward": "High-Performance Rust Service"}', '["Tokio tasks are lightweight green threads - spawn thousands freely","Channels are the primary inter-task communication mechanism","Always use bounded channels for backpressure"]', '["Async Rust is zero-cost at runtime but has compile-time overhead","Pin is the internal representation of async blocks","tokio::spawn requires static lifetime - use Arc for shared state"]', '["Implement structured concurrency with JoinSet","Use tokio::select! for multiplexing multiple async operations","Add tracing-subscriber for structured async logging"]'),
('lab-axum-api', 'track-22-rust-systems', 'Axum REST API with Type-Safe Routing', 55, 'Intermediate', false, 'Build production REST APIs with Axum extractors, middleware, and tower service composition.', '{}', '## Axum REST API with Type-Safe Routing

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
`', '[{"id":"tc-1","description":"Type-safe path params reject invalid IDs at compile time","order":1,"required":true},{"id":"tc-2","description":"Custom extractor validates request body before handler","order":2,"required":true},{"id":"tc-3","description":"Auth middleware rejects unauthenticated requests with 401","order":3,"required":true}]', 2, '{"prerequisiteLabId": "lab-tokio-async", "stage": "Building", "estimatedHours": 6, "learningObjective": "Build type-safe REST APIs with Axum extractors", "buildsToward": "High-Performance Rust Service"}', '["Axum uses Tower services - understand the Service trait","Extractors run in parallel - design them to be idempotent","State sharing uses axum::extract::State with Arc"]', '["Axum is built on Tower - middleware is just a Service wrapper","Path and Query extractors validate at the handler level","Response is IntoResponse - any type that can become a Response"]', '["Add tower-http middleware for CORS, compression, and tracing","Use axum-extra for cookie, typed-header, and query extractors","Implement graceful shutdown with axum::serve and tokio::signal"]'),
('lab-serde-serialization', 'track-22-rust-systems', 'Serde and Zero-Copy Deserialization', 45, 'Intermediate', false, 'Master Serde for efficient serialization: zero-copy, custom implementations, and schema evolution.', '{}', '## Serde and Zero-Copy Deserialization

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
`', '[{"id":"tc-1","description":"Zero-copy deserialization avoids allocation for borrowed fields","order":1,"required":true},{"id":"tc-2","description":"Custom implementation correctly handles edge cases","order":2,"required":true},{"id":"tc-3","description":"serde(default) handles missing fields gracefully","order":3,"required":true}]', 3, '{"prerequisiteLabId": "lab-axum-api", "stage": "Building", "estimatedHours": 4, "learningObjective": "Master Serde for efficient serialization", "buildsToward": "High-Performance Rust Service"}', '["Zero-copy serde borrows from input - input must outlive the struct","serde(default) is essential for forward compatibility","flatten and remote are powerful for schema evolution"]', '["Serde is compile-time - derive macros generate optimized code","JSON is not the only format - bincode, postcard, and rmp are alternatives","Serializer trait allows custom formats without changing struct definitions"]', '["Implement Serialize with custom visitor for complex types","Use serde_with for advanced field transformations","Benchmark serde_json vs simd-json for performance"]'),
('lab-lock-free-concurrency', 'track-22-rust-systems', 'Lock-Free Concurrency with Atomics', 60, 'Advanced', true, 'Build lock-free data structures using atomic operations, memory ordering, and the crossbeam crate.', '{}', '## Lock-Free Concurrency with Atomics

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
`', '[{"id":"tc-1","description":"Lock-free stack handles 100k concurrent pushes/pops","order":1,"required":true},{"id":"tc-2","description":"MPMC queue maintains FIFO ordering under contention","order":2,"required":true},{"id":"tc-3","description":"ABA-resistant implementation passes stress test","order":3,"required":true}]', 4, '{"prerequisiteLabId": "lab-tokio-async", "stage": "Mastery", "estimatedHours": 8, "learningObjective": "Build lock-free data structures with atomic operations", "buildsToward": "High-Performance Rust Service"}', '["Relaxed ordering is sufficient for counters and flags","Acquire/Release pairs establish happens-before relationships","SeqCst is the safest but slowest - use only when needed"]', '["Lock-free does not mean wait-free - starvation is still possible","crossbeam provides well-tested concurrent primitives","Read-write locks are better than mutexes for read-heavy workloads"]', '["Use parking_lot for faster mutex implementations","Implement hazard pointers for safe memory reclamation","Benchmark lock-free vs lock-based for your workload"]'),
('lab-ffi-unsafe', 'track-22-rust-systems', 'FFI and Unsafe Rust Patterns', 55, 'Advanced', true, 'Interface with C libraries using FFI, understand unsafe Rust boundaries, and build safe abstractions.', '{}', '## FFI and Unsafe Rust Patterns

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
`', '[{"id":"tc-1","description":"Safe wrapper correctly calls C function and handles errors","order":1,"required":true},{"id":"tc-2","description":"Wrapper prevents undefined behavior through bounds checking","order":2,"required":true},{"id":"tc-3","description":"No unsafe leaks outside the safe abstraction boundary","order":3,"required":true}]', 5, '{"prerequisiteLabId": "lab-serde-serialization", "stage": "Mastery", "estimatedHours": 7, "learningObjective": "Interface with C code through safe Rust abstractions", "buildsToward": "High-Performance Rust Service"}', '["Unsafe is not a code smell - it is the correct tool for FFI","Always document safety invariants in unsafe functions","Use bindgen to generate FFI bindings automatically"]', '["transmute is the most dangerous function - avoid it when possible","Raw pointers are not null-safe - use NonNull for non-null guarantees","unsafe blocks must have clear safety invariants documented"]', '["Use cbindgen to expose Rust to C consumers","Implement Drop for proper C memory cleanup","Test FFI code with Miri for undefined behavior detection"]'),
('lab-rust-profiling', 'track-22-rust-systems', 'Performance Profiling and Optimization', 50, 'Advanced', true, 'Profile Rust applications with cargo-flamegraph, optimize hot paths, and reduce binary size.', '{}', '## Performance Profiling and Optimization

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
`', '[{"id":"tc-1","description":"Flamegraph clearly shows hot path through the application","order":1,"required":true},{"id":"tc-2","description":"SIMD optimization achieves 2x speedup on vector operations","order":2,"required":true},{"id":"tc-3","description":"Binary size reduced by 50% with LTO and strip","order":3,"required":true}]', 6, '{"prerequisiteLabId": "lab-lock-free-concurrency", "stage": "Mastery", "estimatedHours": 6, "learningObjective": "Profile and optimize Rust applications for production performance", "buildsToward": "High-Performance Rust Service"}', '["cargo-flamegraph is the best Rust profiling tool","SIMD is available through std::simd in nightly or packed_simd","LTO (Link-Time Optimization) reduces binary size significantly"]', '["Profile before optimizing - do not guess where bottlenecks are","Branch prediction hints (likely/unlikely) help the optimizer","Binary size matters for embedded and WASM targets"]', '["Use perf for Linux-specific profiling","Implement cache-friendly data structures for better locality","Consider jemalloc for allocator performance"]')
-- END_OF_INSERT
