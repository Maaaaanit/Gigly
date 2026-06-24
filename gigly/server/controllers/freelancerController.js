const FreelancerProfile = require('../models/FreelancerProfile');
const User = require('../models/User');
const Review = require('../models/Review');
const { success, error } = require('../utils/apiResponse');

exports.getProfile = async (req, res) => {
  try {
    const profile = await FreelancerProfile.findOne({ userId: req.params.userId })
      .populate('userId', 'name email avatar createdAt');
    if (!profile) return error(res, 'Profile not found', 404);

    await FreelancerProfile.findByIdAndUpdate(profile._id, { $inc: { profileViews: 1 } });

    const reviews = await Review.find({ revieweeId: req.params.userId, type: 'client_to_freelancer' })
      .populate('reviewerId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    return success(res, { profile, reviews }, 'Profile fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    if (req.params.userId !== userId && req.user.role !== 'admin')
      return error(res, 'Forbidden', 403);

    const updateData = { ...req.body };

    if (req.files) {
      if (req.files.pan) updateData['documents.pan'] = `/uploads/documents/${req.files.pan[0].filename}`;
      if (req.files.aadhaar) updateData['documents.aadhaar'] = `/uploads/documents/${req.files.aadhaar[0].filename}`;
    }

    const profile = await FreelancerProfile.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('userId', 'name email avatar');

    if (!profile) return error(res, 'Profile not found', 404);
    return success(res, { profile }, 'Profile updated');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.browse = async (req, res) => {
  try {
    const { skill, category, availability, minRate, maxRate, experience, minRating, search, sort = 'rating', page = 1, limit = 12 } = req.query;

    const profileFilter = {};
    if (skill) profileFilter.skills = { $in: [new RegExp(skill, 'i')] };
    if (category) profileFilter.category = new RegExp(category, 'i');
    if (availability) profileFilter.availability = availability;
    if (experience) profileFilter.experience = experience;
    if (minRate || maxRate) {
      profileFilter.hourlyRate = {};
      if (minRate) profileFilter.hourlyRate.$gte = Number(minRate);
      if (maxRate) profileFilter.hourlyRate.$lte = Number(maxRate);
    }
    if (minRating) profileFilter.rating = { $gte: Number(minRating) };

    const sortMap = {
      rating: { rating: -1 },
      rate_low: { hourlyRate: 1 },
      rate_high: { hourlyRate: -1 },
      reviews: { totalRatings: -1 },
      newest: { createdAt: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);

    let profiles = await FreelancerProfile.find(profileFilter)
      .populate({
        path: 'userId',
        match: search
          ? { $or: [{ name: new RegExp(search, 'i') }], isActive: true }
          : { isActive: true },
        select: 'name email avatar createdAt',
      })
      .sort(sortMap[sort] || { rating: -1 });

    profiles = profiles.filter(p => p.userId !== null);
    const total = profiles.length;
    profiles = profiles.slice(skip, skip + Number(limit));

    return success(res, { profiles, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }, 'Freelancers fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const profile = await FreelancerProfile.findOne({ userId: req.user._id })
      .populate('userId', 'name email avatar');
    if (!profile) return error(res, 'Profile not found', 404);
    return success(res, { profile }, 'Profile fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) return error(res, 'No file uploaded', 400);
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true });
    return success(res, { user }, 'Avatar updated');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await FreelancerProfile.distinct('category', { category: { $ne: '' } });
    return success(res, { categories }, 'Categories fetched');
  } catch (err) {
    return error(res, err.message);
  }
};
