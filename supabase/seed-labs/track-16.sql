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
`', '[{"id":"tc-1","description":"Zero critical CVEs in dependency audit","order":1,"required":true},{"id":"tc-2","description":"System sustains 1000 RPS with p99 under 200ms","order":2,"required":true},{"id":"tc-3","description":"Alerts fire within 1 minute of threshold breach","order":3,"required":true},{"id":"tc-4","description":"Runbook covers deployment, rollback, and scaling procedures","order":4,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 5, "learningObjective": "Apply production hardening checklist before launch", "buildsToward": "Backend Forge Capstone"}', '["Security audit is not optional - use automated tools (npm audit, Trivy) plus manual review for logic flaws","Load testing must match production traffic patterns - use realistic user journeys, not just raw RPS numbers","Runbooks save hours during incidents - write them before you need them, not during the 3 AM page","Cross-reference lab-rust-profiling: use profiling tools to identify and fix hot paths before load testing","Connect to lab-litmus-chaos: run chaos experiments as part of hardening to validate resilience under failure"]', '["Production readiness is a checklist, not a feeling - document every requirement and verify each one","Observability gaps appear during incidents - set up logging, metrics, and tracing before launch","Every service needs a runbook - even the simple ones; new team members cannot read your mind at 3 AM","This lab ties together lab-github-actions (CI), lab-gitops-argocd (CD), and lab-istio-traffic (mesh) into a unified checklist","For lab-capstone-project: this hardening checklist is the foundation - the capstone executes it end-to-end"]', '["Implement canary deployments for gradual rollout - connects to lab-gitops-argocd Argo Rollouts","Add SLO monitoring with error budgets - define what uptime means for your specific service","Create incident response playbook with escalation paths, communication templates, and post-mortem process","Build a dependency update pipeline that runs security scans on every dependency change from Dependabot PRs","Implement a production readiness review process where each service must pass all checklist items before launch"]'),

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
`', '[{"id":"tc-1","description":"API handles auth, billing, and CRUD with zero critical bugs","order":1,"required":true},{"id":"tc-2","description":"OpenTelemetry traces span all service boundaries","order":2,"required":true},{"id":"tc-3","description":"ArgoCD deploys with canary rollout and auto-promotion","order":3,"required":true},{"id":"tc-4","description":"System survives pod-delete and network-latency chaos experiments","order":4,"required":true}]', 2, '{"prerequisiteLabId": "lab-production-hardening", "stage": "Building", "estimatedHours": 10, "learningObjective": "Integrate all skills into a production-ready full-stack API", "buildsToward": "Backend Forge Capstone"}', '["The capstone is about integration, not new concepts - every skill you learned connects here in a single cohesive system","Every previous lab contributes: API design (lab-axum-api), auth (lab-kong-plugins), deploy (lab-gitops-argocd), resilience (lab-litmus-chaos)","Focus on the deployment pipeline - that is where most teams struggle; the CI/CD from lab-github-actions must work end-to-end","Cross-reference all tracks: this is your portfolio piece - demonstrate mastery across API design, security, observability, and operations","The capstone validates lab-production-hardening: all checklist items should be implemented and verified here"]', '["Production systems are built in layers: code, infrastructure, observability, and incident response","CI/CD is not optional for production - automate everything from lab-github-actions matrix builds to lab-gitops-argocd deployment","Chaos testing proves your system works under stress - run experiments from lab-litmus-chaos and lab-chaos-monkey","Combine lab-istio-traffic or lab-consul-connect for service mesh if your architecture requires inter-service communication","For career impact: this capstone demonstrates production engineering skills that differentiate senior from mid-level engineers"]', '["Document architectural decisions for future team members - ADRs (Architecture Decision Records) capture the why behind choices","Implement cost monitoring for cloud resource usage - production systems need budget alerts, not just performance alerts","Create onboarding guide for new developers joining the project - they should be able to deploy on day one","Build a comprehensive monitoring dashboard that surfaces metrics from every layer: app, infrastructure, and business","Write a production readiness review document that maps every requirement from lab-production-hardening to implemented solutions"]') ON CONFLICT (id) DO NOTHING;