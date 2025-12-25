const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const adminController = require('../controllers/adminController');
const functionController = require('../controllers/functionController');

const { verifyToken, isAdmin } = require('../middleware/auth');

// Strict rate limiter for admin operations
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { success: false, message: 'Too many admin requests, please try again later.' }
});

router.patch('/user/:id', adminLimiter, verifyToken, isAdmin, adminController.updateUser);
router.delete('/user/:id', adminLimiter, verifyToken, isAdmin, adminController.deleteUser);
router.get('/users', adminLimiter, verifyToken, isAdmin, adminController.listUsers);
router.patch('/site-settings', adminLimiter, verifyToken, isAdmin, adminController.updateSiteSettings);
router.get('/site-settings', adminLimiter, verifyToken, isAdmin, adminController.getSiteSettings);

// Function management routes
router.get('/functions', adminLimiter, verifyToken, isAdmin, functionController.getAllFunctions);
router.get('/projects/:projectId/functions', adminLimiter, verifyToken, isAdmin, functionController.getProjectFunctions);
router.patch('/projects/:projectId/functions/:functionId', adminLimiter, verifyToken, isAdmin, functionController.toggleProjectFunction);

module.exports = router;
