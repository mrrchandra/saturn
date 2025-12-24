const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const userController = require('../controllers/userController');

// Rate limiter for user info endpoints
const userLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { success: false, message: 'Too many requests, please try again later.' }
});

router.get('/:id', userLimiter, userController.getUserInfo);
router.get('/:id/details', userLimiter, userController.getUserDetails);
router.get('/:id/avatar', userLimiter, userController.getAvatar);
router.get('/:id/metadata', userLimiter, userController.getMetadata);

module.exports = router;
