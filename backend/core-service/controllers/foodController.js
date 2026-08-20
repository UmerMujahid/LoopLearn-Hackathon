const FoodListing = require('../models/FoodListings');

// @desc    Create a new food listing
// @route   POST /food
// @access  Provider
const createListing = async (req, res) => {
    try {
        const {
            foodName,
            category,
            quantity,
            unit,
            pickupLocation,
            pickupLat,
            pickupLng,
            availableFrom,
            availableUntil,
            expiryDate,
            description
        } = req.body;

        const listing = new FoodListing({
            providerId: req.user.id,
            foodName,
            category,
            quantity,
            unit,
            pickupLocation,
            pickupLat,
            pickupLng,
            availableFrom,
            availableUntil,
            expiryDate,
            description
        });

        await listing.save();

        return res.status(201).json({
            message: 'Food listing created successfully',
            listing
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to create food listing',
            error: error.message
        });
    }
};

// @desc    Get all food listings with optional filters
// @route   GET /food
// @access  Authenticated
const getListings = async (req, res) => {
    try {
        const { category, status, location, providerId } = req.query;
        const filter = {};

        if (category) filter.category = category;
        if (status) {
            filter.status = status;
        } else if (!providerId) {
            // Default to available listings when browsing general feed
            filter.status = 'available';
        }
        if (providerId) filter.providerId = providerId;
        if (location) {
            filter.pickupLocation = { $regex: location, $options: 'i' };
        }

        const listings = await FoodListing.find(filter)
            .populate('providerId', 'name email organizationName phone address')
            .populate('claimedBy', 'name email organizationName phone')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: listings.length,
            listings
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch food listings',
            error: error.message
        });
    }
};

// @desc    Get single food listing by ID
// @route   GET /food/:id
// @access  Authenticated
const getListingById = async (req, res) => {
    try {
        const listing = await FoodListing.findById(req.params.id)
            .populate('providerId', 'name email organizationName phone address')
            .populate('claimedBy', 'name email organizationName phone');

        if (!listing) {
            return res.status(404).json({ message: 'Food listing not found' });
        }

        return res.status(200).json({ listing });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch food listing',
            error: error.message
        });
    }
};

// @desc    Update a food listing
// @route   PUT /food/:id
// @access  Provider (Owner)
const updateListing = async (req, res) => {
    try {
        const listing = await FoodListing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ message: 'Food listing not found' });
        }

        if (listing.providerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to update this listing' });
        }

        const allowedUpdates = [
            'foodName',
            'category',
            'quantity',
            'unit',
            'pickupLocation',
            'pickupLat',
            'pickupLng',
            'availableFrom',
            'availableUntil',
            'expiryDate',
            'description'
        ];

        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) {
                listing[field] = req.body[field];
            }
        });

        await listing.save();

        return res.status(200).json({
            message: 'Food listing updated successfully',
            listing
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update food listing',
            error: error.message
        });
    }
};

// @desc    Delete a food listing
// @route   DELETE /food/:id
// @access  Provider (Owner) / Admin
const deleteListing = async (req, res) => {
    try {
        const listing = await FoodListing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ message: 'Food listing not found' });
        }

        if (listing.providerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to delete this listing' });
        }

        await FoodListing.findByIdAndDelete(req.params.id);

        return res.status(200).json({ message: 'Food listing deleted successfully' });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete food listing',
            error: error.message
        });
    }
};

// @desc    Change food listing status
// @route   PUT /food/:id/status
// @access  Provider (Owner) / Admin
const updateListingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['available', 'reserved', 'collected', 'expired'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const listing = await FoodListing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ message: 'Food listing not found' });
        }

        if (listing.providerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to modify status of this listing' });
        }

        listing.status = status;
        if (status === 'collected') listing.collectedAt = new Date();
        await listing.save();

        return res.status(200).json({
            message: `Status updated to ${status}`,
            listing
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update listing status',
            error: error.message
        });
    }
};

module.exports = {
    createListing,
    getListings,
    getListingById,
    updateListing,
    deleteListing,
    updateListingStatus
};