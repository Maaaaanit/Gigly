const router = require('express').Router();
const c = require('../controllers/analyticsController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/freelancer', protect, authorize('freelancer'), c.getFreelancerStats);
router.get('/client', protect, authorize('client'), c.getClientStats);
router.get('/admin', protect, authorize('admin'), c.getAdminStats);

module.exports = router;
