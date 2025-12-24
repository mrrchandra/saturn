const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/auth-attempts', verifyToken, isAdmin, analyticsController.getAuthAttempts);
router.get('/users-registered', verifyToken, isAdmin, analyticsController.getUsersRegistered);

module.exports = router;
