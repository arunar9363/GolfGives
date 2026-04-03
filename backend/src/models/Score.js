const mongoose = require('mongoose');

const scoreEntrySchema = new mongoose.Schema({
  value: { type: Number, required: true, min: 1, max: 45 },
  datePlayed: { type: Date, required: true },
  course: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { _id: true, timestamps: true });

const scoreSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  // Rolling array — max 5 entries, newest first
  scores: {
    type: [scoreEntrySchema],
    validate: {
      validator: function (arr) { return arr.length <= 5; },
      message: 'Maximum 5 scores allowed',
    },
    default: [],
  },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

// Static method: add a new score (rolling logic)
scoreSchema.methods.addScore = function (scoreValue, datePlayed, course = '', notes = '') {
  const newEntry = { value: scoreValue, datePlayed, course, notes };

  // Prepend new score
  this.scores.unshift(newEntry);

  // Keep only latest 5
  if (this.scores.length > 5) {
    this.scores = this.scores.slice(0, 5);
  }

  this.lastUpdated = new Date();
  return this;
};

// Get scores as plain numbers array (for draw matching)
scoreSchema.methods.getScoreValues = function () {
  return this.scores.map(s => s.value);
};

module.exports = mongoose.model('Score', scoreSchema);
