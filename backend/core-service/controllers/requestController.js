const Request = require('../models/Request');
const FoodListing = require('../models/FoodListings');
const SustainabilityStats = require('../models/SustainabilityStats');

// Helper to track and update sustainability metrics upon collection
const recordSustainabilityMetrics = async (providerId, organizationId, quantity, unit) => {
    const currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM

    // Estimate kg of food based on unit
    let weightInKg = quantity;
    if (unit === 'portions' || unit === 'items') {
        weightInKg = quantity * 0.4; // 1 portion/meal ≈ 0.4 kg
    } else if (unit === 'liters') {
        weightInKg = quantity * 1.0;
    }

    const co2Saved = Number((weightInKg * 2.5).toFixed(2)); // 1 kg food waste ≈ 2.5 kg CO2[cite: 1]

    // Update Provider Metrics
    await SustainabilityStats.findOneAndUpdate(
        { userId: providerId, month: currentMonth },
        {
            $inc: {
                totalDonated: quantity,
                wasteReduced: weightInKg,
                co2Saved: co2Saved
            }
        },
        { upsert: true, new: true }
    );

    // Update Organization Metrics
    await SustainabilityStats.findOneAndUpdate(
        { userId: organizationId, month: currentMonth },
        {
            $inc: {
                totalCollected: quantity,
                wasteReduced: weightInKg,
                co2Saved: co2Saved
            }
        },
        { upsert: true, new: true }
    );
};

const User = require('../models/User');

// @desc    Create a claim request for food listing
// @route   POST /requests
// @access  Organization (verified only)
const createRequest = async (req, res) => {
    try {
        const { foodListingId, requestedQuantity, message } = req.body;

        // Verify that the requesting organization is verified
        const orgUser = await User.findById(req.user.id);
        if (!orgUser || orgUser.role !== 'organization') {
            return res.status(403).json({ message: 'Only organizations can create claim requests' });
        }
        if (!orgUser.isVerified) {
            return res.status(403).json({ message: 'Your organization must be verified by admin before claiming food. Please wait for verification.' });
        }

        const listing = await FoodListing.findById(foodListingId);
        if (!listing) {
            return res.status(404).json({ message: 'Food listing not found' });
        }

        if (listing.status !== 'available') {
            return res.status(400).json({ message: `Listing is not available (Current status: ${listing.status})` });
        }

        const request = new Request({
            organizationId: req.user.id,
            foodListingId,
            requestedQuantity: requestedQuantity || listing.quantity,
            message
        });

        await request.save();

        return res.status(201).json({
            message: 'Claim request submitted successfully',
            request
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to create claim request',
            error: error.message
        });
    }
};

// @desc    Get all requests (filtered by org or provider's listings)
// @route   GET /requests
// @access  Authenticated
const getRequests = async (req, res) => {
    try {
        const filter = {};

        if (req.user.role === 'organization') {
            filter.organizationId = req.user.id;
        } else if (req.user.role === 'provider') {
            // Find all listings owned by this provider
            const providerListings = await FoodListing.find({ providerId: req.user.id }).select('_id');
            const listingIds = providerListings.map((item) => item._id);
            filter.foodListingId = { $in: listingIds };
        }

        if (req.query.status) {
            filter.status = req.query.status;
        }

        const requests = await Request.find(filter)
            .populate('organizationId', 'name email organizationName phone address isVerified')
            .populate({
                path: 'foodListingId',
                populate: { path: 'providerId', select: 'name email phone address' }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: requests.length,
            requests
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch requests',
            error: error.message
        });
    }
};

// @desc    Approve a claim request
// @route   PUT /requests/:id/approve
// @access  Provider
const approveRequest = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id).populate('foodListingId');
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const listing = request.foodListingId;
        if (listing.providerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to approve this request' });
        }

        request.status = 'approved';
        await request.save();

        // Update listing status to reserved
        listing.status = 'reserved';
        listing.claimedBy = request.organizationId;
        listing.claimedAt = new Date();
        await listing.save();

        return res.status(200).json({
            message: 'Request approved and food listing reserved',
            request
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to approve request',
            error: error.message
        });
    }
};

// @desc    Reject a claim request
// @route   PUT /requests/:id/reject
// @access  Provider
const rejectRequest = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id).populate('foodListingId');
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const listing = request.foodListingId;
        if (listing.providerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to reject this request' });
        }

        request.status = 'rejected';
        await request.save();

        return res.status(200).json({
            message: 'Request rejected',
            request
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to reject request',
            error: error.message
        });
    }
};

// @desc    Mark food as collected
// @route   PUT /requests/:id/collect
// @access  Organization / Provider
const markCollected = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id).populate('foodListingId');
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const listing = request.foodListingId;

        // Verify request belongs to the user (organization or provider)
        const isOrg = request.organizationId.toString() === req.user.id;
        const isProvider = listing.providerId.toString() === req.user.id;

        if (!isOrg && !isProvider && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to mark this request as collected' });
        }

        request.status = 'collected';
        await request.save();

        listing.status = 'collected';
        listing.collectedAt = new Date();
        await listing.save();

        // Update CO2 and waste reduction analytics
        try {
            await recordSustainabilityMetrics(
                listing.providerId,
                request.organizationId,
                listing.quantity,
                listing.unit
            );
        } catch (metricsError) {
            // Log but don't fail the request — collection is already recorded
            console.error('[markCollected] Failed to update sustainability metrics:', metricsError.message);
        }

        return res.status(200).json({
            message: 'Food marked as collected and sustainability stats updated',
            request,
            listing
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to mark as collected',
            error: error.message
        });
    }
};

module.exports = {
    createRequest,
    getRequests,
    approveRequest,
    rejectRequest,
    markCollected
};