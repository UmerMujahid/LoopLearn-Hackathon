const User = require("../models/User");

// @desc    Register a new user (Provider / Organization)
// @route   POST /register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password, role, organizationName, address, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email address." });
        }

        // Validate organization name for organization role
        if (role === "organization" && !organizationName) {
            return res.status(400).json({ message: "Organization name is required for organization accounts." });
        }

        const user = new User({
            name,
            email,
            password,
            role: role || "provider",
            organizationName: role === "organization" ? organizationName : undefined,
            address,
            phone
        });

        await user.save();

        const token = user.getAccessToken();

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationName: user.organizationName,
                address: user.address,
                phone: user.phone,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error during registration",
            error: error.message
        });
    }
};

// @desc    Authenticate user & get token
// @route   POST /login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const token = user.getAccessToken();

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationName: user.organizationName,
                address: user.address,
                phone: user.phone,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error during login",
            error: error.message
        });
    }
};

// @desc    Get logged in user profile
// @route   GET /profile
// @access  Authenticated
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationName: user.organizationName,
                address: user.address,
                phone: user.phone,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error fetching profile",
            error: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /profile
// @access  Authenticated
const updateProfile = async (req, res) => {
    try {
        const updates = {};
        const allowedFields = ["name", "address", "phone", "organizationName"];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                organizationName: updatedUser.organizationName,
                address: updatedUser.address,
                phone: updatedUser.phone,
                isVerified: updatedUser.isVerified
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error updating profile",
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile
};