const Timesheet = require('../models/Timesheet');
const Contract = require('../models/Contract');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const { success, error } = require('../utils/apiResponse');
const { notify } = require('../utils/notificationHelper');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

exports.submitTimesheet = async (req, res) => {
  try {
    const { contractId, weekStartDate, entries } = req.body;
    const contract = await Contract.findOne({ _id: contractId, freelancerId: req.user._id, status: 'active', type: 'hourly' });
    if (!contract) return error(res, 'Active hourly contract not found', 404);

    const totalHours = entries.reduce((s, e) => s + Number(e.hoursWorked), 0);
    const totalAmount = parseFloat((totalHours * contract.hourlyRate).toFixed(2));

    const timesheet = await Timesheet.create({ contractId, freelancerId: req.user._id, weekStartDate, entries, totalHours, totalAmount });

    await notify({
      userId: contract.clientId,
      title: 'Timesheet Submitted',
      message: `Freelancer submitted a timesheet for ${totalHours} hours`,
      type: 'milestone',
      link: `/client/contracts?open=${contract._id}`,
    });

    return success(res, { timesheet }, 'Timesheet submitted', 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getTimesheets = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'freelancer') filter.freelancerId = req.user._id;
    const { status, contractId } = req.query;
    if (status) filter.status = status;
    if (contractId) filter.contractId = contractId;

    const timesheets = await Timesheet.find(filter)
      .populate('contractId', 'title type clientId freelancerId')
      .populate('freelancerId', 'name avatar')
      .sort({ createdAt: -1 });
    return success(res, { timesheets }, 'Timesheets fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.approveTimesheet = async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id);
    if (!timesheet || timesheet.status !== 'pending') return error(res, 'Cannot approve this timesheet', 400);

    const contract = await Contract.findById(timesheet.contractId);
    if (contract.clientId.toString() !== req.user._id.toString()) return error(res, 'Forbidden', 403);

    timesheet.status = 'approved';
    timesheet.approvedAt = new Date();
    await timesheet.save();

    const freelancer = await User.findById(timesheet.freelancerId);
    const client = await User.findById(req.user._id);
    const subtotal = timesheet.totalAmount;
    const gst = parseFloat((subtotal * 0.18).toFixed(2));
    const totalAmount = parseFloat((subtotal + gst).toFixed(2));

    const invoice = await Invoice.create({
      contractId: contract._id,
      freelancerId: freelancer._id,
      clientId: client._id,
      timesheetId: timesheet._id,
      items: [{ description: `Week of ${new Date(timesheet.weekStartDate).toLocaleDateString('en-IN')} — ${timesheet.totalHours}hrs`, amount: subtotal }],
      subtotal, gst, totalAmount,
      status: 'sent',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const pdfUrl = await generateInvoicePDF(invoice, freelancer, client);
    invoice.pdfUrl = pdfUrl;
    await invoice.save();

    await notify({
      userId: freelancer._id,
      title: 'Timesheet Approved',
      message: `Your timesheet was approved. Invoice ${invoice.invoiceNumber} generated.`,
      type: 'invoice',
      link: `/freelancer/invoices`,
    });

    return success(res, { timesheet, invoice }, 'Timesheet approved');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.rejectTimesheet = async (req, res) => {
  try {
    const { rejectionRemark } = req.body;
    const timesheet = await Timesheet.findById(req.params.id);
    if (!timesheet || timesheet.status !== 'pending') return error(res, 'Cannot reject this timesheet', 400);
    const contract = await Contract.findById(timesheet.contractId);
    if (contract.clientId.toString() !== req.user._id.toString()) return error(res, 'Forbidden', 403);
    timesheet.status = 'rejected';
    timesheet.rejectionRemark = rejectionRemark;
    await timesheet.save();
    return success(res, { timesheet }, 'Timesheet rejected');
  } catch (err) {
    return error(res, err.message);
  }
};
