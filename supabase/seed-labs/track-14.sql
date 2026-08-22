-- Track 14: Service Mesh (2 labs)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-istio-traffic', 'track-14-service-mesh', 'Istio Traffic Management', 55, 'Intermediate', false, 'Configure Istio service mesh for traffic routing, circuit breaking, and mutual TLS with VirtualService and DestinationRule.', '["config/istio/virtual-service.yaml":"apiVersion: networking.istio.io/v1beta1\nkind: VirtualService","config/istio/destination-rule.yaml":"apiVersion: networking.istio.io/v1beta1\nkind: DestinationRule","config/istio/gateway.yaml":"apiVersion: networking.istio.io/v1beta1\nkind: Gateway","scripts/install-istio.sh":"#!/bin/bash\nistioctl install --set profile=default -y"]', '## Istio Traffic Management

Configure Istio for production traffic routing and security.

### Objectives
- Configure VirtualService for traffic splitting and routing
- Implement DestinationRule with circuit breaker and connection pools
- Enable mutual TLS across the mesh
- Design retry and timeout policies

### Requirements
1. Create VirtualService with 90/10 traffic split
2. Implement DestinationRule with outlier detection
3. Enable STRICT mutual TLS in PeerAuthentication
4. Configure retry (3 attempts) and timeout (5s) policies

`bash
istioctl analyze
kubectl get virtualservices -A
`', '[{"id":"tc-1","description":"90/10 traffic split works consistently across requests","order":1,"required":true},{"id":"tc-2","description":"Circuit breaker ejects unhealthy pods after 5 errors","order":2,"required":true},{"id":"tc-3","description":"mTLS enforced between all services in mesh","order":3,"required":true},{"id":"tc-4","description":"Timeout fires after 5s preventing hung requests","order":4,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 5, "learningObjective": "Configure Istio traffic management and mutual TLS", "buildsToward": "Multi-Tenant SaaS Platform"}', '["VirtualService defines WHERE traffic goes, DestinationRule defines HOW it gets there - separate routing from connection policy","mTLS encrypts all mesh traffic without application changes; start with PERMISSIVE mode then switch to STRICT after all sidecars are injected","Circuit breaking prevents cascade failures across services - connect this to lab-envoy-filters where you implement circuit breaking at the filter level","Cross-reference lab-gitops-argocd: VirtualService and DestinationRule are deployed via ArgoCD - use sync waves to order Istio resources correctly","This lab builds the traffic foundation that lab-litmus-chaos experiments validate - chaos tests confirm circuit breakers actually work"]', '["Istio adds ~3ms latency per hop - measure before adopting; for simple use cases, Kong (lab-kong-plugins) may be sufficient","Envoy sidecar uses ~50MB memory per pod - budget for this overhead in cluster capacity planning","istioctl analyze catches misconfiguration before deployment - run it in CI pipeline from lab-github-actions","Combine with lab-consul-connect: evaluate Istio vs Consul for your team size and complexity requirements","For multi-tenant deployments, use Istio namespace isolation with lab-consul-connect intentions patterns"]', '["Use Istio for complex traffic management needs only - if you only need simple proxying, consider Kong or Envoy standalone","Implement fault injection (HTTP 500, delays) for chaos testing - validates resilience before lab-litmus-chaos experiments","Add Kiali for mesh visualization and debugging - understand traffic flow visually before writing more complex VirtualServices","Build a VirtualService that implements header-based routing for A/B testing across service versions","Create a PeerAuthentication policy that transitions from PERMISSIVE to STRICT incrementally across namespaces"]'),

('lab-consul-connect', 'track-14-service-mesh', 'Consul Service Mesh and Intention', 60, 'Advanced', false, 'Build Consul service mesh with intentions, service defaults, and transparent proxy for zero-trust networking.', '["config/consul/service-defaults.hcl":"service_defaults \\"api\\" {\n  protocol = \\"http\\"\n  mesh_gateway = {}\n}","config/consul/intention.hcl":"intentions {\n  source      = \\"web\\"\n  destination = \\"api\\"\n  action      = \\"allow\\"\n}","config/consul/proxy-defaults.hcl":"proxy_defaults {\n  mode = \\"transparent\\"\n}","scripts/consul-join.sh":"#!/bin/bash\nconsul agent -bind=0.0.0.0 -client=0.0.0.0 -retry-join=consul-server"]', '## Consul Service Mesh and Intention

Build zero-trust service mesh with Consul intentions and transparent proxy.

### Objectives
- Configure Consul service mesh with transparent proxy
- Implement service intentions for zero-trust security
- Design service defaults for protocol-specific settings
- Build health checks and service discovery

### Requirements
1. Enable transparent proxy for sidecar-less mesh
2. Create intentions allowing web then api then database chain
3. Configure service defaults for HTTP and gRPC protocols
4. Implement service-specific health checks

`bash
consul intention list
consul catalog services
`', '[{"id":"tc-1","description":"Transparent proxy intercepts all traffic without app changes","order":1,"required":true},{"id":"tc-2","description":"Intention denies web-to-database direct access","order":2,"required":true},{"id":"tc-3","description":"Service defaults configure correct protocol for each service","order":3,"required":true},{"id":"tc-4","description":"Health checks mark unhealthy services as critical","order":4,"required":true}]', 2, '{"prerequisiteLabId": "lab-istio-traffic", "stage": "Building", "estimatedHours": 7, "learningObjective": "Build zero-trust service mesh with Consul intentions", "buildsToward": "Multi-Tenant SaaS Platform"}', '["Intentions are the core of Consul security - deny by default and explicitly allow only required communication paths","Transparent proxy simplifies adoption - no application changes required; compare this to Istio sidecar injection from lab-istio-traffic","Service discovery is Consul superpower - combine with mesh for automatic routing to healthy instances","Cross-reference lab-kong-plugins: Consul service discovery can feed upstream targets to Kong for hybrid gateway plus mesh setups","Connect to lab-production-hardening: Consul health checks integrate with alerting for proactive incident detection"]', '["Consul is simpler than Istio but less feature-rich - choose based on your traffic management complexity needs","Intentions can be exported across data centers for multi-DC service mesh - critical for disaster recovery","Consul KV store is useful for feature flags and configuration - reduces the need for separate config services","For lab-gitops-argocd: deploy Consul configurations via ArgoCD to maintain Git-as-source-of-truth for mesh policy","Combine with lab-litmus-chaos: use Consul intentions to simulate network partitions for chaos experiments"]', '["Implement Consul Template for dynamic configuration - services can reload config without restart","Add Consul-ESM for external service monitoring - extends mesh to non-Kubernetes workloads","Use Consul for DNS-based service discovery alongside mesh - enables legacy service integration","Build an intention hierarchy that implements the principle of least privilege for a three-tier web application","Create a Consul service resolver that implements weighted load balancing across data centers"]');
