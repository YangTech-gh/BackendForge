-- Track 11: API Gateway Patterns (2 labs)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-kong-plugins', 'track-11-api-gateway', 'Kong Gateway Custom Plugins', 55, 'Intermediate', false, 'Build Kong Gateway plugins for rate limiting, authentication, and request transformation with Lua.', '{"kong/plugins/rate-limit/handler.lua":"local BasePlugin = require \"kong.plugins.base_plugin\"","kong/plugins/auth/jwt-validator.lua":"-- JWT validation logic","kong/plugins/transform/request-transformer.lua":"-- Request body transformation","kong.conf":"database = postgres\nplugins = bundle rate-limit,auth,transform"}', '## Kong Gateway Custom Plugins

Build custom Kong Gateway plugins for API management.

### Objectives
- Create Kong plugins with the Lua plugin SDK
- Implement token bucket rate limiting
- Build JWT validation plugin with JWKS endpoint
- Design request/response transformation plugins

### Requirements
1. Implement rate limiting plugin with Redis backend
2. Build JWT validation plugin fetching keys from JWKS
3. Create request transformer for header injection
4. Add plugin testing with kong-test-helpers

`bash
busted spec/
kong start -c kong.conf
`', '[{"id":"tc-1","description":"Rate limiter returns 429 when limit exceeded","order":1,"required":true},{"id":"tc-2","description":"JWT plugin rejects tokens with invalid signatures","order":2,"required":true},{"id":"tc-3","description":"Request transformer injects X-Request-ID header","order":3,"required":true},{"id":"tc-4","description":"Plugins execute in correct priority order","order":4,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 5, "learningObjective": "Build Kong Gateway plugins for rate limiting and authentication", "buildsToward": "Production API Gateway with Rate Limiting"}', '["Kong plugins use Lua - understand the plugin SDK lifecycle (init, access, header_filter, body_filter, log phases)","Rate limiting should be distributed with Redis for multi-node deployments - local counters diverge across instances","Plugin priority determines execution order: lower number runs first, so auth (priority 1000) runs before rate-limit (priority 950)","Connect this to Envoy Filters (lab-envoy-filters): Kong is Lua-based and config-driven, while Envoy uses WASM - evaluate trade-offs for your stack","In production, combine Kong rate limiting with circuit breaking (lab-istio-traffic patterns) to protect backends from both traffic spikes and cascading failures"]', '["Kong is extensible but complex - evaluate if a simpler gateway (Traefik, Caddy) suffices for your traffic volume","Lua is fast but not type-safe - add thorough unit tests with busted for every plugin phase","Redis rate limiting adds ~2ms latency per request - measure the overhead and consider local token buckets as fallback","Cross-reference with lab-envoy-filters: Kong plugins are easier to write but WASM filters offer stronger sandboxing and language flexibility","When deploying multiple Kong nodes, ensure consistent plugin configuration via declarative config or DB-backed admin API"]', '["Use Kong Manager GUI for visual plugin configuration and traffic monitoring during development","Implement a circuit breaker plugin following lab-istio-traffic patterns to protect upstream services from overload","Add OpenTelemetry plugin for distributed tracing - integrates with the observability stack from lab-rust-profiling","Write a custom response-transformer plugin that adds security headers (CSP, HSTS, X-Frame-Options) at the gateway layer","Build a plugin that extracts tenant ID from JWT claims and injects it as a header for downstream services"]'),

('lab-envoy-filters', 'track-11-api-gateway', 'Envoy Proxy WASM Filters', 60, 'Advanced', false, 'Build Envoy proxy filters with WebAssembly for custom authentication, routing, and observability.', '{"filters/auth/main.go":"package main\n\nimport \"github.com/tetratelabs/proxy-wasm-go-sdk/proxywasm\"","filters/routing/weights.go":"// Traffic splitting filter","filters/observability/metrics.go":"// Custom metrics filter","envoy.yaml":"static_resources:\n  listeners:\n    - filter_chains:\n        - filters:\n            - name: envoy.filters.network.http_connection_manager"}', '## Envoy Proxy WASM Filters

Build custom Envoy filters with WebAssembly for edge security and routing.

### Objectives
- Build WASM filters using proxy-wasm-go-sdk
- Implement JWT authentication at the edge
- Design traffic splitting for canary deployments
- Add custom metrics export to Prometheus

### Requirements
1. Create JWT validation WASM filter with JWKS caching
2. Build traffic splitting filter with weighted routing
3. Implement custom Prometheus metrics in filter
4. Add request timeout and retry policies

`bash
go build -o filter.wasm main.go
docker-compose up -d envoy
`', '[{"id":"tc-1","description":"WASM filter validates JWT without external auth service","order":1,"required":true},{"id":"tc-2","description":"Traffic splitting routes 10% to canary","order":2,"required":true},{"id":"tc-3","description":"Custom metrics appear in Prometheus scrape","order":3,"required":true},{"id":"tc-4","description":"Filter handles 10k RPS with under 1ms overhead","order":4,"required":true}]', 2, '{"prerequisiteLabId": "lab-kong-plugins", "stage": "Building", "estimatedHours": 7, "learningObjective": "Build Envoy WASM filters for edge authentication and traffic management", "buildsToward": "Production API Gateway with Rate Limiting"}', '["WASM filters run in Envoy process sandbox - no filesystem or network access, use hostcalls for external calls","proxy-wasm-go-sdk provides the Go SDK for Envoy filters; proxy-wasm in Rust (lab-ffi-unsafe) and C++ are also options","Filter chain order matters: auth filter must execute before routing filter to reject bad tokens early","Compare with lab-kong-plugins: WASM filters offer stronger isolation and language choice but are harder to debug","Traffic splitting here connects to lab-istio-traffic (VirtualService) and lab-gitops-argocd (Argo Rollouts canary)"]', '["Envoy is the data plane for both standalone proxy and service mesh - understand it deeply for lab-istio-traffic","WASM sandbox limitations: no file system, no network calls, no goroutines; use proxywasm hostcalls instead","Filter configuration is part of Envoy bootstrap YAML, not runtime; changes require Envoy restart or xDS hot-reload","The observability filter here builds on patterns from lab-rust-profiling: expose metrics for flamegraph analysis","Cross-reference lab-kong-plugins: if you need simpler Lua plugins, Kong may be sufficient; Envoy shines at scale"]', '["Implement rate limiting filter with local token bucket cache - compare performance vs Kong Redis approach from lab-kong-plugins","Add circuit breaker filter following lab-istio-traffic outlier detection patterns to eject unhealthy backends","Use Envoy access logging for debugging filter behavior - format logs for structured ingestion into observability stack","Build a WASM filter that performs request body schema validation before routing to backend services","Implement a shadow traffic filter that mirrors requests to a staging cluster for testing without impacting production"]');