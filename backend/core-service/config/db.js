const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}`);

        console.log(`\ncore-service MongoDB connected ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log(`[core-service EXCEPTION]: MongoDB connection failed. ${error}`);
        process.exit(1);
    }
};

module.exports = connectDB;