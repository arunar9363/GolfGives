const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getCharities, getCharityBySlug, selectCharity, createCharity, updateCharity, deleteCharity } = require('../controllers/charityController');

// Public
router.get('/', getCharities);
router.get('/:slug', getCharityBySlug);

// Subscriber
router.put('/select', protect, selectCharity);

// Admin
router.post('/', protect, adminOnly, createCharity);
router.put('/:id', protect, adminOnly, updateCharity);
router.delete('/:id', protect, adminOnly, deleteCharity);

module.exports = router;
