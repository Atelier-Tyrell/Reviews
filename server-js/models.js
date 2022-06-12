const pool = require('../db/db');
const format = require('pg-format');


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


const metadata = async (id) => {
  try {
    const query = await pool.query(`
      SELECT (
          json_build_object(
              'product_id', id,
              'ratings', json_build_object(
                  '1', num_1_stars,
                  '2', num_2_stars,
                  '3', num_3_stars,
                  '4', num_4_stars,
                  '5', num_5_stars
              ),
              'recommended', num_recommended,
              'characteristics', json_build_object(
                  'Fit', json_build_object(
                      'id', fit_id,
                      'value', fit_total::float / num_reviews
                  ),
                  'Width', json_build_object(
                      'id', width_id,
                      'value', width_total::float / num_reviews
                  ),
                  'Comfort', json_build_object(
                      'id', comfort_id,
                      'value', comfort_total::float / num_reviews
                  ),
                  'Quality', json_build_object(
                      'id', quality_id,
                      'value', quality_total::float / num_reviews
                  ),
                  'Length', json_build_object(
                      'id', length_id,
                      'value', length_total::float / num_reviews
                  )
              )
          )
      )
      FROM reviews.products WHERE reviews.products.id = $1;
    `, [id])

    return query.rows;
  } catch (error) {
    return error;
  }
}

const addReview = async () => {
}

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

const markReported = async (id) => {
  try {
    const result = await pool.query(
      `UPDATE reviews.reviews
       SET reported = true
       WHERE reviews.reviews_id = $1`,
      [id]
    )

    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  reviews,
  metadata,
  addReview,
  markHelpful,
  markReported
}
