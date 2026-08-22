-- Track 9: Infrastructure as Code (2 labs)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-terraform-modules', 'track-9-infra-code', 'Terraform Module Composition', 50, 'Intermediate', false, 'Build reusable Terraform modules with state management, workspaces, and terragrunt for multi-environment deployment.', '{"modules/vpc/main.tf":"resource \"aws_vpc\" \"main\" {\n  cidr_block = var.cidr_block\n}","modules/vpc/variables.tf":"variable \"cidr_block\" {\n  type = string\n}","environments/dev/terragrunt.hcl":"include \"root\" {\n  path = find_in_parent_folders()\n}","environments/prod/terragrunt.hcl":"include \"root\" {\n  path = find_in_parent_folders()\n}"}', '## Terraform Module Composition

Build reusable infrastructure modules with proper state management.

### Objectives
- Create composable Terraform modules for VPC, ECS, and RDS
- Implement remote state management with S3 backend
- Use Terragrunt for multi-environment configuration
- Design module versioning and dependency management

### Requirements
1. Build VPC module with public/private subnets and NAT
2. Create ECS module with service discovery and auto-scaling
3. Configure remote state with S3 + DynamoDB locking
4. Use Terragrunt to DRY up multi-environment configs

`bash
terraform init
terraform plan -var-file=environments/dev/terraform.tfvars
`', '[{"id":"tc-1","description":"Module creates VPC with correct CIDR and subnets","order":1,"required":true},{"id":"tc-2","description":"ECS service registers with Cloud Map service discovery","order":2,"required":true},{"id":"tc-3","description":"State file stored in S3 with DynamoDB lock","order":3,"required":true},{"id":"tc-4","description":"Dev and prod environments share module source","order":4,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 5, "learningObjective": "Build composable Terraform modules with remote state and Terragrunt", "buildsToward": "Multi-Region Kubernetes Deployment"}', '["Modules should be stateless - all config via variables","Remote state is mandatory for team collaboration","Use workspaces or Terragrunt for environment separation"]', '["Terraform plan is your safety net - always review before apply","Pin module versions to prevent breaking changes","Use terraform import for existing resources"]', '["Implement Terraform Cloud for drift detection","Add Sentinel policies for compliance","Use Spacelift for Terraform CI/CD with policy-as-code"]'),

('lab-k8s-operator', 'track-9-infra-code', 'Kubernetes Custom Operator', 65, 'Advanced', false, 'Build a Kubernetes operator with CRDs, controllers, and reconciliation loops using the operator-sdk.', '{"api/v1/scheduledbackup_types.go":"type ScheduledBackupSpec struct {\n  Schedule string `json:\"schedule\"`\n  Target   string `json:\"target\"`\n}","internal/controller/scheduledbackup_controller.go":"// Reconciliation loop","config/crd/bases/forge.dev_scheduledbackups.yaml":"// CRD definition","cmd/manager/main.go":"// Controller-runtime main"}', '## Kubernetes Custom Operator

Build a production Kubernetes operator with CRDs and reconciliation loops.

### Objectives
- Define Custom Resource Definitions (CRDs) with API validation
- Implement reconciliation loops with controller-runtime
- Build status conditions and observed generation tracking
- Design leader election for HA controller deployment

### Requirements
1. Create CRD for ScheduledBackup with schedule and target fields
2. Implement reconciliation loop that creates CronJobs
3. Add status conditions (Ready, Progressing, Degraded)
4. Implement leader election for HA deployment

`bash
make generate
make manifests
go test ./...
`', '[{"id":"tc-1","description":"CRD validates schedule field as valid cron expression","order":1,"required":true},{"id":"tc-2","description":"Controller creates CronJob matching ScheduledBackup spec","order":2,"required":true},{"id":"tc-3","description":"Status conditions reflect current reconciliation state","order":3,"required":true},{"id":"tc-4","description":"Leader election prevents duplicate reconciliation","order":4,"required":true}]', 2, '{"prerequisiteLabId": "lab-terraform-modules", "stage": "Building", "estimatedHours": 8, "learningObjective": "Build Kubernetes operators with CRDs and reconciliation loops", "buildsToward": "Multi-Region Kubernetes Deployment"}', '["Controllers should be idempotent - reconcile until desired state","Use controller-runtime for standard patterns","Status conditions follow the Kubernetes condition convention"]', '["Kubernetes operators are for custom resources, not standard workloads","Reconciliation is level-triggered, not edge-triggered","Always handle the deleted timestamp for cleanup"]', '["Use kubebuilder for scaffolding operator projects","Implement webhooks for admission validation","Add metrics with controller-runtime metrics package"]');
