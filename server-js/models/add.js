const pool = require('../db/db');
const format = require('pg-format');

const add = async (body) => {
  try {
    // INSERT REVIEW
    let reviewID = await pool.query(`
      INSERT INTO reviews.reviews
      (
          product_id,
          rating,
          summary,
          body,
          recommended,
          name,
          email
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `, [body.product_id, body.rating, body.summary, body.body, body.recommend, body.name, body.email]);

    const star_col = `num_${String(body.rating)}_stars`;
    const recommended_inc = body.recommend ? 1 : 0;
    reviewID = reviewID.rows[0].id;

    // Insert photos
    if (body.photos.length) {
      await pool.query(`
        INSERT INTO reviews.photos (review_id, url)
        SELECT $1, value FROM json_array_elements($2);
      `, [reviewID, JSON.stringify(body.photos)] // postgres is drunk
      )
    }

    // Update metadata
    // num_reviews, star count, num_recommended
    await pool.query(
      format(`
        UPDATE reviews.products rp
        SET
          %s = %s + 1,
          num_reviews = num_reviews + 1,
          num_recommended = num_recommended + %s
        WHERE rp.id = %s;
      `, star_col, star_col, recommended_inc, body.product_id)
    )

    if (body.characteristics.length) {
    }

    return;
  } catch (error) {
    console.log(error);
    return error;
  }
}

module.exports = add;
