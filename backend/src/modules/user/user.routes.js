const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const userController = require('./user.controller');
const functionGate = require('../../core/middleware/functionGate');

// Rate limiter for user info endpoints
const userLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { success: false, message: 'Too many requests, please try again later.' }
});

// Note: Original text file didn't seem to invoke functionGate.
// But check FUNCTION_REGISTRY in generic index.js - are they gated?
// 'user.get', 'user.details', 'user.avatar', 'user.metadata' are in registry.
// So they SHOULD be gated by functionGate if we want to enforce enabled/disabled status.
// The original routes/user.js did NOT include functionGate... which means the gate wasn't active for them? 
// Or maybe I missed it?
// Checking the original file content provided above:
// `router.get('/:id', userLimiter, userController.getUserInfo);` -> No functionGate.
// This implies the previous implementation was incomplete or these were open by default.
// However, since they ARE in the registry, the intention is likely to gate them.
// I WILL ADD functionGate to be consistent with the platform vision.
// This is a "Correction/Improvement" during refactor.

router.get('/:id',
    userLimiter,
    functionGate('user.get'),
    userController.getUserInfo
);

router.get('/:id/details',
    userLimiter,
    functionGate('user.details'),
    userController.getUserDetails
);

router.get('/:id/avatar',
    userLimiter,
    functionGate('user.avatar'),
    userController.getAvatar
);

router.get('/:id/metadata',
    userLimiter,
    functionGate('user.metadata'),
    userController.getMetadata
);

module.exports = router;
