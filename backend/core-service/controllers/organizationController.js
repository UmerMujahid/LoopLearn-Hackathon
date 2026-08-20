const User = require('../models/User');
const Request = require('../models/Request');
const SustainabilityStats = require('../models/SustainabilityStats');

// @desc    List all verified organizations
// @route   GET /organizations
// @access  Authenticated
const getOrganizations = async (req, res) => {
    try {
        const organizations = await User.find({
            role: 'organization',
            isVerified: true
        }).select('-password');

        return res.status(200).json({
            count: organizations.length,
            organizations
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch organizations',
            error: error.message
        });
    }
};

// @desc    Get organization details + collection history and stats
// @route   GET /organizations/:id
// @access  Authenticated
const getOrganizationById = async (req, res) => {
    try {
        const organization = await User.findOne({
            _id: req.params.id,
            role: 'organization'
        }).select('-password');

        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        const stats = await SustainabilityStats.find({ userId: req.params.id });
        const history = await Request.find({
            organizationId: req.params.id,
            status: 'collected'
        }).populate('foodListingId');

        return res.status(200).json({
            organization,
            stats,
            totalCollections: history.length,
            history
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch organization details',
            error: error.message
        });
    }
};

module.exports = {
    getOrganizations,
    getOrganizationById
};