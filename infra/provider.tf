# Terraform Configuration
# Specifies required providers and versions
terraform {
  required_providers {
    aws = {
      version = ">=4.9.0"
      source  = "hashicorp/aws"
    }
  }
}

# AWS Provider Configuration
# Configure the AWS Provider with default profile and region
provider "aws" {
  profile = "default"
  region  = "ca-central-1"
}