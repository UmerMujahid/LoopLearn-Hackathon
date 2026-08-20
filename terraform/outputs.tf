output "frontend_url" {
  description = "Public URL for React Frontend"
  value       = "http://localhost:${var.frontend_port}"
}

output "api_gateway_url" {
  description = "Public URL for API Gateway"
  value       = "http://localhost:${var.gateway_port}"
}

output "mongodb_uri" {
  description = "MongoDB Connection URI"
  value       = "mongodb://localhost:${var.mongo_port}/foodloop_db"
}
