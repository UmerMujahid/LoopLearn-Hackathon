const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {

    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Access denied. No token provided or invalid format.'
        });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if (error) {
            return res.status(401).json({
                message: 'Token is not valid'
            })
        }

        req.user = user;

        return next();
    })

}

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    }
}

const isAdmin = (req, res, next) => {

    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: 'Access denied. Admins only' });
    }

    next();

};

module.exports = { verifyToken, authorize, isAdmin };