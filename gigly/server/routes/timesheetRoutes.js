const router = require('express').Router();
const c = require('../controllers/timesheetController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/', protect, authorize('freelancer'), c.submitTimesheet);
router.get('/', protect, c.getTimesheets);
router.put('/:id/approve', protect, authorize('client'), c.approveTimesheet);
router.put('/:id/reject', protect, authorize('client'), c.rejectTimesheet);

module.exports = router;
