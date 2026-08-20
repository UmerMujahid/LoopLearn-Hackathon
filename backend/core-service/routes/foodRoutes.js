const express = require('express');
const router = express.Router();
const {
    createListing,
    getListings,
    getListingById,
    updateListing,
    deleteListing,
    updateListingStatus
} = require('../controllers/foodController');
const { verifyToken, authorize } = require('../middleware/auth');

// All food listing endpoints require a valid JWT token[cite: 1]
router.use(verifyToken);

// Create food listing (Providers & Admins)[cite: 1]
router.post('/', authorize('provider', 'admin'), createListing);

// Read listings (Authenticated users)[cite: 1]
router.get('/', getListings);
router.get('/:id', getListingById);

// Modify food listings (Providers & Admins)[cite: 1]
router.put('/:id', authorize('provider', 'admin'), updateListing);
router.delete('/:id', authorize('provider', 'admin'), deleteListing);
router.put('/:id/status', authorize('provider', 'admin'), updateListingStatus);

module.exports = router;