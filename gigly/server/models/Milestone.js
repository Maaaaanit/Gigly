const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'submitted', 'approved', 'rejected', 'paid'], default: 'pending' },
  submissionNote: { type: String },
  submissionFiles: [{ type: String }],
  rejectionRemark: { type: String },
  approvedAt: { type: Date, default: null },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Milestone', milestoneSchema);
