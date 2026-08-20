const User = require("../models/User");

// @desc    List all users (with optional role filter)
// @route   GET /admin/users
// @access  Admin
const getUsers = async (req, res) => {
    try {
        const filter = {};
        if (req.query.role) {
            filter.role = req.query.role;
        }

        const users = await User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 });

        // Map _id to id for frontend consistency
        const mappedUsers = users.map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            organizationName: u.organizationName,
            address: u.address,
            phone: u.phone,
            isVerified: u.isVerified,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
        }));

        return res.status(200).json({
            count: mappedUsers.length,
            users: mappedUsers
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error fetching users",
            error: error.message
        });
    }
};

// @desc    Verify organization
// @route   PUT /admin/verify/:id
// @access  Admin
const verifyOrganization = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Organization user not found." });
        }

        if (user.role !== "organization") {
            return res.status(400).json({ message: "Only organization accounts can be verified." });
        }

        user.isVerified = true;
        await user.save();

        return res.status(200).json({
            message: "Organization verified successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                organizationName: user.organizationName,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error verifying organization",
            error: error.message
        });
    }
};

module.exports = {
    getUsers,
    verifyOrganization
};