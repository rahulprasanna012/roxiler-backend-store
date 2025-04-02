const { Store, Rating } = require('../models');

const StoreController = {
  createStore: async (req, res) => {
    try {
      const { name, email, address, owner_id } = req.body;
      
      const store = await Store.create({
        name,
        email,
        address,
        owner_id
      });

      res.status(201).json({ 
        message: 'Store created successfully',
        store
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating store' });
    }
  },

  getAllStores: async (req, res) => {
    try {
      const { name, address, sortBy, sortOrder } = req.query;
      
      const filters = {};
      if (name) filters.name = name;
      if (address) filters.address = address;
      if (sortBy) filters.sortBy = sortBy;
      if (sortOrder) filters.sortOrder = sortOrder;
  
      let stores = await Store.getAllStores(filters);
  
      // Add user rating if authenticated user
      if (req.user && req.user.role === 'user') {
        const userId = req.user.id;
        stores = await Promise.all(stores.map(async (store) => {
          try {
            const userRating = await Rating.getUserRatingForStore(userId, store.id);
            return {
              ...store,
              user_rating: userRating ? userRating.rating : null
            };
          } catch (error) {
            console.error(`Error fetching rating for store ${store.id}:`, error);
            return store; // Return store without rating if error occurs
          }
        }));
      }
  
      res.json(stores);
    } catch (error) {
      console.error('Error in getAllStores:', error);
      res.status(500).json({ 
        message: 'Error fetching stores',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  getStoreById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const store = await Store.getStoreById(id);
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }

      if (req.role === 'user') {
        const userId = req.userId;
        const userRating = await Rating.getUserRatingForStore(userId, store.id);
        store.user_rating = userRating ? userRating.rating : null;
      }

      res.json(store);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching store' });
    }
  },

  getOwnerDashboard: async (req, res) => {
    try {
      const ownerId = req.userId;
      
      const stores = await Store.getStoresByOwner(ownerId);
      
      const storesWithRatings = await Promise.all(stores.map(async (store) => {
        const ratings = await Rating.getRatingsForStore(store.id);
        return {
          ...store,
          ratings: ratings.map(r => ({
            id: r.id,
            rating: r.rating,
            user: {
              id: r.user_id,
              name: r.user_name,
              email: r.user_email,
              address: r.user_address
            },
            created_at: r.created_at
          }))
        };
      }));

      res.json(storesWithRatings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching owner dashboard' });
    }
  },
};

module.exports = StoreController;