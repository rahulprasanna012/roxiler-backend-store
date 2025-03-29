const express = require('express');
const router = express.Router();
const StoreController = require('../controllers/storeController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, StoreController.getAllStores);
router.get('/:id', authMiddleware, StoreController.getStoreById);
router.post('/', authMiddleware, roleMiddleware(['admin']), StoreController.createStore);
router.get('/owner/dashboard', authMiddleware, roleMiddleware(['store_owner']), StoreController.getOwnerDashboard);

module.exports = router;