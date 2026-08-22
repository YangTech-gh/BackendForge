-- Track 6: The Rails Monolith Engine (2 labs)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-hotwire-streams', 'track-6-rails', 'Hotwire Turbo Streams', 45, 'Intermediate', false, 'Implement Hotwire Turbo Streams for real-time UI updates with server-rendered HTML and WebSocket broadcasting.', '{"app/views/products/show.html.erb":"<%= turbo_stream_from @product %>","app/models/product.rb":"class Product < ApplicationRecord\n  broadcasts_to :products, inserts_by: :prepend\nend","app/controllers/products_controller.rb":"class ProductsController < ApplicationController\nend"}', '## Hotwire Turbo Streams

Implement real-time UI updates with Hotwire Turbo Streams and Action Cable.

### Objectives
- Set up Action Cable for WebSocket connections
- Implement Turbo Streams for partial page updates
- Build real-time notifications without JavaScript frameworks
- Design broadcast channels for multi-user collaboration

### Requirements
1. Configure Action Cable with Redis adapter
2. Implement turbo_stream_from in views for live updates
3. Broadcast model changes (create, update, delete) to subscribers
4. Handle connection drops and reconnection gracefully

`bash
bundle exec rails test
rails test:system
`', '[{"id":"tc-1","description":"Turbo Stream delivers partial HTML within 200ms of broadcast","order":1,"required":true},{"id":"tc-2","description":"Multiple browser tabs receive updates simultaneously","order":2,"required":true},{"id":"tc-3","description":"Connection drop triggers automatic reconnection","order":3,"required":true},{"id":"tc-4","description":"Broadcast includes correct Turbo action (append, prepend, replace)","order":4,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 5, "learningObjective": "Build real-time UIs with Hotwire Turbo Streams and Action Cable", "buildsToward": "Production SaaS Billing Engine with Hotwire"}', '["Use turbo_stream_from for channel subscription in views","Turbo Frame for independent page section updates","Action Cable channels use Rails authentication by default","Name channels with resource-scoped identifiers like product_#{@product.id} to limit broadcast scope","Prepend broadcasts for chat-like feeds; replace for status fields like order state"]', '["Turbo is not SPA - server renders HTML, WebSocket pushes updates","Broadcast judiciously - every broadcast is a WebSocket message","Use signed IDs for secure Turbo Stream channel names","Turbo Streams compose: append, prepend, replace, update, remove, and before/after actions target specific DOM IDs","Pair with lab-sidekiq-workers when broadcasts are triggered by background jobs to avoid blocking the request cycle"]', '["Implement presence indicators with Action Cable","Add Turbolinks for instant page transitions","Use cable_ready for complex DOM operations","Build a notification bell that accumulates unread counts and streams updates into a dropdown","Refactor the product broadcast to trigger from a Sidekiq job (see lab-sidekiq-workers) and verify the UI still updates within 500ms of job completion"]'),

('lab-sidekiq-workers', 'track-6-rails', 'Sidekiq Background Jobs', 55, 'Advanced', false, 'Design Sidekiq worker pools with retry policies, batch processing, and dead letter queue management.', '{"app/jobs/payment_processor.rb":"class PaymentProcessor < ApplicationJob\n  queue_as :critical\n  retry_on Stripe::APIError, wait: :polynomially_longer\nend","config/sidekiq.yml":"---\n:concurrency: 10\n:queues:\n  - [critical, 6]\n  - [default, 3]\n  - [low, 1]","app/jobs/batch_import_job.rb":"class BatchImportJob < ApplicationJob\n  sidekiq_options batch: true\nend"}', '## Sidekiq Background Jobs

Design production Sidekiq workers with proper error handling and monitoring.

### Objectives
- Configure Sidekiq worker pools with priority queues
- Implement retry policies with exponential backoff
- Build batch processing with Sidekiq Batch API
- Design dead letter queues for failed jobs

### Requirements
1. Configure queue priorities (critical: 6, default: 3, low: 1)
2. Implement retry_on with polynomial backoff for API errors
3. Build batch job processing with progress tracking
4. Set up dead letter queue monitoring

`bash
bundle exec rails test
sidekiqmon
`', '[{"id":"tc-1","description":"Critical queue processes 6x faster than low queue","order":1,"required":true},{"id":"tc-2","description":"Failed job retries with polynomial backoff delays","order":2,"required":true},{"id":"tc-3","description":"Batch job tracks progress and handles partial failures","order":3,"required":true},{"id":"tc-4","description":"Dead letter queue captures permanently failed jobs","order":4,"required":true}]', 2, '{"prerequisiteLabId": "lab-hotwire-streams", "stage": "Building", "estimatedHours": 6, "learningObjective": "Configure Sidekiq for reliable background job processing", "buildsToward": "Production SaaS Billing Engine with Hotwire"}', '["Queue naming convention: resource_action (e.g., payment_charge)","Always set retry_on with specific exception classes, not bare Rescue","Use perform_at for scheduled jobs instead of cron for simplicity","Set queue weights proportionally: critical 6, default 3, low 1 ensures critical jobs always have capacity","Use Sidekiq::Batch to group related jobs and track aggregate progress with callbacks on success/failure"]', '["Sidekiq Pro adds batch, fetch, and unique jobs features","Monitor Sidekiq via Web UI at /sidekiq in development","Use Redis namespaces to separate dev/staging/production queues","Sidekiq performs best with short-lived jobs; anything over 30s should be chunked","When a Sidekiq job triggers a Turbo Stream broadcast (see lab-hotwire-streams), call ActionCable.server.broadcast directly from the worker rather than wrapping it in another job"]', '["Implement CircuitBreaker gem for external API failures","Use Sidekiq Limits for rate-limited third-party APIs","Add custom middleware for request ID propagation","Create a Sidekiq job that batches 500 CSV rows, tracks processed_count, and streams a progress bar via Turbo Stream after each batch completes","Write a dead letter queue consumer that retries jobs with a different strategy after 24 hours and logs the reason for permanent failure"]');

(End of file)