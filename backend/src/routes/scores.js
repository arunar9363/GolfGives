const express = require('express');
const router = express.Router();
const { protect, requireSubscription } = require('../middleware/auth');
const { getMyScores, addScore, editScore, deleteScore } = require('../controllers/scoreController');

router.get('/my', protect, requireSubscription, getMyScores);
router.post('/add', protect, requireSubscription, addScore);
router.put('/:scoreId', protect, requireSubscription, editScore);
router.delete('/:scoreId', protect, requireSubscription, deleteScore);

module.exports = router;
