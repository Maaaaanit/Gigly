const router = require('express').Router();
const c = require('../controllers/contactController');

router.post('/', c.submitMessage);

module.exports = router;
