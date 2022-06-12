require('dotenv').config();

const express = require('express');
const morgan = require('morgan');

const controllers = require('./controllers');

const app = express();

/* Middleware */
app.use(express.json());
app.use(morgan('combined'));


/* Routes */
app.get('/reviews/', (req, res) => controllers.getReviews(req, res));

app.get('/reviews/meta', (req, res) => controllers.getMetadata(req, res));

app.post('/reviews', (req, res) => controllers.addReview(req, res));

app.put('/reviews/:review_id/helpful', (req, res) => controllers.markReviewHelpful(id));

app.put('/reviews/:review_id/report', (req, res) => controllers.reportReview(id));


/* Launch */
app.listen(process.env.SERVER_PORT, () => {
  console.log(`Listening on port ${process.env.SERVER_PORT}...`);
});
