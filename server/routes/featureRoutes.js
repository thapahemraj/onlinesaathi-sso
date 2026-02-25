const express = require('express');
const router = express.Router();
const { getFeatureFlags, upsertFeatureFlag } = require('../controllers/featureFlagController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getFeatureFlags);
router.post('/admin', protect, admin, upsertFeatureFlag);

module.exports = router;
