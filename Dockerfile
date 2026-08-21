# ==============================================================================
# Stage 1: Build React Frontend
# ==============================================================================
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ==============================================================================
# Stage 2: Final Unified All-in-One Container (Node + Python + Nginx + Gateway)
# ==============================================================================
FROM python:3.11-slim

# Install system dependencies, Node.js 20, Nginx, Supervisor, and gettext
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    nginx \
    supervisor \
    gettext-base \
    ca-certificates \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Install Backend Dependencies
COPY backend/auth-service/package*.json ./backend/auth-service/
RUN cd backend/auth-service && npm install --omit=dev

COPY backend/core-service/package*.json ./backend/core-service/
RUN cd backend/core-service && npm install --omit=dev

COPY backend/api-gateway/package*.json ./backend/api-gateway/
RUN cd backend/api-gateway && npm install --omit=dev

# 2. Install AI Service Python Dependencies
COPY ai-service/requirements.txt ./ai-service/
RUN pip install --no-cache-dir -r ai-service/requirements.txt

# 3. Copy Application Source Code
COPY backend/ ./backend/
COPY ai-service/ ./ai-service/
COPY python-service/ ./python-service/
COPY rag/ ./rag/

# 4. Copy Frontend Static Build to Nginx Root
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# 5. Setup Nginx & Supervisor Configs
RUN mkdir -p /etc/nginx/templates /etc/supervisor/conf.d /var/log
COPY docker/nginx.render.conf.template /etc/nginx/templates/default.conf.template
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Render / Cloud runtime environment defaults
ENV PORT=10000 \
    NODE_ENV=production \
    PYTHONUNBUFFERED=1

EXPOSE 10000 80 5173 4000

ENTRYPOINT ["/app/entrypoint.sh"]
