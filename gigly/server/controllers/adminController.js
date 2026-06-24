const User = require('../models/User');
const Job = require('../models/Job');
const Contract = require('../models/Contract');
const ContactMessage = require('../models/ContactMessage');
const { success, error } = require('../utils/apiResponse');
const { notify } = require('../utils/notificationHelper');

// Users

exports.getUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'suspended') filter.isActive = false;
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return success(res, { users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }, 'Users fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    if (req.params.id === String(req.user._id)) return error(res, 'You cannot suspend your own account', 400);
    const user = await User.findById(req.params.id);
    if (!user) return error(res, 'User not found', 404);
    if (user.role === 'admin') return error(res, 'Cannot suspend an admin account', 400);

    user.isActive = !user.isActive;
    await user.save();

    await notify({
      userId: user._id,
      title: user.isActive ? 'Account reactivated' : 'Account suspended',
      message: user.isActive ? 'Your account has been reactivated by an administrator.' : 'Your account has been suspended by an administrator.',
      type: 'general',
    });

    return success(res, { user }, user.isActive ? 'User reactivated' : 'User suspended');
  } catch (err) {
    return error(res, err.message);
  }
};

// Jobs

exports.getJobs = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.title = new RegExp(search, 'i');

    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .populate('clientId', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return success(res, { jobs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }, 'Jobs fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.removeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return error(res, 'Job not found', 404);
    job.status = 'closed';
    await job.save();
    return success(res, { job }, 'Job closed by admin');
  } catch (err) {
    return error(res, err.message);
  }
};

// Contracts

exports.getContracts = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.title = new RegExp(search, 'i');

    const total = await Contract.countDocuments(filter);
    const contracts = await Contract.find(filter)
      .populate('clientId', 'name email avatar')
      .populate('freelancerId', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return success(res, { contracts, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }, 'Contracts fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

// Contact messages

exports.getContactMessages = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await ContactMessage.countDocuments(filter);
    const messages = await ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return success(res, { messages, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }, 'Contact messages fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateContactMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'read', 'resolved'].includes(status)) return error(res, 'Invalid status', 400);
    const message = await ContactMessage.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!message) return error(res, 'Message not found', 404);
    return success(res, { message }, 'Status updated');
  } catch (err) {
    return error(res, err.message);
  }
};
