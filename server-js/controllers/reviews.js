const models = require('../models/models');

const reviews = async (req, res) => {
  const page = req.query.page || 1;
  const count = req.query.count || 8;
  const sort = req.query.sort || 'helpful';
  const id = req.query.id;

  if (!id) {
    res.sendStatus(404);
    return;
  }

  try {
    const response = await models.reviews(id, page, count, sort);
    console.log(response);
    res.status(200).send(response);
  } catch (error) {
    res.sendStatus(504);
  }
}

module.exports = reviews;
