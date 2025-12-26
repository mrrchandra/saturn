const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const otpController = require('./otp.controller');
const functionGate = require('../../core/middleware/functionGate');
const { error } = require('../../core/utils/response');

// Rate limiter
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // Strict limit for OTPs
    message: { success: false, message: 'Too many OTP requests, please wait.' }
});

// Validation
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return error(res, errors.array(), 'Validation failed', 400);
    }
    next();
};

// Routes
router.post('/send',
    otpLimiter,
    functionGate('otp.send'),
    [
        body('email').isEmail().withMessage('Invalid email address')
    ],
    validate,
    otpController.sendOTP
);

router.post('/verify',
    otpLimiter,
    functionGate('otp.verify'),
    [
        body('email').isEmail().withMessage('Invalid email address'),
        body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    ],
    validate,
    otpController.verifyOTP
);

module.exports = router;
