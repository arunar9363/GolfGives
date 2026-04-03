const express = require('express');
const router = express.Router();
const { protect, adminOnly, requireSubscription } = require('../middleware/auth');
const { getDraws, getLatestDraw, getDrawById, getMyParticipation, simulateDrawAdmin, executeDrawAdmin } = require('../controllers/drawController');

// Public
router.get('/', getDraws);
router.get('/latest', getLatestDraw);
router.get('/:id', getDrawById);

// Subscriber
router.get('/user/participation', protect, requireSubscription, getMyParticipation);

// Admin
router.post('/simulate', protect, adminOnly, simulateDrawAdmin);
router.post('/execute', protect, adminOnly, executeDrawAdmin);

module.exports = router;
