const Proposal = require('../models/Proposal');
const Job = require('../models/Job');
const Contract = require('../models/Contract');
const User = require('../models/User');
const FreelancerProfile = require('../models/FreelancerProfile');
const { success, error } = require('../utils/apiResponse');
const { notify } = require('../utils/notificationHelper');
const { sendEmail, templates } = require('../utils/emailSender');

exports.submitProposal = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate('clientId', 'name email');
    if (!job) return error(res, 'Job not found', 404);
    if (job.status !== 'open') return error(res, 'Job is no longer accepting proposals', 400);

    const existing = await Proposal.findOne({ jobId: req.params.jobId, freelancerId: req.user._id });
    if (existing) return error(res, 'You have already submitted a proposal for this job', 400);

    const proposal = await Proposal.create({
      jobId: req.params.jobId,
      freelancerId: req.user._id,
      ...req.body,
    });

    await Job.findByIdAndUpdate(req.params.jobId, { $push: { proposals: proposal._id }, $inc: { proposalCount: 1 } });

    await notify({
      userId: job.clientId._id,
      title: 'New Proposal Received',
      message: `A freelancer submitted a proposal for "${job.title}"`,
      type: 'proposal',
      link: `/client/jobs?open=${job._id}`,
    });

    const t = templates.proposalReceived(job.clientId.name, job.title, req.user.name);
    sendEmail({ to: job.clientId.email, ...t });

    return success(res, { proposal }, 'Proposal submitted', 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancerId: req.user._id })
      .populate('jobId', 'title status budget type clientId')
      .sort({ createdAt: -1 });
    return success(res, { proposals }, 'Proposals fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.withdrawProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, freelancerId: req.user._id, status: 'pending' },
      { status: 'withdrawn' },
      { new: true }
    );
    if (!proposal) return error(res, 'Proposal not found or cannot be withdrawn', 404);
    await Job.findByIdAndUpdate(proposal.jobId, { $inc: { proposalCount: -1 } });
    return success(res, { proposal }, 'Proposal withdrawn');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.acceptProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('freelancerId', 'name email');
    if (!proposal) return error(res, 'Proposal not found', 404);

    const job = await Job.findOne({ _id: proposal.jobId, clientId: req.user._id });
    if (!job) return error(res, 'Unauthorized', 403);

    proposal.status = 'accepted';
    await proposal.save();

    await Proposal.updateMany(
      { jobId: job._id, _id: { $ne: proposal._id }, status: 'pending' },
      { status: 'rejected' }
    );

    job.status = 'in_progress';
    job.hiredFreelancerId = proposal.freelancerId._id;
    await job.save();

    const { startDate, endDate, title, description } = req.body;
    const contract = await Contract.create({
      title: title || job.title,
      description: description || job.description,
      clientId: req.user._id,
      freelancerId: proposal.freelancerId._id,
      jobId: job._id,
      proposalId: proposal._id,
      type: proposal.bidType,
      totalBudget: proposal.bidAmount,
      hourlyRate: proposal.bidType === 'hourly' ? proposal.bidAmount : 0,
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'active',
      acceptedAt: new Date(),
    });

    await notify({
      userId: proposal.freelancerId._id,
      title: 'Proposal Accepted!',
      message: `Your proposal for "${job.title}" was accepted. A contract has been created.`,
      type: 'contract',
      link: `/freelancer/contracts?open=${contract._id}`,
    });

    const t = templates.contractCreated(proposal.freelancerId.name, contract.title);
    sendEmail({ to: proposal.freelancerId.email, ...t });

    return success(res, { proposal, contract }, 'Proposal accepted and contract created');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.rejectProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return error(res, 'Proposal not found', 404);
    const job = await Job.findOne({ _id: proposal.jobId, clientId: req.user._id });
    if (!job) return error(res, 'Unauthorized', 403);
    proposal.status = 'rejected';
    await proposal.save();
    return success(res, { proposal }, 'Proposal rejected');
  } catch (err) {
    return error(res, err.message);
  }
};
