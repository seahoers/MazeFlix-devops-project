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

  depends_on = [
    docker_container.app1,
    docker_container.app2
  ]
}
