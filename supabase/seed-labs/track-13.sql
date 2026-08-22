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
`', '[{"id":"tc-1","description":"Channel delivers all messages in order","order":1,"required":true},{"id":"tc-2","description":"Task pool respects concurrency limit of N workers","order":2,"required":true},{"id":"tc-3","description":"Graceful shutdown completes in-flight tasks within 5s","order":3,"required":true},{"id":"tc-4","description":"Timeout cancels slow operations without leaking","order":4,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 6, "learningObjective": "Master Tokio async primitives for concurrent Rust applications", "buildsToward": "High-Performance Rust Service"}', '["Tokio tasks are lightweight green threads - spawn thousands freely","Channels are the primary inter-task communication mechanism","Always use bounded channels for backpressure"]', '["Async Rust is zero-cost at runtime but has compile-time overhead","Pin is the internal representation of async blocks","tokio::spawn requires static lifetime - use Arc for shared state"]', '["Implement structured concurrency with JoinSet","Use tokio::select! for multiplexing multiple async operations","Add tracing-subscriber for structured async logging"]'),
-- END_OF_INSERT
