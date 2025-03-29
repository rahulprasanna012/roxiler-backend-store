const express = require('express');
const router = express.Router();
const RatingController = require('../controllers/ratingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/', authMiddleware, roleMiddleware(['user']), RatingController.submitRating);
router.get('/user', authMiddleware, roleMiddleware(['user']), RatingController.getUserRatings);

module.exports = router;