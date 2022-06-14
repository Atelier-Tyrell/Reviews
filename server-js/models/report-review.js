const pool = require('../db/db');

const reportReview = async (id) => {
  console.log(id);
  try {
    const result = await pool.query(
      `UPDATE reviews.reviews
       SET reported = true
       WHERE reviews.id = $1`,
      [id]
    )

    return result;
  } catch (error) {
    return error;
  }
}

module.exports = reportReview;
