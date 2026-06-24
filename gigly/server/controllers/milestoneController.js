const Milestone = require('../models/Milestone');
const Contract = require('../models/Contract');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const { success, error } = require('../utils/apiResponse');
const { notify } = require('../utils/notificationHelper');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

const createInvoice = async (milestone, contract, freelancer, client) => {
  const subtotal = milestone.amount;
  const gst = parseFloat((subtotal * 0.18).toFixed(2));
  const totalAmount = parseFloat((subtotal + gst).toFixed(2));

  const invoice = await Invoice.create({
    contractId: contract._id,
    freelancerId: freelancer._id,
    clientId: client._id,
    milestoneId: milestone._id,
    items: [{ description: milestone.title, amount: subtotal }],
    subtotal, gst, totalAmount,
    status: 'sent',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  const pdfUrl = await generateInvoicePDF(invoice, freelancer, client);
  invoice.pdfUrl = pdfUrl;
  await invoice.save();
  return invoice;
};

exports.createMilestone = async (req, res) => {
  try {
    const contract = await Contract.findOne({ _id: req.body.contractId, clientId: req.user._id });
    if (!contract) return error(res, 'Contract not found or unauthorized', 404);
    if (!['active', 'under_review'].includes(contract.status)) return error(res, 'Contract must be active', 400);

    const count = await Milestone.countDocuments({ contractId: contract._id });
    const milestone = await Milestone.create({ ...req.body, order: count });
    return success(res, { milestone }, 'Milestone created', 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getMilestones = async (req, res) => {
  try {
    const milestones = await Milestone.find({ contractId: req.params.contractId }).sort({ order: 1, createdAt: 1 });
    return success(res, { milestones }, 'Milestones fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.submitMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) return error(res, 'Milestone not found', 404);

    const contract = await Contract.findById(milestone.contractId);
    if (contract.freelancerId.toString() !== req.user._id.toString()) return error(res, 'Forbidden', 403);
    if (contract.status !== 'active') return error(res, 'Contract must be active', 400);
    if (!['pending', 'rejected'].includes(milestone.status)) return error(res, 'Milestone cannot be submitted now', 400);

    milestone.status = 'submitted';
    milestone.submissionNote = req.body.submissionNote;
    milestone.rejectionRemark = undefined;
    if (req.files?.length) milestone.submissionFiles = req.files.map(f => `/uploads/milestones/${f.filename}`);
    await milestone.save();

    await notify({
      userId: contract.clientId,
      title: 'Milestone Submitted',
      message: `Freelancer submitted "${milestone.title}" for review`,
      type: 'milestone',
      link: `/client/contracts?open=${contract._id}`,
    });

    return success(res, { milestone }, 'Milestone submitted');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.approveMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) return error(res, 'Milestone not found', 404);
    if (milestone.status !== 'submitted') return error(res, 'Milestone must be submitted first', 400);

    const contract = await Contract.findById(milestone.contractId);
    if (contract.clientId.toString() !== req.user._id.toString()) return error(res, 'Forbidden', 403);

    milestone.status = 'approved';
    milestone.approvedAt = new Date();
    await milestone.save();

    const freelancer = await User.findById(contract.freelancerId);
    const client = await User.findById(contract.clientId);
    const invoice = await createInvoice(milestone, contract, freelancer, client);

    milestone.status = 'paid';
    await milestone.save();

    await notify({
      userId: freelancer._id,
      title: 'Milestone Approved',
      message: `"${milestone.title}" was approved. Invoice ${invoice.invoiceNumber} generated.`,
      type: 'invoice',
      link: `/freelancer/invoices`,
    });

    return success(res, { milestone, invoice }, 'Milestone approved and invoice generated');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.rejectMilestone = async (req, res) => {
  try {
    const { rejectionRemark } = req.body;
    if (!rejectionRemark) return error(res, 'Rejection remark required', 400);

    const milestone = await Milestone.findById(req.params.id);
    if (!milestone || milestone.status !== 'submitted') return error(res, 'Cannot reject this milestone', 400);

    const contract = await Contract.findById(milestone.contractId);
    if (contract.clientId.toString() !== req.user._id.toString()) return error(res, 'Forbidden', 403);

    milestone.status = 'rejected';
    milestone.rejectionRemark = rejectionRemark;
    await milestone.save();

    await notify({
      userId: contract.freelancerId,
      title: 'Milestone Rejected',
      message: `"${milestone.title}" was rejected: ${rejectionRemark}`,
      type: 'milestone',
      link: `/freelancer/contracts?open=${contract._id}`,
    });

    return success(res, { milestone }, 'Milestone rejected');
  } catch (err) {
    return error(res, err.message);
  }
};
