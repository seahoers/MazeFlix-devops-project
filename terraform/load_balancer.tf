resource "docker_image" "nginx" {
  name = "nginx:alpine"
}

resource "docker_container" "nginx" {
  name  = "${var.name_prefix}-nginx"
  image = docker_image.nginx.image_id

  ports {
    internal = 80
    external = var.nginx_port
  }

  networks_advanced {
    name = docker_network.lab.name
  }

  volumes {
    host_path      = abspath("${path.module}/nginx/nginx.conf")
    container_path = "/etc/nginx/nginx.conf"
    read_only      = true
  }

  # nginx.conf is a host bind-mount, so Terraform can't see its content change
  # on its own. This label forces the container to be recreated whenever the file changes.
  labels {
    label = "nginx-conf-hash"
    value = filemd5("${path.module}/nginx/nginx.conf")
  }

  depends_on = [
    docker_container.app1,
    docker_container.app2,
    docker_container.backend,
  ]
}
