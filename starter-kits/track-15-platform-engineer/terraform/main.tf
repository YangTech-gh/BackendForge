terraform {
  required_version = ">= 1.5"
  required_providers { aws = { source = "hashicorp/aws", version = "~> 5.0" } }
}

module "vpc" {
  source       = "./modules/vpc"
  project_name = var.project_name
  environment  = var.environment
}

variable "project_name" { type = string }
variable "environment" { type = string, default = "production" }

output "vpc_id" { value = module.vpc.vpc_id }
