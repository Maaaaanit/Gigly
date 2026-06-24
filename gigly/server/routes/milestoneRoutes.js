const router = require('express').Router();
const c = require('../controllers/milestoneController');
const { protect, authorize } = require('../middlewares/auth');
const { uploadMilestone } = require('../config/multer');

router.post('/', protect, authorize('client'), c.createMilestone);
router.get('/contract/:contractId', protect, c.getMilestones);
router.put('/:id/submit', protect, authorize('freelancer'), uploadMilestone.array('files', 5), c.submitMilestone);
router.put('/:id/approve', protect, authorize('client'), c.approveMilestone);
router.put('/:id/reject', protect, authorize('client'), c.rejectMilestone);

module.exports = router;
