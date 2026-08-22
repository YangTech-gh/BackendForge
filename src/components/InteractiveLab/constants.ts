import { CourseLab, CourseTrack } from '../../types';
import { CommandItem } from './types';

// Paradigm-keyed suggested questions - add new paradigms here
const PARADIGM_QUESTIONS: Record<string, string[]> = {
  go: [
    'How do buffered channels prevent goroutine memory leaks under peak RPS?',
    'When should I use sync.RWMutex vs atomic channel passing in Go?',
    'Give me a step-by-step hint for handling worker context cancellation.',
  ],
  rust: [
    'How does Arc<Mutex<T>> state sharing ensure thread safety in Rust?',
    'Why are Send + Sync bounds required for async route handlers?',
    'Give me a step-by-step hint for zero-cost middleware in Rust.',
  ],
  python: [
    'Why does blocking synchronous I/O inside async def freeze Uvicorn workers?',
    'How does SQLAlchemy async session context manager handle rollbacks?',
    'Give me a step-by-step hint for async DB operations.',
  ],
  'ruby on rails 7+': [
    'What is optimistic vs pessimistic locking in Rails Active Record?',
    'How do advisory locks interact with Puma threads & Sidekiq workers?',
    'Give me a step-by-step hint for Rails transaction isolation levels.',
  ],
  'java & spring boot': [
    'How do JDK 21 Virtual Threads eliminate OS thread context switching?',
    'Why should synchronized blocks be replaced with ReentrantLock in Loom?',
    'Give me a step-by-step hint for virtual thread pinning debugging.',
  ],
  elixir: [
    'How does the "Let It Crash" philosophy work with OTP Supervisors?',
    'What is GenServer call vs cast performance difference under load?',
    'Give me a step-by-step hint for state recovery in Elixir processes.',
  ],
  'node.js & typescript': [
    'How does event loop profiling identify blocking operations?',
    'What is the difference between worker threads and child processes?',
    'Give me a step-by-step hint for event loop lag detection.',
  ],
  database: [
    'What is the exact difference between SELECT FOR UPDATE vs Advisory Locks?',
    'Why is SKIP LOCKED essential for high-throughput background queues?',
    'Give me a step-by-step hint for avoiding PostgreSQL deadlocks.',
  ],
  'ai-native': [
    'How does HNSW index accelerate pgvector cosine similarity search?',
    'How do tool-calling function definitions execute multi-step loops?',
    'Give me a step-by-step hint for handling embedding index updates.',
  ],
  containerization: [
    'How do multi-stage builds reduce image size without losing build tools?',
    'What is the difference between COPY and ADD in a Dockerfile?',
    'Give me a step-by-step hint for optimizing Docker layer caching.',
  ],
  'security engineering': [
    'How does Content-Security-Policy prevent XSS attacks?',
    'What is the difference between CORS preflight and simple requests?',
    'Give me a step-by-step hint for SSRF prevention.',
  ],
  'progressive delivery': [
    'How does percentage-based rollout ensure consistent user assignment?',
    'What statistical methods determine A/B test significance?',
    'Give me a step-by-step hint for automated rollback on degradation.',
  ],
  'data engineering': [
    'How does Debezium CDC read PostgreSQL WAL for change events?',
    'What is the difference between snapshot and streaming CDC?',
    'Give me a step-by-step hint for dbt incremental model design.',
  ],
  'quality engineering': [
    'How do test doubles differ from mocks, stubs, and fakes?',
    'What makes a contract test more valuable than an integration test?',
    'Give me a step-by-step hint for test data factory design.',
  ],
  'infrastructure as code': [
    'How does Terraform plan detect infrastructure drift?',
    'What is the difference between state file locking and resource locking?',
    'Give me a step-by-step hint for Terraform module composition.',
  ],
  'observability & sre': [
    'How do RED metrics (Rate, Errors, Duration) differ from USE metrics?',
    'What is the difference between distributed tracing and log correlation?',
    'Give me a step-by-step hint for SLO error budget calculations.',
  ],
  'api gateway patterns': [
    'How do Kong plugins intercept the request lifecycle?',
    'What is the difference between rate limiting and circuit breaking?',
    'Give me a step-by-step hint for WASM filter development.',
  ],
  'ci/cd pipelines': [
    'How do reusable workflows reduce duplication in GitHub Actions?',
    'What is the difference between canary and blue-green deployments?',
    'Give me a step-by-step hint for ArgoCD ApplicationSet generation.',
  ],
  'event sourcing & cqrs': [
    'How do catch-up projections differ from inline projections?',
    'What is the difference between event versioning and schema evolution?',
    'Give me a step-by-step hint for saga compensation design.',
  ],
  'service mesh': [
    'How does Istio VirtualService split traffic between service versions?',
    'What is the difference between mutual TLS and simple TLS?',
    'Give me a step-by-step hint for Consul intention design.',
  ],
  'chaos engineering': [
    'How do blast radius controls prevent production outages?',
    'What is the difference between steady-state hypothesis and SLO?',
    'Give me a step-by-step hint for GameDay orchestration.',
  ],
};

export function getDynamicSuggestedQuestions(lab: CourseLab, track?: CourseTrack): string[] {
  const paradigm = track?.paradigm?.toLowerCase() || '';

  // Try exact paradigm match first
  for (const [key, questions] of Object.entries(PARADIGM_QUESTIONS)) {
    if (paradigm.includes(key)) return questions;
  }

  // Fallback: use lab title and track paradigm for generic questions
  return [
    `Explain the core architecture of ${lab.title}`,
    `What are common edge cases or race conditions in ${track?.paradigm || 'this paradigm'}?`,
    `Give me a step-by-step hint for passing this lab assertion.`,
  ];
}

// Paradigm-keyed quick commands - add new paradigms here
const PARADIGM_COMMANDS: Record<string, CommandItem[]> = {
  go: [
    { label: 'go test ./...', cmd: 'go test -v ./...', color: 'text-emerald-400' },
    { label: 'go run main.go', cmd: 'go run main.go', color: 'text-cyan-400' },
    { label: 'curl /api/v1/pool', cmd: 'curl -i /api/v1/pool', color: 'text-purple-400' },
    { label: 'clear', cmd: 'clear', color: 'text-zinc-400' },
  ],
  rust: [
    { label: 'cargo test', cmd: 'cargo test -- --nocapture', color: 'text-emerald-400' },
    { label: 'cargo run', cmd: 'cargo run', color: 'text-cyan-400' },
    { label: 'curl /health', cmd: 'curl -i http://localhost:3000/health', color: 'text-purple-400' },
    { label: 'clear', cmd: 'clear', color: 'text-zinc-400' },
  ],
  python: [
    { label: 'pytest', cmd: 'pytest -v', color: 'text-emerald-400' },
    { label: 'uvicorn run', cmd: 'uvicorn main:app --reload', color: 'text-cyan-400' },
    { label: 'curl /predict', cmd: 'curl -X POST /api/v1/predict', color: 'text-purple-400' },
    { label: 'clear', cmd: 'clear', color: 'text-zinc-400' },
  ],
  'ruby on rails 7+': [
    { label: 'rspec', cmd: 'bundle exec rspec', color: 'text-emerald-400' },
    { label: 'rails server', cmd: 'rails server', color: 'text-cyan-400' },
    { label: 'curl /orders', cmd: 'curl -i /orders/process', color: 'text-purple-400' },
    { label: 'clear', cmd: 'clear', color: 'text-zinc-400' },
  ],
  'java & spring boot': [
    { label: 'mvn test', cmd: 'mvn test', color: 'text-emerald-400' },
    { label: 'java -jar', cmd: 'java -jar app.jar', color: 'text-cyan-400' },
    { label: 'curl /actuator', cmd: 'curl -i /actuator/health', color: 'text-purple-400' },
    { label: 'clear', cmd: 'clear', color: 'text-zinc-400' },
  ],
  elixir: [
    { label: 'mix test', cmd: 'mix test', color: 'text-emerald-400' },
    { label: 'iex -S mix', cmd: 'iex -S mix phx.server', color: 'text-cyan-400' },
    { label: 'curl /genserver', cmd: 'curl -i /api/genserver/stats', color: 'text-purple-400' },
    { label: 'clear', cmd: 'clear', color: 'text-zinc-400' },
  ],
  database: [
    { label: 'npm test', cmd: 'npm test', color: 'text-emerald-400' },
    { label: 'psql EXPLAIN', cmd: 'psql -c "EXPLAIN ANALYZE SELECT * FROM accounts FOR UPDATE;"', color: 'text-cyan-400' },
    { label: 'curl /api/ledger', cmd: 'curl -i /api/ledger', color: 'text-purple-400' },
    { label: 'clear', cmd: 'clear', color: 'text-zinc-400' },
  ],
  containerization: [
    { label: 'docker build', cmd: 'docker build -t app .', color: 'text-emerald-400' },
    { label: 'docker compose up', cmd: 'docker compose up -d', color: 'text-cyan-400' },
    { label: 'docker ps', cmd: 'docker ps --format "table {{.Names}}\\t{{.Status}}"', color: 'text-purple-400' },
    { label: 'clear', cmd: 'clear', color: 'text-zinc-400' },
  ],
};

export function getDynamicQuickCommands(_lab: CourseLab, track?: CourseTrack): CommandItem[] {
  const paradigm = track?.paradigm?.toLowerCase() || '';

  // Try exact paradigm match first
  for (const [key, commands] of Object.entries(PARADIGM_COMMANDS)) {
    if (paradigm.includes(key)) return commands;
  }

  // Fallback: Node.js/TypeScript defaults
  return [
    { label: 'npm test', cmd: 'npm test', color: 'text-emerald-400' },
    { label: 'node app.js', cmd: 'node app.js', color: 'text-cyan-400' },
    { label: 'curl /api/webhooks', cmd: 'curl -X POST /api/webhooks -H "X-Idempotency-Key: ik_test_123"', color: 'text-purple-400' },
    { label: 'clear', cmd: 'clear', color: 'text-zinc-400' },
  ];
}
