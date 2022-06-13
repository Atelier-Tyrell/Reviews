const express = require('express');
const router = express.Router();
const ctrls = require('./controllers/controllers');

router.get('/reviews', (req, res) => ctrls.reviews(req, res));
router.get('/reviews/meta', (req, res) => ctrls.metadata(req, res));
router.post('/reviews', (req, res) => ctrls.add(req, res));
router.put('/reviews/:review_id/helpful', (req, res) => ctrls.markHelpful(req, res));
router.put('/reviews/:review_id/report', (req, res) => ctrls.reportReview(req, res));

module.exports = router;
