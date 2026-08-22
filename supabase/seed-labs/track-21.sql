-- Track 21: Testing & Contract Validation (2 labs)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-testing-patterns', 'track-21-testing', 'Unit and Integration Testing Patterns', 50, 'Intermediate', false, 'Design comprehensive test suites: unit tests, integration tests, test doubles, and test data factories.', '{}', '## Unit and Integration Testing Patterns

Design test suites that catch real bugs and survive refactoring.

### Objectives
- Structure tests as Arrange-Act-Assert with clear naming
- Build test doubles (mocks, stubs, fakes) for external dependencies
- Design test data factories for complex domain objects
- Implement integration tests with real databases

### Requirements
1. Write 20 unit tests covering happy path and edge cases
2. Build a test double for a payment provider
3. Create a test data factory for the Order aggregate
4. Write integration tests against a real PostgreSQL database

`bash
npm run test
npm run test:integration
`', '[{"id":"tc-1","description":"Unit tests run in under 5 seconds total","order":1,"required":true},{"id":"tc-2","description":"Test double correctly simulates payment provider failures","order":2,"required":true},{"id":"tc-3","description":"Integration tests use real database, not mocks","order":3,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 5, "learningObjective": "Design test suites with unit, integration, and test doubles", "buildsToward": "Production Quality Engineering"}', '["Test names should describe the behavior, not the implementation","Mock external services, use real databases for integration tests","Test data factories prevent test coupling to specific data shapes"]', '["Fast tests get run often - keep unit tests under 5s total","Integration tests catch what unit tests cannot - real system behavior","Test behavior, not implementation - tests should survive refactoring"]', '["Use property-based testing for complex business rules","Implement snapshot testing for API responses","Add mutation testing to verify test suite quality"]'),
('lab-contract-testing', 'track-21-testing', 'Contract Testing with Pact', 55, 'Advanced', false, 'Implement consumer-driven contract testing with Pact to verify API compatibility between services.', '{}', '## Contract Testing with Pact

Verify API compatibility between services using consumer-driven contracts.

### Objectives
- Write consumer contract tests that define expected API behavior
- Generate and verify provider contracts against real implementations
- Integrate contract tests into CI/CD pipelines
- Handle contract versioning and breaking changes

### Requirements
1. Write a consumer contract for the Products API
2. Verify provider against the generated contract
3. Integrate Pact into GitHub Actions CI pipeline
4. Handle breaking contract changes with versioning

`bash
npm run test:contract
pact-broker publish --consumer-app-version=$VERSION
`', '[{"id":"tc-1","description":"Consumer contract accurately describes expected API behavior","order":1,"required":true},{"id":"tc-2","description":"Provider passes all contract interactions","order":2,"required":true},{"id":"tc-3","description":"Breaking API change fails the provider contract test","order":3,"required":true}]', 2, '{"prerequisiteLabId": "lab-testing-patterns", "stage": "Building", "estimatedHours": 6, "learningObjective": "Implement consumer-driven contract testing for microservices", "buildsToward": "Production Quality Engineering"}', '["Contracts are living documentation - they describe actual API behavior","Pact Broker enables distributed teams to coordinate API changes","Consumer-driven contracts shift API design to the consumer side"]', '["Contract tests are not integration tests - they verify the API shape","Pact uses real HTTP calls in tests, not mocks","Tag consumer versions with release tags for traceability"]', '["Implement can-i-deploy checks before production deployment","Use matrix builds to test against multiple provider versions","Add webhook triggers for contract change notifications"]')
