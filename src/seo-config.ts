export const SITE_URL = 'https://backendforge.dev';

export const TAB_TITLES: Record<string, string> = {
  dashboard: 'Dashboard | Backend Forge',
  tracks: 'Backend Engineering Tracks | Backend Forge',
  lab: 'Interactive Lab | Backend Forge',
  'system-designer': 'System Architecture Sandbox | Backend Forge',
  'starter-kits': 'Production Starter Kits | Backend Forge',
  teardowns: 'Architecture Teardowns | Backend Forge',
  workshops: 'Workshops & Community | Backend Forge',
};

export const TAB_DESCRIPTIONS: Record<string, string> = {
  dashboard: 'Your learning dashboard on Backend Forge. Track progress across enterprise backend engineering labs, AI mentorship, and verified certificates.',
  tracks: 'Browse 16+ enterprise backend engineering tracks covering TypeScript, Go, Rust, PostgreSQL, distributed systems, and AI-native architectures.',
  lab: 'Launch an interactive backend engineering lab with real code editor, terminal, test verification, and AI mentor guidance.',
  'system-designer': 'Design and simulate distributed backend architectures. Test SPOFs, traffic spikes, and generate technical RFCs with AI review.',
  'starter-kits': 'Download production-ready backend starter kits with PostgreSQL, Redis queues, Docker, CI/CD pipelines, and authentication pre-configured.',
  teardowns: 'Deep-dive technical post-mortems analyzing how Stripe, Vercel, Cloudflare, Shopify, and Discord handle distributed systems at scale.',
  workshops: 'Join monthly live system design workshops, book 1-on-1 architecture coaching calls, and connect with senior backend engineers.',
};

export const TEARDOWN_META: Record<string, { title: string; description: string; keywords: string; slug: string }> = {
  'stripe-payment-infrastructure': {
    title: "Stripe's Payment Infrastructure: Distributed Transactions Deep Dive | Backend Forge",
    description: "Learn how Stripe processes billions in payments with zero data loss using idempotency keys, event sourcing, and saga-based distributed transactions. Architecture teardown.",
    keywords: 'stripe architecture, distributed transactions, payment processing, idempotency, event sourcing, saga pattern',
    slug: 'stripe-payment-infrastructure',
  },
  'vercel-edge-network': {
    title: "Vercel's Edge Network: Serverless Scaling Deep Dive | Backend Forge",
    description: "Inside Vercel's edge runtime - sub-50ms cold starts, ISR caching, and 30+ global regions. Full architecture teardown of their serverless platform.",
    keywords: 'vercel edge, serverless cold starts, edge computing, ISR, CDN, vercel architecture',
    slug: 'vercel-edge-network',
  },
  'cloudflare-workers-runtime': {
    title: "Cloudflare Workers: V8 Isolates Edge Runtime Deep Dive | Backend Forge",
    description: "How Cloudflare Workers uses V8 isolates for zero cold starts across 300+ cities, processing 40M requests/second. Architecture teardown with Durable Objects.",
    keywords: 'cloudflare workers, V8 isolates, edge computing, durable objects, serverless, cloudflare architecture',
    slug: 'cloudflare-workers-runtime',
  },
  'shopify-checkout-scalability': {
    title: "Shopify's Checkout: $1B Black Friday Traffic Architecture | Backend Forge",
    description: "How Shopify processes $1B in GMV with 80K requests/second using state machines, Redis Cluster, and the strangler fig pattern. Architecture teardown.",
    keywords: 'shopify checkout, high traffic architecture, state machine, monolith migration, redis cluster, e-commerce',
    slug: 'shopify-checkout-scalability',
  },
  'discord-real-time-infrastructure': {
    title: "Discord's Real-Time Infrastructure: 500M Users WebSocket Scaling | Backend Forge",
    description: "How Discord scales WebSocket connections to 500M users with Elixir/BEAM processes, Cassandra, and custom UDP voice. Architecture teardown.",
    keywords: 'discord architecture, websocket scaling, elixir beam, real-time messaging, cassandra, distributed systems',
    slug: 'discord-real-time-infrastructure',
  },
};

export function parseHashRoute(): { tab: string; id: string } {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/').filter(Boolean);
  const tab = parts[0] || 'dashboard';
  const id = parts.slice(1).join('/') || '';
  return { tab, id };
}
