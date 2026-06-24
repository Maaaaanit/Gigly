const Message = require('../models/Message');
const Contract = require('../models/Contract');
const { success, error } = require('../utils/apiResponse');

exports.getMessages = async (req, res) => {
  try {
    const { contractId } = req.params;
    const contract = await Contract.findById(contractId);
    if (!contract) return error(res, 'Contract not found', 404);

    const isParty = [contract.clientId.toString(), contract.freelancerId.toString()].includes(req.user._id.toString());
    if (!isParty) return error(res, 'Forbidden', 403);

    await Message.updateMany({ contractId, receiverId: req.user._id, isRead: false }, { isRead: true });

    const messages = await Message.find({ contractId })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: 1 });

    return success(res, { messages }, 'Messages fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { contractId } = req.params;
    const contract = await Contract.findById(contractId);
    if (!contract) return error(res, 'Contract not found', 404);

    const isParty = [contract.clientId.toString(), contract.freelancerId.toString()].includes(req.user._id.toString());
    if (!isParty) return error(res, 'Forbidden', 403);

    const receiverId = contract.clientId.toString() === req.user._id.toString()
      ? contract.freelancerId
      : contract.clientId;

    const message = await Message.create({
      contractId,
      senderId: req.user._id,
      receiverId,
      content: req.body.content,
    });

    const populated = await Message.findById(message._id).populate('senderId', 'name avatar');
    return success(res, { message: populated }, 'Message sent', 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiverId: req.user._id, isRead: false });
    return success(res, { count }, 'Unread count fetched');
  } catch (err) {
    return error(res, err.message);
  }
};
