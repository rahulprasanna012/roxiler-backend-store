const { User, Store, Rating } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const ErrorHandler = require('../utils/errorHandler');
const bcrypt = require('bcrypt');
const config = require('../config/config');

class AdminController {
    // Dashboard Statistics
    async getDashboardStats(req, res, next) {
        try {
            const [users, stores, ratings] = await Promise.all([
                User.count(),
                Store.count(),
                Rating.count()
            ]);

            return new ApiResponse(res).success(200, {
                totalUsers: users,
                totalStores: stores,
                totalRatings: ratings
            }, 'Dashboard stats retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    // User Management
    async createUser(req, res, next) {
        try {
            const { name, email, password, address, role = 'user' } = req.body;
            
            // Validation
            if (!['user', 'admin', 'store_owner'].includes(role)) {
                throw new ErrorHandler(400, 'Invalid role specified');
            }

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                throw new ErrorHandler(400, 'Email already in use');
            }

            const hashedPassword = await bcrypt.hash(password, config.PASSWORD_SALT_ROUNDS);
            const user = await User.create({
                name,
                email,
                password: hashedPassword,
                address,
                role
            });

            return new ApiResponse(res).success(201, {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    address: user.address,
                    role: user.role,
                    createdAt: user.createdAt
                }
            }, 'User created successfully');
        } catch (error) {
            next(error);
        }
    }

    // Store Management
    async createStore(req, res, next) {
        try {
            const { name, email, address, ownerId } = req.body;

            const owner = await User.findByPk(ownerId);
            if (!owner) {
                throw new ErrorHandler(404, 'Owner not found');
            }
            if (owner.role !== 'store_owner') {
                throw new ErrorHandler(400, 'Specified user is not a store owner');
            }

            const store = await Store.create({
                name,
                email,
                address,
                ownerId
            });

            return new ApiResponse(res).success(201, { store }, 'Store created successfully');
        } catch (error) {
            next(error);
        }
    }

    // Listings with Filters
    async listUsers(req, res, next) {
        try {
            const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;
            
            const where = {};
            if (name) where.name = { [Op.iLike]: `%${name}%` };
            if (email) where.email = { [Op.iLike]: `%${email}%` };
            if (address) where.address = { [Op.iLike]: `%${address}%` };
            if (role) where.role = role;

            const users = await User.findAll({
                where,
                order: [[sortBy, sortOrder]],
                attributes: ['id', 'name', 'email', 'address', 'role', 'createdAt']
            });

            return new ApiResponse(res).success(200, { users }, 'Users retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    async listStores(req, res, next) {
        try {
            const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
            
            const where = {};
            if (name) where.name = { [Op.iLike]: `%${name}%` };
            if (email) where.email = { [Op.iLike]: `%${email}%` };
            if (address) where.address = { [Op.iLike]: `%${address}%` };

            const stores = await Store.findAll({
                where,
                order: [[sortBy, sortOrder]],
                include: [{
                    model: Rating,
                    as: 'ratings',
                    attributes: []
                }],
                attributes: [
                    'id',
                    'name',
                    'email',
                    'address',
                    'ownerId',
                    'createdAt',
                    [sequelize.fn('COALESCE', sequelize.fn('AVG', sequelize.col('ratings.rating')), 0), 'averageRating']
                ],
                group: ['Store.id']
            });

            return new ApiResponse(res).success(200, { stores }, 'Stores retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    // User Details
    async getUserDetails(req, res, next) {
        try {
            const { id } = req.params;

            const user = await User.findByPk(id, {
                attributes: ['id', 'name', 'email', 'address', 'role', 'createdAt']
            });

            if (!user) {
                throw new ErrorHandler(404, 'User not found');
            }

            let responseData = { user };

            if (user.role === 'store_owner') {
                const stores = await Store.findAll({
                    where: { ownerId: user.id },
                    include: [{
                        model: Rating,
                        as: 'ratings',
                        attributes: []
                    }],
                    attributes: [
                        'id',
                        'name',
                        'email',
                        'address',
                        'createdAt',
                        [sequelize.fn('COALESCE', sequelize.fn('AVG', sequelize.col('ratings.rating')), 0), 'averageRating']
                    ],
                    group: ['Store.id']
                });

                responseData.stores = stores;
            }

            return new ApiResponse(res).success(200, responseData, 'User details retrieved successfully');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AdminController();