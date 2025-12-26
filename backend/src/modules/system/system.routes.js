const express = require('express');
const router = express.Router();
const systemController = require('./system.controller');
const { verifyToken, isAdmin } = require('../../core/middleware/auth');

router.get('/stats', verifyToken, isAdmin, systemController.getStats);
router.get('/recent-activity', verifyToken, isAdmin, systemController.getRecentActivity);
router.get('/registry', systemController.getRegistry);

module.exports = router;
