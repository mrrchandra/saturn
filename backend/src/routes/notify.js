const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const notifyController = require('../controllers/notifyController');

// Strict rate limiter for notifications to prevent spam
const notifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { success: false, message: 'Too many notification requests, please try again later.' }
});

router.post('/email', notifyLimiter, notifyController.sendEmail);
router.post('/push', notifyLimiter, notifyController.sendPush);
router.post('/subscribe', notifyLimiter, notifyController.subscribe);

module.exports = router;
