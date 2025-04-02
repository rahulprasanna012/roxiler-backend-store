const db = require('../config/db');

const Rating = {
  createOrUpdate: async ({ user_id, store_id, rating }) => {
    try {
      const { rows } = await db.query(
        `INSERT INTO ratings (user_id, store_id, rating)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, store_id) 
         DO UPDATE SET rating = $3, updated_at = NOW()
         RETURNING *`,
        [user_id, store_id, rating]
      );
      return rows[0];
    } catch (error) {
      console.error('Error in createOrUpdate:', error);
      throw new Error('Failed to create or update rating');
    }
  },

  getUserRatingForStore: async (user_id, store_id) => {
    try {
      const { rows } = await db.query(
        'SELECT * FROM ratings WHERE user_id = $1 AND store_id = $2',
        [user_id, store_id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in getUserRatingForStore:', error);
      throw new Error('Failed to get user rating for store');
    }
  },

  getRatingsForStore: async (store_id) => {
    try {
      const { rows } = await db.query(
        `SELECT r.*, u.name as user_name, u.email as user_email
         FROM ratings r
         JOIN users u ON r.user_id = u.id
         WHERE r.store_id = $1
         ORDER BY r.created_at DESC`,
        [store_id]
      );
      return rows;
    } catch (error) {
      console.error('Error in getRatingsForStore:', error);
      throw new Error('Failed to get ratings for store');
    }
  },

  getUserRatings: async (user_id) => {
    try {
      const { rows } = await db.query(
        `SELECT r.*, s.name as store_name, s.address as store_address
         FROM ratings r
         JOIN stores s ON r.store_id = s.id
         WHERE r.user_id = $1
         ORDER BY r.updated_at DESC`,
        [user_id]
      );
      return { 
        success: true,
        data: rows,
        count: rows.length
      };
    } catch (error) {
      console.error('Error in getUserRatings:', error);
      throw new Error('Failed to get user ratings');
    }
  },

  countRatings: async () => {
    try {
      const { rows } = await db.query('SELECT COUNT(*) FROM ratings');
      return parseInt(rows[0].count);
    } catch (error) {
      console.error('Error in countRatings:', error);
      throw new Error('Failed to count ratings');
    }
  }
};

module.exports = Rating;