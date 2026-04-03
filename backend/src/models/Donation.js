const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  charity: { type: mongoose.Schema.Types.ObjectId, ref: 'Charity', required: true },
  amount: { type: Number, required: true }, // in pence/cents
  type: { type: String, enum: ['subscription_share', 'voluntary'], default: 'subscription_share' },
  percentage: { type: Number, default: 10 },
  stripePaymentId: { type: String, default: null },
  month: { type: Number },
  year: { type: Number },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
