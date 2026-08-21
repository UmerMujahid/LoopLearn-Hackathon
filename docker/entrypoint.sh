#!/bin/sh
set -e

# Default PORT to 10000 if not provided by Render / Cloud host
export PORT=${PORT:-10000}

echo "[FoodLoop Unified Container] Starting all services on PORT=$PORT..."

# Substitute $PORT into nginx configuration
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Start supervisor daemon to manage Auth, Core, AI, Gateway, and Nginx processes
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
