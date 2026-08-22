-- Track 13: Event Sourcing & CQRS (2 labs)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-eventstoredb', 'track-13-event-sourcing', 'EventStoreDB Projections', 55, 'Intermediate', false, 'Build event-sourced systems with EventStoreDB, catch-up subscriptions, and inline projections.', '{"src/event-store/connection.ts":"// EventStoreDB connection","src/event-store/aggregate.ts":"// Base aggregate class","src/projections/order-projection.ts":"// Order read model projection","src/events/order-events.ts":"// Order domain events"}', '## EventStoreDB Projections

Build event-sourced systems with EventStoreDB projections and subscriptions.

### Objectives
- Design event-sourced aggregates with EventStoreDB
- Build catch-up projections for read models
- Implement idempotent event handlers
- Design event versioning and migration strategies

### Requirements
1. Create Order aggregate with event sourcing pattern
2. Build catch-up subscription projection for order summary
3. Implement idempotent event handling with position tracking
4. Design event schema versioning with upcasting

`bash
npm run test
docker-compose up -d eventstoredb
`', '[{"id":"tc-1","description":"Order aggregate rebuilds state from event stream","order":1,"required":true},{"id":"tc-2","description":"Projection updates read model within 100ms of event","order":2,"required":true},{"id":"tc-3","description":"Duplicate events are handled idempotently","order":3,"required":true},{"id":"tc-4","description":"Event upcasting converts v1 events to v2 format","order":4,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 5, "learningObjective": "Build event-sourced systems with EventStoreDB projections", "buildsToward": "Distributed Saga Orchestrator"}', '["Events are immutable facts - design them to be meaningful","Catch-up projections are eventually consistent - handle accordingly","Event versioning is critical - plan for schema evolution from day one"]', '["Event sourcing is not free - you need projections for queries","EventStoreDB streams are ordered - use position for exactly-once","Projections can be rebuilt from events - that is the power"]', '["Implement snapshotting for aggregates with long event histories","Use linked events for aggregate correlation","Add event store compaction for storage management"]'),

('lab-distributed-saga', 'track-13-event-sourcing', 'Distributed Saga Orchestrator', 65, 'Advanced', false, 'Implement the Saga pattern with EventStoreDB for distributed transaction coordination and compensation.', '{"src/saga/orchestrator.ts":"// Saga orchestrator base class","src/saga/order-saga.ts":"// Order processing saga","src/saga/compensation.ts":"// Compensation handlers","src/saga/saga-store.ts":"// Saga state persistence"}', '## Distributed Saga Orchestrator

Implement distributed transactions with the Saga pattern and compensation.

### Objectives
- Design saga orchestrators for multi-step transactions
- Implement compensation logic for failure scenarios
- Build saga state persistence and recovery
- Handle concurrent saga execution and locking

### Requirements
1. Create OrderSaga: reserve_inventory → process_payment → ship_order
2. Implement compensation for each step on failure
3. Persist saga state for crash recovery
4. Handle concurrent sagas with optimistic locking

`bash
npm run test
npm run test:saga
`', '[{"id":"tc-1","description":"Saga completes all steps on success","order":1,"required":true},{"id":"tc-2","description":"Payment failure triggers inventory release compensation","order":2,"required":true},{"id":"tc-3","description":"Saga recovers from crash using persisted state","order":3,"required":true},{"id":"tc-4","description":"Concurrent order sagas do not deadlock","order":4,"required":true}]', 2, '{"prerequisiteLabId": "lab-eventstoredb", "stage": "Building", "estimatedHours": 8, "learningObjective": "Implement distributed sagas with compensation and crash recovery", "buildsToward": "Distributed Saga Orchestrator"}', '["Sagas replace distributed transactions with compensation","Orchestrator pattern centralizes saga logic - easier to debug","Each step must be idempotent and have a compensation handler"]', '["Distributed sagas are complex - use only when truly needed","Compensation is not rollback - it is a new action that undoes effects","Saga timeouts should trigger compensation, not infinite retry"]', '["Implement saga monitoring with distributed tracing","Add dead letter queues for permanently failed sagas","Use event sourcing for saga state for perfect audit trail"]');
