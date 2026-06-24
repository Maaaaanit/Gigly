const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
  proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal', default: null },
  type: { type: String, enum: ['fixed', 'hourly'], required: true },
  totalBudget: { type: Number, required: true },
  hourlyRate: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'active', 'under_review', 'completed', 'cancelled', 'disputed'],
    default: 'pending',
  },
  contractDocumentUrl: { type: String, default: null },
  acceptedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  notes: { type: String },
}, { timestamps: true });

contractSchema.virtual('remainingBudget').get(function () {
  return this.totalBudget - this.amountPaid;
});

contractSchema.virtual('spendPercentage').get(function () {
  if (!this.totalBudget) return 0;
  return Math.round((this.amountPaid / this.totalBudget) * 100);
});

contractSchema.set('toJSON', { virtuals: true });
contractSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Contract', contractSchema);
