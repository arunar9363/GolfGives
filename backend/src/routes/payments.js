const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createCheckout, cancelSubscription, getPortalLink, stripeWebhook } = require('../controllers/paymentController');

// Webhook — raw body (applied in server.js before express.json)
router.post('/webhook', stripeWebhook);

router.post('/create-checkout', protect, createCheckout);
router.post('/cancel', protect, cancelSubscription);
router.get('/portal', protect, getPortalLink);

module.exports = router;
