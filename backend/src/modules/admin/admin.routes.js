const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const adminController = require('./admin.controller');
const { verifyToken, isAdmin } = require('../../core/middleware/auth');
const saturnOnly = require('../../core/middleware/saturnOnly');

// Strict rate limiter for admin operations
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // Increased slightly for admin dashboard use
    message: { success: false, message: 'Too many admin requests, please try again later.' }
});

// Middleware for all admin routes
router.use(verifyToken);
router.use(isAdmin);

// User Management
router.get('/users', adminLimiter, adminController.listUsers);
router.patch('/user/:id', adminLimiter, adminController.updateUser);
router.delete('/user/:id', adminLimiter, adminController.deleteUser);

// Site Settings
router.get('/site-settings', adminLimiter, adminController.getSiteSettings);
router.patch('/site-settings', adminLimiter, adminController.updateSiteSettings);

// Project & Function Management
router.get('/functions', adminLimiter, adminController.getAllFunctions);
router.get('/projects/:projectId/functions', adminLimiter, adminController.getProjectFunctions);
router.patch('/projects/:projectId/functions/:functionId', adminLimiter, adminController.toggleProjectFunction);
router.put('/projects/:projectId/origins', adminLimiter, saturnOnly, adminController.updateProjectOrigins);

module.exports = router;
