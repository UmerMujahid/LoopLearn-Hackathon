const FoodListing = require('../models/FoodListings');
const Request = require('../models/Request');
const SustainabilityStats = require('../models/SustainabilityStats');
const User = require('../models/User');

// @desc    Get provider donation and sustainability stats
// @route   GET /stats/provider
// @access  Provider
const getProviderStats = async (req, res) => {
    try {
        const providerId = req.user.id;

        const totalListings = await FoodListing.countDocuments({ providerId });
        const activeListings = await FoodListing.countDocuments({ providerId, status: 'available' });
        const collectedListings = await FoodListing.countDocuments({ providerId, status: 'collected' });
        const expiredListings = await FoodListing.countDocuments({ providerId, status: 'expired' });

        const sustainabilityData = await SustainabilityStats.find({ userId: providerId });

        const totalWasteReduced = sustainabilityData.reduce((acc, curr) => acc + (curr.wasteReduced || 0), 0);
        const totalCo2Saved = sustainabilityData.reduce((acc, curr) => acc + (curr.co2Saved || 0), 0);

        return res.status(200).json({
            totalListings,
            activeListings,
            collectedListings,
            expiredListings,
            wasteReducedKg: Number(totalWasteReduced.toFixed(2)),
            co2SavedKg: Number(totalCo2Saved.toFixed(2)),
            monthlyBreakdown: sustainabilityData
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch provider stats',
            error: error.message
        });
    }
};

// @desc    Get organization collection stats
// @route   GET /stats/organization
// @access  Organization
const getOrganizationStats = async (req, res) => {
    try {
        const organizationId = req.user.id;

        const totalRequests = await Request.countDocuments({ organizationId });
        const pendingRequests = await Request.countDocuments({ organizationId, status: 'pending' });
        const collectedFood = await Request.countDocuments({ organizationId, status: 'collected' });

        const sustainabilityData = await SustainabilityStats.find({ userId: organizationId });

        const totalWasteRescued = sustainabilityData.reduce((acc, curr) => acc + (curr.wasteReduced || 0), 0);
        const totalCo2Saved = sustainabilityData.reduce((acc, curr) => acc + (curr.co2Saved || 0), 0);

        return res.status(200).json({
            totalRequests,
            pendingRequests,
            collectedFood,
            wasteRescuedKg: Number(totalWasteRescued.toFixed(2)),
            co2SavedKg: Number(totalCo2Saved.toFixed(2)),
            monthlyBreakdown: sustainabilityData
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch organization stats',
            error: error.message
        });
    }
};

// @desc    Get platform-wide admin stats
// @route   GET /stats/admin
// @access  Admin
const getAdminStats = async (req, res) => {
    try {
        const totalListings = await FoodListing.countDocuments();
        const foodRescued = await FoodListing.countDocuments({ status: 'collected' });
        const activeListings = await FoodListing.countDocuments({ status: 'available' });
        const expiredListings = await FoodListing.countDocuments({ status: 'expired' });

        const activeOrgs = await User.countDocuments({ role: 'organization', isVerified: true });
        const pendingOrgs = await User.countDocuments({ role: 'organization', isVerified: false });
        const totalProviders = await User.countDocuments({ role: 'provider' });

        const allStats = await SustainabilityStats.find();
        const totalWasteReduced = allStats.reduce((acc, curr) => acc + (curr.wasteReduced || 0), 0);
        const totalCo2Saved = allStats.reduce((acc, curr) => acc + (curr.co2Saved || 0), 0);

        return res.status(200).json({
            totalListings,
            foodRescued,
            activeListings,
            expiredListings,
            activeOrgs,
            pendingOrgs,
            totalProviders,
            totalWasteReducedKg: Number(totalWasteReduced.toFixed(2)),
            totalCo2SavedKg: Number(totalCo2Saved.toFixed(2))
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch admin stats',
            error: error.message
        });
    }
};

module.exports = {
    getProviderStats,
    getOrganizationStats,
    getAdminStats
};