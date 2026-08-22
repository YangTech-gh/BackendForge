-- Track 7: The Go Service (2 labs)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-goroutine-patterns', 'track-7-go-service', 'Goroutine Patterns & Concurrency', 55, 'Intermediate', false, 'Master Go concurrency with goroutines, channels, select statements, and the worker pool pattern.', '{"cmd/server/main.go":"package main\n\nimport \"net/http\"","internal/concurrency/pool.go":"// Worker pool implementation","internal/concurrency/fan_out.go":"// Fan-out fan-in pattern","internal/concurrency/semaphore.go":"// Semaphore pattern"}', '## Goroutine Patterns & Concurrency

Master Go concurrency primitives for building highly concurrent services.

### Objectives
- Implement worker pool with configurable concurrency
- Build fan-out/fan-in pattern for parallel processing
- Design semaphore pattern for rate limiting
- Handle goroutine lifecycle with context cancellation

### Requirements
1. Build a worker pool that processes jobs with N goroutines
2. Implement fan-out/fan-in for parallel data processing
3. Create a semaphore for concurrent request limiting
4. Handle graceful shutdown with context.Context

`bash
go test ./...
go vet ./...
`', '[{"id":"tc-1","description":"Worker pool processes 1000 jobs with 10 goroutines","order":1,"required":true},{"id":"tc-2","description":"Fan-in correctly merges results from multiple goroutines","order":2,"required":true},{"id":"tc-3","description":"Semaphore limits concurrency to configured maximum","order":3,"required":true},{"id":"tc-4","description":"Context cancellation stops all goroutines within 1s","order":4,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 5, "learningObjective": "Master goroutines, channels, and concurrency patterns", "buildsToward": "High-Performance Go API Gateway"}', '["Goroutines are cheap (~2KB stack) - spawn thousands freely","Channels are typed: use unbuffered for synchronization, buffered for decoupling","Always use context.Context for cancellation and timeouts"]', '["Race conditions are silent - always run tests with -race flag","Select statement multiplexes channel operations","Sync.WaitGroup coordinates goroutine completion"]', '["Use errgroup for structured concurrency with error handling","Implement rate limiting with time.Ticker or token buckets","Profile goroutine counts with runtime.NumGoroutine()"]'),

('lab-grpc-streaming', 'track-7-go-service', 'gRPC Bidirectional Streaming', 60, 'Advanced', false, 'Build gRPC services with server streaming, client streaming, and bidirectional streaming with interceptors.', '{"proto/service.proto":"syntax = \"proto3\";\nservice ProductService {\n  rpc ListProducts(ListProductsRequest) returns (stream Product);\n}","internal/grpc/server.go":"// gRPC server implementation","internal/grpc/interceptor.go":"// Logging and auth interceptors","cmd/grpc/main.go":"// gRPC server entry point"}', '## gRPC Bidirectional Streaming

Build production gRPC services with all streaming patterns and middleware.

### Objectives
- Define protobuf service definitions with streaming RPCs
- Implement server, client, and bidirectional streaming
- Build gRPC interceptors for logging, auth, and recovery
- Design connection management with health checking

### Requirements
1. Define ProductService with all 4 RPC types (unary, server, client, bidi)
2. Implement server streaming for real-time product updates
3. Build interceptors for logging, auth token validation, and panic recovery
4. Add gRPC health checking protocol

`bash
go test ./...
protoc --go_out=. --go-grpc_out=. proto/*.proto
`', '[{"id":"tc-1","description":"Server streaming delivers products incrementally","order":1,"required":true},{"id":"tc-2","description":"Bidi streaming handles concurrent client/server sends","order":2,"required":true},{"id":"tc-3","description":"Auth interceptor rejects unauthenticated requests","order":3,"required":true},{"id":"tc-4","description":"Health check returns SERVING status","order":4,"required":true}]', 2, '{"prerequisiteLabId": "lab-goroutine-patterns", "stage": "Building", "estimatedHours": 7, "learningObjective": "Build gRPC services with streaming and interceptor middleware", "buildsToward": "High-Performance Go API Gateway"}', '["gRPC streaming is ideal for real-time data feeds","Interceptors are middleware for gRPC - chain them for cross-cutting concerns","Always implement gRPC health checking for load balancers"]', '["Protobuf is both schema and wire format - design proto files carefully","Client streaming is rare in practice - prefer server streaming","gRPC status codes differ from HTTP - map them correctly"]', '["Use gRPC-Gateway for REST fallback","Implement deadline propagation across service calls","Add OpenTelemetry tracing with gRPC interceptors"]');
