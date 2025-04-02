require('dotenv').config();
const { Pool } = require('pg');

// Neon PostgreSQL connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon
  },
  connectionTimeoutMillis: 5000, // Fail fast if connection stalls
  idleTimeoutMillis: 30000,
  max: 20 // Connection pool size
});

// Test connection
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to Neon PostgreSQL database');
    client.release();
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    process.exit(1); // Exit if can't connect
  }
})();

// Log connection events
pool.on('connect', () => console.log('New client connected'));
pool.on('error', (err) => console.error('Pool error:', err));

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool // Export pool for transactions
};