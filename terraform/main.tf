terraform {
  required_version = ">= 1.0.0"
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.2"
    }
  }
}

provider "docker" {}

# 1. Shared Network
resource "docker_network" "foodloop_net" {
  name = var.docker_network_name
}

# 2. MongoDB Volume
resource "docker_volume" "mongo_data" {
  name = "foodloop-mongodb-data"
}

# 3. MongoDB Container
resource "docker_container" "mongodb" {
  name  = "foodloop-mongodb"
  image = "mongo:7.0"
  restart = "always"

  networks_advanced {
    name = docker_network.foodloop_net.name
  }

  volumes {
    volume_name    = docker_volume.mongo_data.name
    container_path = "/data/db"
  }

  ports {
    internal = 27017
    external = var.mongo_port
  }
}

# 4. API Gateway Container
resource "docker_container" "api_gateway" {
  name  = "foodloop-gateway"
  image = "foodloop-gateway:latest"
  restart = "always"

  networks_advanced {
    name = docker_network.foodloop_net.name
  }

  env = [
    "PORT=4000",
    "AUTH_SERVICE_URL=http://foodloop-auth:4001",
    "CORE_SERVICE_URL=http://foodloop-core:4002",
    "AI_SERVICE_URL=http://foodloop-ai:5000",
    "CLIENT_URL=http://localhost:80"
  ]

  ports {
    internal = 4000
    external = var.gateway_port
  }

  depends_on = [
    docker_container.mongodb
  ]
}

# 5. React Frontend Container
resource "docker_container" "frontend" {
  name  = "foodloop-frontend"
  image = "foodloop-frontend:latest"
  restart = "always"

  networks_advanced {
    name = docker_network.foodloop_net.name
  }

  ports {
    internal = 80
    external = var.frontend_port
  }

  depends_on = [
    docker_container.api_gateway
  ]
}
