const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, roleMiddleware(['admin']), UserController.getAllUsers);
router.get('/dashboard', authMiddleware, roleMiddleware(['admin']), UserController.getAdminDashboard);
router.post('/', authMiddleware, roleMiddleware(['admin']), UserController.createUser);
router.get('/:id', authMiddleware, roleMiddleware(['admin']), UserController.getUserById);

module.exports = router;