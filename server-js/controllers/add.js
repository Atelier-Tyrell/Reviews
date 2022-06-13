const models = require('../models/models');

const add = async (req, res) => {
  try {
    await models.add(req.body);
    res.sendStatus(201);
  } catch (error) {
    res.status(504).send(error);
  }
}

module.exports = add;
