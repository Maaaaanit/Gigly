const router = require('express').Router();
const c = require('../controllers/proposalController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/my', protect, authorize('freelancer'), c.getMyProposals);
router.put('/:id/withdraw', protect, authorize('freelancer'), c.withdrawProposal);
router.put('/:id/accept', protect, authorize('client'), c.acceptProposal);
router.put('/:id/reject', protect, authorize('client'), c.rejectProposal);

module.exports = router;
