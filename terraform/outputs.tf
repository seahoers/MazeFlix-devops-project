output "nginx_url" {
  description = "URL of the NGINX load balancer"
  value       = "http://localhost:${var.nginx_port}"
}

output "app_image" {
  description = "Docker Hub image used by the app containers"
  value       = docker_image.app.name
}

output "postgres_host" {
  description = "Hostname the backend can reach Postgres at, from within the Docker network"
  value       = "postgres"
}

output "postgres_port" {
  description = "Port Postgres listens on inside the Docker network"
  value       = 5432
}

output "postgres_db" {
  description = "Name of the provisioned Postgres database"
  value       = var.postgres_db
}
