const Notification = require('../models/Notification');

const notify = async ({ userId, title, message, type = 'general', link = null, metadata = null }) => {
  try {
    await Notification.create({ userId, title, message, type, link, metadata });
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

module.exports = { notify };
