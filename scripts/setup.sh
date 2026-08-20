#!/bin/bash
# ==============================================================================
# FoodLoop Setup Script — Automated Toolchain & Dependency Initializer
# ==============================================================================

set -e

echo "🍽️ Starting FoodLoop Platform Setup..."

# 1. Verify Prerequisites
echo "Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed."; exit 1; }
command -v python3 >/dev/null 2>&1 || command -v python >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed."; exit 1; }

echo "✓ Core runtimes detected."

# 2. Setup Environment Variables
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "Creating .env from .env.example..."
        cp .env.example .env
    fi
fi

# 3. Install Backend Microservice Dependencies
echo "Installing API Gateway dependencies..."
cd backend/api-gateway && npm install
cd ../..

echo "Installing Auth Service dependencies..."
cd backend/auth-service && npm install
cd ../..

echo "Installing Core Service dependencies..."
cd backend/core-service && npm install
cd ../..

# 4. Install React Frontend Dependencies
echo "Installing Frontend dependencies..."
cd frontend && npm install
cd ..

# 5. Install Python AI Service Dependencies
echo "Setting up Python AI environment..."
if command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD=python3
else
    PYTHON_CMD=python
fi

cd ai-service
$PYTHON_CMD -m pip install -r requirements.txt || true
cd ..

echo "=============================================================================="
echo "🎉 FoodLoop setup complete! Run ./scripts/deploy.sh or npm run dev to start."
echo "=============================================================================="
