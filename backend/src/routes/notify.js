const express = require('express');
const router = express.Router();
const notifyController = require('../controllers/notifyController');

router.post('/email', notifyController.sendEmail);
router.post('/push', notifyController.sendPush);
router.post('/subscribe', notifyController.subscribe);

module.exports = router;
