const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

const verifyToken = (req, res, next) => {
    // Check cookies first (new cookie-based auth)
    let token = req.cookies?.saturn_access;

    // Fallback to Authorization header (backward compatibility)
    if (!token) {
        const authHeader = req.headers['authorization'];
        token = authHeader && authHeader.split(' ')[1];
    }

    if (!token) {
        return error(res, 'Authentication required', 'No token provided', 401);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.userId, role: decoded.role };
        next();
    } catch (err) {
        return error(res, 'Invalid token', 'Token verification failed', 403);
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied: Admin role required' });
    }
};

module.exports = { verifyToken, isAdmin };
