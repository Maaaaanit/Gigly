const Job = require('../models/Job');
const Proposal = require('../models/Proposal');
const { success, error } = require('../utils/apiResponse');
const { notify } = require('../utils/notificationHelper');

exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, clientId: req.user._id });
    return success(res, { job }, 'Job posted successfully', 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getJobs = async (req, res) => {
  try {
    const { category, type, experience, minBudget, maxBudget, search, sort = 'newest', page = 1, limit = 12 } = req.query;

    const filter = { status: 'open' };
    if (category) filter.category = new RegExp(category, 'i');
    if (type) filter.type = type;
    if (experience) filter.experienceLevel = experience;
    if (search) filter.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { skills: { $in: [new RegExp(search, 'i')] } },
    ];
    if (minBudget || maxBudget) {
      if (minBudget) filter['budget.min'] = { $gte: Number(minBudget) };
      if (maxBudget) filter['budget.max'] = { $lte: Number(maxBudget) };
    }

    const sortMap = { newest: { createdAt: -1 }, budget_high: { 'budget.max': -1 }, budget_low: { 'budget.min': 1 }, proposals: { proposalCount: 1 } };
    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .populate('clientId', 'name avatar createdAt')
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return success(res, { jobs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }, 'Jobs fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('clientId', 'name avatar createdAt');
    if (!job) return error(res, 'Job not found', 404);

    let myProposal = null;
    if (req.user?.role === 'freelancer') {
      myProposal = await Proposal.findOne({ jobId: job._id, freelancerId: req.user._id });
    }

    return success(res, { job, myProposal }, 'Job fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getClientJobs = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { clientId: req.user._id };
    if (status) filter.status = status;
    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    return success(res, { jobs }, 'Client jobs fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, clientId: req.user._id });
    if (!job) return error(res, 'Job not found or unauthorized', 404);
    Object.assign(job, req.body);
    await job.save();
    return success(res, { job }, 'Job updated');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.closeJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, clientId: req.user._id },
      { status: 'closed' },
      { new: true }
    );
    if (!job) return error(res, 'Job not found or unauthorized', 404);
    return success(res, { job }, 'Job closed');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, clientId: req.user._id });
    if (!job) return error(res, 'Job not found or unauthorized', 404);
    if (job.status !== 'open') return error(res, 'Only open jobs can be deleted', 400);

    const proposalCount = await Proposal.countDocuments({ jobId: job._id });
    if (proposalCount > 0) return error(res, 'Cannot delete a job that has received proposals', 400);

    await job.deleteOne();
    return success(res, {}, 'Job deleted');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getJobProposals = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, clientId: req.user._id });
    if (!job) return error(res, 'Job not found or unauthorized', 404);

    const proposals = await Proposal.find({ jobId: req.params.id })
      .populate('freelancerId', 'name avatar')
      .sort({ createdAt: -1 });

    return success(res, { proposals }, 'Proposals fetched');
  } catch (err) {
    return error(res, err.message);
  }
};
