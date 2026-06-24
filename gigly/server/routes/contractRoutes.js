const router = require('express').Router();
const c = require('../controllers/contractController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/', protect, authorize('client'), c.createDirectContract);
router.get('/', protect, c.getContracts);
router.get('/:id', protect, c.getContractById);
router.put('/:id/accept', protect, authorize('freelancer'), c.acceptContract);
router.put('/:id/status', protect, c.updateContractStatus);

module.exports = router;
