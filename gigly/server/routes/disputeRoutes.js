const router = require('express').Router();
const c = require('../controllers/disputeController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/', protect, authorize('client', 'freelancer'), c.createDispute);
router.get('/my', protect, authorize('client', 'freelancer'), c.getMyDisputes);

router.get('/', protect, authorize('admin'), c.getAllDisputes);
router.put('/:id/resolve', protect, authorize('admin'), c.resolveDispute);

module.exports = router;
