variables {
  name_prefix = "terraform-test-infrastructure"
  nginx_port  = 18080
}

run "infrastructure" {
  command = apply

  assert {
    condition     = docker_network.lab.name == var.name_prefix
    error_message = "Docker network was not created correctly."
  }

  assert {
    condition     = docker_container.app1.name == "${var.name_prefix}-app-1"
    error_message = "Application container 1 was not created correctly."
  }

  assert {
    condition     = docker_container.app2.name == "${var.name_prefix}-app-2"
    error_message = "Application container 2 was not created correctly."
  }

  assert {
    condition     = docker_container.nginx.name == "${var.name_prefix}-nginx"
    error_message = "NGINX container was not created correctly."
  }
}

run "nginx_is_reachable" {
  command = plan

  module {
    source = "./tests/http_check"
  }

  variables {
    endpoint = run.infrastructure.nginx_url
  }

  assert {
    condition     = data.http.nginx.status_code == 200
    error_message = "NGINX did not respond with HTTP 200."
  }
}
