const pool = require('../db/db');

const reportReview = async (id) => {
  try {
    const result = await pool.query(
      `UPDATE reviews.reviews
       SET reported = true
       WHERE reviews.reviews_id = $1`,
      [id]
    )

    return result;
  } catch (error) {
    return error;
  }
}

module.exports = reportReview;
