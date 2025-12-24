const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

const { verifyToken, isAdmin } = require('../middleware/auth');

router.patch('/user/:id', verifyToken, isAdmin, adminController.updateUser);
router.delete('/user/:id', verifyToken, isAdmin, adminController.deleteUser);
router.get('/users', verifyToken, isAdmin, adminController.listUsers);
router.patch('/site-settings', verifyToken, isAdmin, adminController.updateSiteSettings);
router.get('/site-settings', verifyToken, isAdmin, adminController.getSiteSettings);


module.exports = router;
