const pool = require('../db/db');
const format = require('pg-format');

console.log(pool);

const getReviews = async (id, page, count, sort) => {
  const offset = (page - 1) * count;
  const query = await pool.query(
    `SELECT * FROM reviews.reviews
     WHERE product_id = $1
     ORDER BY $2
     LIMIT $3
     OFFSET $4`,
    [id, sort, count, offset]
  );
  return query;
};

module.exports = {
  getReviews,
}
