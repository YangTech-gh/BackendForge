import { WorkshopEvent } from '../types';

export const UPCOMING_WORKSHOPS: WorkshopEvent[] = [
  {
    id: 'ws-1',
    title: 'Live System Design: Building a 100k req/sec Rate Limiter in Go & Redis',
    date: 'Aug 14, 2026',
    time: '11:00 AM EST (2 Hours)',
    speaker: 'Alex Rivera',
    speakerRole: 'Founder @ Backend Forge, Ex-Staff Systems Eng',
    topic: 'Leaky Bucket vs Sliding Window Logs, Distributed Redis Lua Scripts, and Benchmarking under Load.',
    attendeesCount: 412,
    isLive: true
  },
  {
    id: 'ws-2',
    title: 'AI Engineering Workshop: Zero-Hallucination SQL Tool-Calling Agents',
    date: 'Aug 21, 2026',
    time: '2:00 PM EST (1.5 Hours)',
    speaker: 'Dr. Maya Lin',
    speakerRole: 'AI Systems Architect, Author of Agentic Data Pipelines',
    topic: 'Constructing robust schema reflection, guardrail validation, and pgvector semantic filtering.',
    attendeesCount: 580,
    isLive: false
  },
  {
    id: 'ws-3',
    title: 'Architecture Teardown & Live RFC Code Review',
    date: 'Aug 28, 2026',
    time: '1:00 PM EST (2 Hours)',
    speaker: 'Staff Engineering Panel',
    speakerRole: 'Stripe, Uber, & Discord Engineering Leads',
    topic: 'Live teardown of student-submitted RFCs and system architecture diagrams with interactive Q&A.',
    attendeesCount: 320,
    isLive: false
  }
];
