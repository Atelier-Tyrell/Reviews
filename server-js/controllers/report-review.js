const models = require('../models/models');

const reportReview = async (req, res) => {
  try {
    const result = await models.markReported(req.body.id);
    res.status(201).send(result);
  } catch (error) {
    console.error(error);
    res.status(504).send(error);
  }
}

module.exports = reportReview;
