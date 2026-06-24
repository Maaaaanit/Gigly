const Contract = require('../models/Contract');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Job = require('../models/Job');
const User = require('../models/User');
const FreelancerProfile = require('../models/FreelancerProfile');
const { success, error } = require('../utils/apiResponse');

exports.getFreelancerStats = async (req, res) => {
  try {
    const id = req.user._id;
    const [activeContracts, completedContracts, totalEarnings, pendingInvoices, monthlyEarnings, recentPayments] = await Promise.all([
      Contract.find({ freelancerId: id, status: 'active' }).populate('clientId', 'name avatar').select('title status totalBudget amountPaid startDate endDate'),
      Contract.countDocuments({ freelancerId: id, status: 'completed' }),
      Payment.aggregate([{ $match: { freelancerId: id, status: 'captured' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Invoice.find({ freelancerId: id, status: 'sent' }).populate('contractId', 'title').select('invoiceNumber totalAmount dueDate status'),
      Payment.aggregate([
        { $match: { freelancerId: id, status: 'captured' } },
        { $group: { _id: { y: { $year: '$paymentDate' }, m: { $month: '$paymentDate' } }, total: { $sum: '$amount' } } },
        { $sort: { '_id.y': 1, '_id.m': 1 } }, { $limit: 12 },
      ]),
      Payment.find({ freelancerId: id, status: 'captured' }).populate('invoiceId', 'invoiceNumber').sort({ paymentDate: -1 }).limit(5),
    ]);
    return success(res, {
      activeContracts, activeCount: activeContracts.length, completedContracts,
      totalEarnings: totalEarnings[0]?.total || 0,
      pendingInvoices, pendingAmount: pendingInvoices.reduce((s, i) => s + i.totalAmount, 0),
      monthlyEarnings, recentPayments,
    }, 'Freelancer stats fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getClientStats = async (req, res) => {
  try {
    const id = req.user._id;
    const [activeContracts, completedContracts, totalSpend, pendingInvoices, activeJobs, monthlySpend] = await Promise.all([
      Contract.find({ clientId: id, status: 'active' }).populate('freelancerId', 'name avatar').select('title status totalBudget amountPaid'),
      Contract.countDocuments({ clientId: id, status: 'completed' }),
      Payment.aggregate([{ $match: { clientId: id, status: 'captured' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Invoice.find({ clientId: id, status: 'sent' }).populate('freelancerId', 'name').select('invoiceNumber totalAmount dueDate'),
      Job.countDocuments({ clientId: id, status: 'open' }),
      Payment.aggregate([
        { $match: { clientId: id, status: 'captured' } },
        { $group: { _id: { y: { $year: '$paymentDate' }, m: { $month: '$paymentDate' } }, total: { $sum: '$amount' } } },
        { $sort: { '_id.y': 1, '_id.m': 1 } }, { $limit: 12 },
      ]),
    ]);
    return success(res, {
      activeContracts, activeCount: activeContracts.length, completedContracts,
      totalSpend: totalSpend[0]?.total || 0, pendingInvoices,
      pendingAmount: pendingInvoices.reduce((s, i) => s + i.totalAmount, 0),
      activeJobs, monthlySpend,
    }, 'Client stats fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalFreelancers, totalClients, totalJobs, totalContracts, totalRevenue, topFreelancers, recentUsers] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'freelancer', isActive: true }),
      User.countDocuments({ role: 'client', isActive: true }),
      Job.countDocuments(),
      Contract.countDocuments(),
      Payment.aggregate([{ $match: { status: 'captured' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      FreelancerProfile.find().populate('userId', 'name avatar').sort({ rating: -1 }).limit(5),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role avatar createdAt'),
    ]);
    return success(res, {
      totalUsers, totalFreelancers, totalClients, totalJobs, totalContracts,
      totalRevenue: totalRevenue[0]?.total || 0, topFreelancers, recentUsers,
    }, 'Admin stats fetched');
  } catch (err) {
    return error(res, err.message);
  }
};
