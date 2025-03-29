const { Rating, Store } = require('../models');
const db = require('../config/db'); // Add this missing import

const RatingController = {
  submitRating: async (req, res) => {
    try {
      const { storeId, rating } = req.body;
      const userId = req.userId;
      
      // Validate rating range
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ 
          message: 'Rating must be between 1 and 5',
          error: 'INVALID_RATING'
        });
      }

      // Check store exists
      const store = await Store.getStoreById(storeId);
      if (!store) {
        return res.status(404).json({ 
          message: 'Store not found',
          error: 'STORE_NOT_FOUND'
        });
      }

      // Prevent self-rating if user is store owner
      if (store.owner_id === userId) {
        return res.status(403).json({
          message: 'Cannot rate your own store',
          error: 'SELF_RATING_NOT_ALLOWED'
        });
      }

      // Create or update rating
      const newRating = await Rating.createOrUpdate({
        user_id: userId,
        store_id: storeId,
        rating
      });

      // Get updated store data
      const updatedStore = await Store.getStoreById(storeId);

      res.status(200).json({ 
        success: true,
        message: 'Rating submitted successfully',
        data: {
          rating: newRating,
          store: updatedStore
        }
      });

    } catch (error) {
      console.error('Rating submission error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error submitting rating',
        error: error.message
      });
    }
  },

  getUserRatings: async (req, res) => {
    try {
      const userId = req.userId;
      
      // Use the model method instead of direct db query
      const ratings = await Rating.getUserRatings(userId);

      res.status(200).json({
        success: true,
        data: ratings
      });

    } catch (error) {
      console.error('Get user ratings error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user ratings',
        error: error.message
      });
    }
  }
};

module.exports = RatingController;