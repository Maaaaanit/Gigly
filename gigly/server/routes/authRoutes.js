const router = require('express').Router();
const { body } = require('express-validator');
const c = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const v = require('../middlewares/validate');

router.post('/register', [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 }), body('role').isIn(['freelancer', 'client', 'admin'])], v, c.register);
router.post('/login', [body('email').isEmail(), body('password').notEmpty()], v, c.login);
router.get('/me', protect, c.getMe);
router.put('/password', protect, c.updatePassword);
router.post('/forgot-password', [body('email').isEmail()], v, c.forgotPassword);
router.post('/reset-password', [body('token').notEmpty(), body('password').isLength({ min: 6 })], v, c.resetPassword);

module.exports = router;
