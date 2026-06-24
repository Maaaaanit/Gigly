const router = require('express').Router();
const c = require('../controllers/invoiceController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, c.getInvoices);
router.get('/:id', protect, c.getInvoiceById);
router.get('/:id/pdf', protect, c.downloadPDF);

module.exports = router;
