const mongoose = require('mongoose');
const { Schema } = mongoose;

const phoneRegex = /^\+[1-9]\d{1,14}$/;

/**
 * Read-only User model for core-service.
 * This mirrors the auth-service User schema so that core-service
 * can populate() references and query user fields correctly.
 * Auth-service is the "owner" of user documents (password hashing, etc.)
 */
const userSchema = new Schema(
    {
        name: { type: String, trim: true, required: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        password: { type: String, required: true, minLength: 6, maxLength: 100, select: false },
        role: { type: String, enum: ['provider', 'organization', 'admin'], default: 'provider' },
        organizationName: { type: String },
        address: { type: String, required: true },
        phone: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    const cleaned = v.replace(/[\s-]/g, '');
                    return phoneRegex.test(cleaned);
                },
                message: props => `${props.value} is not a valid E.164 phone number!`
            }
        },
        isVerified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
