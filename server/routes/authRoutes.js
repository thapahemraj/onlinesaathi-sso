const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    sendVerificationCode,
    verifyVerificationCode,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/check-email', require('../controllers/authController').checkEmail);
router.post('/forgot-password', require('../controllers/authController').forgotPassword);
router.post('/reset-password', require('../controllers/authController').resetPassword);
router.post('/logout', logoutUser);
router.post('/send-verification', sendVerificationCode);
router.post('/verify-code', verifyVerificationCode);
router.get('/profile', protect, getUserProfile);

module.exports = router;
