const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { error } = require('../utils/response');

// Configure Multer (In-memory storage for cloud relay)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Configure Rate Limiting for Auth
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1024, // 15 minutes
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
    [
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],
    validate,
    authController.register
);

router.post('/login',
    authLimiter,
    [
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    validate,
    authController.login
);

router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

router.post('/pfp',
    upload.single('file'),
    authController.uploadPFP
);

module.exports = router;
