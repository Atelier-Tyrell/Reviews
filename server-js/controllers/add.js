const models = require('../models/models');

const add = async (req, res) => {
  console.log(req.body);
  res.sendStatus(201);
}

module.exports = add;
