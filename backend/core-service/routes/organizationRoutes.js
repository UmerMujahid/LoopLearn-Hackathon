const express = require('express');
const router = express.Router();
const {
    getOrganizations,
    getOrganizationById
} = require('../controllers/organizationController');
const { verifyToken } = require('../middleware/auth');

// All organization queries require authentication[cite: 1]
router.use(verifyToken);

// List verified organizations and individual profiles[cite: 1]
router.get('/', getOrganizations);
router.get('/:id', getOrganizationById);

module.exports = router;