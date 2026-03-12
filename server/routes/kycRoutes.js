const express = require('express');
const router = express.Router();
const { protect, isSubAdmin, isSuperAdmin, requireMinRole, ROLE_LEVELS } = require('../middleware/authMiddleware');
const {
    submitKYCRequest,
    getMyKYCStatus,
    getKYCQueue,
    getKYCDetails,
    claimKYCReview,
    reviewKYC,
    getAllKYCRecords
} = require('../controllers/kycController');

router.use(protect);

// Any authenticated user
router.post('/submit', submitKYCRequest);
router.get('/my-status', getMyKYCStatus);

// Agent and above: review queue
const isAgentOrAbove = requireMinRole('agent');
router.get('/queue', isAgentOrAbove, getKYCQueue);
router.get('/:id', isAgentOrAbove, getKYCDetails);
router.put('/:id/claim', isAgentOrAbove, claimKYCReview);
router.put('/:id/review', isAgentOrAbove, reviewKYC);

// subAdmin and above: full list
router.get('/admin/all', isSubAdmin, getAllKYCRecords);

module.exports = router;
