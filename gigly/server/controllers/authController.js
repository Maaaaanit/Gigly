const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const FreelancerProfile = require('../models/FreelancerProfile');
const { success, error } = require('../utils/apiResponse');
const { sendEmail, templates } = require('../utils/emailSender');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!['client', 'freelancer'].includes(role)) return error(res, 'Invalid role', 400);
    if (await User.findOne({ email })) return error(res, 'Email already registered', 400);

    const user = await User.create({ name, email, password, role });

    if (role === 'freelancer') {
      await FreelancerProfile.create({ userId: user._id });
    }

    const t = templates.welcome(name);
    sendEmail({ to: email, ...t });

    const token = signToken(user._id);
    return success(res, { user, token }, 'Registration successful', 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) return error(res, 'Invalid credentials', 401);
    if (!(await user.comparePassword(password))) return error(res, 'Invalid credentials', 401);

    let profile = null;
    if (user.role === 'freelancer') {
      profile = await FreelancerProfile.findOne({ userId: user._id });
    }

    const token = signToken(user._id);
    return success(res, { user: user.toJSON(), token, profile }, 'Login successful');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;
    if (user.role === 'freelancer') profile = await FreelancerProfile.findOne({ userId: user._id });
    return success(res, { user, profile }, 'User fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) return error(res, 'Current password is incorrect', 400);
    user.password = newPassword;
    await user.save();
    return success(res, {}, 'Password updated successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return error(res, 'No user found with that email', 404);
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const t = templates.passwordReset(user.name, resetUrl);
    await sendEmail({ to: user.email, ...t });
    return success(res, {}, 'Password reset email sent');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.body.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');
    if (!user) return error(res, 'Invalid or expired reset token', 400);
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    const token = signToken(user._id);
    return success(res, { token }, 'Password reset successful');
  } catch (err) {
    return error(res, err.message);
  }
};
