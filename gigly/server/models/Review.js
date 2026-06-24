const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  revieweeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true },
  type: { type: String, enum: ['client_to_freelancer', 'freelancer_to_client'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
