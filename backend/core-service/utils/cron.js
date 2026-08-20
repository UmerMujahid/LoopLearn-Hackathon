const cron = require('node-cron');
const FoodListing = require('../models/FoodListings');

const initAutoExpireCron = () => {
    // Runs every hour at minute 0: '0 * * * *'[cite: 1]
    cron.schedule('0 * * * *', async () => {
        try {
            const now = new Date();

            const result = await FoodListing.updateMany(
                {
                    status: 'available',
                    availableUntil: { $lt: now }
                },
                {
                    $set: { status: 'expired' }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`[Cron Job] Successfully expired ${result.modifiedCount} overdue food listings at ${now.toISOString()}`);
            }
        } catch (error) {
            console.error('[Cron Job Error] Failed to update expired listings:', error.message);
        }
    });

    console.log('[Cron Job] Auto-expire scheduler initialized (Running hourly)');
};

module.exports = initAutoExpireCron;