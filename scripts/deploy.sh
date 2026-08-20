#!/bin/bash
# ==============================================================================
# FoodLoop Deployment Script — Builds & Launches All 5 Microservices
# ==============================================================================

set -e

echo "🚀 Deploying FoodLoop Stack via Docker Compose..."

# 1. Check Docker daemon
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed."; exit 1; }

# 2. Build and Compose services
echo "Building container images..."
docker compose build

echo "Starting microservices network..."
docker compose up -d

echo "Waiting for health checks to initialize..."
sleep 5

# 3. Print service status and dashboard endpoints
echo "=============================================================================="
echo "✨ FoodLoop Services are now ACTIVE:"
echo "------------------------------------------------------------------------------"
echo "  Frontend Dashboard : http://localhost:5173"
echo "  API Gateway        : http://localhost:4000/health"
echo "  Auth Microservice  : http://localhost:4001/health"
echo "  Core Microservice  : http://localhost:4002/health"
echo "  AI & RAG Service   : http://localhost:5000/health"
echo "  MongoDB Instance   : localhost:27017"
echo "=============================================================================="
echo "To monitor logs: docker compose logs -f"
echo "To stop services: docker compose down"
