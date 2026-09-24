resource "docker_image" "app" {
  name = "seahoers/mazeflix-frontend:${var.app_image_tag}"
}

resource "docker_container" "app1" {
  name  = "${var.name_prefix}-app-1"
  image = docker_image.app.image_id

  networks_advanced {
    name = docker_network.lab.name
  }
}

resource "docker_container" "app2" {
  name  = "${var.name_prefix}-app-2"
  image = docker_image.app.image_id

  networks_advanced {
    name = docker_network.lab.name
  }
}
