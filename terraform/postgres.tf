resource "docker_volume" "postgres_data" {
  name = "${var.name_prefix}-postgres-data"
}

resource "docker_image" "postgres" {
  name = "postgres:16-alpine"
}

resource "docker_container" "postgres" {
  name  = "${var.name_prefix}-postgres"
  image = docker_image.postgres.image_id

  env = [
    "POSTGRES_DB=${var.postgres_db}",
    "POSTGRES_USER=${var.postgres_user}",
    "POSTGRES_PASSWORD=${var.postgres_password}",
  ]

  networks_advanced {
    name    = docker_network.lab.name
    aliases = ["postgres"]
  }

  volumes {
    volume_name    = docker_volume.postgres_data.name
    container_path = "/var/lib/postgresql/data"
  }

  dynamic "ports" {
    for_each = var.postgres_port == null ? [] : [var.postgres_port]
    content {
      internal = 5432
      external = ports.value
      ip       = "127.0.0.1"
    }
  }

  healthcheck {
    test     = ["CMD-SHELL", "pg_isready -U ${var.postgres_user} -d ${var.postgres_db}"]
    interval = "5s"
    timeout  = "3s"
    retries  = 5
  }

  wait         = true
  wait_timeout = 60
}
