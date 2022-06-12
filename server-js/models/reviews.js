const pool = require('../../db/db');

const reviews = async (id, page, count, sort) => {
  const offset = (page - 1) * count;
  try {
    const query = await pool.query(`
      SELECT (
         json_build_object(
             'product', product_id,
             'page', 0,
             'count', 0,
             'results', 0,
             'photos', 0
         )
      )
      FROM reviews.reviews rr
      LEFT JOIN reviews.photos rp
      ON rr.id=rp.review_id
      WHERE rr.product_id = $1 AND rr.reported = false
      ORDER BY $2
      LIMIT $3
      OFFSET $4;
  `, [id, sort, count, offset]);

    return query;
  } catch (error) {
    return error;
  }
};

module.exports = reviews;
