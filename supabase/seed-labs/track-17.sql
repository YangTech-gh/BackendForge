-- Track 17: Docker & Container Mastery (2 labs)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-dockerfile-optimization', 'track-17-docker', 'Dockerfile Optimization & Multi-Stage Builds', 45, 'Intermediate', false, 'Write production Dockerfiles with multi-stage builds, layer caching, and security best practices.', '{}', '## Dockerfile Optimization and Multi-Stage Builds

Write efficient, secure Docker images for production deployment.

### Objectives
- Design multi-stage builds to minimize image size
- Optimize layer caching for fast rebuilds
- Implement security best practices (non-root, minimal base)

### Requirements
1. Create a multi-stage Dockerfile (build + runtime stages)
2. Use .dockerignore to exclude unnecessary files
3. Run as non-root user with specific UID

`bash
docker build -t app .
docker run --rm app echo ok
`', '[{"id":"tc-1","description":"Final image is under 50MB (excluding base)","order":1,"required":true},{"id":"tc-2","description":"Rebuild with no code changes uses cached layers","order":2,"required":true},{"id":"tc-3","description":"Container runs as non-root user","order":3,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 4, "learningObjective": "Write optimized, secure Dockerfiles with multi-stage builds", "buildsToward": "Production Container Orchestration"}', '["Multi-stage builds separate build-time and runtime dependencies","Layer ordering matters: put rarely-changing layers first","Always use specific base image tags, never latest"]', '["COPY . . invalidates all subsequent layers on any file change","Alpine is smaller but has musl libc - test for compatibility","docker scout cve scans for known vulnerabilities"]', '["Use docker buildx for multi-platform builds","Implement health checks in Dockerfile","Use BuildKit cache mounts for package managers"]'),
('lab-docker-compose', 'track-17-docker', 'Docker Compose Orchestration', 50, 'Intermediate', false, 'Orchestrate multi-service applications with Docker Compose: networking, volumes, health checks, and profiles.', '{}', '## Docker Compose Orchestration

Orchestrate multi-service applications with Docker Compose.

### Objectives
- Design multi-service architectures with Compose
- Configure networking, volumes, and health checks
- Use profiles for dev vs production configurations

### Requirements
1. Define a multi-service stack (API, DB, Redis, worker)
2. Configure health checks for all services
3. Use volumes for data persistence
4. Create dev and prod profiles

`bash
docker compose up -d
docker compose ps
`', '[{"id":"tc-1","description":"All services start and pass health checks","order":1,"required":true},{"id":"tc-2","description":"Data persists across container restarts via volumes","order":2,"required":true},{"id":"tc-3","description":"Dev profile includes debug tools, prod does not","order":3,"required":true}]', 2, '{"prerequisiteLabId": "lab-dockerfile-optimization", "stage": "Building", "estimatedHours": 5, "learningObjective": "Orchestrate multi-service applications with Docker Compose", "buildsToward": "Production Container Orchestration"}', '["Health checks prevent compose from marking unhealthy services as ready","Named volumes persist data independently of container lifecycle","Profiles let you layer dev tools on top of production configs"]', '["docker compose config validates your compose file","Depends_on with condition: service_healthy ensures proper startup order","Use .env files for environment-specific configuration"]', '["Implement docker compose watch for hot-reload in development","Add resource limits to prevent runaway containers","Use Docker networks for service isolation"]')
