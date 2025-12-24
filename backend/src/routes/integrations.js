const express = require('express');
const router = express.Router();
const integrationsController = require('../controllers/integrationsController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', verifyToken, isAdmin, integrationsController.getProjects);
router.post('/', verifyToken, isAdmin, integrationsController.addProject);
router.patch('/:id/maintenance', verifyToken, isAdmin, integrationsController.toggleMaintenance);
router.delete('/:id', verifyToken, isAdmin, integrationsController.deleteProject);

module.exports = router;
