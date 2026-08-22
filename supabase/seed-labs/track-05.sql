-- Track 5: The Python Backend (2 labs)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-fastapi-async', 'track-5-python-backend', 'FastAPI Async Endpoints', 45, 'Intermediate', false, 'Build production FastAPI services with async dependency injection, Pydantic v2 validation, and SQLAlchemy 2.0 async ORM.', '{"src/main.py":"from fastapi import FastAPI\napp = FastAPI()","src/models/product.py":"# SQLAlchemy 2.0 async model","src/schemas/product.py":"# Pydantic v2 schema","src/dependencies.py":"# Async dependency injection"}', '## FastAPI Async Endpoints

Build high-performance async Python APIs with FastAPI and SQLAlchemy 2.0.

### Objectives
- Create async FastAPI endpoints with dependency injection
- Define Pydantic v2 models for strict validation
- Implement SQLAlchemy 2.0 async ORM with relationship loading
- Build background tasks with proper error handling

### Requirements
1. Build CRUD endpoints with async database operations
2. Implement Pydantic v2 models with field validators
3. Use SQLAlchemy 2.0 async session with proper lifecycle
4. Add background tasks for email/notification sending

`bash
pytest tests/ -v
mypy src/
`', '[{"id":"tc-1","description":"Async endpoint handles 1000 concurrent requests","order":1,"required":true},{"id":"tc-2","description":"Pydantic v2 validation rejects invalid input with clear errors","order":2,"required":true},{"id":"tc-3","description":"SQLAlchemy session properly commits and rolls back","order":3,"required":true},{"id":"tc-4","description":"Background task executes after response is sent","order":4,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 5, "learningObjective": "Build async Python APIs with FastAPI dependency injection", "buildsToward": "Async Python SaaS API"}', '["Use Depends() for reusable database session management","Pydantic v2 uses model_validator for cross-field validation","AsyncSession requires async driver like asyncpg","The async patterns here directly transfer to lab-celery-queues task handlers","Background tasks in FastAPI are similar to lightweight Celery tasks - choose based on reliability needs"]', '["FastAPI auto-generates OpenAPI docs from type hints","Background tasks run after response - use for non-critical work","Dependency injection is the backbone of FastAPI architecture","This lab establishes async patterns that lab-celery-queues extends with distributed workers","Pydantic v2 validators are 5-50x faster than v1 due to Rust core"]', '["Add rate limiting middleware with slowapi","Implement request ID tracking across async boundaries","Use Alembic for async database migrations","Build a health check endpoint that verifies async DB connectivity","Create a benchmark comparing sync vs async endpoints under 1000 concurrent connections"]'),

('lab-celery-queues', 'track-5-python-backend', 'Celery Task Queues with Redis', 55, 'Advanced', false, 'Configure Celery workers with Redis broker, implement retry policies, and design task monitoring dashboards.', '{"src/celery_app.py":"from celery import Celery\napp = Celery(''worker'', broker=''redis://localhost'')","src/tasks/email.py":"# Email sending task","src/tasks/etl.py":"# Data pipeline task","src/monitoring/flower.py":"# Flower monitoring config"}', '## Celery Task Queues with Redis

Configure Celery workers with Redis broker for reliable background processing.

### Objectives
- Configure Celery with Redis broker and result backend
- Implement tasks with retry, rate limiting, and priority queues
- Build task monitoring with Flower dashboard
- Design circuit breaker for external API calls

### Requirements
1. Configure Celery with Redis broker and result backend
2. Implement tasks with retry, rate limiting, and priority queues
3. Build task monitoring with Flower dashboard
4. Design circuit breaker for external API calls

`bash
celery -A src.celery_app worker --loglevel=info
pytest tests/ -v
`', '[{"id":"tc-1","description":"Task survives worker restart via Redis persistence","order":1,"required":true},{"id":"tc-2","description":"Failed task retries 3 times with exponential backoff","order":2,"required":true},{"id":"tc-3","description":"Rate-limited task respects configured max per minute","order":3,"required":true},{"id":"tc-4","description":"Flower dashboard shows real-time task metrics","order":4,"required":true}]', 2, '{"prerequisiteLabId": "lab-fastapi-async", "stage": "Building", "estimatedHours": 6, "learningObjective": "Configure Celery for reliable distributed task processing", "buildsToward": "Async Python SaaS API"}', '["Always set task time limits to prevent hung workers","Use Celery priorities to ensure critical tasks run first","Implement circuit breakers for tasks calling external APIs","FastAPI background tasks from lab-fastapi-async handle light work - use Celery for anything requiring retries or durability","Redis broker connects the same event loop principles from Node.js labs to Python"]', '["Celery is not a message queue - it needs Redis/RabbitMQ as broker","Task results can be expensive - only store what you need","Monitor worker memory usage to detect leaks","This lab extends the async concepts from lab-fastapi-async into distributed processing","Task serialization with pickle is dangerous - use JSON serializer"]', '["Implement dead letter queues for permanently failed tasks","Use Celery Canvas for complex task workflows","Add structured logging with task ID correlation","Build a task retry dashboard showing failure reasons and patterns","Create a load test that dispatches 10,000 tasks and validates completion within SLA"]');

(End of file)
