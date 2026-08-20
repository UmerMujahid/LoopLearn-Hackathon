const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services');
const { handleProxyError } = require('../middleware/errorHandler');

/**
 * Build proxy config that uses function-based pathRewrite
 * to handle Express 5's URL stripping when using app.use(path, middleware)
 */
const configureProxy = (target, prefixToReplace) => ({
  target,
  changeOrigin: true,
  pathRewrite: (path, req) => {
    // Use originalUrl (full path) to avoid Express 5 stripping mount prefix
    const fullPath = req.originalUrl || req.url;
    if (prefixToReplace && fullPath.startsWith(prefixToReplace)) {
      const rest = fullPath.slice(prefixToReplace.length);
      // For auth: strip prefix entirely (routes are at root)
      // For core: replace prefix with service route prefix
      if (prefixToReplace === '/api/auth') {
        return rest || '/';
      }
      // For other services, replace prefix with the service route
      const servicePrefix = prefixToReplace.replace('/api/', '/');
      return servicePrefix + rest;
    }
    return fullPath;
  },
  on: {
    error: handleProxyError,
  },
  onError: handleProxyError,
});

/**
 * Set up all microservice route proxies on the Express app
 */
const setupProxies = (app) => {
  // 1. Auth Service (:4001) - Maps /api/auth/* -> /*
  app.use(
    '/api/auth',
    createProxyMiddleware(configureProxy(services.auth.url, '/api/auth'))
  );

  // 1b. Admin Routes via Auth Service (:4001) - Maps /api/admin/* -> /admin/*
  app.use(
    '/api/admin',
    createProxyMiddleware(configureProxy(services.auth.url, '/api/admin'))
  );

  // 2. Core Service (:4002) - Maps /api/food/* -> /food/*
  app.use(
    '/api/food',
    createProxyMiddleware(configureProxy(services.core.url, '/api/food'))
  );

  // 3. Core Service (:4002) - Maps /api/requests/* -> /requests/*
  app.use(
    '/api/requests',
    createProxyMiddleware(configureProxy(services.core.url, '/api/requests'))
  );

  // 4. Core Service (:4002) - Maps /api/organizations/* -> /organizations/*
  app.use(
    '/api/organizations',
    createProxyMiddleware(configureProxy(services.core.url, '/api/organizations'))
  );

  // 5. Core Service (:4002) - Maps /api/stats/* -> /stats/*
  app.use(
    '/api/stats',
    createProxyMiddleware(configureProxy(services.core.url, '/api/stats'))
  );

  // 6. AI Service (:5000) - Maps /api/ai/* -> /api/ai/*
  app.use(
    '/api/ai',
    createProxyMiddleware({
      target: services.ai.url,
      changeOrigin: true,
      on: { error: handleProxyError },
      onError: handleProxyError,
    })
  );
};

module.exports = setupProxies;
