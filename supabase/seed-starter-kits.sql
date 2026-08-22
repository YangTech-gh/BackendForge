-- Backend Forge Seed Data: Starter Kits
-- Starter code templates for each track
-- Run: supabase db reset (auto) or psql -f supabase/seed-starter-kits.sql

INSERT INTO public.starter_kits (id, name, paradigm, db, queue, auth_method, description, stars, github_repo_url, is_published) VALUES
('kit-1-api-blueprint', 'Production API Gateway', 'REST / GraphQL', 'PostgreSQL', 'Redis (BullMQ)', 'JWT + OAuth2', 'Complete API layer with versioning, rate limiting, OpenAPI docs, and GraphQL federation.', 128, 'https://github.com/backend-forge/api-blueprint-starter', true),
('kit-2-node-ts', 'Multi-Tenant Webhook Engine', 'Node.js / TypeScript', 'PostgreSQL', 'BullMQ', 'JWT + API Keys', 'Idempotent webhook ingestion service capable of 25,000 req/sec with Redis SETNX locks.', 96, 'https://github.com/backend-forge/node-ts-starter', true),
('kit-3-database-mastery', 'High-Performance Database Layer', 'PostgreSQL', 'PgBouncer', 'N/A', 'JWT', 'Optimized PostgreSQL setup with connection pooling, read replicas, and automated migrations.', 84, 'https://github.com/backend-forge/database-starter', true),
('kit-4-auth-security', 'Enterprise Auth Service', 'OAuth2 / OIDC', 'PostgreSQL', 'Redis', 'MFA + Session', 'Production auth service with OAuth2, MFA, session management, and audit logging.', 112, 'https://github.com/backend-forge/auth-starter', true),
('kit-5-python-backend', 'Async Python SaaS API', 'FastAPI / Python', 'SQLAlchemy', 'Celery + Redis', 'JWT + OAuth2', 'Production FastAPI backend with async database access, background tasks, and OpenAPI auto-docs.', 76, 'https://github.com/backend-forge/python-starter', true),
('kit-6-rails', 'Rails Monolith Engine', 'Rails 7+', 'PostgreSQL', 'Sidekiq', 'Devise + OAuth2', 'Modular Rails monolith with real-time billing updates and Stripe integration.', 64, 'https://github.com/backend-forge/rails-starter', true),
('kit-7-go-service', 'Go Microservice Gateway', 'Go / gRPC', 'PostgreSQL', 'NATS', 'JWT + mTLS', 'High-performance Go microservice with gRPC, structured logging, and health checks.', 72, 'https://github.com/backend-forge/go-starter', true),
('kit-8-enterprise-java', 'Spring Boot Microservice', 'Spring Boot 3', 'JPA / Hibernate', 'RabbitMQ', 'Spring Security', 'Production Spring Boot service with security, caching, and distributed tracing.', 58, 'https://github.com/backend-forge/java-starter', true),
('kit-9-event-driven', 'Event-Sourced CQRS Engine', 'Event Sourcing', 'PostgreSQL', 'Kafka', 'JWT', 'Fully event-sourced commerce system with CQRS projections and saga orchestration.', 92, 'https://github.com/backend-forge/event-driven-starter', true),
('kit-10-observability', 'Observability Stack', 'OTel / Prometheus', 'PostgreSQL', 'N/A', 'JWT', 'Complete observability layer with logs, metrics, traces, and alerting.', 68, 'https://github.com/backend-forge/observability-starter', true),
('kit-11-caching', 'Multi-Tier Caching Layer', 'Redis / Nginx', 'PostgreSQL', 'N/A', 'JWT', 'Multi-tier caching system with Redis, CDN, and intelligent invalidation.', 56, 'https://github.com/backend-forge/caching-starter', true),
('kit-12-ai-native', 'AI-Native Agentic Backend', 'pgvector / LLM', 'PostgreSQL', 'BullMQ', 'JWT + API Keys', 'Production AI backend with semantic search, RAG, and LLM caching.', 88, 'https://github.com/backend-forge/ai-starter', true),
('kit-13-rust-systems', 'Rust High-Performance Service', 'Rust / Tokio', 'PostgreSQL', 'N/A', 'JWT', 'Memory-safe Rust microservice with async I/O, Axum REST API, and lock-free concurrency.', 56, 'https://github.com/backend-forge/rust-starter', true),
('kit-14-service-mesh', 'Service Mesh Platform', 'Istio / Consul', 'PostgreSQL', 'N/A', 'mTLS', 'Production service mesh with Istio traffic management and zero-trust networking.', 44, 'https://github.com/backend-forge/service-mesh-starter', true),
('kit-15-chaos', 'Chaos Resilience Toolkit', 'Litmus / K8s', 'Prometheus', 'N/A', 'JWT', 'Chaos engineering platform with Litmus experiments and automated resilience validation.', 36, 'https://github.com/backend-forge/chaos-starter', true),
('kit-16-capstone', 'Capstone Production API', 'TypeScript', 'PostgreSQL', 'Redis', 'OAuth2', 'Full-stack production API integrating auth, billing, observability, and CI/CD.', 68, 'https://github.com/backend-forge/capstone-starter', true),
('kit-17-docker', 'Container Platform', 'Docker', 'PostgreSQL', 'Redis', 'JWT', 'Optimized Docker images with multi-stage builds and Compose orchestration.', 52, 'https://github.com/backend-forge/docker-starter', true),
('kit-18-api-security', 'Hardened API Security', 'TypeScript', 'Redis', 'N/A', 'JWT', 'API security layer with OWASP defense, security headers, and rate limiting.', 48, 'https://github.com/backend-forge/api-security-starter', true),
('kit-19-feature-flags', 'Feature Management', 'Unleash / OpenFeature', 'PostgreSQL', 'Redis', 'JWT', 'Feature flag system with gradual rollouts, A/B testing, and kill switches.', 40, 'https://github.com/backend-forge/feature-flags-starter', true),
('kit-20-data-pipelines', 'Data Pipeline Stack', 'Debezium / dbt', 'PostgreSQL', 'Kafka', 'JWT', 'Real-time data pipeline with CDC streaming and dbt transformation layers.', 44, 'https://github.com/backend-forge/data-pipeline-starter', true),
('kit-21-testing', 'Quality Engineering', 'Vitest / Pact', 'PostgreSQL', 'N/A', 'JWT', 'Comprehensive testing strategy with unit, integration, and contract tests.', 36, 'https://github.com/backend-forge/testing-starter', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  stars = EXCLUDED.stars,
  github_repo_url = EXCLUDED.github_repo_url;
