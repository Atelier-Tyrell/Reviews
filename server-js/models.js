const pool = require('../db/db');
const format = require('pg-format');

const getReviews = async (id, page, count, sort) => {
  const offset = (page - 1) * count;
  try {
    const query = await pool.query(
      `SELECT * FROM reviews.reviews, reviews.photos
       WHERE product_id = $1
       ORDER BY $2
       LIMIT $3
       OFFSET $4`,
      [id, sort, count, offset]
    );
    return query;
  } catch (error) {
    return error;
  }
};


const getMetadata = async (id) => {
  try {
    const query = await pool.query(
      `SELECT (
         id,
         num_1_stars,
         num_2_stars,
         num_3_stars,
         num_4_stars,
         num_5_stars,
         fit_id,
         width_id,
         length_id,
         comfort_id,
         quality_id,
         quality_total::float / num_reviews,
         fit_total::float / num_reviews,
         length_total::float / num_reviews,
         comfort_total::float / num_reviews,
         quality_total::float / num_reviews,
         num_recommended
       )
       FROM reviews.products
       WHERE id = $1`,
      [id]
    );
    console.log(query.rows);
  } catch (error) {
    throw error;
    console.log(error);
  }
}

const addReview = async () => {
}

const markReviewHelpful = async () => {
}

const reportReview = async () => {
}


module.exports = {
  getReviews,
  getMetadata
}
