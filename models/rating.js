const db = require('../config/db');

const Rating = {
  createOrUpdate: async ({ user_id, store_id, rating }) => {
    try {
      const existingRating = await db.query(
        'SELECT * FROM ratings WHERE user_id = $1 AND store_id = $2',
        [user_id, store_id]
      );

      if (existingRating.rows.length > 0) {
        const { rows } = await db.query(
          'UPDATE ratings SET rating = $1, updated_at = NOW() WHERE user_id = $2 AND store_id = $3 RETURNING *',
          [rating, user_id, store_id]
        );
        return rows[0];
      } else {
        const { rows } = await db.query(
          'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3) RETURNING *',
          [user_id, store_id, rating]
        );
        return rows[0];
      }
    } catch (error) {
      console.error('Error in createOrUpdate:', error);
      throw error;
    }
  },

  getUserRatingForStore: async (user_id, store_id) => {
    try {
      const { rows } = await db.query(
        'SELECT * FROM ratings WHERE user_id = $1 AND store_id = $2',
        [user_id, store_id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error in getUserRatingForStore:', error);
      throw error;
    }
  },

  getRatingsForStore: async (store_id) => {
    try {
      const { rows } = await db.query(
        `SELECT r.*, u.name as user_name, u.email as user_email, u.address as user_address
         FROM ratings r
         JOIN users u ON r.user_id = u.id
         WHERE r.store_id = $1`,
        [store_id]
      );
      return rows;
    } catch (error) {
      console.error('Error in getRatingsForStore:', error);
      throw error;
    }
  },

  // NEW: Add this method to fix the ReferenceError
  getUserRatings: async (user_id) => {
    try {
      const { rows } = await db.query(
        `SELECT r.*, s.name as store_name, s.address as store_address
         FROM ratings r
         JOIN stores s ON r.store_id = s.id
         WHERE r.user_id = $1`,
        [user_id]
      );
      return rows;
    } catch (error) {
      console.error('Error in getUserRatings:', error);
      throw error;
    }
  },

  countRatings: async () => {
    try {
      const { rows } = await db.query('SELECT COUNT(*) FROM ratings');
      return parseInt(rows[0].count);
    } catch (error) {
      console.error('Error in countRatings:', error);
      throw error;
    }
  }
};

module.exports = Rating;