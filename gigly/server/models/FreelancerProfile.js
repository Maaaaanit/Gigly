const mongoose = require('mongoose');

const freelancerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  title: { type: String, trim: true, default: '' },
  bio: { type: String, trim: true, default: '' },
  skills: [{ type: String, trim: true }],
  hourlyRate: { type: Number, default: 0 },
  category: { type: String, trim: true, default: '' },
  subCategory: { type: String, trim: true, default: '' },
  experience: { type: String, enum: ['entry', 'intermediate', 'expert'], default: 'entry' },
  languages: [{ type: String }],
  portfolioLinks: [{ type: String }],
  availability: { type: String, enum: ['available', 'busy', 'unavailable'], default: 'available' },
  documents: {
    pan: { type: String, default: null },
    aadhaar: { type: String, default: null },
    bankDetails: {
      accountNo: { type: String, default: null },
      ifsc: { type: String, default: null },
      bankName: { type: String, default: null },
      accountHolderName: { type: String, default: null },
    },
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  totalContractsCompleted: { type: Number, default: 0 },
  successRate: { type: Number, default: 100 },
  responseTime: { type: String, default: 'Within a day' },
  location: { type: String, default: '' },
  profileViews: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('FreelancerProfile', freelancerProfileSchema);
