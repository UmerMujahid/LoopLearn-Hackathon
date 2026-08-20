variable "environment" {
  type        = string
  description = "Deployment environment name"
  default     = "production"
}

variable "docker_network_name" {
  type        = string
  description = "Docker network name for FoodLoop services"
  default     = "foodloop-net"
}

variable "mongo_port" {
  type        = number
  description = "Exposed port for MongoDB"
  default     = 27017
}

variable "gateway_port" {
  type        = number
  description = "Exposed port for API Gateway"
  default     = 4000
}

variable "auth_port" {
  type        = number
  description = "Internal port for Auth Service"
  default     = 4001
}

variable "core_port" {
  type        = number
  description = "Internal port for Core Service"
  default     = 4002
}

variable "ai_port" {
  type        = number
  description = "Internal port for AI Service"
  default     = 5000
}

variable "frontend_port" {
  type        = number
  description = "Exposed port for React Frontend"
  default     = 80
}
