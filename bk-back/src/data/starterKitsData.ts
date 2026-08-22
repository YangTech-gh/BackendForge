import { StarterKitOption } from '../types';

export const STARTER_KITS: StarterKitOption[] = [
  {
    id: 'kit-node-drizzle',
    name: 'The Ultimate Node.js + Drizzle + BullMQ Boilerplate',
    paradigm: 'Node & TypeScript',
    db: 'PostgreSQL + Drizzle',
    queue: 'Redis / BullMQ',
    auth: 'Clerk',
    description: 'Production-ready Fastify + TypeScript backend featuring atomic transactions, idempotency guards, BullMQ background job queues, and Docker compose setup.',
    stars: 3840,
    downloadCount: '24.2k',
    githubRepoUrl: 'https://github.com/backendforge/node-ts-drizzle-starter'
  },
  {
    id: 'kit-rails-hotwire',
    name: 'The Rails 7.2 SaaS Monolith Engine',
    paradigm: 'Ruby on Rails 7+',
    db: 'PostgreSQL + ActiveRecord',
    queue: 'Sidekiq',
    auth: 'Custom JWT / Devise',
    description: 'Batteries-included Rails monolith with Hotwire real-time streams, Stripe subscription billing, role-based permissions, and Sidekiq worker pools.',
    stars: 2910,
    downloadCount: '18.7k',
    githubRepoUrl: 'https://github.com/backendforge/rails-monolith-starter'
  },
  {
    id: 'kit-go-rust-grpc',
    name: 'Go Ingestion Gateway + Rust Validation Microservice',
    paradigm: 'Rust & Go',
    db: 'PostgreSQL + pgvector',
    queue: 'RabbitMQ',
    auth: 'OAuth2 Server',
    description: 'Blazing fast Go gRPC API gateway paired with a Rust validation core communicating over Protobuf channels with zero GC latency.',
    stars: 4120,
    downloadCount: '15.4k',
    githubRepoUrl: 'https://github.com/backendforge/go-rust-grpc-starter'
  },
  {
    id: 'kit-ai-agent-backend',
    name: 'AI-Native Agentic Backend (Forger 1.0 + pgvector)',
    paradigm: 'AI-Native Agentic Backend',
    db: 'PostgreSQL + pgvector',
    queue: 'Redis / BullMQ',
    auth: 'Clerk',
    description: 'Agentic backend architecture with hybrid semantic vector search, LLM caching, function calling guardrails, and automated webhook triggers.',
    stars: 5200,
    downloadCount: '31.9k',
    githubRepoUrl: 'https://github.com/backendforge/ai-native-agent-starter'
  }
];
