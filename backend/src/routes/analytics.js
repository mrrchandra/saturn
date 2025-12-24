const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const analyticsController = require('../controllers/analyticsController');

const { verifyToken, isAdmin } = require('../middleware/auth');

// Rate limiter for analytics endpoints
const analyticsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50,
    message: { success: false, message: 'Too many analytics requests, please try again later.' }
});

router.get('/auth-attempts', analyticsLimiter, verifyToken, isAdmin, analyticsController.getAuthAttempts);
router.get('/users-registered', analyticsLimiter, verifyToken, isAdmin, analyticsController.getUsersRegistered);

module.exports = router;
