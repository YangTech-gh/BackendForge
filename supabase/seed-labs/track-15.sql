-- Track 15: Chaos Engineering (2 labs)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-litmus-chaos', 'track-15-chaos', 'Litmus Chaos Experiments', 50, 'Intermediate', false, 'Design and run chaos experiments with Litmus Chaos to validate system resilience under failure.', '["chaos/pod-delete.yaml":"apiVersion: litmuschaos.io/v1alpha1\nkind: ChaosEngine","chaos/network-latency.yaml":"apiVersion: litmuschaos.io/v1alpha1\nkind: ChaosEngine","chaos/experiment-runner.yaml":"# Experiment runner pod","scripts/chaos-dashboard.sh":"#!/bin/bash\nkubectl port-forward svc/litmus-frontend 8080:9091 -n litmus"]', '## Litmus Chaos Experiments

Design and run chaos experiments to validate system resilience.

### Objectives
- Design chaos experiments targeting specific failure modes
- Implement pod kill and network latency experiments
- Build steady-state hypothesis validation
- Create chaos engineering workflow with guardrails

### Requirements
1. Design pod-delete experiment with impact assessment
2. Implement network latency injection (100ms delay)
3. Build steady-state hypothesis: request latency stays under 200ms
4. Create experiment with auto-rollback on critical impact

`bash
kubectl apply -f chaos/
litmus experiment list -n litmus
`', '[{"id":"tc-1","description":"Pod-delete experiment kills and recovers pod within 60s","order":1,"required":true},{"id":"tc-2","description":"Network latency injection increases p99 by 100ms","order":2,"required":true},{"id":"tc-3","description":"Steady-state hypothesis validates system health post-experiment","order":3,"required":true},{"id":"tc-4","description":"Auto-rollback triggers when error rate exceeds 5%","order":4,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 5, "learningObjective": "Design chaos experiments with Litmus for resilience validation", "buildsToward": "Chaos-Resilient Production System"}', '["Always have a steady-state hypothesis before running experiments - without one, chaos is just destruction","Start with smallest blast radius: single pod, not entire AZ; grow radius only after validating hypothesis","Guardrails prevent experiments from causing real outages - set error rate and latency thresholds before execution","Cross-reference lab-istio-traffic: Istio circuit breakers should activate during chaos - validate the mesh response","Connect to lab-production-hardening: run chaos experiments as part of production readiness validation checklist"]', '["Chaos engineering is about building confidence, not breaking things - frame it as resilience validation for your team","Run experiments in production-like environments, not just dev - staging must mirror production topology","Automate experiments as part of CI/CD pipeline from lab-github-actions - periodic chaos prevents drift","The guardrail patterns here connect to lab-chaos-monkey: both need blast radius control and auto-rollback","For multi-tenant systems, use lab-consul-connect intentions to limit chaos scope to specific service chains"]', '["Implement chaos scoring for service resilience rating (0-100) based on experiment results and recovery time","Add automated remediation for common failure patterns - self-healing reduces MTTR dramatically","Use LitmusHub for pre-built experiment libraries instead of writing experiments from scratch","Build a pod-delete experiment that validates Argo Rollouts from lab-gitops-argocd handles failures during canary","Create a network partition experiment that tests Istio circuit breaker recovery from lab-istio-traffic"]'),

('lab-chaos-monkey', 'track-15-chaos', 'Chaos Monkey and Steady Hypothesis', 60, 'Advanced', false, 'Build a production chaos engineering platform with automated experiments, steady-state validation, and GameDay orchestration.', '["src/chaos/experiment-runner.go":"// Experiment execution engine","src/chaos/steady-state.go":"// Steady-state hypothesis validator","src/chaos/gameday/orchestrator.go":"// GameDay orchestration","src/chaos/guardrails/blast-radius.go":"// Blast radius control"]', '## Chaos Monkey and Steady Hypothesis

Build a production chaos engineering platform with automated experiments.

### Objectives
- Implement chaos experiments with Go-based runner
- Build steady-state hypothesis validation engine
- Design GameDay orchestration for team exercises
- Create guardrails for blast radius control

### Requirements
1. Build experiment runner supporting multiple failure types
2. Implement steady-state validator comparing before/after metrics
3. Create GameDay orchestrator with scheduling and notification
4. Design blast radius control (max 10% of instances)

`bash
go test ./chaos/...
chaos run experiment.json --guardrails
`', '[{"id":"tc-1","description":"Experiment runner supports pod, network, and CPU failures","order":1,"required":true},{"id":"tc-2","description":"Steady-state validator detects metric drift within 5 minutes","order":2,"required":true},{"id":"tc-3","description":"GameDay orchestrator runs 3 experiments in sequence","order":3,"required":true},{"id":"tc-4","description":"Blast radius control stops experiment at 10% threshold","order":4,"required":true}]', 2, '{"prerequisiteLabId": "lab-litmus-chaos", "stage": "Building", "estimatedHours": 7, "learningObjective": "Build a production chaos engineering platform with guardrails", "buildsToward": "Chaos-Resilient Production System"}', '["Chaos experiments must be automated - manual chaos does not scale across teams or environments","Steady-state is about user-facing metrics (latency, error rate, throughput), not infrastructure CPU or memory","GameDays build team muscle memory for incident response - practice under controlled conditions before real incidents","This builds on lab-litmus-chaos: the Go runner extends Litmus experiments with custom failure types","Connect to lab-rust-profiling: use flamegraphs during chaos to identify performance degradation in hot paths"]', '["Blast radius control is essential for production chaos - always cap affected instances before running experiments","Always have a rollback plan before starting experiments - auto-rollback within 30 seconds of threshold breach","Chaos engineering requires buy-in from the whole team - GameDays are the best way to build organizational confidence","For lab-production-hardening: chaos scores should be part of the production readiness checklist","Combine with lab-istio-traffic: use Istio fault injection as a complementary chaos technique at the mesh layer"]', '["Implement chaos score for services (0-100 resilience rating) based on recovery time and blast radius survived","Add automated remediation experiments for common failures - test that self-healing actually works under chaos","Use Chaos Toolkit for declarative experiment definitions - JSON-based experiments are version-controllable","Build a GameDay that tests the full stack: pod-delete, network partition, and database failover in sequence","Create a chaos dashboard that aggregates results across all experiments and tracks resilience score over time"]');
