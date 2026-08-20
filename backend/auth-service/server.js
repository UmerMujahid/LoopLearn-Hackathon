const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const cors = require('cors');
const authRouter = require('./routes/authRoutes');
const adminRouter = require('./routes/adminRoutes');
const { verifyToken, authorize } = require('./middleware/auth');


const app = express();
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use('/', authRouter);
app.use('/admin', adminRouter);

app.use('/authenticate', verifyToken, authorize('provider', 'organization', 'admin'), (req, res) => {

    const user = req.user;

    return res.status(200).json({
        message: "Authentication successful",
        user: {
            id: user.id,
            email: user.email,
            role: user.role
        }
    });

});

app.use("/health", (req, res) => {
    return res.status(200).json({
        message: "auth-service backend is working fine."
    })
})

const startServer = async () => {
    try {
        await connectDB();

        app.on('error', (error) => {
            console.log(`[auth-service ERROR]: ${error}`);
            throw error;
        });

        const PORT = process.env.PORT;

        app.listen(PORT, () => {
            console.log(`auth-service server is running at ${PORT}.\nCheck out http://localhost:${PORT}/api/v1`);
        });

    } catch (error) {
        console.log(`[auth-service ERROR]: MongoDB connection failed. ${error}`);
    }
};

startServer();
