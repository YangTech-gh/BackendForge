-- Track 16: Final Capstone (2 labs)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-production-hardening', 'track-16-capstone', 'Production Hardening Checklist', 55, 'Intermediate', false, 'Apply production hardening: security audit, performance tuning, observability setup, and runbook creation.', '{"docs/runbook.md":"# Production Runbook\n\n## Deployment\n1. Run tests\n2. Build artifacts\n3. Deploy to staging\n4. Verify health checks\n5. Deploy to production","docs/security-checklist.md":"# Security Audit\n- [ ] Secrets rotated\n- [ ] Dependencies patched\n- [ ] RBAC reviewed","scripts/health-check.sh":"#!/bin/bash\ncurl -sf http://localhost:8080/health || exit 1","config/production.env":"# Production environment variables"}', '## Production Hardening Checklist

Apply comprehensive production hardening before launch.

### Objectives
- Perform security audit of dependencies and configuration
- Optimize performance with profiling and load testing
- Set up comprehensive observability stack
- Create runbooks for common operational scenarios

### Requirements
1. Audit dependencies for known CVEs
2. Load test: sustain 1000 RPS for 30 minutes
3. Set up alerts for error rate, latency, and saturation
4. Create runbook for top-5 incident scenarios

`bash
npm audit
npm run test:load
`', '[{"id":"tc-1","description":"Zero critical CVEs in dependency audit","order":1,"required":true},{"id":"tc-2","description":"System sustains 1000 RPS with p99 under 200ms","order":2,"required":true},{"id":"tc-3","description":"Alerts fire within 1 minute of threshold breach","order":3,"required":true},{"id":"tc-4","description":"Runbook covers deployment, rollback, and scaling procedures","order":4,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 5, "learningObjective": "Apply production hardening checklist before launch", "buildsToward": "Backend Forge Capstone"}', '["Security audit is not optional - use automated tools + manual review","Load testing must match production traffic patterns","Runbooks save hours during incidents - write them before you need them"]', '["Production readiness is a checklist, not a feeling","Observability gaps appear during incidents - set up before launch","Every service needs a runbook - even the simple ones"]', '["Implement canary deployments for gradual rollout","Add SLO monitoring with error budgets","Create incident response playbook with escalation paths"]'),

('lab-capstone-project', 'track-16-capstone', 'Backend Forge Capstone: Full-Stack Production API', 90, 'Staff', true, 'Build and deploy a production API combining all skills: auth, billing, observability, CI/CD, and chaos testing.', '{"src/index.ts":"import express from ''express'';","src/auth/middleware.ts":"// Auth middleware","src/billing/checkout.ts":"// Stripe checkout","src/observability/tracing.ts":"// OpenTelemetry setup",".github/workflows/deploy.yml":"# Production deploy","k8s/deployment.yaml":"apiVersion: apps/v1\nkind: Deployment"}', '## Backend Forge Capstone

Build and deploy a production API combining all learned skills.

### Objectives
- Implement complete API with authentication, billing, and webhooks
- Set up OpenTelemetry tracing and Prometheus metrics
- Deploy to Kubernetes with ArgoCD and canary releases
- Run chaos experiments and validate resilience

### Requirements
1. Build Express API with OAuth2 PKCE authentication
2. Implement Stripe billing with metered subscriptions
3. Deploy to K8s with ArgoCD and canary rollout
4. Run 3 chaos experiments validating resilience

`bash
npm run test
npm run test:integration
kubectl apply -f k8s/
`', '[{"id":"tc-1","description":"API handles auth, billing, and CRUD with zero critical bugs","order":1,"required":true},{"id":"tc-2","description":"OpenTelemetry traces span all service boundaries","order":2,"required":true},{"id":"tc-3","description":"ArgoCD deploys with canary rollout and auto-promotion","order":3,"required":true},{"id":"tc-4","description":"System survives pod-delete and network-latency chaos experiments","order":4,"required":true}]', 2, '{"prerequisiteLabId": "lab-production-hardening", "stage": "Building", "estimatedHours": 10, "learningObjective": "Integrate all skills into a production-ready full-stack API", "buildsToward": "Backend Forge Capstone"}', '["The capstone is about integration, not new concepts","Every skill you learned connects here - API design, auth, billing, deploy","Focus on the deployment pipeline - that is where most teams struggle"]', '["Production systems are built in layers: code, infra, observability","CI/CD is not optional for production - automate everything","Chaos testing proves your system works under stress"]', '["Document architectural decisions for future team members","Implement cost monitoring for cloud resource usage","Create onboarding guide for new developers joining the project"]');
