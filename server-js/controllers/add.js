const models = require('../models/models');

const add = async (req, res) => {
  try {
    const result = await models.add(req.body);
    res.status(201).send(result);
  } catch (error) {
    res.status(504).send(error);
  }
}

module.exports = add;
