const models = require('../models/models');

const metadata = async (req, res) => {
  const id = req.query.id;
  try {
    const query = await models.metadata(id);
    res.status(200).send(query[0].json_build_object);
  } catch (error) {
    console.error(error);
    res.status(504).send(error);
  }
}

module.exports = metadata;
