require('dotenv').config();

const express = require('express');
const morgan = require('morgan');

const app = express();

/* Middleware */
app.use(express.json());
app.use(morgan('combined'));

/* Routes */
app.get('/reviews', (req, res) => {
  // Query Parameters
  // page: integer the page of results to return - default 1
  // count: integer number of results per page - default 5
  // sort: the order, based on 'newest', 'helpful', 'relevant'
  // product_id: integer
});

app.get('/reviews/meta', (req, res) => {
  // Query Parameters
  // product_id: integer
});

app.post('/reviews', (req, res) => {
  // Body Parameters
});

app.put('/reviews/:review_id/helpful', (req, res) => {
  // Parameters
  // review_id: integer the review to update
});

app.put('/reviews/:review_id/report', (req, res) => {
  // Parameters
  // review_id: integer the review to update
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Listening on port ${process.env.SERVER_PORT}...`);
});
