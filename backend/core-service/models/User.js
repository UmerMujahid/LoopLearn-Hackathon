const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        role: { type: String, enum: ['provider', 'organization', 'admin'] },
        organizationName: { type: String },
        address: { type: String, required: true },
        phone: { type: String, required: true },
        isVerified: { type: Boolean, default: false }
    },
    { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);