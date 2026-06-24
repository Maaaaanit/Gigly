const router = require('express').Router();
const c = require('../controllers/messageController');
const { protect } = require('../middlewares/auth');

router.get('/unread', protect, c.getUnreadCount);
router.get('/:contractId', protect, c.getMessages);
router.post('/:contractId', protect, c.sendMessage);

module.exports = router;
