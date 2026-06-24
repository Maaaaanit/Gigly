const router = require('express').Router();
const c = require('../controllers/notificationController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, c.getNotifications);
router.put('/read-all', protect, c.markAllRead);
router.put('/:id/read', protect, c.markRead);

module.exports = router;
