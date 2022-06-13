const pool = require('../db/db');

const add = async (body) => {
  console.log('here');
  try {
    pool.query(`
      INSERT INTO reviews.reviews
      (
          product_id,
          rating,
          summary,
          body,
          name,
          email
      )
      VALUES ($1, $2, $3, $4, $5, $6);
    `, [body.product_id, body.rating, body.summary, body.body, body.name, body.email]);

    const star_col = `num_${String(body.rating)}_stars`;
    const recommended_inc = body.recommended ? 1 : 0;

    if (!body.photos.length) {
      pool.query(`
        INSERT INTO reviews.photos (review_id, url)
        SELECT json_array_elements($1)
      `, [body.photos])
    }

    if (body.characteristics.length) {
    }

    return;
  } catch (error) {
    console.log('here');
    return error;
  }
}

module.exports = add;
