const mongoose = require('mongoose');
const { Schema } = mongoose;

const foodListingSchema = new Schema(
    {
        providerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Provider ID is required']
        },
        foodName: {
            type: String,
            required: [true, 'Food name is required'],
            trim: true
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['meals', 'bakery', 'produce', 'dairy', 'beverages', 'other']
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be at least 1']
        },
        unit: {
            type: String,
            required: [true, 'Unit is required'],
            enum: ['portions', 'kg', 'liters', 'items']
        },
        pickupLocation: {
            type: String,
            required: [true, 'Pickup location is required'],
            trim: true
        },
        pickupLat: {
            type: Number,
            default: null
        },
        pickupLng: {
            type: Number,
            default: null
        },
        availableFrom: {
            type: Date,
            required: [true, 'Available from date is required']
        },
        availableUntil: {
            type: Date,
            required: [true, 'Available until date is required']
        },
        expiryDate: {
            type: Date,
            required: [true, 'Expiry date is required']
        },
        description: {
            type: String,
            trim: true,
            default: ''
        },
        status: {
            type: String,
            enum: ['available', 'reserved', 'collected', 'expired'],
            default: 'available'
        },
        claimedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        claimedAt: {
            type: Date,
            default: null
        },
        collectedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const FoodListing = mongoose.model('FoodListing', foodListingSchema);

module.exports = FoodListing;