const ContactMessage = require('../models/ContactMessage');
const { success, error } = require('../utils/apiResponse');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.submitMessage = async (req, res) => {
  try {
    const { name, email, topic, message } = req.body;

    if (!name?.trim()) return error(res, 'Name is required', 400);
    if (!EMAIL_RE.test(email || '')) return error(res, 'A valid email is required', 400);
    if (!topic?.trim()) return error(res, 'Topic is required', 400);
    if (!message || message.trim().length < 20) return error(res, 'Message must be at least 20 characters', 400);

    await ContactMessage.create({ name: name.trim(), email: email.trim(), topic: topic.trim(), message: message.trim() });
    return success(res, {}, 'Message submitted', 201);
  } catch (err) {
    return error(res, err.message);
  }
};
