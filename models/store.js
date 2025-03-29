const db = require('../config/db');

const Store = {
  create: async ({ name, email, address, owner_id }) => {
    const { rows } = await db.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, address, owner_id]
    );
    return rows[0];
  },

  getAllStores: async (filters = {}) => {
    let query = `
      SELECT s.*, 
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as rating_count
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (filters.name) {
      query += ` AND s.name ILIKE $${paramCount}`;
      params.push(`%${filters.name}%`);
      paramCount++;
    }

    if (filters.address) {
      query += ` AND s.address ILIKE $${paramCount}`;
      params.push(`%${filters.address}%`);
      paramCount++;
    }

    query += ' GROUP BY s.id';

    if (filters.sortBy) {
      const sortOrder = filters.sortOrder === 'desc' ? 'DESC' : 'ASC';
      if (filters.sortBy === 'average_rating') {
        query += ` ORDER BY average_rating ${sortOrder}`;
      } else {
        query += ` ORDER BY s.${filters.sortBy} ${sortOrder}`;
      }
    }

    const { rows } = await db.query(query, params);
    return rows;
  },

  getStoreById: async (id) => {
    const { rows } = await db.query(
      `SELECT s.*, 
              COALESCE(AVG(r.rating), 0) as average_rating,
              COUNT(r.id) as rating_count
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.id = $1
       GROUP BY s.id`,
      [id]
    );
    return rows[0];
  },

  getStoresByOwner: async (ownerId) => {
    const { rows } = await db.query(
      `SELECT s.*, 
              COALESCE(AVG(r.rating), 0) as average_rating,
              COUNT(r.id) as rating_count
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.owner_id = $1
       GROUP BY s.id`,
      [ownerId]
    );
    return rows;
  },

  countStores: async () => {
    const { rows } = await db.query('SELECT COUNT(*) FROM stores');
    return parseInt(rows[0].count);
  },
};

module.exports = Store;