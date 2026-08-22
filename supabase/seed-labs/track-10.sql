-- Track 10: Observability at Scale (2 labs)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-opentelemetry-otel', 'track-10-observability', 'OpenTelemetry Distributed Tracing', 50, 'Intermediate', false, 'Instrument applications with OpenTelemetry for distributed tracing, metrics, and log correlation.', '{"src/tracing/init.go":"// OpenTelemetry initialization","src/tracing/middleware.go":"// HTTP middleware for tracing","src/tracing/span.go":"// Custom span creation","docker-compose.yml":"services:\n  otel-collector:\n    image: otel/opentelemetry-collector:latest"}', '## OpenTelemetry Distributed Tracing

Instrument applications with OpenTelemetry for full observability.

### Objectives
- Initialize OpenTelemetry SDK with OTLP exporter
- Create custom spans for business operations
- Correlate traces, metrics, and logs
- Configure sampling strategies for production

### Requirements
1. Initialize OTLP exporter sending to collector
2. Auto-instrument HTTP clients and database calls
3. Create custom spans for order processing pipeline
4. Implement probabilistic sampling at 10% for production

`bash
go test ./...
docker-compose up -d otel-collector jaeger
`', '[{"id":"tc-1","description":"Trace shows full request lifecycle across services","order":1,"required":true},{"id":"tc-2","description":"Custom span includes business attributes (order_id, user_id)","order":2,"required":true},{"id":"tc-3","description":"Trace ID appears in correlated logs","order":3,"required":true},{"id":"tc-4","description":"Sampling reduces trace volume to ~10% in production","order":4,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 5, "learningObjective": "Instrument applications with OpenTelemetry for distributed tracing", "buildsToward": "Production Observability Stack"}', '["Use OTLP for vendor-neutral telemetry export","Always propagate trace context across service boundaries","Sampling is critical for production - never trace 100%","Resource attributes like service.name and service.version are set once at init and attached to every span","Use the semantic conventions for HTTP, database, and messaging attributes so your traces are queryable across tools"]', '["OpenTelemetry is the future - prefer over vendor-specific SDKs","Span attributes are queryable - add business context","Collector pipeline enables flexible routing and processing","A single OTLP exporter covers traces, metrics, and logs - avoid shipping three separate agents","When adding tracing to a gRPC service, use the OTel gRPC interceptor from the OpenTelemetry contrib library so every call is traced automatically"]', '["Implement tail-based sampling for error traces","Add span links for batch operations","Use OpenTelemetry Collector for log aggregation","Add custom span attributes to the order processing pipeline that record order_id, customer_id, and total_amount so that slow orders are instantly diagnosable in Jaeger","Configure the OTel Collector with a probabilistic sampler for normal traffic and a tail-based sampler that always keeps error traces, then verify both paths work with a test request"]'),

('lab-prometheus-grafana', 'track-10-observability', 'Prometheus & Grafana Alerting', 55, 'Advanced', false, 'Design Prometheus alerting rules, build Grafana dashboards, and implement SLO-based alerting with error budgets.', '{"config/prometheus.yml":"global:\n  scrape_interval: 15s","config/alerts.yml":"groups:\n  - name: api-alerts\n    rules:\n      - alert: HighErrorRate\n        expr: rate(http_requests_total{status=~\"5..\"}[5m]) > 0.05","dashboards/api-overview.json":"// Grafana dashboard JSON","src/slo/error_budget.go":"// Error budget calculator"}', '## Prometheus & Grafana Alerting

Build production alerting and dashboards with SLO-based error budgets.

### Objectives
- Design Prometheus recording rules for pre-aggregation
- Build Grafana dashboards with actionable panels
- Implement SLO-based alerting with error budgets
- Configure alert routing with Alertmanager

### Requirements
1. Create recording rules for request rate, error rate, and latency
2. Build Grafana dashboard with RED metrics (Rate, Errors, Duration)
3. Define SLO: 99.9% availability with 30-day error budget
4. Alert when error budget burns faster than 10% per hour

`bash
promtool check rules config/alerts.yml
promtool test test/prometheus_test.yml
`', '[{"id":"tc-1","description":"Recording rules pre-aggregate metrics efficiently","order":1,"required":true},{"id":"tc-2","description":"Grafana dashboard shows RED metrics in real-time","order":2,"required":true},{"id":"tc-3","description":"Alert fires when error budget burn rate exceeds threshold","order":3,"required":true},{"id":"tc-4","description":"Alertmanager routes critical alerts to PagerDuty","order":4,"required":true}]', 2, '{"prerequisiteLabId": "lab-opentelemetry-otel", "stage": "Building", "estimatedHours": 6, "learningObjective": "Design SLO-based alerting with Prometheus and Grafana", "buildsToward": "Production Observability Stack"}', '["Recording rules reduce query load - pre-aggregate expensive queries","Grafana dashboards should answer: is the system healthy?","SLO-based alerting reduces noise - alert on user impact, not thresholds","Name recording rules with a predictable prefix like service_metric so they are easy to discover","Use Grafana annotations to mark deployments so you can correlate release events with metric spikes"]', '["Prometheus is pull-based - ensure your metrics endpoints are scrapeable","Grafana variables make dashboards reusable across services","Error budgets are a business tool, not just technical metric","The traces you instrumented in lab-opentelemetry-otel provide the span-level detail that your Prometheus metrics summarize at a high level","Correlate Grafana panels with Jaeger trace IDs by including the trace_id label on RED metrics"]', '["Use Grafana Alloy for metrics collection","Implement multi-region alerting with Alertmanager clustering","Add cost attribution to metrics for FinOps visibility","Create a Grafana dashboard that overlays Prometheus RED metrics with OpenTelemetry trace-derived latency percentiles and annotate it with deployment markers","Write a PromQL recording rule that pre-computes the 5-minute error rate per endpoint, then use it in an alert that fires when the error budget burn rate exceeds 10 percent per hour"]') ON CONFLICT (id) DO NOTHING;