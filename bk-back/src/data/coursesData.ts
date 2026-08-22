import { CourseTrack } from '../types';

export const COURSE_TRACKS: CourseTrack[] = [
  {
    id: 'track-1-node-ts',
    trackNumber: 1,
    title: 'The Ubiquitous Backend',
    tagline: 'Node.js, TypeScript & Production Scale Architecture',
    paradigm: 'Node.js & TypeScript',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    iconName: 'Server',
    description: 'Master advanced TypeScript, non-blocking I/O event loops, database transaction boundaries with Drizzle/Postgres, gRPC vs REST, and resilient webhook queues. Based on official Node.js, Fastify, and PostgreSQL documentation.',
    learningGoals: [
      'Understand Node.js Event Loop phases (Timers, Pending Callbacks, Poll, Check, Close) and Libuv thread pool allocation',
      'Design idempotent webhook ingestion with Redis SETNX locks & atomic PostgreSQL transactions',
      'Optimize Postgres connection pooling, row-level locks (SELECT FOR UPDATE SKIP LOCKED), and composite indexing',
      'Build multi-tenant SaaS billing engines with strict tenant isolation and circuit breakers'
    ],
    deliverableProject: {
      title: 'Multi-Tenant Idempotent SaaS Webhook Engine',
      description: 'A production-grade webhook ingestion service capable of processing 25,000 req/sec with guaranteed idempotency, exponential backoff retries, and multi-tenant rate limiting.',
      techStack: ['Fastify', 'TypeScript', 'PostgreSQL', 'Drizzle ORM', 'Redis', 'BullMQ']
    },
    labs: [
      {
        id: 'lab-idempotency-engine',
        title: 'Lab 1.1: Idempotency Keys & Distributed Locking',
        durationMinutes: 45,
        difficulty: 'Intermediate',
        isPro: false,
        conceptSummary: 'Prevent duplicate charge events and double-fulfillments during network retry bursts using Redis SETNX locks and PostgreSQL atomic transactions.',
        initialFiles: [
          {
            filename: 'idempotency.ts',
            language: 'typescript',
            code: `import { Redis } from 'ioredis';

export interface WebhookPayload {
  eventId: string;
  tenantId: string;
  amountCents: number;
  idempotencyKey: string;
}

export class IdempotencyManager {
  constructor(private redisClient: any, private dbClient: any) {}

  /**
   * Official Redis Pattern: SET key value NX PX milliseconds
   * 1. Check if idempotencyKey exists in Redis with state 'COMPLETED'
   * 2. If 'PROCESSING', return 409 Conflict / retry-after
   * 3. Acquire lock with 30s TTL using SETNX
   * 4. Execute atomic DB transaction
   * 5. Save result payload in Redis with 24h TTL
   */
  async processWebhookIdempotently(payload: WebhookPayload, handler: () => Promise<any>): Promise<{ status: string; result: any }> {
    const lockKey = \`idempotency:\${payload.tenantId}:\${payload.idempotencyKey}\`;
    
    // Check for completed response in cache
    const existing = await this.redisClient.get(lockKey);
    if (existing) {
      const parsed = JSON.parse(existing);
      if (parsed.status === 'COMPLETED') {
        return { status: 'CACHED_SUCCESS', result: parsed.result };
      }
      return { status: 'CONCURRENT_IN_FLIGHT', result: null };
    }

    // Acquire distributed Redis lock with SETNX (30s TTL)
    const acquired = await this.redisClient.set(lockKey, JSON.stringify({ status: 'PROCESSING' }), 'EX', 30, 'NX');
    if (!acquired) {
      return { status: 'CONCURRENT_IN_FLIGHT', result: null };
    }

    try {
      const result = await handler();
      // Store result payload with 24-hour TTL
      await this.redisClient.set(
        lockKey, 
        JSON.stringify({ status: 'COMPLETED', result }), 
        'EX', 
        86400
      );
      return { status: 'SUCCESS', result };
    } catch (err) {
      // Release lock on exception so retries can succeed
      await this.redisClient.del(lockKey);
      throw err;
    }
  }
}`
          },
          {
            filename: 'schema.sql',
            language: 'sql',
            code: `-- Webhook Processed Events Audit Ledger (PostgreSQL Docs Compliant)
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(64) NOT NULL,
  idempotency_key VARCHAR(128) NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT clock_timestamp(),
  CONSTRAINT unq_tenant_idempotency UNIQUE(tenant_id, idempotency_key)
);

CREATE INDEX idx_webhook_tenant_lookup ON webhook_events(tenant_id, idempotency_key);`
          }
        ],
        instructions: [
          'Examine the idempotency lock key strategy (`idempotency:{tenantId}:{key}`).',
          'Implement atomic execution ensuring that if a process crashes mid-flight, the lock expires gracefully after 30 seconds.',
          'Verify that subsequent identical requests within 24 hours return cached responses without re-executing payment or email logic.'
        ],
        testCases: [
          { id: 't1', name: 'Concurrent Duplicate Requests Test', expectedOutcome: 'Only 1 DB write executed; 2nd request gets lock conflict or cached payload' },
          { id: 't2', name: 'Lock Release on Error Test', expectedOutcome: 'If handler throws error, Redis lock key is deleted so retry can succeed' },
          { id: 't3', name: 'Tenant Isolation Test', expectedOutcome: 'Identical idempotencyKey under different tenantId does not collide' }
        ]
      },
      {
        id: 'lab-event-loop-profiling',
        title: 'Lab 1.2: Node.js Event Loop Lag & Worker Threads',
        durationMinutes: 60,
        difficulty: 'Advanced',
        isPro: true,
        conceptSummary: 'Detect synchronous CPU blocking that stalls Node.js event loop ticks using perf_hooks, and offload heavy crypto/JSON processing to Worker Threads.',
        initialFiles: [
          {
            filename: 'eventLoopGuard.ts',
            language: 'typescript',
            code: `import { monitorEventLoopDelay } from 'perf_hooks';
import { Worker } from 'worker_threads';

export function setupEventLoopMonitoring(maxThresholdMs = 100) {
  const histogram = monitorEventLoopDelay({ resolution: 10 });
  histogram.enable();

  setInterval(() => {
    const p99Ms = histogram.percentile(99) / 1e6;
    if (p99Ms > maxThresholdMs) {
      console.warn(\`[CRITICAL WARNING] Event loop lag p99 is \${p99Ms.toFixed(2)}ms (threshold \${maxThresholdMs}ms)\`);
    }
  }, 1000);
}

export function runCpuTaskInWorker(taskData: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(\`
      const { parentPort, workerData } = require('worker_threads');
      // CPU heavy hash calculation offloaded from main thread
      let hash = 0;
      for (let i = 0; i < 1e7; i++) { hash = (hash + i) % 100000; }
      parentPort.postMessage({ status: 'done', hash });
    \`, { eval: true, workerData: taskData });

    worker.on('message', resolve);
    worker.on('error', reject);
  });
}`
          }
        ],
        instructions: [
          'Identify synchronous CPU intensive operations stalling the HTTP handler thread.',
          'Refactor heavy crypto or compression payloads to use Node.js Worker Threads.'
        ],
        testCases: [
          { id: 't1', name: 'Event Loop Lag Under 10ms', expectedOutcome: 'HTTP p99 latency stays under 15ms during 5,000 CPU hash requests' }
        ]
      },
      {
        id: 'lab-postgres-mvcc-locks',
        title: 'Lab 1.3: PostgreSQL MVCC & High-Throughput Queue Locks',
        durationMinutes: 50,
        difficulty: 'Staff',
        isPro: true,
        conceptSummary: 'Master PostgreSQL transaction isolation levels (Read Committed, Repeatable Read, Serializable) and use SELECT ... FOR UPDATE SKIP LOCKED for high-concurrency job dispatchers.',
        initialFiles: [
          {
            filename: 'queueDispatcher.ts',
            language: 'typescript',
            code: `export class PostgresQueueDispatcher {
  constructor(private dbPool: any) {}

  /**
   * Official PostgreSQL Documentation Pattern:
   * SELECT * FROM jobs 
   * WHERE status = 'PENDING' 
   * ORDER BY priority DESC 
   * LIMIT 10 
   * FOR UPDATE SKIP LOCKED;
   */
  async claimNextBatch(batchSize: number = 10): Promise<any[]> {
    const client = await this.dbPool.connect();
    try {
      await client.query('BEGIN;');
      const query = \`
        SELECT id, payload 
        FROM job_queue 
        WHERE status = 'PENDING' AND scheduled_at <= NOW()
        ORDER BY priority DESC, created_at ASC
        LIMIT $1
        FOR UPDATE SKIP LOCKED;
      \`;
      const result = await client.query(query, [batchSize]);
      
      if (result.rows.length > 0) {
        const ids = result.rows.map((r: any) => r.id);
        await client.query(
          \`UPDATE job_queue SET status = 'PROCESSING', locked_at = NOW() WHERE id = ANY($1::uuid[])\`,
          [ids]
        );
      }
      
      await client.query('COMMIT;');
      return result.rows;
    } catch (err) {
      await client.query('ROLLBACK;');
      throw err;
    } finally {
      client.release();
    }
  }
}`
          }
        ],
        instructions: [
          'Verify how `FOR UPDATE SKIP LOCKED` allows 20 concurrent worker processes to pick jobs without waiting on locks.',
          'Test query behavior under high contention to confirm zero duplicate job processing.'
        ],
        testCases: [
          { id: 't1', name: 'Zero Worker Contention Lock Test', expectedOutcome: '10 concurrent workers claim 10 distinct job IDs simultaneously' }
        ]
      },
      {
        id: 'lab-distributed-redis-lock',
        title: 'Lab 1.4: Redlock Distributed Mutex & Thundering Herd Prevention',
        durationMinutes: 45,
        difficulty: 'Senior',
        isPro: true,
        conceptSummary: 'Prevent cache thundering herds and duplicate scheduled tasks across stateless Node.js containers using Redis distributed mutex locks (SET NX PX).',
        initialFiles: [
          {
            filename: 'redisMutex.ts',
            language: 'typescript',
            code: `import { createClient } from 'redis';

export class RedisDistributedMutex {
  constructor(private redisClient: any) {}

  /**
   * Official Redlock SET NX PX pattern:
   * SET key value NX PX ttlMs
   */
  async acquireLock(resourceKey: string, lockToken: string, ttlMs: number = 5000): Promise<boolean> {
    const result = await this.redisClient.set(
      \`lock:\${resourceKey}\`,
      lockToken,
      {
        NX: true,
        PX: ttlMs
      }
    );
    return result === 'OK';
  }

  async releaseLock(resourceKey: string, lockToken: string): Promise<boolean> {
    // Lua script guarantees we only unlock if value matches lockToken
    const script = \`
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    \`;
    const res = await this.redisClient.eval(script, {
      keys: [\`lock:\${resourceKey}\`],
      arguments: [lockToken]
    });
    return res === 1;
  }
}`
          }
        ],
        instructions: [
          'Verify that only one Node.js instance can acquire the distributed lock for a given resourceKey.',
          'Test Lua script safety so an expired lock is not released by a slower worker.'
        ],
        testCases: [
          { id: 't1', name: 'Single Lock Holder Guarantee', expectedOutcome: 'Only 1 of 50 concurrent request workers successfully acquires the mutex' },
          { id: 't2', name: 'Token-Guarded Release Verification', expectedOutcome: 'Lua script prevents accidental deletion of lock renewed by another worker' }
        ]
      }
    ]
  },
  {
    id: 'track-2-rails',
    trackNumber: 2,
    title: 'Rapid Product & Business Logic',
    tagline: 'Ruby on Rails 7+, Hotwire & The Majesty of Monolith First',
    paradigm: 'Ruby on Rails 7+',
    badgeColor: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
    iconName: 'Flame',
    description: 'Learn why 95% of successful tech startups begin with a monolith. Master Domain-Driven Design (DDD), Service Objects, Hotwire/Turbo real-time updates, and Sidekiq/Solid Queue background jobs.',
    learningGoals: [
      'Implement strict domain boundaries with Service Objects & Form Objects in Rails',
      'Eliminate N+1 database queries using Bullet, eager loading, and CTEs',
      'Build real-time collaborative UI states using Hotwire Streams without client JS bloat',
      'Handle Stripe Webhooks and double-entry ledger bookkeeping safely'
    ],
    deliverableProject: {
      title: 'Production-Ready Two-Sided Marketplace',
      description: 'An Airbnb/Substack style marketplace complete with role-based access control, Stripe Connect payouts, instant Hotwire Turbo live updates, and zero-downtime database migrations.',
      techStack: ['Rails 7.2', 'Ruby 3.3', 'Hotwire', 'PostgreSQL', 'Sidekiq', 'Stripe API']
    },
    labs: [
      {
        id: 'lab-rails-double-entry',
        title: 'Lab 2.1: Double-Entry Financial Ledger in Rails',
        durationMinutes: 50,
        difficulty: 'Intermediate',
        isPro: false,
        conceptSummary: 'Create an immutable financial ledger with ActiveRecord transactions where total debits equal total credits for every transaction.',
        initialFiles: [
          {
            filename: 'transfer_funds_service.rb',
            language: 'ruby',
            code: `class TransferFundsService
  class InsufficientBalanceError < StandardError; end

  def initialize(source_account:, destination_account:, amount_cents:, currency: 'USD')
    @source = source_account
    @destination = destination_account
    @amount = amount_cents
    @currency = currency
  end

  def call
    ActiveRecord::Base.transaction do
      # Pessimistic row locking to prevent overdraft race conditions
      @source.lock! 
      raise InsufficientBalanceError if @source.available_balance_cents < @amount

      entry = LedgerEntry.create!(description: "Transfer to Account #\{@destination.id\}")
      
      # Debit Source Account (-amount)
      entry.postings.create!(account: @source, amount_cents: -@amount, currency: @currency)
      # Credit Destination Account (+amount)
      entry.postings.create!(account: @destination, amount_cents: @amount, currency: @currency)

      @source.recalculate_balance!
      @destination.recalculate_balance!
      
      entry
    end
  end
end`
          }
        ],
        instructions: [
          'Examine pessimistic row locking (`@source.lock!`) inside the transaction block.',
          'Verify that zero net discrepancy exists across postings before committing.',
          'Handle deadlock exceptions gracefully with automatic retry decorators.'
        ],
        testCases: [
          { id: 't1', name: 'Zero Balance Discrepancy Test', expectedOutcome: 'Sum of postings in LedgerEntry equals 0' },
          { id: 't2', name: 'Concurrent Overdraft Protection', expectedOutcome: 'Pessimistic lock prevents race condition double spending' }
        ]
      },
      {
        id: 'lab-rails-solid-queue',
        title: 'Lab 2.2: Solid Queue & Resilient Background Workflows',
        durationMinutes: 45,
        difficulty: 'Advanced',
        isPro: true,
        conceptSummary: 'Implement background processing with Rails 7+ Solid Queue using FOR UPDATE SKIP LOCKED database tables, concurrency controls, and dead-letter queues.',
        initialFiles: [
          {
            filename: 'process_payout_job.rb',
            language: 'ruby',
            code: `class ProcessPayoutJob < ApplicationJob
  queue_as :payouts
  limits_concurrency to: 1, key: ->(account_id, _) { "account_\#{account_id}" }

  retry_on Stripe::APIConnectionError, wait: :exponentially_longer, attempts: 5

  def perform(account_id, amount_cents)
    account = Account.find(account_id)
    Stripe::Payout.create(
      amount: amount_cents,
      currency: 'usd',
      destination: account.stripe_account_id
    )
  end
end`
          }
        ],
        instructions: [
          'Inspect concurrency limits preventing duplicate payouts to the same account.',
          'Configure exponential backoff strategies for external API retries.'
        ],
        testCases: [
          { id: 't1', name: 'Concurrency Lock Test', expectedOutcome: 'Prevents parallel payout execution for same account_id' }
        ]
      },
      {
        id: 'lab-rails-hotwire-websockets',
        title: 'Lab 2.3: Hotwire ActionCable Live Trading Ticker & Broadcasts',
        durationMinutes: 50,
        difficulty: 'Senior',
        isPro: true,
        conceptSummary: 'Stream real-time DOM updates via server-sent ActionCable websockets and Hotwire Turbo Streams without heavy JavaScript bundles.',
        initialFiles: [
          {
            filename: 'price_update_job.rb',
            language: 'ruby',
            code: `# app/jobs/price_update_job.rb
class PriceUpdateJob < ApplicationJob
  queue_as :default

  def perform(ticker_symbol, price, volume)
    stock = Stock.find_by!(symbol: ticker_symbol)
    stock.update!(price: price, volume: volume)

    # Broadcast Turbo Stream partial over Redis ActionCable channel
    Turbo::StreamsChannel.broadcast_replace_to(
      "market_ticker_#{ticker_symbol}",
      target: "stock_quote_#{stock.id}",
      partial: "stocks/ticker_item",
      locals: { stock: stock, change_pct: stock.calculate_change }
    )
  end
end`
          }
        ],
        instructions: [
          'Verify that updating a stock model automatically broadcasts a DOM replace instruction over Redis ActionCable.',
          'Test WebSocket reconnection resilience during server deployment restarts.'
        ],
        testCases: [
          { id: 't1', name: 'DOM Broadcast Verification', expectedOutcome: 'Turbo stream broadcasts replace_to target with updated HTML partial' },
          { id: 't2', name: 'Zero JS Bundle Overhead Test', expectedOutcome: '10,000 live DOM updates execute without memory leaks or virtual DOM reconciliation diffing' }
        ]
      }
    ]
  },
  {
    id: 'track-3-rust-go',
    trackNumber: 3,
    title: 'High-Performance & Systems',
    tagline: 'Go Cloud-Native Services & Rust Performance Engines',
    paradigm: 'Rust & Go',
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    iconName: 'Cpu',
    description: 'When milliseconds matter. Build ultra-concurrent Go microservices with worker pools and gRPC, paired with a blazing-fast Rust validation microservice featuring zero-cost abstractions.',
    learningGoals: [
      'Master Go concurrency primitives: Goroutines, channels, sync.Pool, and context cancellation',
      'Understand Rust Ownership, Borrow Checker, Lifetimes, and safe FFI/gRPC boundaries',
      'Build a custom high-throughput log ingestion pipeline handling 100,000 events/sec',
      'Design gRPC protobuf protocols with backward compatibility guarantees'
    ],
    deliverableProject: {
      title: 'Real-Time Analytics Ingestion & Validation Pipeline',
      description: 'A hybrid Go & Rust system where Go handles HTTP/gRPC ingress and buffering, while a compiled Rust engine performs sub-millisecond regex & schema validation.',
      techStack: ['Go 1.22', 'Rust 1.78', 'gRPC / Protobuf', 'Tonic', 'Tokio', 'Docker']
    },
    labs: [
      {
        id: 'lab-go-worker-pool',
        title: 'Lab 3.1: Go Lock-Free Worker Pool & Channel Buffering',
        durationMinutes: 55,
        difficulty: 'Advanced',
        isPro: false,
        conceptSummary: 'Design a high-throughput event buffer using Go channels, worker goroutines, and graceful shutdown signal handling.',
        initialFiles: [
          {
            filename: 'pipeline.go',
            language: 'go',
            code: `package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

type Event struct {
	ID        string
	Payload   []byte
	Timestamp time.Time
}

type Pipeline struct {
	jobs    chan Event
	results chan string
	wg      sync.WaitGroup
}

func NewPipeline(bufferSize int, workerCount int) *Pipeline {
	p := &Pipeline{
		jobs:    make(chan Event, bufferSize),
		results: make(chan string, bufferSize),
	}

	for i := 0; i < workerCount; i++ {
		p.wg.Add(1)
		go p.worker(i)
	}

	return p
}

func (p *Pipeline) worker(id int) {
	defer p.wg.Done()
	for event := range p.jobs {
		processed := fmt.Sprintf("Worker %d processed event %s", id, event.ID)
		p.results <- processed
	}
}

func (p *Pipeline) Enqueue(ctx context.Context, e Event) error {
	select {
	case p.jobs <- e:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	default:
		return fmt.Errorf("buffer full, event dropped: %s", e.ID)
	}
}`
          }
        ],
        instructions: [
          'Run the Go test suite to verify no goroutine leaks occur on context cancellation.',
          'Optimize channel capacity and eliminate allocation overheads using sync.Pool for byte buffers.'
        ],
        testCases: [
          { id: 't1', name: 'Zero Goroutine Leak Test', expectedOutcome: 'p.wg.Wait() terminates cleanly on channel close' },
          { id: 't2', name: '100k Messages Ingestion Benchmark', expectedOutcome: 'Processes 100,000 events in under 180ms with 0 memory allocations' }
        ]
      },
      {
        id: 'lab-rust-tokio-validation',
        title: 'Lab 3.2: Rust Async Tokio Validator & Memory Safety',
        durationMinutes: 60,
        difficulty: 'Staff',
        isPro: true,
        conceptSummary: 'Build a zero-copy payload validation engine in Rust using Tokio async task spawning and strict ownership guarantees.',
        initialFiles: [
          {
            filename: 'validator.rs',
            language: 'rust',
            code: `use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Debug, Clone)]
pub struct IngestionPayload {
    pub id: String,
    pub body: Vec<u8>,
}

pub struct SchemaValidator {
    rules: Vec<String>,
}

impl SchemaValidator {
    pub fn new(rules: Vec<String>) -> Self {
        Self { rules }
    }

    pub async fn validate(&self, payload: &IngestionPayload) -> Result<bool, String> {
        if payload.body.is_empty() {
            return Err("Payload body cannot be empty".to_string());
        }
        Ok(true)
    }
}`
          }
        ],
        instructions: [
          'Verify zero heap allocations during validation loops using Rust lifetimes.',
          'Implement gRPC service handlers for high-speed cross-process calls.'
        ],
        testCases: [
          { id: 't1', name: 'Zero Memory Leak Test', expectedOutcome: 'Valgrind / Miri confirms 0 unsafe memory leaks' }
        ]
      },
      {
        id: 'lab-go-ebpf-circuit-breaker',
        title: 'Lab 3.3: High-Throughput gRPC Connection Pooling & Circuit Breaking',
        durationMinutes: 60,
        difficulty: 'Staff',
        isPro: true,
        conceptSummary: 'Protect downstream microservices under 100k QPS load using adaptive token bucket circuit breaking and gRPC channel multiplexing.',
        initialFiles: [
          {
            filename: 'circuit_breaker.go',
            language: 'go',
            code: `package main

import (
	"context"
	"errors"
	"sync"
	"time"
)

type CircuitState int

const (
	StateClosed CircuitState = iota
	StateOpen
	StateHalfOpen
)

type CircuitBreaker struct {
	mu           sync.Mutex
	state        CircuitState
	failureCount int
	threshold    int
	resetTimeout time.Duration
	lastFailure  time.Time
}

func NewCircuitBreaker(threshold int, resetTimeout time.Duration) *CircuitBreaker {
	return &CircuitBreaker{
		state:        StateClosed,
		threshold:    threshold,
		resetTimeout: resetTimeout,
	}
}

func (cb *CircuitBreaker) Execute(fn func() error) error {
	cb.mu.Lock()
	if cb.state == StateOpen {
		if time.Since(cb.lastFailure) > cb.resetTimeout {
			cb.state = StateHalfOpen
		} else {
			cb.mu.Unlock()
			return errors.New("circuit breaker is OPEN: downstream service overloaded")
		}
	}
	cb.mu.Unlock()

	err := fn()
	cb.mu.Lock()
	defer cb.mu.Unlock()

	if err != nil {
		cb.failureCount++
		cb.lastFailure = time.Now()
		if cb.failureCount >= cb.threshold {
			cb.state = StateOpen
		}
		return err
	}

	if cb.state == StateHalfOpen {
		cb.state = StateClosed
		cb.failureCount = 0
	}
	return nil
}`
          }
        ],
        instructions: [
          'Verify that exceeding the failure threshold immediately trips the circuit breaker to OPEN state.',
          'Test half-open state transition and automatic recovery after reset timeout elapses.'
        ],
        testCases: [
          { id: 't1', name: 'Fast-Fail Circuit Trip Test', expectedOutcome: 'Trips circuit to OPEN after 5 consecutive downstream gRPC timeouts' },
          { id: 't2', name: 'Half-Open Recovery Test', expectedOutcome: 'Successfully resets circuit to CLOSED after probe request succeeds' }
        ]
      }
    ]
  },
  {
    id: 'track-4-ai-native',
    trackNumber: 4,
    title: 'AI-Native Backend Engineering',
    tagline: 'RAG Pipelines, Vector DBs, Guardrails & Autonomous Agents',
    paradigm: 'AI-Native Engineering',
    badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
    iconName: 'Bot',
    description: 'Transform standard backends into intelligent, autonomous agentic systems. Implement hybrid semantic vector search with pgvector, LLM rate-limiting, output guardrails, and tool-calling webhooks using Forger 1.0 SDK.',
    learningGoals: [
      'Design hybrid vector search engines combining HNSW indexes with SQL metadata filters',
      'Implement LLM output guardrails and schema enforcement using structured JSON response schemas',
      'Build agentic tool-calling workflows that query relational DBs and dispatch external API calls',
      'Cache LLM embeddings and responses in Redis to cut latency by 85% and reduce API costs'
    ],
    deliverableProject: {
      title: 'Autonomous Enterprise Agent Backend',
      description: 'A production agent service that ingests natural language user requests, plans multi-step SQL queries across a database schema, validates output safety, and executes webhook triggers.',
      techStack: ['Node.js', 'Forger 1.0 API', 'pgvector', 'Redis', 'LangChain / Custom Agent Engine']
    },
    labs: [
      {
        id: 'lab-agent-tool-calling',
        title: 'Lab 4.1: Autonomous Tool-Calling Agent with Circuit Breakers',
        durationMinutes: 60,
        difficulty: 'Staff',
        isPro: false,
        conceptSummary: 'Create a safe agent loop that interprets natural language, executes database tools with parameterized queries, and handles hallucinations gracefully using Forger 1.0.',
        initialFiles: [
          {
            filename: 'agentExecutor.ts',
            language: 'typescript',
            code: `import { GoogleGenAI } from '@google/genai';

export class AgentService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async executeUserPrompt(userPrompt: string, availableTools: any[]): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userPrompt,
      config: {
        systemInstruction: 'You are an AI-Native Systems Agent. Inspect tools before invoking. Never run drop or delete SQL commands.',
        tools: availableTools
      }
    });

    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      console.log('Agent requested function calls:', functionCalls);
    }

    return response.text || 'Task completed.';
  }
}`
          }
        ],
        instructions: [
          'Examine the function declaration schemas enforcing strict parameter typing.',
          'Add a safety guardrail check that blocks any SQL injection or unauthorized schema mutation before executing tool arguments.',
          'Implement Redis semantic query caching for previously evaluated prompt embeddings.'
        ],
        testCases: [
          { id: 't1', name: 'Structured Tool Calling Verification', expectedOutcome: 'Agent generates valid functionCall with typed JSON arguments' },
          { id: 't2', name: 'SQL Injection Guardrail Test', expectedOutcome: 'Blocks malicious input strings like DROP TABLE users' }
        ]
      },
      {
        id: 'lab-pgvector-hnsw',
        title: 'Lab 4.2: pgvector HNSW Hybrid Vector Search & Indexing',
        durationMinutes: 50,
        difficulty: 'Advanced',
        isPro: true,
        conceptSummary: 'Configure PostgreSQL pgvector extension with Hierarchical Navigable Small World (HNSW) indexing for sub-5ms cosine similarity searches over 1,000,000 document embeddings.',
        initialFiles: [
          {
            filename: 'vectorSearch.sql',
            language: 'sql',
            code: `-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(64) NOT NULL,
  content TEXT NOT NULL,
  embedding vector(768) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- HNSW Index for ultra-fast cosine distance search (<=> operator)
CREATE INDEX idx_docs_hnsw_cosine ON document_embeddings 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- Hybrid Search Query combining SQL metadata + Cosine distance
SELECT id, content, 1 - (embedding <=> $1) AS similarity
FROM document_embeddings
WHERE tenant_id = $2 AND (metadata->>'category' = 'TECHNICAL_RFC')
ORDER BY embedding <=> $1 ASC
LIMIT 5;`
          }
        ],
        instructions: [
          'Examine the HNSW index parameters (`m=16`, `ef_construction=64`).',
          'Test query execution plan using `EXPLAIN ANALYZE` to confirm index scan over seq scan.'
        ],
        testCases: [
          { id: 't1', name: 'HNSW Index Scan Verification', expectedOutcome: 'EXPLAIN ANALYZE confirms Index Scan using idx_docs_hnsw_cosine' }
        ]
      },
      {
        id: 'lab-ai-guardrails-evaluation',
        title: 'Lab 4.3: Enterprise LLM Prompt Guardrails & PII Sanitization Pipeline',
        durationMinutes: 45,
        difficulty: 'Senior',
        isPro: true,
        conceptSummary: 'Implement automated PII redaction and prompt injection classification before sending enterprise payloads to LLMs.',
        initialFiles: [
          {
            filename: 'guardrails.ts',
            language: 'typescript',
            code: `export interface SanitizationResult {
  isSafe: boolean;
  sanitizedPrompt: string;
  detectedPII: string[];
}

export class EnterpriseLLMGuardrail {
  private piiRegex = /\b(\d{3}-\d{2}-\d{4}|\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4})\b/g;
  private injectionPatterns = [
    /ignore previous instructions/i,
    /system prompt override/i,
    /drop database/i
  ];

  public async evaluatePrompt(rawPrompt: string): Promise<SanitizationResult> {
    // 1. Check for prompt injections
    for (const pattern of this.injectionPatterns) {
      if (pattern.test(rawPrompt)) {
        return {
          isSafe: false,
          sanitizedPrompt: '[REJECTED: PROMPT_INJECTION_DETECTED]',
          detectedPII: []
        };
      }
    }

    // 2. Redact sensitive SSN / Credit Card PII
    const detectedPII: string[] = [];
    const sanitized = rawPrompt.replace(this.piiRegex, (match) => {
      detectedPII.push(match);
      return '[REDACTED_PII]';
    });

    return {
      isSafe: true,
      sanitizedPrompt: sanitized,
      detectedPII
    };
  }
}`
          }
        ],
        instructions: [
          'Verify that SSNs and 16-digit credit card numbers are stripped before prompt serialization.',
          'Test rejection of adversarial override commands attempting to leak system instructions.'
        ],
        testCases: [
          { id: 't1', name: 'PII Redaction Verification', expectedOutcome: 'Replaces SSN and card numbers with [REDACTED_PII] token' },
          { id: 't2', name: 'Adversarial Injection Defense', expectedOutcome: 'Flags isSafe=false when prompt contains instruction override attempt' }
        ]
      }
    ]
  },
  {
    id: 'track-5-platform-reliability',
    trackNumber: 5,
    title: 'Platform, Reliability & Product Sense',
    tagline: 'DevOps, OpenTelemetry, RFCs & Business Alignment',
    paradigm: 'Platform & Systems Architecture',
    badgeColor: 'border-violet-500/40 text-violet-400 bg-violet-500/10',
    iconName: 'ShieldCheck',
    description: 'The glue that elevates engineers to Senior/Staff roles. Master Docker container optimization, CI/CD pipelines, Prometheus metrics, OpenTelemetry tracing, and writing impactful Technical RFCs.',
    learningGoals: [
      'Write production Dockerfiles using multi-stage builds and distroless minimal images',
      'Instrument distributed systems with OpenTelemetry context propagation across HTTP/gRPC boundaries',
      'Trace business metrics (e.g. checkout conversion drop-off) directly through structured logs',
      'Draft persuasive RFCs (Request for Comments) balancing tech debt with business timelines'
    ],
    deliverableProject: {
      title: 'Full Stack Observability & CI/CD Platform Blueprint',
      description: 'An enterprise-grade platform setup featuring GitHub Actions workflow, Terraform IaC deployment manifests, Grafana dashboard configs, and distributed OpenTelemetry tracing.',
      techStack: ['Docker', 'Terraform', 'OpenTelemetry', 'Prometheus', 'Grafana', 'GitHub Actions']
    },
    labs: [
      {
        id: 'lab-opentelemetry-tracing',
        title: 'Lab 5.1: OpenTelemetry Trace Context Propagation',
        durationMinutes: 45,
        difficulty: 'Intermediate',
        isPro: false,
        conceptSummary: 'Pass trace headers (traceparent) across microservices to visualize latency bottlenecks in Jaeger/Grafana Tempo.',
        initialFiles: [
          {
            filename: 'tracing.ts',
            language: 'typescript',
            code: `import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  serviceName: 'order-processing-service',
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();`
          }
        ],
        instructions: [
          'Ensure span tags include business context attributes (`tenant_id`, `order_value`).',
          'Simulate a slow database query and verify that OpenTelemetry captures the span duration accurately.'
        ],
        testCases: [
          { id: 't1', name: 'Traceparent Propagation Test', expectedOutcome: 'Downstream HTTP call inherits same traceId from incoming request' }
        ]
      },
      {
        id: 'lab-technical-rfc-drafting',
        title: 'Lab 5.2: Technical RFC Drafting & Cost Optimization',
        durationMinutes: 40,
        difficulty: 'Staff',
        isPro: true,
        conceptSummary: 'Draft formal Technical RFCs analyzing trade-offs, CAP theorem constraints, SLAs/SLOs, and AWS/GCP cloud billing costs.',
        initialFiles: [
          {
            filename: 'rfc-template.md',
            language: 'markdown',
            code: `# RFC: Migration to Multi-Region Active-Active PostgreSQL

## 1. Problem Statement & Motivation
Currently, our single primary database node handles 18,000 RPS. Peak traffic spikes create CPU throttling and database connection pool exhaustion.

## 2. Proposed Architecture & CAP Trade-offs
We propose adopting a primary-replica cluster with transaction pooling via PgBouncer and async read replicas.
- **Consistency**: Read Committed across primary; eventual consistency on replicas (<50ms replication lag).
- **Availability**: 99.99% uptime target (SLO).

## 3. Cost & Infrastructure Impact
- RDS Multi-AZ Instance (db.r6g.2xlarge): $820/mo
- Read Replicas (x2): $740/mo
- Total Estimated Monthly Cost: $1,560/mo
`
          }
        ],
        instructions: [
          'Fill out technical trade-off matrix comparing consistency vs availability under network partition.',
          'Review cloud infrastructure pricing estimations.'
        ],
        testCases: [
          { id: 't1', name: 'RFC Completeness Check', expectedOutcome: 'Includes SLA/SLO metrics, CAP trade-off, and cloud cost breakdown' }
        ]
      },
      {
        id: 'lab-k8s-zero-downtime-rollout',
        title: 'Lab 5.3: Kubernetes Zero-Downtime Canary Rollout & Prometheus SLO Auto-Rollback',
        durationMinutes: 55,
        difficulty: 'Senior',
        isPro: true,
        conceptSummary: 'Automate traffic weighting and instant health-check rollback when error budget burn rates exceed production thresholds.',
        initialFiles: [
          {
            filename: 'canary_rollout.yaml',
            language: 'yaml',
            code: `apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: payment-gateway
spec:
  replicas: 10
  strategy:
    canary:
      analysis:
        templates:
          - templateName: prometheus-slo-error-budget
      steps:
        - setWeight: 10
        - pause: { duration: 2m }
        - setWeight: 50
        - pause: { duration: 5m }
        - setWeight: 100`
          }
        ],
        instructions: [
          'Verify that canary traffic weight increases in progressive increments (10% -> 50% -> 100%).',
          'Simulate a 5xx error spike and confirm automated rollback occurs within 30 seconds.'
        ],
        testCases: [
          { id: 't1', name: 'Progressive Weight Verification', expectedOutcome: 'Traffic routes exactly 10% to canary pods during initial analysis window' },
          { id: 't2', name: 'Automated SLO Rollback Test', expectedOutcome: 'Rollback triggered immediately when Prometheus 5xx error budget exceeds 0.1%' }
        ]
      }
    ]
  },
  {
    id: 'track-6',
    trackNumber: 6,
    title: 'Enterprise Event-Driven Microservices & CQRS',
    tagline: 'Transactional Outbox, Kafka CDC & Saga Compensations',
    paradigm: 'Enterprise Event-Driven Architecture',
    badgeColor: 'border-orange-500/40 text-orange-400 bg-orange-500/10',
    iconName: 'Layers',
    description: 'Design decoupled, fault-tolerant enterprise microservices using Event Sourcing, CQRS, Apache Kafka, and Debezium Change Data Capture (CDC). Eliminate dual-write anomalies with the Transactional Outbox pattern.',
    learningGoals: [
      'Implement the Transactional Outbox pattern to guarantee exactly-once event publication across distributed database transactions',
      'Deploy Debezium CDC connectors to stream real-time Postgres row changes to Elasticsearch and Snowflake analytical pipelines',
      'Orchestrate multi-step Saga compensations across billing, inventory, and fulfillment microservices without two-phase commit (2PC) bottlenecks'
    ],
    deliverableProject: {
      title: 'Enterprise Order Fulfillment Saga & Outbox Engine',
      description: 'A production-grade event-driven architecture handling 50,000 orders/sec with zero dual-write inconsistencies and automated compensation workflows.',
      techStack: ['Apache Kafka', 'Debezium CDC', 'PostgreSQL', 'gRPC / Protobuf', 'Redis']
    },
    labs: [
      {
        id: 'lab-transactional-outbox',
        title: 'Lab 6.1: Implementing Transactional Outbox & Debezium CDC',
        durationMinutes: 50,
        difficulty: 'Senior',
        isPro: true,
        conceptSummary: 'Avoid distributed database/broker race conditions by persisting domain events inside the same ACID database transaction as business entities.',
        initialFiles: [
          {
            filename: 'outboxPublisher.ts',
            language: 'typescript',
            code: `import { Pool } from 'pg';

export async function createOrderWithOutbox(pool: Pool, order: { userId: string; amount: number }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // 1. Insert order entity
    const orderRes = await client.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING id',
      [order.userId, order.amount, 'PENDING']
    );
    const orderId = orderRes.rows[0].id;

    // 2. Insert event into transactional outbox table in the SAME transaction
    await client.query(
      'INSERT INTO event_outbox (aggregate_type, aggregate_id, event_type, payload) VALUES ($1, $2, $3, $4)',
      ['Order', orderId, 'OrderCreated', JSON.stringify({ orderId, amount: order.amount })]
    );

    await client.query('COMMIT');
    return { orderId, status: 'PENDING' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}`
          }
        ],
        instructions: [
          'Verify that inserting an order and its corresponding outbox event happens inside an atomic database transaction.',
          'Test failure rollback scenarios where broker disconnection does not leave orphaned database rows.'
        ],
        testCases: [
          { id: 't1', name: 'Atomic Commit Verification', expectedOutcome: 'Order row and event_outbox row are created in one ACID transaction' },
          { id: 't2', name: 'Rollback Atomicity Test', expectedOutcome: 'Exception during outbox insert rolls back the created order row' }
        ]
      },
      {
        id: 'lab-saga-orchestrator',
        title: 'Lab 6.2: Orchestrated Saga Pattern & Rollback Compensations',
        durationMinutes: 60,
        difficulty: 'Staff',
        isPro: true,
        conceptSummary: 'Implement distributed state machine orchestrators that trigger compensating actions (refunds, stock restocks) when downstream steps fail.',
        initialFiles: [
          {
            filename: 'sagaOrchestrator.ts',
            language: 'typescript',
            code: `export interface SagaStep<TState> {
  name: string;
  execute: (state: TState) => Promise<void>;
  compensate: (state: TState) => Promise<void>;
}

export class SagaOrchestrator<TState> {
  constructor(private steps: SagaStep<TState>[]) {}

  async run(initialState: TState): Promise<{ success: boolean; executedSteps: string[] }> {
    const executed: SagaStep<TState>[] = [];
    try {
      for (const step of this.steps) {
        await step.execute(initialState);
        executed.push(step);
      }
      return { success: true, executedSteps: executed.map(s => s.name) };
    } catch (error) {
      // Trigger compensations in reverse order
      for (const step of executed.reverse()) {
        await step.compensate(initialState);
      }
      return { success: false, executedSteps: executed.map(s => s.name) };
    }
  }
}`
          }
        ],
        instructions: [
          'Add compensating logic for inventory hold and payment charge steps.',
          'Simulate a payment gateway timeout and confirm all previous steps execute their compensate handlers.'
        ],
        testCases: [
          { id: 't1', name: 'Reverse Compensation Test', expectedOutcome: 'Compensating actions execute in strict reverse LIFO order upon failure' }
        ]
      },
      {
        id: 'lab-kafka-exactly-once-cqrs',
        title: 'Lab 6.3: Kafka Exactly-Once Stream Processing & CQRS Read Model Projection',
        durationMinutes: 50,
        difficulty: 'Senior',
        isPro: true,
        conceptSummary: 'Process event streams with Kafka transaction guarantees and project materialized views for sub-millisecond query performance.',
        initialFiles: [
          {
            filename: 'cqrs_projector.ts',
            language: 'typescript',
            code: `export interface DomainEvent {
  eventId: string;
  aggregateId: string;
  eventType: 'OrderCreated' | 'OrderPaid' | 'OrderShipped';
  payload: any;
  version: number;
}

export interface ReadModelOrderView {
  orderId: string;
  status: string;
  totalAmount: number;
  lastEventVersion: number;
}

export class CQRSOrderProjector {
  private readStore = new Map<string, ReadModelOrderView>();

  public applyEvent(event: DomainEvent): ReadModelOrderView {
    const existing = this.readStore.get(event.aggregateId) || {
      orderId: event.aggregateId,
      status: 'PENDING',
      totalAmount: 0,
      lastEventVersion: 0
    };

    // Idempotency & out-of-order check
    if (event.version <= existing.lastEventVersion) {
      return existing; // Ignore duplicate or stale event
    }

    switch (event.eventType) {
      case 'OrderCreated':
        existing.totalAmount = event.payload.amount;
        existing.status = 'CREATED';
        break;
      case 'OrderPaid':
        existing.status = 'PAID';
        break;
      case 'OrderShipped':
        existing.status = 'SHIPPED';
        break;
    }

    existing.lastEventVersion = event.version;
    this.readStore.set(event.aggregateId, existing);
    return existing;
  }
}`
          }
        ],
        instructions: [
          'Verify that replaying duplicate Kafka event messages does not corrupt the CQRS read model state.',
          'Test out-of-order event delivery handling using aggregate version ordering.'
        ],
        testCases: [
          { id: 't1', name: 'Idempotent Event Projection Test', expectedOutcome: 'Replaying OrderPaid event twice results in version incremented only once' },
          { id: 't2', name: 'Out-of-Order Rejection Verification', expectedOutcome: 'Stale version <= lastEventVersion is ignored gracefully' }
        ]
      }
    ]
  },
  {
    id: 'track-7',
    trackNumber: 7,
    title: 'High-Scale Distributed Storage & Consensus',
    tagline: 'Raft Consensus, Multi-Region Active-Active & Split-Brain Safety',
    paradigm: 'Distributed Consensus & Sharding',
    badgeColor: 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10',
    iconName: 'Server',
    description: 'Master distributed storage internals, Raft consensus algorithm leadership elections, multi-region active-active sharding, and split-brain resolution in globally geo-distributed CockroachDB clusters.',
    learningGoals: [
      'Implement Raft leader election, heartbeat timeouts, and log replication across 5-node distributed quorum clusters',
      'Architect geo-distributed data partitioning with vector clocks and multi-region read-your-writes consistency guarantees',
      'Diagnose and prevent network partition split-brain scenarios using fencing tokens and epoch numbers'
    ],
    deliverableProject: {
      title: 'Global Active-Active Distributed Consensus Database',
      description: 'A custom Raft-inspired distributed key-value storage engine supporting multi-node failover, log compaction, and linearizable reads.',
      techStack: ['CockroachDB', 'Raft Algorithm', 'etcd', 'Vector Clocks', 'Protobuf']
    },
    labs: [
      {
        id: 'lab-raft-election',
        title: 'Lab 7.1: Raft Consensus Leader Election & Quorum Safety',
        durationMinutes: 60,
        difficulty: 'Principal',
        isPro: true,
        conceptSummary: 'Simulate randomized election timeouts, vote solicitation, and quorum log commitment under simulated network latency.',
        initialFiles: [
          {
            filename: 'raftNode.ts',
            language: 'typescript',
            code: `export type NodeRole = 'FOLLOWER' | 'CANDIDATE' | 'LEADER';

export class RaftNode {
  public role: NodeRole = 'FOLLOWER';
  public currentTerm: number = 0;
  public votedFor: string | null = null;

  constructor(public id: string, private clusterPeers: string[]) {}

  public startElection(): boolean {
    this.role = 'CANDIDATE';
    this.currentTerm += 1;
    this.votedFor = this.id;
    let votes = 1;

    for (const peer of this.clusterPeers) {
      if (this.requestVoteFromPeer(peer, this.currentTerm)) {
        votes += 1;
      }
    }

    const quorumSize = Math.floor((this.clusterPeers.length + 1) / 2) + 1;
    if (votes >= quorumSize) {
      this.role = 'LEADER';
      return true;
    }
    this.role = 'FOLLOWER';
    return false;
  }

  private requestVoteFromPeer(peerId: string, term: number): boolean {
    // Simulated peer voting: succeeds if term is higher than peer's seen term
    return true;
  }
}`
          }
        ],
        instructions: [
          'Implement quorum size calculation for arbitrary cluster sizes (N/2 + 1).',
          'Verify that two nodes cannot simultaneously achieve LEADER status in the same term.'
        ],
        testCases: [
          { id: 't1', name: 'Quorum Majority Test', expectedOutcome: 'Node requires >= 3 votes in a 5-node cluster to transition to LEADER' },
          { id: 't2', name: 'Single Leader Guarantee', expectedOutcome: 'Split-vote scenarios correctly prevent multiple leaders per term' }
        ]
      },
      {
        id: 'lab-vector-clock-partition',
        title: 'Lab 7.2: Vector Clock Conflict Resolution & Multi-Region Sharded Routing',
        durationMinutes: 55,
        difficulty: 'Principal',
        isPro: true,
        conceptSummary: 'Handle concurrent updates across multi-region active-active replicas using vector clock causal timestamps without centralized coordination.',
        initialFiles: [
          {
            filename: 'vectorClock.ts',
            language: 'typescript',
            code: `export type VectorClock = Record<string, number>;

export type ComparisonResult = 'BEFORE' | 'AFTER' | 'CONCURRENT' | 'EQUAL';

export class VectorClockResolver {
  public static increment(clock: VectorClock, nodeId: string): VectorClock {
    return {
      ...clock,
      [nodeId]: (clock[nodeId] || 0) + 1
    };
  }

  public static compare(a: VectorClock, b: VectorClock): ComparisonResult {
    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
    let aGreater = false;
    let bGreater = false;

    for (const key of allKeys) {
      const valA = a[key] || 0;
      const valB = b[key] || 0;
      if (valA > valB) aGreater = true;
      if (valB > valA) bGreater = true;
    }

    if (aGreater && bGreater) return 'CONCURRENT';
    if (aGreater) return 'AFTER';
    if (bGreater) return 'BEFORE';
    return 'EQUAL';
  }

  public static merge(a: VectorClock, b: VectorClock): VectorClock {
    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
    const merged: VectorClock = {};
    for (const key of allKeys) {
      merged[key] = Math.max(a[key] || 0, b[key] || 0);
    }
    return merged;
  }
}`
          }
        ],
        instructions: [
          'Verify that two divergent vector clocks from us-east and eu-west are correctly flagged as CONCURRENT.',
          'Test vector clock merge step so LWW (last-write-wins) or CRDT sets can unify conflicted replicas.'
        ],
        testCases: [
          { id: 't1', name: 'Causal Ordering Detection', expectedOutcome: 'Correctly identifies { A: 2, B: 1 } as AFTER { A: 1, B: 1 }' },
          { id: 't2', name: 'Concurrent Split-Brain Flagging', expectedOutcome: 'Flags { A: 2, B: 1 } and { A: 1, B: 2 } as CONCURRENT conflict' }
        ]
      },
      {
        id: 'lab-consistent-hashing-ring',
        title: 'Lab 7.3: Consistent Hashing Ring with Virtual Nodes & Dynamic Rebalancing',
        durationMinutes: 50,
        difficulty: 'Staff',
        isPro: true,
        conceptSummary: 'Prevent hot spots and minimize key reshuffling when scaling distributed cache cluster nodes in and out.',
        initialFiles: [
          {
            filename: 'hashRing.ts',
            language: 'typescript',
            code: `import * as crypto from 'crypto';

export class ConsistentHashRing {
  private ring = new Map<number, string>();
  private sortedKeys: number[] = [];

  constructor(private virtualNodesPerNode: number = 100) {}

  private hash(key: string): number {
    const hash = crypto.createHash('md5').update(key).digest('hex');
    return parseInt(hash.substring(0, 8), 16);
  }

  public addNode(nodeId: string): void {
    for (let i = 0; i < this.virtualNodesPerNode; i++) {
      const vNodeKey = this.hash(\`\${nodeId}#\${i}\`);
      this.ring.set(vNodeKey, nodeId);
      this.sortedKeys.push(vNodeKey);
    }
    this.sortedKeys.sort((a, b) => a - b);
  }

  public getNode(key: string): string | undefined {
    if (this.ring.size === 0) return undefined;
    const hashKey = this.hash(key);

    // Binary search for clockwise next virtual node
    for (const k of this.sortedKeys) {
      if (hashKey <= k) {
        return this.ring.get(k);
      }
    }
    return this.ring.get(this.sortedKeys[0]); // Wrap around ring
  }
}`
          }
        ],
        instructions: [
          'Verify that adding a node to a 10-node cluster only rebalances ~10% of existing keys.',
          'Test virtual node dispersion to ensure uniform load distribution.'
        ],
        testCases: [
          { id: 't1', name: 'Minimal Key Churn Test', expectedOutcome: 'Adding 11th node causes exactly ~9.1% key migration' },
          { id: 't2', name: 'Uniform Dispersion Verification', expectedOutcome: '100 vNodes per server prevents single-node CPU hotspotting' }
        ]
      }
    ]
  },
  {
    id: 'track-8',
    trackNumber: 8,
    title: 'Financial Core Banking & Zero-Trust Payment Gateways',
    tagline: 'ISO 20022, Double-Entry Immutable Ledger & HSM Tokenization',
    paradigm: 'FinTech Zero-Trust Ledger & Security',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    iconName: 'ShieldCheck',
    description: 'Build mission-critical FinTech backend engines compliant with ISO 20022 financial standards. Implement double-entry immutable accounting ledgers, HSM cryptography tokenization, and mutual TLS (mTLS) zero-trust gateways.',
    learningGoals: [
      'Design double-entry ACID accounting engines that enforce zero-sum invariants across multi-currency accounts',
      'Implement Hardware Security Module (HSM) envelope encryption and PCI-DSS compliant card tokenization',
      'Configure mutual TLS (mTLS) identity verification and idempotency keys for high-frequency interbank clearing'
    ],
    deliverableProject: {
      title: 'Zero-Trust Multi-Currency Core Banking Gateway',
      description: 'An immutable double-entry financial ledger processing 100,000 FX transfers/day with cryptographic audit trails and zero balance drift.',
      techStack: ['ISO 20022', 'PostgreSQL ACID Ledger', 'Mutual TLS (mTLS)', 'HSM Cryptography', 'Redis Lock']
    },
    labs: [
      {
        id: 'lab-double-entry-ledger',
        title: 'Lab 8.1: Double-Entry Immutable Accounting Engine',
        durationMinutes: 55,
        difficulty: 'Staff',
        isPro: true,
        conceptSummary: 'Enforce fundamental accounting invariants (Debits == Credits) using immutable ledger transactions and Postgres advisory locks.',
        initialFiles: [
          {
            filename: 'ledgerEngine.ts',
            language: 'typescript',
            code: `import { Pool } from 'pg';

export interface LedgerEntry {
  debitAccountId: string;
  creditAccountId: string;
  amountCents: number;
  currency: string;
  referenceId: string;
}

export async function executeLedgerTransfer(pool: Pool, entry: LedgerEntry) {
  if (entry.amountCents <= 0) {
    throw new Error('Transfer amount must be strictly positive integer cents');
  }
  if (entry.debitAccountId === entry.creditAccountId) {
    throw new Error('Cannot transfer to identical account ID');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Sort account IDs lexicographically to prevent deadlocks
    const [firstId, secondId] = [entry.debitAccountId, entry.creditAccountId].sort();
    await client.query('SELECT id FROM accounts WHERE id IN ($1, $2) FOR UPDATE', [firstId, secondId]);

    // Debit source account
    await client.query(
      'UPDATE accounts SET balance_cents = balance_cents - $1 WHERE id = $2',
      [entry.amountCents, entry.debitAccountId]
    );

    // Credit destination account
    await client.query(
      'UPDATE accounts SET balance_cents = balance_cents + $1 WHERE id = $2',
      [entry.amountCents, entry.creditAccountId]
    );

    // Write immutable ledger audit record
    const record = await client.query(
      'INSERT INTO ledger_records (debit_account, credit_account, amount_cents, currency, ref_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [entry.debitAccountId, entry.creditAccountId, entry.amountCents, entry.currency, entry.referenceId]
    );

    await client.query('COMMIT');
    return { success: true, ledgerId: record.rows[0].id };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}`
          }
        ],
        instructions: [
          'Verify that lexicographical account ID ordering prevents deadlocks during concurrent bidirectional transfers.',
          'Confirm that zero or negative transfer amounts are rejected before acquiring database locks.'
        ],
        testCases: [
          { id: 't1', name: 'Zero-Sum Balance Invariant', expectedOutcome: 'Total sum across debit and credit accounts remains unchanged after transfer' },
          { id: 't2', name: 'Deadlock Immunity Test', expectedOutcome: 'Concurrent A->B and B->A transfers execute without deadlock timeout' }
        ]
      },
      {
        id: 'lab-hsm-card-tokenization',
        title: 'Lab 8.2: PCI-DSS Payment Card Tokenization & HSM Envelope Encryption',
        durationMinutes: 50,
        difficulty: 'Principal',
        isPro: true,
        conceptSummary: 'Encrypt sensitive primary account numbers (PAN) using Hardware Security Module (HSM) envelope cryptography and format-preserving token vaults.',
        initialFiles: [
          {
            filename: 'tokenVault.ts',
            language: 'typescript',
            code: `import * as crypto from 'crypto';

export interface TokenizedCard {
  token: string;
  lastFour: string;
  encryptedPanEnvelope: string;
  ivHex: string;
}

export class PCIEnvelopeVault {
  // Simulated HSM Master Key (in production, never leaves HSM hardware boundary)
  private hsmMasterKey = crypto.randomBytes(32);

  public tokenizePan(rawPan: string): TokenizedCard {
    const cleanPan = rawPan.replace(/\\D/g, '');
    const lastFour = cleanPan.slice(-4);
    const token = 'tok_4242_' + crypto.randomBytes(8).toString('hex');

    // 1. Generate unique Data Encryption Key (DEK) for this card
    const dek = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    // 2. Encrypt PAN with DEK (AES-256-GCM)
    const cipher = crypto.createCipheriv('aes-256-gcm', dek, iv);
    let encryptedPan = cipher.update(cleanPan, 'utf8', 'hex');
    encryptedPan += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    // 3. Encrypt DEK with HSM Master Key (Envelope Encryption)
    const dekCipher = crypto.createCipheriv('aes-256-ecb', this.hsmMasterKey, null);
    let encryptedDek = dekCipher.update(dek, undefined, 'hex');
    encryptedDek += dekCipher.final('hex');

    return {
      token,
      lastFour,
      encryptedPanEnvelope: \`\${encryptedDek}.\${encryptedPan}.\${authTag}\`,
      ivHex: iv.toString('hex')
    };
  }
}`
          }
        ],
        instructions: [
          'Verify that plaintext PANs are never logged or stored in application database tables.',
          'Test envelope decryption using HSM DEK unwrap procedures.'
        ],
        testCases: [
          { id: 't1', name: 'Zero Plaintext Leakage Test', expectedOutcome: 'TokenizedCard object contains no plaintext PAN digits outside lastFour' },
          { id: 't2', name: 'Envelope Decryption Integrity', expectedOutcome: 'HSM key unwrap reproduces original PAN with matching GCM auth tag' }
        ]
      },
      {
        id: 'lab-mtls-interbank-clearing',
        title: 'Lab 8.3: ISO 20022 Financial Messaging & Mutual TLS Zero-Trust Gateway',
        durationMinutes: 55,
        difficulty: 'Principal',
        isPro: true,
        conceptSummary: 'Validate XML/JSON ISO 20022 clearing messages with cryptographic digital signatures and mTLS identity verification.',
        initialFiles: [
          {
            filename: 'iso20022_gateway.go',
            language: 'go',
            code: `package main

import (
	"crypto/x509"
	"errors"
	"fmt"
)

type ISO20022Pacs008 struct {
	MessageID      string
	DebtorBIC      string
	CreditorBIC    string
	SettlementAmt  float64
	Currency       string
	DigitalSigHex  string
}

type ZeroTrustClearingGateway struct {
	trustedBankRootCAs *x509.CertPool
}

func NewGateway(rootCA *x509.CertPool) *ZeroTrustClearingGateway {
	return &ZeroTrustClearingGateway{trustedBankRootCAs: rootCA}
}

func (g *ZeroTrustClearingGateway) ValidateClearingMessage(msg ISO20022Pacs008, peerCert *x509.Certificate) error {
	// 1. Enforce mTLS Peer Certificate verification against central bank Root CA
	opts := x509.VerifyOptions{
		Roots: g.trustedBankRootCAs,
	}
	if _, err := peerCert.Verify(opts); err != nil {
		return fmt.Errorf("ZERO-TRUST REJECT: untrusted bank identity cert: %w", err)
	}

	// 2. Validate ISO 20022 BIC code formatting (8 or 11 uppercase alphanumeric)
	if len(msg.DebtorBIC) != 8 && len(msg.DebtorBIC) != 11 {
		return errors.New("ISO 20022 ERROR: invalid Debtor BIC length")
	}

	// 3. Reject zero or negative settlement amounts
	if msg.SettlementAmt <= 0 {
		return errors.New("AML ALERT: settlement amount must be strictly positive")
	}

	return nil
}`
          }
        ],
        instructions: [
          'Verify that mTLS peer certificate chains are verified against the central bank Root CA before parsing XML/JSON payloads.',
          'Test rejection of forged BIC identifiers or unsigned settlement messages.'
        ],
        testCases: [
          { id: 't1', name: 'mTLS Identity Enforcement', expectedOutcome: 'Rejects clearing connection immediately if peer cert is self-signed or revoked' },
          { id: 't2', name: 'ISO 20022 BIC Compliance', expectedOutcome: 'Validates SWIFT BIC codes against 8/11 character alphanumeric specification' }
        ]
      }
    ]
  }
];
