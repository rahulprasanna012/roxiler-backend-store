const db = require('../config/db');

const User = {
  create: async ({ name, email, password, address, role }) => {
    const { rows } = await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, password, address, role]
    );
    return rows[0];
  },

  findByEmail: async (email) => {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  },

  findById: async (id) => {
    
    const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0];
  },

  updatePassword: async (id, newPassword) => {
    const { rows } = await db.query(
      'UPDATE users SET password = $1 WHERE id = $2 RETURNING *',
      [newPassword, id]
    );
    return rows[0];
  },


  findByRole: async (role) => {
    try {
      const { rows } = await db.query(
        'SELECT id, name, email FROM users WHERE role = $1',
        [role]
      );
      return rows;
    } catch (error) {
      console.error('Error finding users by role:', error);
      throw error;
    }
  },

  getAllUsers: async (filters = {}) => {
    let query = 'SELECT * FROM users WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.name) {
      query += ` AND name ILIKE $${paramCount}`;
      params.push(`%${filters.name}%`);
      paramCount++;
    }

    if (filters.email) {
      query += ` AND email ILIKE $${paramCount}`;
      params.push(`%${filters.email}%`);
      paramCount++;
    }

    if (filters.address) {
      query += ` AND address ILIKE $${paramCount}`;
      params.push(`%${filters.address}%`);
      paramCount++;
    }

    if (filters.role) {
      query += ` AND role = $${paramCount}`;
      params.push(filters.role);
      paramCount++;
    }

    if (filters.sortBy) {
      const sortOrder = filters.sortOrder === 'desc' ? 'DESC' : 'ASC';
      query += ` ORDER BY ${filters.sortBy} ${sortOrder}`;
    }

    const { rows } = await db.query(query, params);
    return rows;
  },

  countUsers: async () => {
    const { rows } = await db.query('SELECT COUNT(*) FROM users');
    return parseInt(rows[0].count);
  },
};

module.exports = User;