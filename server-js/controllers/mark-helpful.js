const models = require('../models/models');

const markHelpful = async (req, res) => {
  try {
    const result = await models.markHelpful(req.params.review_id);
    res.status(201).send(result);
  } catch (error) {
    console.error(error);
    res.sendStatus(504);
  }
}

module.exports = markHelpful;
