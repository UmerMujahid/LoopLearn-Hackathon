/**
 * Error handler specifically for http-proxy-middleware connection failures
 * (e.g., ECONNREFUSED, ETIMEDOUT when downstream microservices are offline).
 */
const handleProxyError = (err, req, res) => {
  console.error(`[Proxy Error] ${req.method} ${req.originalUrl} -> ${err.message}`);

  if (res.headersSent) {
    return;
  }

  res.status(502).json({
    success: false,
    error: 'Bad Gateway',
    message: 'The requested downstream microservice is currently unreachable.',
    path: req.originalUrl,
  });
};

/**
 * Standard global Express error handler middleware.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[Gateway Error] ${err.stack || err.message}`);

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    error: statusCode === 502 ? 'Bad Gateway' : (err.name || 'InternalServerError'),
    message: err.message || 'An unexpected error occurred in the API Gateway.',
    path: req.originalUrl,
  });
};

module.exports = {
  handleProxyError,
  errorHandler,
};