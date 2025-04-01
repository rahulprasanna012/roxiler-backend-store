const { User, Store, Rating } = require('../models');
const bcrypt = require('bcrypt');
const UserController = {
  createUser: async (req, res) => {
    try {
      const { name, email, password, address, role } = req.body;
      
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        address,
        role
      });

      res.status(201).json({ 
        message: 'User created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          address: user.address,
          role: user.role
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating user' });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const { name, email, address, role, sortBy, sortOrder } = req.query;
      
      const filters = {};
      if (name) filters.name = name;
      if (email) filters.email = email;
      if (address) filters.address = address;
      if (role) filters.role = role;
      if (sortBy) filters.sortBy = sortBy;
      if (sortOrder) filters.sortOrder = sortOrder;

      const users = await User.getAllUsers(filters);

      const enhancedUsers = await Promise.all(users.map(async (user) => {
        if (user.role === 'store_owner') {
          const stores = await Store.getStoresByOwner(user.id);
          let totalRating = 0;
          let ratingCount = 0;
          
          for (const store of stores) {
            totalRating += parseFloat(store.average_rating) * store.rating_count;
            ratingCount += parseInt(store.rating_count);
          }
          
          const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : 0;
          return { ...user, average_rating: averageRating };
        }
        return user;
      }));

      res.json(enhancedUsers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  },




    getByRole: async (req, res) => {
      try {
        const { role } = req.params;

        console.log('Role parameter:', role); // Debugging line
        
        // Additional validation in controller
        if (!role) {
          return res.status(400).json({ 
            success: false,
            message: 'Role parameter is required' 
          });
        }
  
        const users = await User.getAllUsers(role);
        
        res.status(200).json({
          success: true,
          data: users
        });
      } catch (error) {
        console.error('Error in getByRole controller:', error.message);
        
        res.status(error.message.includes('Invalid') ? 400 : 500).json({
          success: false,
          message: error.message || 'Failed to fetch users by role'
        });
      }},
  
  


  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.role === 'store_owner') {
        const stores = await Store.getStoresByOwner(user.id);
        let totalRating = 0;
        let ratingCount = 0;
        
        for (const store of stores) {
          totalRating += parseFloat(store.average_rating) * store.rating_count;
          ratingCount += parseInt(store.rating_count);
        }
        
        const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : 0;
        user.average_rating = averageRating;
        user.stores = stores;
      }

      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching user' });
    }
  },

  getAdminDashboard: async (req, res) => {
    try {
      const [userCount, storeCount, ratingCount] = await Promise.all([
        User.countUsers(),
        Store.countStores(),
        Rating.countRatings()
      ]);

      res.json({
        userCount,
        storeCount,
        ratingCount
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching dashboard data' });
    }
  },
};

module.exports = UserController;