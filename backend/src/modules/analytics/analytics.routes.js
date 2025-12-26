const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const analyticsController = require('./analytics.controller');
const { verifyToken, isAdmin } = require('../../core/middleware/auth');

// Rate limiter for analytics endpoints
const analyticsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50,
    message: { success: false, message: 'Too many analytics requests, please try again later.' }
});

router.use(verifyToken);
router.use(isAdmin);

router.get('/auth-attempts', analyticsLimiter, analyticsController.getAuthAttempts);
router.get('/users-registered', analyticsLimiter, analyticsController.getUsersRegistered);

module.exports = router;
