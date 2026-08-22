terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

variable "project_name" { type = string }
variable "environment" { type = string, default = "production" }

provider "aws" {
  region = "us-east-1"
}

output "vpc_id" { value = aws_vpc.main.id }
output "subnet_ids" { value = aws_subnet.private[*].id }

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = { Name = "${var.project_name}-vpc", Environment = var.environment }
}

resource "aws_subnet" "private" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  tags = { Name = "${var.project_name}-private-${count.index}" }
}

data "aws_availability_zones" "available" { state = "available" }
