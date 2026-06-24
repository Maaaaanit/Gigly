const router = require('express').Router();
const c = require('../controllers/reviewController');
const { protect } = require('../middlewares/auth');

router.post('/', protect, c.createReview);
router.get('/freelancer/:freelancerId', c.getFreelancerReviews);

module.exports = router;
