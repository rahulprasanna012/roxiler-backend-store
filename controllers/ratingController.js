const { Rating, Store } = require('../models');
const db = require('../config/db');

const RatingController = {
  submitRating: async (req, res) => {
    try {
      const { userId,storeId} = req.body;
      const rating= req.body.rating.rating;
      
      // Validate input
      if (!storeId || !rating) {
        return res.status(400).json({ 
          message: 'storeId and rating are required',
          error: 'MISSING_FIELDS'
        });
      }

      if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ 
          message: 'Rating must be a number between 1 and 5',
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

    

      if (store.owner_id === userId) {
        return res.status(403).json({
          message: 'Cannot rate your own store',
          error: 'SELF_RATING_NOT_ALLOWED'
        });
      }

      // Create/update rating
      const newRating = await Rating.createOrUpdate({
        user_id: userId,
        store_id: storeId,
        rating
      });

      // Get updated store data with average rating
      const updatedStore = await Store.getStoreById(storeId);

      res.json({ 
        success: true,
        message: 'Rating submitted successfully',
        rating: newRating,
        store: updatedStore
      });

    } catch (error) {
      console.error('Rating submission error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error submitting rating',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  getUserRatings: async (req, res) => {
    try {
      
      const userId = req.params.userId || req.user.id;
      
      // If admin or requesting own ratings
      if (req.user.role === 'admin' || userId === req.user.id) {
        const ratings = await Rating.getUserRatings(userId);
        return res.status(200).json({
          success: true,
          data: ratings
        });
      }
      
      // Unauthorized access
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view these ratings'
      });
  
    } catch (error) {
      console.error('Get user ratings error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user ratings',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = RatingController;