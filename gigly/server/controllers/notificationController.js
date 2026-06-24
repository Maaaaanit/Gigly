const Notification = require('../models/Notification');
const { success, error } = require('../utils/apiResponse');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = notifications.filter(n => !n.isRead).length;
    return success(res, { notifications, unreadCount }, 'Notifications fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isRead: true });
    return success(res, {}, 'Marked as read');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    return success(res, {}, 'All marked as read');
  } catch (err) {
    return error(res, err.message);
  }
};
