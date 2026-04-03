const mongoose = require('mongoose');

const drawSchema = new mongoose.Schema({
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  drawType: { type: String, enum: ['random', 'algorithmic'], default: 'random' },
  status: { type: String, enum: ['pending', 'simulated', 'published'], default: 'pending' },

  // The 5 winning numbers drawn
  winningNumbers: { type: [Number], default: [] },

  // Prize pool info
  prizePool: {
    total: { type: Number, default: 0 },
    fiveMatch: { type: Number, default: 0 },
    fourMatch: { type: Number, default: 0 },
    threeMatch: { type: Number, default: 0 },
    jackpotRollover: { type: Number, default: 0 }, // carried from previous month
  },

  // Winners
  winners: {
    fiveMatch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    fourMatch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    threeMatch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },

  // Jackpot: if no 5-match winner, carry forward
  jackpotCarriedForward: { type: Boolean, default: false },

  totalParticipants: { type: Number, default: 0 },
  publishedAt: { type: Date, default: null },
  notes: { type: String, default: '' },
}, { timestamps: true });

// Compound unique index: one draw per month+year
drawSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Draw', drawSchema);
