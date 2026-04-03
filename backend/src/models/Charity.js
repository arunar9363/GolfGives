const mongoose = require('mongoose');

const charitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  shortDescription: { type: String, default: '' },
  image: { type: String, default: '' }, // URL or path
  coverImage: { type: String, default: '' },
  website: { type: String, default: '' },
  category: {
    type: String,
    enum: ['health', 'education', 'environment', 'poverty', 'children', 'animals', 'disaster', 'other'],
    default: 'other',
  },
  country: { type: String, default: '' },
  totalReceived: { type: Number, default: 0 }, // total donations received via platform
  totalSubscribers: { type: Number, default: 0 }, // users currently supporting
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  upcomingEvents: [{
    title: String,
    date: Date,
    description: String,
  }],
  registrationNumber: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Charity', charitySchema);
