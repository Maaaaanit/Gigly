const router = require('express').Router();
const c = require('../controllers/paymentController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/create-order', protect, authorize('client'), c.createOrder);
router.post('/verify', protect, authorize('client'), c.verifyPayment);
router.post('/mock-pay', protect, authorize('client'), c.mockPay);
router.get('/', protect, c.getPayments);

module.exports = router;
