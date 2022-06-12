const express = require('express');
const router = express.Router();
const controllers = require('./controllers/controllers');

router.get('/reviews/', (req, res) => controllers.reviews(req, res));

router.get('/reviews/meta', (req, res) => controllers.metadata(req, res));

router.post('/reviews', (req, res) => controllers.add(req, res));

router.put('/reviews/:review_id/helpful', (req, res) =>
  controllers.markHelpful(req, res)
);

router.put('/reviews/:review_id/report', (req, res) =>
  controllers.reportReview(req, res)
);

module.exports = router;
