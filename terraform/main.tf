terraform {
  required_version = ">= 1.6.0"

  # No path set here: actions/checkout's default `git clean -ffdx` would wipe
  # a state file kept inside the repo. CI supplies a path outside the
  # checkout via `-backend-config`; local runs use the default (./terraform.tfstate).
  backend "local" {}

  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "4.6.0"
    }
  }
}

provider "docker" {
}
