const router = require('express').Router();
const c = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect, authorize('admin'));

router.get('/users', c.getUsers);
router.put('/users/:id/toggle-status', c.toggleUserStatus);

router.get('/jobs', c.getJobs);
router.put('/jobs/:id/close', c.removeJob);

router.get('/contracts', c.getContracts);

router.get('/contact-messages', c.getContactMessages);
router.put('/contact-messages/:id/status', c.updateContactMessageStatus);

module.exports = router;
