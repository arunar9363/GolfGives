const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Donation = require('../models/Donation');

// Plan pricing (in pence/cents)
const PLANS = {
  monthly: { priceId: process.env.STRIPE_MONTHLY_PRICE_ID, amount: 99900 },   // £9.99
  yearly:  { priceId: process.env.STRIPE_YEARLY_PRICE_ID,  amount: 999900 },  // £99.99
};

// @POST /api/payments/create-checkout
const createCheckout = async (req, res) => {
  try {
    const { plan } = req.body; // 'monthly' or 'yearly'
    if (!PLANS[plan]) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    const user = req.user;
    let customerId = user.subscription.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(user._id, { 'subscription.stripeCustomerId': customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?cancelled=true`,
      metadata: { userId: user._id.toString(), plan },
      subscription_data: {
        metadata: { userId: user._id.toString(), plan },
      },
    });

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/payments/cancel
const cancelSubscription = async (req, res) => {
  try {
    const user = req.user;
    if (!user.subscription.stripeSubscriptionId) {
      return res.status(400).json({ success: false, message: 'No active subscription found' });
    }

    // Cancel at period end (not immediately)
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await User.findByIdAndUpdate(user._id, { 'subscription.cancelAtPeriodEnd': true });

    res.json({ success: true, message: 'Subscription will cancel at end of billing period' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/payments/portal
const getPortalLink = async (req, res) => {
  try {
    const user = req.user;
    if (!user.subscription.stripeCustomerId) {
      return res.status(400).json({ success: false, message: 'No billing record found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.subscription.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard/settings`,
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/payments/webhook — Stripe webhook handler (raw body)
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const plan = session.metadata.plan;
        const subscriptionId = session.subscription;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);

        await User.findByIdAndUpdate(userId, {
          'subscription.status': 'active',
          'subscription.plan': plan,
          'subscription.stripeSubscriptionId': subscriptionId,
          'subscription.currentPeriodEnd': new Date(sub.current_period_end * 1000),
          'subscription.cancelAtPeriodEnd': false,
        });

        // Record charity donation for this month
        const user = await User.findById(userId);
        if (user?.selectedCharity) {
          const amount = plan === 'yearly' ? 83300 : 99900;
          const donationAmount = Math.round(amount * (user.charityPercentage / 100));
          await Donation.create({
            user: userId,
            charity: user.selectedCharity,
            amount: donationAmount,
            type: 'subscription_share',
            percentage: user.charityPercentage,
            stripePaymentId: session.payment_intent,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subId = invoice.subscription;
        const sub = await stripe.subscriptions.retrieve(subId);
        const userId = sub.metadata.userId;

        await User.findOneAndUpdate(
          { 'subscription.stripeSubscriptionId': subId },
          {
            'subscription.status': 'active',
            'subscription.currentPeriodEnd': new Date(sub.current_period_end * 1000),
          }
        );
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await User.findOneAndUpdate(
          { 'subscription.stripeSubscriptionId': invoice.subscription },
          { 'subscription.status': 'past_due' }
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await User.findOneAndUpdate(
          { 'subscription.stripeSubscriptionId': sub.id },
          {
            'subscription.status': 'cancelled',
            'subscription.stripeSubscriptionId': null,
            'subscription.currentPeriodEnd': null,
          }
        );
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

module.exports = { createCheckout, cancelSubscription, getPortalLink, stripeWebhook };
