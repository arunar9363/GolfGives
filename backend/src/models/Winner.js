const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  draw: { type: mongoose.Schema.Types.ObjectId, ref: 'Draw', required: true },

  matchType: { type: String, enum: ['three', 'four', 'five'], required: true },
  matchedNumbers: { type: [Number], default: [] },
  prizeAmount: { type: Number, required: true },

  // Verification workflow
  verificationStatus: {
    type: String,
    enum: ['pending', 'proof_submitted', 'approved', 'rejected', 'paid'],
    default: 'pending',
  },
  proofFile: { type: String, default: null }, // file path
  proofSubmittedAt: { type: Date, default: null },
  adminNote: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
  paidAt: { type: Date, default: null },

  // Payment details
  bankDetails: {
    accountName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    sortCode: { type: String, default: '' },
    paypalEmail: { type: String, default: '' },
  },
}, { timestamps: true });

module.exports = mongoose.model('Winner', winnerSchema);
