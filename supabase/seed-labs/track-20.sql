-- Track 20: Data Pipeline Engineering (2 labs)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-debezium-cdc', 'track-20-data-pipelines', 'CDC with Debezium and PostgreSQL', 55, 'Intermediate', false, 'Implement Change Data Capture with Debezium for real-time data synchronization between services.', '{}', '## CDC with Debezium and PostgreSQL

Implement real-time data synchronization using Change Data Capture.

### Objectives
- Configure Debezium for PostgreSQL WAL-based CDC
- Build event streaming from database changes
- Implement downstream consumer processing
- Handle schema evolution in CDC events

### Requirements
1. Configure Debezium connector for PostgreSQL
2. Stream change events to Kafka topics
3. Build a consumer that processes change events
4. Handle schema evolution without downtime

`bash
docker compose up -d kafka debezium postgres
npm run test:cdc
`', '[{"id":"tc-1","description":"CDC captures INSERT, UPDATE, and DELETE operations","order":1,"required":true},{"id":"tc-2","description":"Events arrive in transaction order within a partition","order":2,"required":true},{"id":"tc-3","description":"Schema evolution does not break existing consumers","order":3,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 6, "learningObjective": "Implement CDC with Debezium for real-time data synchronization", "buildsToward": "Real-Time Data Platform"}', '["Debezium reads PostgreSQL WAL - ensure it is enabled and has sufficient retention","CDC is more reliable than polling for change detection","Event ordering is per-transaction, not per-statement"]', '["Debezium requires PostgreSQL logical replication slots - monitor slot usage","WAL retention must be sufficient for consumer lag","Schema Registry prevents incompatible schema changes"]', '["Implement dead letter queues for failed CDC events","Use Debezium SMTs for event transformation","Monitor consumer lag to prevent WAL accumulation"]'),
('lab-dbt-transformations', 'track-20-data-pipelines', 'dbt Data Transformations', 50, 'Intermediate', false, 'Build data transformation pipelines with dbt: models, tests, documentation, and incremental materialization.', '{}', '## dbt Data Transformations

Build auditable data transformation pipelines with dbt.

### Objectives
- Design staging -> intermediate -> mart model layers
- Implement data tests for freshness and quality
- Build incremental models for large tables
- Generate documentation with dbt docs

### Requirements
1. Create a 3-layer model (staging, intermediate, marts)
2. Add schema tests (not_null, unique, relationships)
3. Build an incremental model for event data
4. Generate and serve dbt documentation

`bash
dbt run
dbt test
dbt docs generate
`', '[{"id":"tc-1","description":"Models follow staging -> intermediate -> mart pattern","order":1,"required":true},{"id":"tc-2","description":"Tests catch data quality issues on every run","order":2,"required":true},{"id":"tc-3","description":"Incremental model processes only new rows","order":3,"required":true}]', 2, '{"prerequisiteLabId": "lab-debezium-cdc", "stage": "Building", "estimatedHours": 5, "learningObjective": "Build data transformation pipelines with dbt for analytics", "buildsToward": "Real-Time Data Platform"}', '["dbt models are SQL SELECT statements - keep them simple","Tests run on every dbt run - make them fast and meaningful","Incremental models are essential for large event tables"]', '["Staging models clean and rename, intermediate transform, marts serve","Source freshness checks prevent stale data from propagating","dbt docs are the single source of truth for data documentation"]', '["Use dbt packages for common transformations","Implement snapshot tables for slowly changing dimensions","Add exposure definitions for downstream BI tools"]')
