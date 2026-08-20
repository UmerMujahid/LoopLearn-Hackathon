const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services');
const { handleProxyError } = require('../middleware/errorHandler');

/**
 * Shared proxy configuration factory with error handling
 */
const configureProxy = (target, pathRewrite = {}) => ({
  target,
  changeOrigin: true,
  pathRewrite,
  on: {
    error: handleProxyError,
  },
  // Backward compatibility for older http-proxy-middleware versions
  onError: handleProxyError,
});

/**
 * Set up all microservice route proxies on the Express app
 */
const setupProxies = (app) => {
  // 1. Auth Service (:4001) - Maps /api/auth/* to /auth/* or /*
  app.use(
    '/api/auth',
    createProxyMiddleware(
      configureProxy(services.auth.url, {
        '^/api/auth': '',
      })
    )
  );

  // 2. Core Service (:4002) - Maps /api/food/* to /food/*
  app.use(
    '/api/food',
    createProxyMiddleware(
      configureProxy(services.core.url, {
        '^/api/food': '/food',
      })
    )
  );

  // 3. Core Service (:4002) - Maps /api/requests/* to /requests/*
  app.use(
    '/api/requests',
    createProxyMiddleware(
      configureProxy(services.core.url, {
        '^/api/requests': '/requests',
      })
    )
  );

  // 4. Core Service (:4002) - Maps /api/organizations/* to /organizations/*
  app.use(
    '/api/organizations',
    createProxyMiddleware(
      configureProxy(services.core.url, {
        '^/api/organizations': '/organizations',
      })
    )
  );

  // 5. Core Service (:4002) - Maps /api/stats/* to /stats/*
  app.use(
    '/api/stats',
    createProxyMiddleware(
      configureProxy(services.core.url, {
        '^/api/stats': '/stats',
      })
    )
  );

  // 6. AI Service (:5000) - Maps /api/ai/* directly to /api/ai/*
  app.use(
    '/api/ai',
    createProxyMiddleware(configureProxy(services.ai.url))
  );
};

module.exports = setupProxies;