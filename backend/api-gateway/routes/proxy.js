const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services');
const { handleProxyError } = require('../middleware/errorHandler');

/**
 * Build proxy config that handles both prefixed (/api/...) and non-prefixed (/...) routes
 * and correctly routes to downstream microservices.
 */
const createServiceProxy = (target, serviceType) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      const fullPath = req.originalUrl || req.url;

      // 1. Auth routes (mounted at '/' on auth-service: /login, /register, /profile, /authenticate)
      if (serviceType === 'auth') {
        const cleaned = fullPath.replace(/^\/api\/auth/, '').replace(/^\/auth/, '');
        return cleaned || '/';
      }

      // 2. Admin routes (mounted at '/admin' on auth-service: /admin/users, /admin/verify/:id)
      if (serviceType === 'admin') {
        const cleaned = fullPath.replace(/^\/api\/admin/, '/admin').replace(/^\/admin/, '/admin');
        return cleaned;
      }

      // 3. Core Food routes (mounted at '/food' on core-service)
      if (serviceType === 'food') {
        const cleaned = fullPath.replace(/^\/api\/food/, '/food').replace(/^\/food/, '/food');
        return cleaned;
      }

      // 4. Core Requests routes (mounted at '/requests' on core-service)
      if (serviceType === 'requests') {
        const cleaned = fullPath.replace(/^\/api\/requests/, '/requests').replace(/^\/requests/, '/requests');
        return cleaned;
      }

      // 5. Core Organizations routes (mounted at '/organizations' on core-service)
      if (serviceType === 'organizations') {
        const cleaned = fullPath.replace(/^\/api\/organizations/, '/organizations').replace(/^\/organizations/, '/organizations');
        return cleaned;
      }

      // 6. Core Stats routes (mounted at '/stats' on core-service)
      if (serviceType === 'stats') {
        const cleaned = fullPath.replace(/^\/api\/stats/, '/stats').replace(/^\/stats/, '/stats');
        return cleaned;
      }

      // 7. AI Service routes (mounted on ai-service)
      if (serviceType === 'ai') {
        return fullPath;
      }

      return fullPath;
    },
    on: {
      error: handleProxyError,
    },
    onError: handleProxyError,
  });
};

/**
 * Set up all microservice route proxies on the Express API Gateway app.
 * Mounts both /api/* and non-prefixed /* endpoints so all requests work reliably.
 */
const setupProxies = (app) => {
  // 1. Auth Service (:4001) - /api/auth/* & /auth/*
  app.use(['/api/auth', '/auth'], createServiceProxy(services.auth.url, 'auth'));

  // 2. Admin Routes via Auth Service (:4001) - /api/admin/* & /admin/*
  app.use(['/api/admin', '/admin'], createServiceProxy(services.auth.url, 'admin'));

  // 3. Core Service (:4002) - /api/food/* & /food/*
  app.use(['/api/food', '/food'], createServiceProxy(services.core.url, 'food'));

  // 4. Core Service (:4002) - /api/requests/* & /requests/*
  app.use(['/api/requests', '/requests'], createServiceProxy(services.core.url, 'requests'));

  // 5. Core Service (:4002) - /api/organizations/* & /organizations/*
  app.use(['/api/organizations', '/organizations'], createServiceProxy(services.core.url, 'organizations'));

  // 6. Core Service (:4002) - /api/stats/* & /stats/*
  app.use(['/api/stats', '/stats'], createServiceProxy(services.core.url, 'stats'));

  // 7. AI Service (:5000) - /api/ai/* & /ai/*
  app.use(['/api/ai', '/ai'], createServiceProxy(services.ai.url, 'ai'));
};

module.exports = setupProxies;
