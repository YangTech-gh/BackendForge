-- Track 8: The Enterprise Java (2 labs)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-spring-boot-starter', 'track-8-enterprise-java', 'Spring Boot Starter Patterns', 50, 'Intermediate', false, 'Build production Spring Boot services with auto-configuration, custom starters, and Actuator health checks.', '{"src/main/java/com/forge/Application.java":"@SpringBootApplication\npublic class Application { public static void main(String[] args) { SpringApplication.run(Application.class, args); } }","src/main/java/com/forge/config/DatabaseConfig.java":"// Database configuration","src/main/java/com/forge/actuator/HealthIndicator.java":"// Custom health indicator","src/main/java/com/forge/starter/CustomAutoConfiguration.java":"// Auto-configuration"}', '## Spring Boot Starter Patterns

Build production Spring Boot services with custom auto-configuration.

### Objectives
- Create custom Spring Boot starters with auto-configuration
- Implement Actuator health checks for downstream services
- Build externalized configuration with profiles
- Design proper layered architecture (Controller → Service → Repository)

### Requirements
1. Create a custom starter for database connection pooling
2. Implement Actuator health indicators for Redis and PostgreSQL
3. Build profile-specific configuration (dev, staging, prod)
4. Follow Controller → Service → Repository layering

`bash
mvn clean test
mvn spring-boot:run
`', '[{"id":"tc-1","description":"Custom starter auto-configures on classpath detection","order":1,"required":true},{"id":"tc-2","description":"Actuator health endpoint shows DOWN for unreachable services","order":2,"required":true},{"id":"tc-3","description":"Profile-specific config overrides base configuration","order":3,"required":true},{"id":"tc-4","description":"Service layer has no Spring web dependencies","order":4,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 5, "learningObjective": "Build custom Spring Boot starters and Actuator health checks", "buildsToward": "Enterprise Order Processing Pipeline"}', '["Use @ConditionalOnClass for classpath-based auto-configuration","Actuator endpoints should never expose sensitive data","Profiles are the correct way to handle environment differences","Name your starter module spring-boot-starter-yourfeature so Spring Boot conventions detect it automatically","Use @ConfigurationProperties with @Validated for type-safe config binding with Bean Validation"]', '["Spring Boot magic is @EnableAutoConfiguration - understand the conditions","Custom starters make your library consumable with one dependency","Health indicators should check actual connectivity, not just bean presence","A starter should contain zero business code - only auto-configuration classes and metadata in META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports","Structure the service layer so it can be invoked both from web controllers and from Kafka consumers that trigger the same business logic, as you will need in lab-kafka-outbox"]', '["Use Micrometer for metrics export to Prometheus/Grafana","Implement @ConfigurationProperties for type-safe configuration","Add @PreAuthorize for method-level security","Create a starter that auto-configures a Redisson client and expose a health indicator that checks actual ping latency rather than just connection pool state","Write an integration test that boots the full Spring context with Testcontainers for PostgreSQL and Redis, then asserts the health endpoint returns UP for both"]'),

('lab-kafka-outbox', 'track-8-enterprise-java', 'Kafka Transactional Outbox Pattern', 60, 'Advanced', false, 'Implement exactly-once Kafka publishing with the transactional outbox pattern and Debezium CDC.', '{"src/main/java/com/forge/outbox/OutboxEvent.java":"// Outbox event entity","src/main/java/com/forge/outbox/OutboxRepository.java":"// Spring Data JPA repository","src/main/java/com/forge/kafka/KafkaPublisher.java":"// Kafka publisher with transactions","src/main/java/com/forge/cdc/DebeziumConfig.java":"// Debezium CDC configuration"}', '## Kafka Transactional Outbox Pattern

Implement exactly-once Kafka publishing with the transactional outbox pattern.

### Objectives
- Implement the transactional outbox pattern for dual writes
- Configure Debezium CDC for outbox table polling
- Design idempotent Kafka consumers
- Handle schema evolution with Avro and Schema Registry

### Requirements
1. Create outbox_event table with aggregate_id, payload, status
2. Write events to outbox in the same transaction as business data
3. Configure Debezium to poll outbox and publish to Kafka
4. Implement idempotent consumer with deduplication

`bash
mvn clean test
docker-compose up -d kafka zookeeper debezium
`', '[{"id":"tc-1","description":"Business write and outbox write are atomic","order":1,"required":true},{"id":"tc-2","description":"Debezium publishes outbox events within 5 seconds","order":2,"required":true},{"id":"tc-3","description":"Duplicate Kafka messages are deduplicated by consumer","order":3,"required":true},{"id":"tc-4","description":"Schema evolution does not break existing consumers","order":4,"required":true}]', 2, '{"prerequisiteLabId": "lab-spring-boot-starter", "stage": "Building", "estimatedHours": 7, "learningObjective": "Implement transactional outbox for reliable event publishing", "buildsToward": "Enterprise Order Processing Pipeline"}', '["The outbox pattern eliminates dual-write problems","Debezium CDC is more reliable than polling for outbox relay","Always use Avro with Schema Registry for Kafka serialization","Partition your Kafka topics by aggregate_id to guarantee per-entity ordering","Enable Debezium tombstone handling so soft-deletes propagate correctly"]', '["Transactional outbox adds latency - measure if it is acceptable","Debezium requires WAL for PostgreSQL - ensure it is enabled","Kafka ordering is per-partition - partition by aggregate_id","The outbox table should have an index on status and created_at for efficient Debezium polling","The service layer from lab-spring-boot-starter should write the business entity and outbox event in a single @Transactional method so that the two writes are truly atomic"]', '["Implement dead letter queues for poison pill messages","Use Kafka transactions for exactly-once producer semantics","Monitor consumer lag with Kafka consumer group metrics","Write a test that deliberately publishes a duplicate Kafka message and verify the consumer idempotency filter rejects it","Extend the outbox entity to include an event_type field and use Debezium message routing to publish different event types to separate Kafka topics"]');

