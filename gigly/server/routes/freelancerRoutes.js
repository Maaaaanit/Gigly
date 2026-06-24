const router = require('express').Router();
const c = require('../controllers/freelancerController');
const { protect, authorize, optionalAuth } = require('../middlewares/auth');
const { uploadDocument, uploadAvatar } = require('../config/multer');

router.get('/browse', optionalAuth, c.browse);
router.get('/categories', c.getCategories);
router.get('/me', protect, authorize('freelancer'), c.getMyProfile);
router.get('/:userId', optionalAuth, c.getProfile);
router.put('/:userId', protect, uploadDocument.fields([{ name: 'pan', maxCount: 1 }, { name: 'aadhaar', maxCount: 1 }]), c.updateProfile);
router.post('/avatar', protect, uploadAvatar.single('avatar'), c.updateAvatar);

module.exports = router;
