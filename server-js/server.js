require('dotenv').config();

const express = require('express');
const morgan = require('morgan');

const routes = require('./routes');

const app = express();

/* Middleware */
app.use(express.json());
//app.use(morgan('combined'));

/* Routes */
app.use(routes);

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Listening on port ${process.env.SERVER_PORT}...`);
});
