const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { validateCreateUser, validateCreateStore } = require('../middleware/validationMiddleware');
const adminController = require('../controllers/adminController');

// Dashboard
router.get('/dashboard', auth(['admin']), adminController.getDashboardStats);

// User Management
router.post('/users', auth(['admin']), validateCreateUser, adminController.createUser);
router.get('/users', auth(['admin']), adminController.listUsers);
router.get('/users/:id', auth(['admin']), adminController.getUserDetails);

// Store Management
router.post('/stores', auth(['admin']), validateCreateStore, adminController.createStore);
router.get('/stores', auth(['admin']), adminController.listStores);

router.get('/users', authMiddleware, roleMiddleware(['admin']), RatingController.getUserRatings);

module.exports = router;