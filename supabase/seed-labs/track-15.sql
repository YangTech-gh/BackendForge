-- Track 15: Chaos Engineering (2 labs)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-litmus-chaos', 'track-15-chaos', 'Litmus Chaos Experiments', 50, 'Intermediate', false, 'Design and run chaos experiments with Litmus Chaos to validate system resilience under failure.', '["chaos/pod-delete.yaml":"apiVersion: litmuschaos.io/v1alpha1\nkind: ChaosEngine","chaos/network-latency.yaml":"apiVersion: litmuschaos.io/v1alpha1\nkind: ChaosEngine","chaos/experiment-runner.yaml":"# Experiment runner pod","scripts/chaos-dashboard.sh":"#!/bin/bash\nkubectl port-forward svc/litmus-frontend 8080:9091 -n litmus"}', '## Litmus Chaos Experiments

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
`', '[{"id":"tc-1","description":"Pod-delete experiment kills and recovers pod within 60s","order":1,"required":true},{"id":"tc-2","description":"Network latency injection increases p99 by 100ms","order":2,"required":true},{"id":"tc-3","description":"Steady-state hypothesis validates system health post-experiment","order":3,"required":true},{"id":"tc-4","description":"Auto-rollback triggers when error rate exceeds 5%","order":4,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 5, "learningObjective": "Design chaos experiments with Litmus for resilience validation", "buildsToward": "Chaos-Resilient Production System"}', '["Always have a steady-state hypothesis before running experiments","Start with smallest blast radius - single pod, not entire AZ","Guardrails prevent experiments from causing real outages"]', '["Chaos engineering is about building confidence, not breaking things","Run experiments in production-like environments, not just dev","Automate experiments as part of CI/CD pipeline"]', '["Implement chaos scoring for service resilience rating","Add automated remediation for common failure patterns","Use LitmusHub for pre-built experiment libraries"]'),

('lab-chaos-monkey', 'track-15-chaos', 'Chaos Monkey & Steady Hypothesis', 60, 'Advanced', false, 'Build a production chaos engineering platform with automated experiments, steady-state validation, and GameDay orchestration.', '["src/chaos/experiment-runner.go":"// Experiment execution engine","src/chaos/steady-state.go":"// Steady-state hypothesis validator","src/chaos/gameday/orchestrator.go":"// GameDay orchestration","src/chaos/guardrails/blast-radius.go":"// Blast radius control"}', '## Chaos Monkey & Steady Hypothesis

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
`', '[{"id":"tc-1","description":"Experiment runner supports pod, network, and CPU failures","order":1,"required":true},{"id":"tc-2","description":"Steady-state validator detects metric drift within 5 minutes","order":2,"required":true},{"id":"tc-3","description":"GameDay orchestrator runs 3 experiments in sequence","order":3,"required":true},{"id":"tc-4","description":"Blast radius control stops experiment at 10% threshold","order":4,"required":true}]', 2, '{"prerequisiteLabId": "lab-litmus-chaos", "stage": "Building", "estimatedHours": 7, "learningObjective": "Build a production chaos engineering platform with guardrails", "buildsToward": "Chaos-Resilient Production System"}', '["Chaos experiments must be automated - manual chaos does not scale","Steady-state is about user-facing metrics, not infrastructure","GameDays build team muscle memory for incident response"]', '["Blast radius control is essential for production chaos","Always have a rollback plan before starting experiments","Chaos engineering requires buy-in from the whole team"]', '["Implement chaos score for services (0-100 resilience rating)","Add automated remediation experiments for common failures","Use Chaos Toolkit for declarative experiment definitions"]');
