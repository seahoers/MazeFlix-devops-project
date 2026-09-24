output "nginx_url" {
  description = "URL of the NGINX load balancer"
  value       = "http://localhost:${var.nginx_port}"
}

output "app_image" {
  description = "Docker Hub image used by the app containers"
  value       = docker_image.app.name
}
