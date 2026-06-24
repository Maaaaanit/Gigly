const Dispute = require('../models/Dispute');
const Contract = require('../models/Contract');
const { success, error } = require('../utils/apiResponse');
const { notify } = require('../utils/notificationHelper');

exports.createDispute = async (req, res) => {
  try {
    const { contractId, milestoneId, reason, evidence } = req.body;
    const contract = await Contract.findById(contractId);
    if (!contract) return error(res, 'Contract not found', 404);

    const isParty = [String(contract.clientId), String(contract.freelancerId)].includes(String(req.user._id));
    if (!isParty) return error(res, 'You are not a party to this contract', 403);

    const against = String(contract.clientId) === String(req.user._id) ? contract.freelancerId : contract.clientId;

    const dispute = await Dispute.create({
      contractId, milestoneId: milestoneId || null, raisedBy: req.user._id, against, reason, evidence: evidence || [],
    });

    contract.status = 'disputed';
    await contract.save();

    await notify({ userId: against, title: 'A dispute was raised', message: `A dispute was raised on contract "${contract.title}".`, type: 'contract', link: `/contracts/${contract._id}` });

    return success(res, { dispute }, 'Dispute raised', 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getMyDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find({ $or: [{ raisedBy: req.user._id }, { against: req.user._id }] })
      .populate('contractId', 'title')
      .populate('raisedBy', 'name avatar')
      .populate('against', 'name avatar')
      .sort({ createdAt: -1 });
    return success(res, { disputes }, 'Disputes fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getAllDisputes = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await Dispute.countDocuments(filter);
    const disputes = await Dispute.find(filter)
      .populate('contractId', 'title totalBudget')
      .populate('raisedBy', 'name email avatar role')
      .populate('against', 'name email avatar role')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return success(res, { disputes, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }, 'Disputes fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.resolveDispute = async (req, res) => {
  try {
    const { resolution, status } = req.body;
    if (!['resolved', 'closed'].includes(status)) return error(res, 'Invalid status', 400);

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return error(res, 'Dispute not found', 404);

    dispute.status = status;
    dispute.resolution = resolution;
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = new Date();
    await dispute.save();

    const contract = await Contract.findById(dispute.contractId);
    if (contract && contract.status === 'disputed') {
      contract.status = 'active';
      await contract.save();
    }

    await Promise.all([
      notify({ userId: dispute.raisedBy, title: 'Dispute resolved', message: resolution, type: 'contract', link: `/contracts/${dispute.contractId}` }),
      notify({ userId: dispute.against, title: 'Dispute resolved', message: resolution, type: 'contract', link: `/contracts/${dispute.contractId}` }),
    ]);

    return success(res, { dispute }, 'Dispute resolved');
  } catch (err) {
    return error(res, err.message);
  }
};
