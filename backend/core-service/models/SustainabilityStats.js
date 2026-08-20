const mongoose = require('mongoose');
const { Schema } = mongoose;

const sustainabilityStatsSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required']
        },
        totalDonated: {
            type: Number,
            default: 0,
            min: 0
        },
        totalCollected: {
            type: Number,
            default: 0,
            min: 0
        },
        wasteReduced: {
            type: Number, // in kg
            default: 0,
            min: 0
        },
        co2Saved: {
            type: Number, // in kg
            default: 0,
            min: 0
        },
        month: {
            type: String, // format YYYY-MM
            required: [true, 'Month is required']
        }
    },
    {
        timestamps: true
    }
);

// Compound index to guarantee one record per user per month
sustainabilityStatsSchema.index({ userId: 1, month: 1 }, { unique: true });

const SustainabilityStats = mongoose.model('SustainabilityStats', sustainabilityStatsSchema);

module.exports = SustainabilityStats;