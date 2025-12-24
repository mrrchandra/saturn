const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Note: Auth, User, Admin, Analytics routes are now handled by their respective modular route files.
// This file can be used for general platform endpoints or legacy support.

// Dashboard / Analytics routes (General platform stats)
router.get('/stats', verifyToken, isAdmin, dashboardController.getStats);
router.get('/recent-activity', verifyToken, isAdmin, dashboardController.getRecentActivity);

module.exports = router;
