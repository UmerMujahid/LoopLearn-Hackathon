const express = require('express');
const router = express.Router();
const {
    createRequest,
    getRequests,
    approveRequest,
    rejectRequest,
    markCollected
} = require('../controllers/requestController');
const { verifyToken, authorize } = require('../middleware/auth');

// All request operations require authentication[cite: 1]
router.use(verifyToken);

// Claim request creation (Organizations only)[cite: 1]
router.post('/', authorize('organization'), createRequest);

// List user-related requests[cite: 1]
router.get('/', getRequests);

// Request status lifecycle updates[cite: 1]
router.put('/:id/approve', authorize('provider', 'admin'), approveRequest);
router.put('/:id/reject', authorize('provider', 'admin'), rejectRequest);
router.put('/:id/collect', authorize('organization', 'provider', 'admin'), markCollected);

module.exports = router;