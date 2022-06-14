const models = require('../models/models');

const reportReview = async (req, res) => {
  const id = req.params.review_id;
  try {
    const result = await models.reportReview(id);
    res.status(201).send(result);
  } catch (error) {
    console.error(error);
    res.status(504).send(error);
  }
}

module.exports = reportReview;
