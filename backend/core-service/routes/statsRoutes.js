const express = require('express');
const router = express.Router();
const {
    getProviderStats,
    getOrganizationStats,
    getAdminStats
} = require('../controllers/statsController');
const { verifyToken, authorize, isAdmin } = require('../middleware/auth');

// All stats endpoints require authentication[cite: 1]
router.use(verifyToken);

// Role-protected metrics routes[cite: 1]
router.get('/provider', authorize('provider', 'admin'), getProviderStats);
router.get('/organization', authorize('organization', 'admin'), getOrganizationStats);
router.get('/admin', isAdmin, getAdminStats);

module.exports = router;