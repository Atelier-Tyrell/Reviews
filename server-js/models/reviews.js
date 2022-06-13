const pool = require('../db/db');

const reviews = async (id, page, count, sort) => {
  const offset = (page - 1) * count;
  try {
    const query = await pool.query(`
      SELECT
         json_build_object(
             'product', $1::integer,
             'page', $5::integer,
             'count', $3::integer,
             'results', (

              SELECT json_agg(
                      json_build_object(
                        'id', reviews.reviews.id,
                        'rating', rating,
                        'summary', summary,
                        'recommend', recommended,
                        'response', response,
                        'body', body,
                        'date', created_at,
                        'review_name', name,
                        'helpfulness', helpful,
                         'photos', ( SELECT
                          json_agg(
                            json_build_object(
                              'id', id,
                              'url', url
                            )
                          )
                            FROM reviews.photos
                            WHERE reviews.photos.review_id = reviews.reviews.id
                        )
                      )
                    ) as results
                      FROM reviews.reviews
                      WHERE reviews.reviews.product_id = $1
                      AND reviews.reviews.reported = false
                      ORDER BY $2
                      LIMIT $3
                      OFFSET $4
           )
        );
  `, [id, sort, count, offset, page]);

    return query.rows[0].json_build_object;
  } catch (error) {
    return error;
  }
};

module.exports = reviews;
