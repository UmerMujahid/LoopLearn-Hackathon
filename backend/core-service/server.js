const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
const connectDB = require('./config/db');
const initAutoExpireCron = require('./utils/cron');

// Route Imports
const foodRoutes = require('./routes/foodRoutes');
const requestRoutes = require('./routes/requestRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const statsRoutes = require('./routes/statsRoutes');
const globalErrorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Mount Core Service Routes (Direct endpoints matching Gateway proxies)[cite: 1]
app.use('/food', foodRoutes);
app.use('/requests', requestRoutes);
app.use('/organizations', organizationRoutes);
app.use('/stats', statsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    return res.status(200).json({
        status: 'healthy',
        service: 'core-service'
    });
});

// Global error handler (must be registered AFTER all routes)
app.use(globalErrorHandler);

const startServer = async () => {
    try {
        await connectDB();

        // Start background auto-expiration cron worker[cite: 1]
        initAutoExpireCron();

        app.on('error', (error) => {
            console.error(`[core-service ERROR]: ${error}`);
            throw error;
        });

        const PORT = process.env.PORT || 4002;

        app.listen(PORT, () => {
            console.log(`core-service running on port ${PORT}`);
        });
    } catch (error) {
        console.error(`[core-service ERROR]: MongoDB connection failed: ${error.message}`);
    }
};

startServer();