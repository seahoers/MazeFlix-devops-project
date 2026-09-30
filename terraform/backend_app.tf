resource "docker_image" "backend" {
  name = "seahoers/mazeflix-backend:${var.backend_image_tag}"
}

resource "docker_container" "backend" {
  name  = "${var.name_prefix}-backend"
  image = docker_image.backend.image_id

  env = [
    "DATABASE_URL=postgresql://${var.postgres_user}:${var.postgres_password}@postgres:5432/${var.postgres_db}",
    "PORT=3000",
    "COOKIE_SECURE=false",
  ]

  restart = "on-failure"

  networks_advanced {
    name    = docker_network.lab.name
    aliases = ["backend"]
  }

  healthcheck {
    test     = ["CMD-SHELL", "wget -qO- http://localhost:3000/api/health || exit 1"]
    interval = "5s"
    timeout  = "3s"
    retries  = 5
  }

  depends_on = [docker_container.postgres]
}
