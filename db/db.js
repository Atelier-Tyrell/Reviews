/*
 * Creates the pool connection to Postgres.
*/

require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  'user': process.env.POSTGRES_USER,
  'password': process.env.POSTGRES_PASSWORD,
  'database': process.env.DATABASE
})

pool.on('error', (error, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: async (text, params) => {
    return await pool.query(text, params);
  },
}
