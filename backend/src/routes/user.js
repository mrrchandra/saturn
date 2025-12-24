const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/:id', userController.getUserInfo);
router.get('/:id/details', userController.getUserDetails);
router.get('/:id/avatar', userController.getAvatar);
router.get('/:id/metadata', userController.getMetadata);

module.exports = router;
