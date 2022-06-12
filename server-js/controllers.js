const models = require('./models');

const getReviews = async (req, res) => {
  const page = req.query.page || 1;
  const count = req.query.count || 8;
  const sort = req.query.sort || 'helpful';
  const id = req.query.id;

  if (!id) {
    res.sendStatus(404);
    return;
  }

  const response = await models.getReviews(id, page, count, sort);
  console.log(response.rows);
  res.sendStatus(200);
}

const getMetadata = async (req, res) => {
  const id = req.query.id;
  const query = await models.getMetadata(id);
  console.log(query);
  res.sendStatus(200);
}

module.exports = {
  getReviews,
  getMetadata
}
