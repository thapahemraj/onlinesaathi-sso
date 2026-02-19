const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    setupTwoFactor,
    verifyAndEnable,
    disableTwoFactor,
    verifyLoginCode,
    getTwoFactorStatus
} = require('../controllers/twoFactorController');

// Protected routes (require login)
router.get('/status', protect, getTwoFactorStatus);
router.post('/setup', protect, setupTwoFactor);
router.post('/verify', protect, verifyAndEnable);
router.delete('/disable', protect, disableTwoFactor);

// Public route (used during login flow)
router.post('/login-verify', verifyLoginCode);

module.exports = router;
