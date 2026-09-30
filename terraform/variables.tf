variable "name_prefix" {
  description = "Prefix applied to all Docker resource names, so parallel stacks (e.g. terraform test runs) don't collide"
  type        = string
  default     = "mazeflix-lab"
}

variable "nginx_port" {
  description = "NGINX load balancer host port"
  type        = number
  default     = 8080
}

variable "app_image_tag" {
  description = "Tag of the seahoers/mazeflix-frontend image (from Docker Hub) to run"
  type        = string
  default     = "sha-76009ff"
}

variable "postgres_db" {
  description = "Name of the database the backend's data is stored in"
  type        = string
  default     = "mazeflix"
}

variable "postgres_user" {
  description = "Postgres user the backend connects as"
  type        = string
  default     = "mazeflix"
}

variable "postgres_password" {
  description = "Password for the Postgres user. Must be supplied via TF_VAR_postgres_password."
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.postgres_password) > 0
    error_message = "postgres_password must not be empty. Set TF_VAR_postgres_password."
  }
}

variable "postgres_port" {
  description = "Host port to map to Postgres' internal port 5432 for local access."
  type        = number
  default     = 5433
}
