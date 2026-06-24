const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, trim: true },
  skills: [{ type: String, trim: true }],
  type: { type: String, enum: ['fixed', 'hourly'], required: true },
  budget: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
  },
  duration: { type: String, enum: ['less_than_1_month', '1_to_3_months', '3_to_6_months', 'more_than_6_months'], default: '1_to_3_months' },
  experienceLevel: { type: String, enum: ['entry', 'intermediate', 'expert'], default: 'intermediate' },
  status: { type: String, enum: ['open', 'in_progress', 'completed', 'closed'], default: 'open' },
  proposals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' }],
  proposalCount: { type: Number, default: 0 },
  hiredFreelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  views: { type: Number, default: 0 },
  attachments: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
