const router = require('express').Router();
const c = require('../controllers/jobController');
const p = require('../controllers/proposalController');
const { protect, authorize, optionalAuth } = require('../middlewares/auth');

router.get('/', optionalAuth, c.getJobs);
router.post('/', protect, authorize('client'), c.createJob);
router.get('/my', protect, authorize('client'), c.getClientJobs);
router.get('/:id', optionalAuth, c.getJobById);
router.put('/:id', protect, authorize('client'), c.updateJob);
router.put('/:id/close', protect, authorize('client'), c.closeJob);
router.delete('/:id', protect, authorize('client'), c.deleteJob);
router.get('/:id/proposals', protect, authorize('client'), c.getJobProposals);

router.post('/:jobId/proposals', protect, authorize('freelancer'), p.submitProposal);

module.exports = router;
