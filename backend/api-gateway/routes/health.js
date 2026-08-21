const express = require('express');
const router = express.Router();
const http = require('http');
const services = require('../config/services');

/**
 * Helper to ping downstream HTTP services with a strict timeout.
 */
const checkService = (serviceName, targetUrl) => {
  return new Promise((resolve) => {
    const url = new URL(targetUrl);
    const start = Date.now();

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: '/health',
        method: 'GET',
        timeout: 2000,
      },
      (res) => {
        resolve({
          service: serviceName,
          status: res.statusCode < 500 ? 'UP' : 'DOWN',
          statusCode: res.statusCode,
          responseTimeMs: Date.now() - start,
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({
        service: serviceName,
        status: 'DOWN',
        error: 'Timeout after 2000ms',
        responseTimeMs: Date.now() - start,
      });
    });

    req.on('error', (err) => {
      resolve({
        service: serviceName,
        status: 'DOWN',
        error: err.message,
        responseTimeMs: Date.now() - start,
      });
    });

    req.end();
  });
};

/**
 * GET /health - Aggregated downstream health status
 */
router.get('/', async (req, res) => {
  const serviceChecks = await Promise.all([
    checkService('auth-service', services.auth.url),
    checkService('core-service', services.core.url),
    checkService('ai-service', services.ai.url),
  ]);

  const allUp = serviceChecks.every((check) => check.status === 'UP');
  const anyUp = serviceChecks.some((check) => check.status === 'UP');

  const systemStatus = allUp ? 'HEALTHY' : anyUp ? 'DEGRADED' : 'DOWN';
  const statusCode = allUp ? 200 : anyUp ? 207 : 503;

  res.status(statusCode).json({
    status: systemStatus,
    timestamp: new Date().toISOString(),
    gateway: {
      port: services.port,
      uptimeSeconds: Math.floor(process.uptime()),
    },
    services: serviceChecks.reduce((acc, curr) => {
      acc[curr.service] = curr;
      return acc;
    }, {}),
  });
});

module.exports = router;