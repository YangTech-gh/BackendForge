-- Track 1: The API Blueprint (3 labs)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-rest-api-design', 'track-1-api-blueprint', 'REST API Design with OpenAPI', 45, 'Intermediate', false, 'Master REST conventions, Richardson Maturity Model, and contract-first API design with OpenAPI 3.1.', '{"openapi.yaml":"openapi: 3.1.0\ninfo:\n  title: Backend Forge API\n  version: 1.0.0\npaths: {}","src/routes/products.ts":"import { Router } from ''express'';\nexport const productRoutes = Router();","src/schemas/product.ts":"import { z } from ''zod'';\nexport const CreateProductSchema = z.object({});"}', '## REST API Design with OpenAPI

Design a production REST API following Richardson Maturity Model conventions.

### Objectives
- Define RESTful resource endpoints with proper HTTP verbs and status codes
- Generate OpenAPI 3.1 specification from code
- Implement request validation with Zod schemas
- Build proper error response formats

### Requirements
1. Create CRUD endpoints for a products resource (GET, POST, PUT, DELETE)
2. Generate an OpenAPI 3.1 YAML spec
3. Use Zod schemas for request body validation
4. Standard error response: { error: { code, message, details? } }

`bash
npm run test
npx @redocly/cli lint openapi.yaml
`', '[{"id":"tc-1","description":"OpenAPI spec has valid YAML syntax","order":1,"required":true},{"id":"tc-2","description":"Products endpoint returns paginated list","order":2,"required":true},{"id":"tc-3","description":"Create validates request body with 400 on invalid","order":3,"required":true},{"id":"tc-4","description":"Soft delete sets deleted_at timestamp","order":4,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 4, "learningObjective": "Master Richardson Maturity Model conventions and OpenAPI contract-first design", "buildsToward": "Production API Gateway with Rate Limiting"}', '["Always use plural nouns for resource URLs (e.g., /products not /product)","Return 404 for missing resources, not 400","Use pagination for list endpoints: { data, meta: { total, page, pageSize } }","Version your API via URL prefix: /v1/products","In lab-graphql-federation you will see how GraphQL handles the same resources differently"]', '["Contract-first design prevents drift between docs and implementation","Zod schemas serve as both validation and OpenAPI generation source","Status codes are part of the API contract - clients depend on them","This lab establishes the HTTP conventions that lab-api-versioning will extend across versions","Richardson Level 3 (HATEOAS) is optional - most teams stop at Level 2"]', '["Add rate limiting headers (X-RateLimit-Remaining) to all endpoints","Implement ETag-based conditional requests for PUT operations","Design HATEOAS links for discoverable API navigation","Build an OpenAPI codegen pipeline that generates TypeScript clients from your spec","Create a shared error schema and reuse it across all endpoints"]'),

('lab-graphql-federation', 'track-1-api-blueprint', 'GraphQL Schema Design & Federation', 60, 'Advanced', true, 'Build a production GraphQL API with schema design, DataLoader N+1 prevention, and Apollo Federation.', '{"src/schema.ts":"import { makeExecutableSchema } from ''@graphql-tools/schema'';","src/dataloaders.ts":"// DataLoader for N+1 prevention","src/resolvers.ts":"export const resolvers = { Query: { products: () => [] } };"}', '## GraphQL Schema Design & Federation

Build a production GraphQL API with proper schema design and DataLoader patterns.

### Objectives
- Design a cohesive GraphQL schema with types, queries, and mutations
- Implement DataLoader to prevent N+1 query problems
- Build cursor-based pagination following Relay specification
- Set up Apollo Federation for microservice composition

### Requirements
1. Define Product, Category, and Review types with relationships
2. Implement DataLoader for each relationship (product->reviews, category->products)
3. Build cursor-based pagination with edges/nodes/pageInfo
4. Write schema stitching or federation gateway

`bash
npm run test
npm run typecheck
`', '[{"id":"tc-1","description":"GraphQL schema is valid and introspectable","order":1,"required":true},{"id":"tc-2","description":"DataLoader batches 50 individual queries into 2 batched queries","order":2,"required":true},{"id":"tc-3","description":"Pagination returns correct pageInfo with hasMore flag","order":3,"required":true},{"id":"tc-4","description":"Nested resolver does not trigger N+1 queries","order":4,"required":true}]', 2, '{"prerequisiteLabId": "lab-rest-api-design", "stage": "Building", "estimatedHours": 6, "learningObjective": "Design production GraphQL schemas and prevent N+1 with DataLoader", "buildsToward": "Production API Gateway with Rate Limiting"}', '["Name queries in PascalCase, fields in camelCase","Always use DataLoader for database relationships","Implement query complexity limits to prevent abuse","Return consistent error shapes across REST and GraphQL","If you completed lab-rest-api-design, notice how GraphQL collapses multiple REST endpoints into one"]', '["GraphQL is not always better than REST - choose based on client needs","Federation adds complexity; start with a monolith schema first","N+1 problems are invisible until production traffic hits","This lab builds on the resource modeling from lab-rest-api-design - compare pagination approaches","Federation lets you split the monolith later without changing the client contract"]', '["Add persisted queries for production security","Implement @defer/@stream for large response optimization","Build a schema registry for versioning and breaking change detection","Compare your GraphQL error format to the REST error format from lab-rest-api-design","Write integration tests that query both REST and GraphQL for the same product data"]'),

('lab-api-versioning', 'track-1-api-blueprint', 'API Versioning Strategies', 45, 'Advanced', true, 'Implement multiple API versioning strategies including URL path, header-based, and content negotiation.', '{"src/v1/router.ts":"import { Router } from ''express''; export const v1Router = Router();","src/v2/router.ts":"import { Router } from ''express''; export const v2Router = Router();","src/middleware/versioning.ts":"// API versioning middleware"}', '## API Versioning Strategies

Implement production-grade API versioning that supports backward compatibility.

### Objectives
- Implement URL path versioning (/v1/products, /v2/products)
- Build header-based versioning with Accept headers
- Create response transformers for backward compatibility
- Design deprecation workflows with sunset headers

### Requirements
1. Set up URL path versioning with router mounting
2. Implement Accept header versioning middleware
3. Build response transformers for v1->v2 data migration
4. Add Sunset and Deprecation headers for old versions

`bash
npm run test
npm run lint
`', '[{"id":"tc-1","description":"v1 and v2 endpoints coexist without conflicts","order":1,"required":true},{"id":"tc-2","description":"Header-based versioning returns correct version","order":2,"required":true},{"id":"tc-3","description":"Deprecation header included for old versions","order":3,"required":true},{"id":"tc-4","description":"Response transformer migrates v1 shape to v2","order":4,"required":true}]', 3, '{"prerequisiteLabId": "lab-rest-api-design", "stage": "Building", "estimatedHours": 5, "learningObjective": "Design versioning strategies that support backward compatibility", "buildsToward": "Production API Gateway with Rate Limiting"}', '["URL path versioning is the most explicit and debuggable","Always support at least 2 versions simultaneously","Deprecation warnings should start 6 months before removal","Apply the same versioning patterns to your OpenAPI spec from lab-rest-api-design","GraphQL federation from lab-graphql-federation handles schema evolution differently"]', '["Breaking changes should be rare; design for extensibility first","Content negotiation is cleanest but hardest for clients to use","Version everything: routes, schemas, response shapes, error formats","This lab extends the REST design from lab-rest-api-design - keep your error contracts consistent across versions","Consider how GraphQL achieves field-level deprecation without version numbers"]', '["Build automated API diff tools to detect breaking changes","Implement canary deployments for new API versions","Use API gateways for centralized version management","Write a migration guide document for each version bump","Create a shared transformer library that works for both REST and GraphQL responses"]') ON CONFLICT (id) DO NOTHING;