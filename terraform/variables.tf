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
