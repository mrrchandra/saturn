const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const integrationsController = require('../controllers/integrationsController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const saturnOnly = require('../middleware/saturnOnly');

// Rate limiter for integration management
const integrationsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,
    message: { success: false, message: 'Too many integration requests, please try again later.' }
});

router.get('/', integrationsLimiter, verifyToken, isAdmin, saturnOnly, integrationsController.getProjects);
router.post('/', integrationsLimiter, verifyToken, isAdmin, saturnOnly, integrationsController.addProject);
router.patch('/:id/maintenance', integrationsLimiter, verifyToken, isAdmin, saturnOnly, integrationsController.toggleMaintenance);
router.delete('/:id', integrationsLimiter, verifyToken, isAdmin, saturnOnly, integrationsController.deleteProject);

module.exports = router;
