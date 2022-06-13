const pool = require('../db/db');

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
                  'Size', json_build_object(
                      'id', size_id,
                      'value', size_total::float / num_reviews
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

module.exports = metadata;
