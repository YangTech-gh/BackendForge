-- Track 19: Feature Flags & Progressive Delivery (2 labs)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-feature-flags', 'track-19-feature-flags', 'Feature Flags with Unleash/OpenFeature', 50, 'Intermediate', false, 'Implement feature flags with Unleash for gradual rollouts, kill switches, and A/B testing.', '{}', '## Feature Flags with Unleash/OpenFeature

Implement feature flags for safe, incremental feature rollouts.

### Objectives
- Set up Unleash for self-hosted feature flag management
- Implement boolean, percentage, and user-segment flags
- Build kill switches for critical features
- Design flag lifecycle management

### Requirements
1. Deploy Unleash with Docker Compose
2. Implement feature flags in application code
3. Build percentage-based gradual rollout (10% -> 50% -> 100%)
4. Create kill switch pattern for emergency shutoff

`bash
docker compose up -d unleash
npm run test
`', '[{"id":"tc-1","description":"Feature flag returns correct value for different user segments","order":1,"required":true},{"id":"tc-2","description":"Percentage rollout distributes traffic within 5% of target","order":2,"required":true},{"id":"tc-3","description":"Kill switch immediately disables feature for all users","order":3,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 5, "learningObjective": "Implement feature flags for gradual rollouts and kill switches", "buildsToward": "Production Feature Management"}', '["Feature flags are technical debt - plan for cleanup","Boolean flags are simplest but percentage flags are most useful","Kill switches should be instant - do not rely on cache TTL","Feature flag SDKs cache responses - set short polling intervals for kill switches","Tag flags with ownership and expiration to prevent orphaned flags"]', '["Unleash is open-source and self-hostable - prefer over SaaS for control","OpenFeature is the vendor-neutral standard for feature flags","Always log flag evaluations for debugging and audit","Percentage rollouts should be user-based, not request-based, to avoid flickering","Flag evaluation should be synchronous and fast - avoid network calls per evaluation"]', '["Implement flag aging to detect unused flags","Use environment-specific flags for dev/staging/prod parity","Build a flag dashboard for non-engineering stakeholders","Write integration tests that cover both flag states","Set up alerts for kill switch activation events"]'),
('lab-ab-testing', 'track-19-feature-flags', 'A/B Testing and Progressive Rollout', 55, 'Advanced', false, 'Design A/B experiments with statistical significance, gradual rollouts, and automated rollback.', '{}', '## A/B Testing and Progressive Rollout

Design controlled experiments with feature flags for data-driven decisions.

### Objectives
- Design A/B experiments with clear hypothesis and metrics
- Implement statistical significance testing
- Build automated rollback on metric degradation
- Create gradual rollout pipeline (canary -> percentage -> full)

### Requirements
1. Implement A/B test assignment with consistent hashing
2. Track conversion metrics per variant
3. Build automated rollback when error rate increases
4. Create a rollout pipeline with approval gates

`bash
npm run test
npm run test:experiments
`', '[{"id":"tc-1","description":"A/B assignment is consistent for same user across sessions","order":1,"required":true},{"id":"tc-2","description":"Statistical significance calculator correctly identifies winners","order":2,"required":true},{"id":"tc-3","description":"Automated rollback triggers within 5 minutes of degradation","order":3,"required":true}]', 2, '{"prerequisiteLabId": "lab-feature-flags", "stage": "Building", "estimatedHours": 6, "learningObjective": "Design A/B experiments with statistical rigor and automated rollback", "buildsToward": "Production Feature Management"}', '["Consistent hashing ensures same user always gets same variant","Statistical significance requires sufficient sample size - do not end early","Automated rollback is more reliable than human judgment under pressure","Mutual exclusivity prevents metric contamination across experiments","Always define guardrail metrics before launching an experiment"]', '["A/B testing is not just for UI - test API behavior changes too","Guardrail metrics prevent optimizing one metric at the expense of others","Feature flags enable trunk-based development with safe deployments","Novelty effects can skew short experiments - run for at least one full business cycle","Bayesian approaches give probability distributions instead of binary p-values"]', '["Implement multi-armed bandit for dynamic traffic allocation","Use Bayesian statistics for faster significance detection","Build experiment dashboards for stakeholders","Document experiment hypotheses, results, and decisions in a shared log","Combine feature flags from lab-feature-flags with statistical analysis for full progressive delivery"]')
