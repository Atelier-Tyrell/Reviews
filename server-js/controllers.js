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

  const response = await models.reviews(id, page, count, sort);
  console.log(response.rows);
  res.sendStatus(200);
}

const getMetadata = async (req, res) => {
  const id = req.query.id;
  try {
    const query = await models.metadata(id);
    res.status(200).send(query[0].json_build_object);
  } catch (error) {
    console.error(error);
    res.status(504).send(error);
  }
}

const addReview = async (req, res) => {
  console.log(req.body);
  res.sendStatus(201);
}

const markReviewHelpful = async (req, res) => {
  try {
    const result = await models.markHelpful(req.body.id);
    res.status(201).send(result);
  } catch (error) {
    console.error(error);
    res.status(504).send(error);
  }
}

const reportReview = async (req, res) => {
  try {
    const result = await models.markReported(req.body.id);
    res.status(201).send(result);
  } catch (error) {
    console.error(error);
    res.status(504).send(error);
  }
}

module.exports = {
  getReviews,
  getMetadata
}
