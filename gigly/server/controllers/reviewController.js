const Review = require('../models/Review');
const Contract = require('../models/Contract');
const FreelancerProfile = require('../models/FreelancerProfile');
const { success, error } = require('../utils/apiResponse');

exports.createReview = async (req, res) => {
  try {
    const { contractId, rating, comment, type } = req.body;
    const contract = await Contract.findById(contractId);
    if (!contract) return error(res, 'Contract not found', 404);
    if (contract.status !== 'completed') return error(res, 'Contract must be completed to leave a review', 400);

    const isClient = contract.clientId.toString() === req.user._id.toString();
    const isFreelancer = contract.freelancerId.toString() === req.user._id.toString();
    if (!isClient && !isFreelancer) return error(res, 'Forbidden', 403);

    const revieweeId = isClient ? contract.freelancerId : contract.clientId;
    const reviewType = isClient ? 'client_to_freelancer' : 'freelancer_to_client';

    const existing = await Review.findOne({ contractId, reviewerId: req.user._id });
    if (existing) return error(res, 'You have already reviewed this contract', 400);

    const review = await Review.create({
      contractId,
      reviewerId: req.user._id,
      revieweeId,
      rating,
      comment,
      type: reviewType,
    });

    if (reviewType === 'client_to_freelancer') {
      const profile = await FreelancerProfile.findOne({ userId: revieweeId });
      if (profile) {
        const newTotal = profile.rating * profile.totalRatings + rating;
        profile.totalRatings += 1;
        profile.rating = parseFloat((newTotal / profile.totalRatings).toFixed(2));
        await profile.save();
      }
    }

    return success(res, { review }, 'Review submitted', 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getFreelancerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ revieweeId: req.params.freelancerId, type: 'client_to_freelancer' })
      .populate('reviewerId', 'name avatar')
      .populate('contractId', 'title')
      .sort({ createdAt: -1 });
    return success(res, { reviews }, 'Reviews fetched');
  } catch (err) {
    return error(res, err.message);
  }
};
