require('dotenv').config();

const services = {
  port: process.env.PORT || 4000,
  auth: {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
  },
  core: {
    url: process.env.CORE_SERVICE_URL || 'http://localhost:4002',
  },
  ai: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:5000',
  },
};

module.exports = services;