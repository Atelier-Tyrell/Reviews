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
             'results',
               (SELECT
                   json_agg(t)
                 FROM (
                   SELECT (
                       'id', rr.id,
                       'rating', rating,
                       'summary', summary
                   ) from reviews.reviews rr
                   LEFT JOIN reviews.photos rp
                   ON rr.id=rp.review_id
                   WHERE rr.product_id = $1 AND rr.reported = false
                   ORDER BY $2
                   LIMIT $3
                   OFFSET $4
               ) t
            )
         )
  `, [id, sort, count, offset, page]);

    return query.rows[0].json_build_object;
  } catch (error) {
    return error;
  }
};

module.exports = reviews;
