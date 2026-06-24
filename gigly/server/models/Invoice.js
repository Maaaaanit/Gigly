const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  milestoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone', default: null },
  timesheetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Timesheet', default: null },
  items: [{ description: String, amount: Number, _id: false }],
  subtotal: { type: Number, required: true },
  gst: { type: Number, default: 0 },
  platformFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['draft', 'sent', 'paid', 'cancelled'], default: 'sent' },
  pdfUrl: { type: String, default: null },
  dueDate: { type: Date },
  paidAt: { type: Date, default: null },
  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
}, { timestamps: true });

invoiceSchema.pre('save', async function (next) {
  if (this.invoiceNumber) return next();
  const count = await mongoose.model('Invoice').countDocuments();
  const year = new Date().getFullYear();
  this.invoiceNumber = `GIG-${year}-${String(count + 1).padStart(4, '0')}`;
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
