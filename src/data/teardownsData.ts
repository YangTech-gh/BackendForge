import { TeardownArticle } from '../types';

export const ARCHITECTURE_TEARDOWNS: TeardownArticle[] = [
  {
    id: 'teardown-stripe-idempotency',
    slug: 'stripe-idempotency',
    company: 'Stripe',
    logoColor: 'from-indigo-500 to-purple-600',
    title: 'How Stripe Guarantees Exactly-Once Processing in Webhook & Billing Engines',
    readTime: '12 min read',
    summary: 'An architectural breakdown of Stripe’s idempotency layer that handles tens of billions of API transactions without double-charging users even during network splits.',
    seoDescription: 'How Stripe guarantees exactly-once processing in webhook and billing engines using idempotency keys, Redis locks, and PostgreSQL atomic transactions.',
    keywords: ['Stripe', 'idempotency', 'webhooks', 'PostgreSQL', 'Redis', 'distributed systems'],
    publishedAt: '2025-03-15',
    author: 'Backend Forge Editorial',
    keyInsights: [
      'Use atomic database mutations coupled with unique idempotency key constraints in PostgreSQL.',
      'Wrap non-idempotent HTTP mutation calls inside Redis SETNX lock primitives with deterministic TTLs.',
      'Return cached response payloads for identical keys directly from fast memory stores without hitting payment gateways.'
    ],
    architectureOverview: 'Client Request -> Ingress Proxy -> Idempotency Lock Layer (Redis) -> Transaction Isolation Boundary (Postgres Primary) -> Downstream Webhook Buffer (Kafka/BullMQ).',
    rfcCodeSnippet: `// Stripe-style Idempotency Lock Guard
async function handlePaymentWithIdempotency(req, res) {
  const key = req.headers['idempotency-key'];
  if (!key) return res.status(400).json({ error: 'Missing Idempotency-Key header' });

  const cached = await redis.get(\`idempotency:\${key}\`);
  if (cached) {
    const { status, body } = JSON.parse(cached);
    return res.status(status).json(body);
  }

  const acquired = await redis.set(\`lock:\${key}\`, 'LOCKED', 'EX', 15, 'NX');
  if (!acquired) return res.status(409).json({ error: 'Concurrent request in progress' });

  try {
    const result = await processPaymentTransaction(req.body);
    await redis.set(\`idempotency:\${key}\`, JSON.stringify({ status: 200, body: result }), 'EX', 86400);
    res.json(result);
  } finally {
    await redis.del(\`lock:\${key}\`);
  }
}`,
    tags: ['Distributed Systems', 'Idempotency', 'PostgreSQL', 'Redis'],
    faqPairs: [
      { question: 'What is idempotency?', answer: 'Idempotency means making the same request multiple times produces the same result as making it once, preventing duplicate charges or events.' },
      { question: 'Why does Stripe use Redis for idempotency?', answer: 'Redis provides fast in-memory storage for idempotency keys, allowing Stripe to return cached responses without hitting the database on duplicate requests.' }
    ]
  },
  {
    id: 'teardown-discord-rust-websockets',
    slug: 'discord-rust-websockets',
    company: 'Discord',
    logoColor: 'from-blue-600 to-indigo-700',
    title: 'How Discord Scaled Real-time Chat to 11M Concurrent WebSockets using Rust & Go',
    readTime: '15 min read',
    summary: 'Why Discord migrated critical real-time voice and gateway services from Elixir/Python to Rust, eliminating GC pause spikes and reducing memory usage by 70%.',
    seoDescription: 'How Discord scaled to 11M concurrent WebSockets using Rust and Go, eliminating GC pauses and reducing memory usage by 70 percent.',
    keywords: ['Discord', 'Rust', 'WebSockets', 'Go', 'concurrency', 'Tokio', 'real-time'],
    publishedAt: '2025-04-22',
    author: 'Backend Forge Editorial',
    keyInsights: [
      'Go GC pauses caused p99 latency spikes under high socket load; Rust zero-cost memory management solved GC latency jitter.',
      'Shared memory model with Tokio async runtime allowed Discord to handle 2.5M concurrent connections per node.',
      'Implemented custom memory ring buffers and binary Protobuf protocols over WebSockets.'
    ],
    architectureOverview: 'Gateway LB -> Tokio Async Rust Nodes -> Redis Cluster Pub/Sub -> ScyllaDB Message Store.',
    rfcCodeSnippet: `// Rust Tokio Async WebSocket Gateway Ingestion Example
use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let listener = TcpListener::bind("0.0.0.0:8080").await?;
    while let Ok((stream, _)) = listener.accept().await {
        tokio::spawn(async move {
            if let Ok(ws_stream) = accept_async(stream).await {
                // High throughput WebSocket framing with zero GC pause
            }
        });
    }
    Ok(())
}`,
    tags: ['Rust', 'WebSockets', 'Concurrency', 'Low Latency'],
    faqPairs: [
      { question: 'Why did Discord switch to Rust?', answer: 'Discord switched to Rust to eliminate Go GC pause spikes that caused p99 latency issues under high socket load, benefiting from Rust\'s zero-cost memory management.' },
      { question: 'How many concurrent connections can Rust handle?', answer: 'Discord\'s Rust implementation handles 2.5M concurrent connections per node using Tokio\'s async runtime and custom memory ring buffers.' }
    ]
  },
  {
    id: 'teardown-shopify-rails-monolith',
    slug: 'shopify-rails-monolith',
    company: 'Shopify',
    logoColor: 'from-emerald-500 to-teal-700',
    title: 'Why Shopify Stays on a Modular Ruby on Rails Monolith Processing $200B+ GMV',
    readTime: '10 min read',
    summary: 'How Shopify avoids premature microservices chaos by enforcing strict architectural modularity inside a single massive Rails codebase.',
    seoDescription: 'Why Shopify stays on a modular Ruby on Rails monolith processing over $200B GMV, enforcing strict architectural boundaries without microservices.',
    keywords: ['Shopify', 'Ruby on Rails', 'monolith', 'microservices', 'architecture', 'database sharding'],
    publishedAt: '2025-05-10',
    author: 'Backend Forge Editorial',
    keyInsights: [
      'Microservices increase network latency and deployment complexity exponentially; a modular monolith provides domain isolation without distributed system taxes.',
      'Packwerk static analysis tool strictly prevents cross-domain private calls in Rails.',
      'Database sharding by merchant ID ensures horizontal scalability across thousands of MySQL database nodes.'
    ],
    architectureOverview: 'Edge Router -> NGINX -> Modular Rails Engine -> Sharded MySQL Pods + Memcached + Sidekiq Workers.',
    rfcCodeSnippet: `# Shopify Modular Monolith Packwerk Boundary Specification
# package.yml inside components/checkout
name: components/checkout
enforce_privacy: true
enforce_dependencies: true
dependencies:
  - components/inventory
  - components/payments`,
    tags: ['Ruby on Rails', 'Monolith First', 'Database Sharding', 'Architecture'],
    faqPairs: [
      { question: 'Why does Shopify use a monolith?', answer: 'Shopify uses a modular monolith to avoid the operational complexity of microservices while maintaining strict domain boundaries through tools like Packwerk.' },
      { question: 'How does Shopify scale Rails?', answer: 'Shopify scales Rails through database sharding by merchant ID, using thousands of MySQL database nodes with Memcached and Sidekiq for caching and background processing.' }
    ]
  }
];
