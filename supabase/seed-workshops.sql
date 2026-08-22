-- Backend Forge Seed Data - Workshops
-- Run: supabase db reset (auto) or psql -f supabase/seed-workshops.sql

INSERT INTO public.workshops (id, title, event_date, event_time, speaker, speaker_role, topic, attendees_count, is_live, is_published) VALUES
('ws-1', 'Node.js Performance Mastery', '2026-09-04', '6:00 PM EST', 'Sarah Chen', 'Staff Engineer @ Vercel', 'Event loop profiling, worker threads, and memory optimization for production Node.js services.', 128, false, true),
('ws-2', 'Database Scaling Strategies', '2026-09-11', '6:00 PM EST', 'Marcus Rivera', 'Principal DBA @ Neon', 'PostgreSQL sharding, connection pooling, read replicas, and zero-downtime migration strategies.', 96, false, true),
('ws-3', 'AI-Native Backend Architecture', '2026-09-18', '6:00 PM EST', 'Priya Patel', 'Head of AI @ Supabase', 'Building production RAG pipelines, LLM function calling, agentic workflows, and pgvector at scale.', 144, false, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  event_date = EXCLUDED.event_date,
  event_time = EXCLUDED.event_time,
  speaker = EXCLUDED.speaker,
  speaker_role = EXCLUDED.speaker_role,
  topic = EXCLUDED.topic,
  attendees_count = EXCLUDED.attendees_count,
  is_published = EXCLUDED.is_published;
