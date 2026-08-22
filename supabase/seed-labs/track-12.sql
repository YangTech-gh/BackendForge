-- Track 12: CI/CD Pipelines (2 labs)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-github-actions', 'track-12-cicd', 'GitHub Actions Matrix Builds', 45, 'Intermediate', false, 'Design GitHub Actions workflows with matrix builds, caching, and reusable workflows for multi-service repositories.', '[".github/workflows/ci.yml":"name: CI\non: [push, pull_request]",".github/workflows/reusable-deploy.yml":"name: Reusable Deploy\non:\n  workflow_call:",".github/actions/setup/action.yml":"name: Setup\nruns:\n  using: composite","scripts/test-matrix.sh":"#!/bin/bash\nfor service in api web worker; do\n  echo \"Testing $service\"\ndone"}', '## GitHub Actions Matrix Builds

Design production CI/CD with matrix strategies and reusable workflows.

### Objectives
- Build matrix build strategies for multi-language repositories
- Implement reusable workflows for shared CI steps
- Design caching strategies for dependencies and build artifacts
- Create composite actions for common setup tasks

### Requirements
1. Matrix build across Node.js 20/22 and Go 1.22/1.23
2. Reusable workflow for deploy with environment inputs
3. Cache node_modules and Go modules with proper keys
4. Composite action for shared setup (checkout, install, lint)

`bash
act -l  # List workflows
act -j ci  # Run CI job locally
`', '[{"id":"tc-1","description":"Matrix builds run in parallel for all version combinations","order":1,"required":true},{"id":"tc-2","description":"Reusable workflow accepts inputs and produces outputs","order":2,"required":true},{"id":"tc-3","description":"Cache hit skips dependency installation","order":3,"required":true},{"id":"tc-4","description":"Composite action works across all matrix combinations","order":4,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 4, "learningObjective": "Build matrix CI/CD pipelines with reusable workflows and caching", "buildsToward": "GitOps Deployment Pipeline"}', '["Matrix builds are powerful but expensive - use fail-fast: true to stop on first failure across all combinations","Reusable workflows reduce duplication across services but have limitations: max 4 levels of nesting, secrets must be passed explicitly","Cache keys must include lockfile hashes (package-lock.json, go.sum) for correct invalidation - stale caches cause subtle bugs","Cross-reference lab-gitops-argocd: this CI pipeline produces artifacts that ArgoCD deploys; ensure image tags are consistent","Connect to lab-production-hardening: CI should run security scanning (npm audit, gosec) before merge to main"]', '["GitHub Actions is free for public repos - leverage it for open source projects to reduce infrastructure costs","Composite actions are reusable but cannot use workflow_call - they run in the caller workflow context directly","Dependabot can update workflow actions automatically - pin actions by SHA, not tag, for reproducibility","The caching strategy here builds on patterns from lab-rust-profiling: Cargo target directories benefit from aggressive caching","Align matrix combinations with lab-production-hardening requirements: test against production-relevant version combos"]', '["Implement branch protection rules requiring all matrix jobs to pass before merge to main","Add CodeQL security scanning as a separate workflow that runs on PR and scheduled weekly","Use GitHub Environments with protection rules for deploy approvals - connects to lab-gitops-argocd promote flow","Build a reusable workflow for running chaos experiments (lab-litmus-chaos) as part of CI smoke tests","Create a composite action for setting up Rust toolchain that caches cargo artifacts across matrix builds"]'),

('lab-gitops-argocd', 'track-12-cicd', 'GitOps with ArgoCD', 60, 'Advanced', false, 'Implement GitOps deployment with ArgoCD, ApplicationSets, and progressive delivery with Argo Rollouts.', '["argocd/application.yaml":"apiVersion: argoproj.io/v1alpha1\nkind: Application","argocd/applicationset.yaml":"apiVersion: argoproj.io/v1alpha1\nkind: ApplicationSet","argocd/rollout.yaml":"apiVersion: argoproj.io/v1alpha1\nkind: Rollout","argocd-project.yaml":"apiVersion: argoproj.io/v1alpha1\nkind: AppProject"}', '## GitOps with ArgoCD

Implement GitOps deployment with ArgoCD and progressive delivery.

### Objectives
- Deploy applications with ArgoCD from Git repositories
- Use ApplicationSets for multi-environment management
- Implement canary deployments with Argo Rollouts
- Design RBAC and project isolation for multi-team setups

### Requirements
1. Create ArgoCD Application pointing to Helm chart
2. Build ApplicationSet generating per-environment apps
3. Implement canary rollout with 10% → 50% → 100% promotion
4. Configure AppProject with source and destination restrictions

`bash
argocd app sync my-app
kubectl get rollouts -n default
`', '[{"id":"tc-1","description":"ArgoCD syncs application from Git within 3 minutes","order":1,"required":true},{"id":"tc-2","description":"ApplicationSet generates correct apps for all environments","order":2,"required":true},{"id":"tc-3","description":"Canary rollout pauses at 10% for analysis","order":3,"required":true},{"id":"tc-4","description":"AppProject prevents deployment to restricted namespaces","order":4,"required":true}]', 2, '{"prerequisiteLabId": "lab-github-actions", "stage": "Building", "estimatedHours": 7, "learningObjective": "Implement GitOps with ArgoCD and progressive delivery", "buildsToward": "GitOps Deployment Pipeline"}', '["GitOps means Git is the source of truth - never kubectl apply manually in production; let ArgoCD reconcile","ApplicationSets scale management across environments using generators (list, git, cluster) - avoid per-env YAML files","Argo Rollouts provide built-in canary and blue-green deployments; connect with lab-istio-traffic for traffic-weighted routing","This builds on lab-github-actions: CI produces the image, ArgoCD deploys it - ensure the image tag flows correctly","For production, combine with lab-consul-connect: service discovery ensures new canary pods are registered before traffic shifts"]', '["ArgoCD is declarative - your Git state IS the desired state; drift detection alerts when cluster diverges","ApplicationSet generators reduce boilerplate for multi-env setups; list generator is simplest, git generator for file-per-env","Progressive delivery reduces risk of bad deployments; auto-promotion with analysis prevents manual bottlenecks","Cross-reference lab-litmus-chaos: inject chaos during canary rollout to validate resilience under progressive delivery","Connect to lab-production-hardening: ArgoCD health checks and sync waves enforce deployment ordering"]', '["Implement ArgoCD Notifications for Slack/Teams alerts on sync failures - integrates with lab-production-hardening runbook","Use ArgoCD Image Updater for automated image updates based on semantic versioning or regex patterns","Add ArgoCD Vault Plugin for secret management - avoids hardcoding secrets in Git manifests","Build an ApplicationSet using cluster generator for multi-cluster deployments across staging and production","Create a custom ArgoCD health check for custom resources (e.g., Argo Rollouts) to show correct sync status"]');