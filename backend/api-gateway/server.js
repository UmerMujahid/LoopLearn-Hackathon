const express = require('express');
const cors = require('cors');
const services = require('./config/services');
const logger = require('./middleware/logger');
const healthRoutes = require('./routes/health');
const setupProxies = require('./routes/proxy');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// 1. Global Middleware
app.use(cors());
app.use(logger);

// 2. Aggregated Health Check
app.use('/health', healthRoutes);

// 3. Reverse Proxy Route Setup (Mounted before body-parsers to avoid stream locking)
setupProxies(app);

// 4. Fallback 404 Route for Unmatched Gateway Endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'NotFound',
    message: `Endpoint ${req.method} ${req.originalUrl} does not exist on the API Gateway.`,
  });
});

// 5. Global Error Handler Middleware
app.use(errorHandler);

// 6. Server Initialization
const PORT = services.port;
app.listen(PORT, () => {
  console.log(`[API Gateway] Running on http://localhost:${PORT}`);
  console.log(`[Target Services] Auth: ${services.auth.url} | Core: ${services.core.url} | AI: ${services.ai.url}`);
});