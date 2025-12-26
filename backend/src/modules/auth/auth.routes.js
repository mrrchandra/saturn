const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authController = require('./auth.controller');
// sessionController logic moved to local module
const sessionController = require('./session.controller');
const { verifyToken } = require('../../core/middleware/auth');
const { error } = require('../../core/utils/response');
const functionGate = require('../../core/middleware/functionGate');

// Configure Multer (In-memory storage for cloud relay)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Configure Rate Limiting for Auth
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});

// Validation Middleware Helper
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return error(res, errors.array(), 'Validation failed', 400);
    }
    next();
};

// Routes
router.post('/register',
    authLimiter,
    functionGate('auth.register'),
    [
        body('email').isEmail().withMessage('Invalid email address'),
        body('username').optional().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters').matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],
    validate,
    authController.register
);

router.post('/login',
    authLimiter,
    functionGate('auth.login'),
    [
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    validate,
    authController.login
);

// Session check
router.get('/session', sessionController.session);
router.get('/me', sessionController.session);

router.post('/refresh', functionGate('auth.refresh'), authController.refresh);
router.post('/logout', verifyToken, functionGate('auth.logout'), authController.logout);

router.post('/pfp',
    functionGate('auth.upload-pfp'),
    upload.single('file'),
    // Note: uploadPFP was not moved to auth.service properly yet (it was in the controller logic I pasted, 
    // but the controller I created DID NOT include uploadPFP! I missed it in the controller creation step).
    // I need to update auth.controller.js to include uploadPFP.
    // For now, I'll point to the new controller and I will fix the controller immediately after this.
    authController.uploadPFP
);


// OTP routes
router.post('/send-otp',
    authLimiter,
    functionGate('otp.send'),
    [
        body('email').isEmail().withMessage('Invalid email address')
    ],
    validate,
    authController.sendOTP
);


router.post('/verify-otp',
    authLimiter,
    functionGate('otp.verify'),
    [
        body('email').isEmail().withMessage('Invalid email address'),
        body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    ],
    validate,
    authController.verifyOTPCode
);

// Password reset routes
router.post('/forgot-password',
    authLimiter,
    functionGate('auth.forgot-password'),
    [
        body('email').isEmail().withMessage('Invalid email address')
    ],
    validate,
    authController.forgotPassword
);

router.post('/reset-password',
    authLimiter,
    functionGate('auth.reset-password'),
    [
        body('email').isEmail().withMessage('Invalid email address'),
        body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
        body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],
    validate,
    authController.resetPassword
);

module.exports = router;
