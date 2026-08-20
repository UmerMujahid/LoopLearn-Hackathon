const mongoose = require('mongoose');
const { Schema } = mongoose;

const requestSchema = new Schema(
    {
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Organization ID is required']
        },
        foodListingId: {
            type: Schema.Types.ObjectId,
            ref: 'FoodListing',
            required: [true, 'Food listing ID is required']
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'collected'],
            default: 'pending'
        },
        requestedQuantity: {
            type: Number,
            required: [true, 'Requested quantity is required'],
            min: [1, 'Requested quantity must be at least 1']
        },
        message: {
            type: String,
            trim: true,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;