import { CourseLab, CourseTrack } from '../../types';
import { CommandItem } from './types';

export function getDynamicSuggestedQuestions(lab: CourseLab, track?: CourseTrack): string[] {
  const labId = lab.id.toLowerCase();
  const paradigm = track?.paradigm?.toLowerCase() || '';

  if (labId.includes('idempotency') || labId.includes('lock')) {
    return [
      'How does Redis SETNX prevent double-charging during concurrent request bursts?',
      'What happens if the Redis lock TTL expires before the DB transaction commits?',
      'Give me a step-by-step architectural hint for passing this idempotency lab.',
    ];
  }
  if (labId.includes('worker') || labId.includes('goroutine') || paradigm.includes('go')) {
    return [
      'How do buffered channels prevent goroutine memory leaks under peak RPS?',
      'When should I use sync.RWMutex vs atomic channel passing in Go?',
      'Give me a step-by-step hint for handling worker context cancellation.',
    ];
  }
  if (labId.includes('axum') || labId.includes('rust') || paradigm.includes('rust')) {
    return [
      'How does Arc<Mutex<T>> state sharing ensure thread safety in Rust?',
      'Why are Send + Sync bounds required for Axum async route handlers?',
      'Give me a step-by-step hint for zero-cost middleware in Rust.',
    ];
  }
  if (labId.includes('mvcc') || labId.includes('postgres') || labId.includes('sql')) {
    return [
      'What is the exact difference between SELECT FOR UPDATE vs Advisory Locks?',
      'Why is SKIP LOCKED essential for high-throughput background queues?',
      'Give me a step-by-step hint for avoiding PostgreSQL deadlocks.',
    ];
  }
  if (labId.includes('fastapi') || labId.includes('python') || paradigm.includes('python')) {
    return [
      'Why does blocking synchronous I/O inside async def freeze Uvicorn workers?',
      'How does SQLAlchemy async session context manager handle rollbacks?',
      'Give me a step-by-step hint for FastAPI async DB operations.',
    ];
  }
  if (labId.includes('rails') || labId.includes('ruby') || paradigm.includes('ruby')) {
    return [
      'What is optimistic vs pessimistic locking in Rails Active Record?',
      'How do advisory locks interact with Puma threads & Sidekiq workers?',
      'Give me a step-by-step hint for Rails transaction isolation levels.',
    ];
  }
  if (labId.includes('virtual-threads') || labId.includes('spring') || paradigm.includes('java')) {
    return [
      'How do JDK 21 Virtual Threads eliminate OS thread context switching?',
      'Why should synchronized blocks be replaced with ReentrantLock in Loom?',
      'Give me a step-by-step hint for virtual thread thread-local pin debugging.',
    ];
  }
  if (labId.includes('beam') || labId.includes('genserver') || paradigm.includes('elixir')) {
    return [
      'How does the "Let It Crash" philosophy work with OTP Supervisors?',
      'What is GenServer call vs cast performance difference under load?',
      'Give me a step-by-step hint for state recovery in Elixir processes.',
    ];
  }
  if (labId.includes('vector') || labId.includes('pgvector') || labId.includes('agent')) {
    return [
      'How does HNSW index accelerate pgvector cosine similarity search?',
      'How do Forger 1.0 tool-calling function definitions execute multi-step loops?',
      'Give me a step-by-step hint for handling embedding index updates.',
    ];
  }

  return [
    `Explain the core architecture of ${lab.title}`,
    `What are common edge cases or race conditions in ${track.paradigm}?`,
    `Give me a step-by-step hint for passing this lab assertion.`,
  ];
}

export function getDynamicQuickCommands(_lab: CourseLab, track?: CourseTrack): CommandItem[] {
  const paradigm = track?.paradigm?.toLowerCase() || '';

  if (paradigm.includes('go')) {
    return [
      { label: 'go test ./...', cmd: 'go test -v ./...', color: 'text-emerald-400' },
      { label: 'go run main.go', cmd: 'go run main.go', color: 'text-cyan-400' },
      { label: 'curl /api/v1/pool', cmd: 'curl -i /api/v1/pool', color: 'text-purple-400' },
      { label: 'clear', cmd: 'clear', color: 'text-zinc-400' },
    ];
  }
  if (paradigm.includes('rust')) {
    return [
      { label: 'cargo test', cmd: 'cargo test -- --nocapture', color: 'text-emerald-400' },
      { label: 'cargo run', cmd: 'cargo run', color: 'text-cyan-400' },
      { label: 'curl /health', cmd: 'curl -i http://localhost:3000/health', color: 'text-purple-400' },
      { label: 'clear', cmd: 'clear', color: 'text-zinc-400' },
    ];
  }
  if (paradigm.includes('python')) {
    return [
      { label: 'pytest', cmd: 'pytest -v', color: 'text-emerald-400' },
      { label: 'uvicorn run', cmd: 'uvicorn main:app --reload', color: 'text-cyan-400' },
      { label: 'curl /predict', cmd: 'curl -X POST /api/v1/predict', color: 'text-purple-400' },
      { label: 'clear', cmd: 'clear', color: 'text-zinc-400' },
    ];
  }
  if (paradigm.includes('ruby')) {
    return [
      { label: 'rspec', cmd: 'bundle exec rspec', color: 'text-emerald-400' },
      { label: 'rails server', cmd: 'rails server', color: 'text-cyan-400' },
      { label: 'curl /orders', cmd: 'curl -i /orders/process', color: 'text-purple-400' },
      { label: 'clear', cmd: 'clear', color: 'text-zinc-400' },
    ];
  }
  if (paradigm.includes('java')) {
    return [
      { label: 'mvn test', cmd: 'mvn test', color: 'text-emerald-400' },
      { label: 'java -jar', cmd: 'java -jar app.jar', color: 'text-cyan-400' },
      { label: 'curl /actuator', cmd: 'curl -i /actuator/health', color: 'text-purple-400' },
      { label: 'clear', cmd: 'clear', color: 'text-zinc-400' },
    ];
  }
  if (paradigm.includes('elixir')) {
    return [
      { label: 'mix test', cmd: 'mix test', color: 'text-emerald-400' },
      { label: 'iex -S mix', cmd: 'iex -S mix phx.server', color: 'text-cyan-400' },
      { label: 'curl /genserver', cmd: 'curl -i /api/genserver/stats', color: 'text-purple-400' },
      { label: 'clear', cmd: 'clear', color: 'text-zinc-400' },
    ];
  }
  if (paradigm.includes('postgres')) {
    return [
      { label: 'npm test', cmd: 'npm test', color: 'text-emerald-400' },
      { label: 'psql EXPLAIN', cmd: 'psql -c "EXPLAIN ANALYZE SELECT * FROM accounts FOR UPDATE;"', color: 'text-cyan-400' },
      { label: 'curl /api/ledger', cmd: 'curl -i /api/ledger', color: 'text-purple-400' },
      { label: 'clear', cmd: 'clear', color: 'text-zinc-400' },
    ];
  }

  return [
    { label: 'npm test', cmd: 'npm test', color: 'text-emerald-400' },
    { label: 'node app.js', cmd: 'node app.js', color: 'text-cyan-400' },
    { label: 'curl /api/webhooks', cmd: 'curl -X POST /api/webhooks -H "X-Idempotency-Key: ik_test_123"', color: 'text-purple-400' },
    { label: 'clear', cmd: 'clear', color: 'text-zinc-400' },
  ];
}
