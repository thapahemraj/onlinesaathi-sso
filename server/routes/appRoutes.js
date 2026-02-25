const express = require('express');
const router = express.Router();
const { processVoiceAI } = require('../controllers/voiceAIController');
const { generateAnalyticsReport } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { tenantMiddleware } = require('../middleware/tenantMiddleware');
const { checkFeature } = require('../middleware/featureGuard');

// Secure route with Auth, Tenant Context, and Feature Gate
router.post('/process',
    protect,
    tenantMiddleware,
    checkFeature('voice-ai'),
    processVoiceAI
);

router.post('/analytics/report',
    protect,
    tenantMiddleware,
    checkFeature('analytics'),
    generateAnalyticsReport
);

module.exports = router;
