const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const integrationsController = require('./integrations.controller');
const { verifyToken, isAdmin } = require('../../core/middleware/auth');
const saturnOnly = require('../../core/middleware/saturnOnly');

// Rate limiter for integration management
const integrationsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Increased for admin dashboard usage
    message: { success: false, message: 'Too many integration requests, please try again later.' }
});

router.use(verifyToken);
router.use(isAdmin);
router.use(saturnOnly); // Integration management is global saturn property

router.get('/', integrationsLimiter, integrationsController.getProjects);
router.post('/', integrationsLimiter, integrationsController.addProject);
router.patch('/:id/maintenance', integrationsLimiter, integrationsController.toggleMaintenance);
router.delete('/:id', integrationsLimiter, integrationsController.deleteProject);

module.exports = router;
