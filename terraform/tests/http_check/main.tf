terraform {
  required_providers {
    http = {
      source  = "hashicorp/http"
      version = "3.6.1"
    }
  }
}

variable "endpoint" {
  description = "URL to probe after the infrastructure has been applied"
  type        = string
}

data "http" "nginx" {
  url                = var.endpoint
  request_timeout_ms = 5000

  retry {
    attempts     = 5
    min_delay_ms = 500
    max_delay_ms = 1000
  }
}
