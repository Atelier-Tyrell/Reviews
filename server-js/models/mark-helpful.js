const pool = require('../db/db');

const markHelpful = async (id) => {
  try {
    const result = await pool.query(
      `UPDATE reviews.reviews
       SET helpful = true
       WHERE reviews.review_id = $1`,
      [id]
    )

    return result;
  } catch (error) {
    return error;
  }
}

module.exports = markHelpful;
