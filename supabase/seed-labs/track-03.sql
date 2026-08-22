-- Track 3: Database Mastery (2 labs)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-query-optimization', 'track-3-database-mastery', 'PostgreSQL Query Optimization', 50, 'Intermediate', false, 'Analyze query execution plans with EXPLAIN ANALYZE, design composite indexes, and optimize slow queries.', '{"src/queries/slow-query.sql":"SELECT u.*, o.*, p.*\nFROM users u\nJOIN orders o ON o.user_id = u.id\nJOIN products p ON p.id = o.product_id\nWHERE o.created_at > ''2024-01-01''\nORDER BY o.total DESC;","src/optimizer/explain-analyzer.ts":"// EXPLAIN ANALYZE wrapper","src/indexes/recommender.ts":"// Index recommendation engine"}', '## PostgreSQL Query Optimization

Master query performance analysis and optimization with EXPLAIN ANALYZE.

### Objectives
- Read and interpret EXPLAIN ANALYZE output
- Identify sequential scans, hash joins, and sort operations
- Design composite indexes for complex WHERE clauses
- Rewrite slow queries using CTEs and window functions

### Requirements
1. Analyze 5 slow queries with EXPLAIN ANALYZE
2. Create composite indexes that eliminate sequential scans
3. Rewrite at least 2 queries using window functions
4. Achieve 10x query performance improvement

`bash
npm run test
psql -f src/migrations/001_optimize.sql
`', '[{"id":"tc-1","description":"All 5 queries show Index Scan instead of Seq Scan","order":1,"required":true},{"id":"tc-2","description":"Composite index covers the most selective columns first","order":2,"required":true},{"id":"tc-3","description":"Window function replaces self-join for ranking query","order":3,"required":true},{"id":"tc-4","description":"Query execution time reduced by 10x from baseline","order":4,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 5, "learningObjective": "Read EXPLAIN output and design indexes that eliminate sequential scans", "buildsToward": "High-Performance Database Layer"}', '["Always run EXPLAIN ANALYZE, not just EXPLAIN - it shows actual execution times","Index column order matters: put high-selectivity columns first","Partial indexes are powerful when queries always filter on a fixed value","Optimized queries are critical for lab-connection-pooling - slow queries hold connections longer","Consider query patterns before designing indexes - they must match real WHERE clauses"]', '["EXPLAIN BUFFERS shows I/O impact, not just CPU","Correlated subqueries become inefficient at scale - use JOINs instead","Materialized views cache expensive aggregations","This lab teaches the query analysis skills needed to debug connection pool saturation in lab-connection-pooling","ANALYZE statistics go stale - schedule regular VACUUM ANALYZE on high-write tables"]', '["Use pg_stat_statements to find the actual slowest queries in production","Consider partitioning for tables over 100GB","Monitor index usage with pg_stat_user_indexes to drop unused indexes","Build a query performance regression test suite that runs EXPLAIN on every migration","Create a dashboard showing p95 query latency before and after your optimizations"]'),

('lab-connection-pooling', 'track-3-database-mastery', 'PgBouncer Connection Pooling', 45, 'Advanced', true, 'Configure PgBouncer for 10,000+ connection handling with connection pooling modes, health checks, and failover.', '{"config/pgbouncer.ini":"[databases]\nbackend_forge = host=localhost port=5432\n\n[pgbouncer]\npool_mode = transaction\nmax_client_conn = 10000","src/pool/pooled-client.ts":"// PgBouncer-aware client","src/health/healthcheck.ts":"// Pool health monitoring"}', '## PgBouncer Connection Pooling

Configure PgBouncer to handle massive connection loads with optimal pool settings.

### Objectives
- Configure PgBouncer in transaction pooling mode
- Set up connection pooling with health checks and retry logic
- Load test with 10,000 concurrent connections
- Monitor pool metrics and connection wait times

### Requirements
1. Configure PgBouncer with transaction pooling mode
2. Build a PgBouncer-aware database client with retry logic
3. Implement health checks for pooled connections
4. Load test with 10,000 simulated connections

`bash
docker-compose up -d pgbouncer postgres
npm run test:load
`', '[{"id":"tc-1","description":"PgBouncer serves 10k connections with under 50ms p99 latency","order":1,"required":true},{"id":"tc-2","description":"Transaction mode correctly handles connection release","order":2,"required":true},{"id":"tc-3","description":"Health check detects and removes dead connections","order":3,"required":true},{"id":"tc-4","description":"Connection wait time stays under 100ms under load","order":4,"required":true}]', 2, '{"prerequisiteLabId": "lab-query-optimization", "stage": "Building", "estimatedHours": 5, "learningObjective": "Configure PgBouncer for high-connection workloads with health checks", "buildsToward": "High-Performance Database Layer"}', '["Transaction mode is the sweet spot for most web applications","Session mode preserves prepared statements but wastes connections","server_idle_timeout prevents connection leaks from abandoned transactions","Slow queries from lab-query-optimization will hold pooled connections longer - fix queries first","Transaction mode disables PREPARE statements - adjust your ORM config accordingly"]', '["PgBouncer adds ~0.5ms latency - measure if it is worth it for your scale","Connection pool sizing: (2 * CPU cores) + effective_spindle_count","Use SET statements carefully in transaction mode - they persist across queries","Query optimization from lab-query-optimization reduces connection hold time, increasing effective pool capacity","PgBouncer SHOW POOLS shows real-time utilization - alert when >80%"]', '["Monitor pgbouncer SHOW POOLS for connection utilization","Set server_connect_query for role setup on new connections","Consider PgCat as a modern PgBouncer alternative with sharding","Write a load test that validates connection release after transaction commit","Build a connection pool exhaustion simulator to test retry logic under pressure"]');
