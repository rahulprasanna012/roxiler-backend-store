require('dotenv').config();
const { query } = require('./config/db');

const initializeDatabase = async () => {
  try {
    // Create tables if they don't exist
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(400),
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        address VARCHAR(400),
        owner_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        store_id INTEGER REFERENCES stores(id),
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, store_id)
      )
    `);

    console.log('Database tables initialized');

    // Check if data already exists to prevent duplicate seeding
    const usersCount = await query('SELECT COUNT(*) FROM users');
    if (usersCount.rows[0].count === '0') {
      console.log('Seeding database with test data...');
      
      // 1. First insert users (no dependencies)
      const users = await query(`
        INSERT INTO users (name, email, password, address, role, created_at) VALUES
        ('Admin User', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H3dYj6QjP9y6VqGUXJZz4.5WYy', '123 Admin Blvd, Tech City', 'admin', '2023-01-01 09:00:00'),
        ('Store Owner 1', 'owner1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H3dYj6QjP9y6VqGUXJZz4.5WYy', '456 Business Ave, Commerce Town', 'store_owner', '2023-01-15 10:30:00'),
        ('Store Owner 2', 'owner2@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H3dYj6QjP9y6VqGUXJZz4.5WYy', '789 Market St, Retail Village', 'store_owner', '2023-02-01 11:45:00'),
        ('Regular User 1', 'user1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H3dYj6QjP9y6VqGUXJZz4.5WYy', '321 Consumer Lane, Shopper City', 'user', '2023-02-15 13:15:00'),
        ('Regular User 2', 'user2@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H3dYj6QjP9y6VqGUXJZz4.5WYy', '654 Buyer Road, Purchase Town', 'user', '2023-03-01 14:30:00')
        RETURNING id, email
      `);

      // Find user IDs by email for clearer reference
      const userMap = {};
      users.rows.forEach(user => {
        userMap[user.email] = user.id;
      });

      // 2. Then insert stores (depends on users)
      const stores = await query(`
        INSERT INTO stores (name, email, address, owner_id, created_at) VALUES
        ('Tech Haven', 'tech@example.com', '123 Gadget Street, Tech City', $1, '2023-01-20 10:00:00'),
        ('Fashion Forward', 'fashion@example.com', '456 Style Avenue, Trendy Town', $1, '2023-02-05 11:30:00'),
        ('Grocery Plus', 'grocery@example.com', '789 Market Lane, Foodville', $2, '2023-02-20 13:45:00'),
        ('Book Nook', 'books@example.com', '321 Literature Road, Readerville', $2, '2023-03-10 15:00:00')
        RETURNING id, name
      `, [userMap['owner1@example.com'], userMap['owner2@example.com']]);

      // Create store ID mapping
      const storeMap = {};
      stores.rows.forEach(store => {
        storeMap[store.name] = store.id;
      });

      // 3. Finally insert ratings (depends on both users and stores)
      await query(`
        INSERT INTO ratings (user_id, store_id, rating, created_at) VALUES
        ($1, $2, 5, '2023-03-05 09:15:00'),
        ($3, $2, 4, '2023-03-06 10:30:00'),
        ($1, $4, 3, '2023-03-07 11:45:00'),
        ($3, $4, 5, '2023-03-08 13:00:00'),
        ($1, $5, 4, '2023-03-09 14:15:00'),
        ($3, $5, 2, '2023-03-10 15:30:00'),
        ($1, $6, 5, '2023-03-11 16:45:00'),
        ($3, $6, 4, '2023-03-12 18:00:00')
      `, [
        userMap['user1@example.com'], 
        storeMap['Tech Haven'],
        userMap['user2@example.com'],
        storeMap['Fashion Forward'],
        storeMap['Grocery Plus'],
        storeMap['Book Nook']
      ]);

      console.log('Test data successfully seeded');
    } else {
      console.log('Database already contains data - skipping seeding');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Run the initialization
initializeDatabase();