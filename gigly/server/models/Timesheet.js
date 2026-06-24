const mongoose = require('mongoose');

const timesheetSchema = new mongoose.Schema({
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekStartDate: { type: Date, required: true },
  entries: [{
    date: { type: Date, required: true },
    hoursWorked: { type: Number, required: true, min: 0, max: 24 },
    taskDescription: { type: String, required: true },
    _id: false,
  }],
  totalHours: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionRemark: { type: String },
  approvedAt: { type: Date, default: null },
}, { timestamps: true });

timesheetSchema.pre('save', function (next) {
  this.totalHours = this.entries.reduce((s, e) => s + e.hoursWorked, 0);
  next();
});

module.exports = mongoose.model('Timesheet', timesheetSchema);
