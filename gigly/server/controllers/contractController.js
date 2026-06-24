const Contract = require('../models/Contract');
const User = require('../models/User');
const FreelancerProfile = require('../models/FreelancerProfile');
const { success, error } = require('../utils/apiResponse');
const { notify } = require('../utils/notificationHelper');
const { sendEmail, templates } = require('../utils/emailSender');

exports.createDirectContract = async (req, res) => {
  try {
    const freelancer = await User.findById(req.body.freelancerId);
    if (!freelancer || freelancer.role !== 'freelancer') return error(res, 'Freelancer not found', 404);

    const contract = await Contract.create({
      ...req.body,
      clientId: req.user._id,
      status: 'pending',
    });

    await notify({
      userId: freelancer._id,
      title: 'New Contract Offer',
      message: `You received a contract offer: "${contract.title}"`,
      type: 'contract',
      link: `/freelancer/contracts?open=${contract._id}`,
    });

    const t = templates.contractCreated(freelancer.name, contract.title);
    sendEmail({ to: freelancer.email, ...t });

    return success(res, { contract }, 'Contract created', 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getContracts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (req.user.role === 'client') filter.clientId = req.user._id;
    else if (req.user.role === 'freelancer') filter.freelancerId = req.user._id;

    if (status) filter.status = status;

    const total = await Contract.countDocuments(filter);
    const contracts = await Contract.find(filter)
      .populate('clientId', 'name avatar email')
      .populate('freelancerId', 'name avatar email')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return success(res, { contracts, total, page: Number(page) }, 'Contracts fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('clientId', 'name avatar email')
      .populate('freelancerId', 'name avatar email')
      .populate('jobId', 'title category');
    if (!contract) return error(res, 'Contract not found', 404);

    const isParty = [contract.clientId._id.toString(), contract.freelancerId._id.toString()].includes(req.user._id.toString());
    if (!isParty && req.user.role !== 'admin') return error(res, 'Forbidden', 403);

    return success(res, { contract }, 'Contract fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.acceptContract = async (req, res) => {
  try {
    const contract = await Contract.findOne({ _id: req.params.id, freelancerId: req.user._id, status: 'pending' });
    if (!contract) return error(res, 'Contract not found or already accepted', 404);
    contract.status = 'active';
    contract.acceptedAt = new Date();
    await contract.save();

    await notify({
      userId: contract.clientId,
      title: 'Contract Accepted',
      message: `Freelancer accepted your contract "${contract.title}"`,
      type: 'contract',
      link: `/client/contracts?open=${contract._id}`,
    });

    return success(res, { contract }, 'Contract accepted');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateContractStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const contract = await Contract.findById(req.params.id);
    if (!contract) return error(res, 'Contract not found', 404);

    const isClient = contract.clientId.toString() === req.user._id.toString();
    const isFreelancer = contract.freelancerId.toString() === req.user._id.toString();
    if (!isClient && !isFreelancer && req.user.role !== 'admin') return error(res, 'Forbidden', 403);

    contract.status = status;
    if (status === 'completed') {
      contract.completedAt = new Date();
      await FreelancerProfile.findOneAndUpdate(
        { userId: contract.freelancerId },
        { $inc: { totalContractsCompleted: 1 } }
      );
    }
    await contract.save();
    return success(res, { contract }, 'Contract status updated');
  } catch (err) {
    return error(res, err.message);
  }
};
