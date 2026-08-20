/**
 * Global error handler middleware
 * Catches unhandled errors and returns a consistent JSON response
 */
const globalErrorHandler = (err, req, res, next) => {
    console.error(`[${req.method} ${req.originalUrl}] Unhandled error:`, err.message);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            message: 'Validation failed',
            errors: messages
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            message: `Duplicate value for field: ${field}`
        });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            message: `Invalid ${err.path}: ${err.value}`
        });
    }

    // Default server error
    return res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
};

module.exports = globalErrorHandler;
