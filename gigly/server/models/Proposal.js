const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: { type: String, required: true },
  bidAmount: { type: Number, required: true },
  bidType: { type: String, enum: ['fixed', 'hourly'], required: true },
  estimatedDuration: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'withdrawn'], default: 'pending' },
  attachments: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Proposal', proposalSchema);
