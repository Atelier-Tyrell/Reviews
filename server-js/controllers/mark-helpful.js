const models = require('./models');

const markHelpful = async (req, res) => {
  try {
    const result = await models.markHelpful(req.body.id);
    res.status(201).send(result);
  } catch (error) {
    console.error(error);
    res.status(504).send(error);
  }
}

module.exports = markHelpful;
