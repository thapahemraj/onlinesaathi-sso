const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getFullProfile,
    updateProfile,
    updateProfilePicture,
    changePassword,
    updatePrivacySettings,
    requestEmailChange,
    confirmEmailChange,
    deleteAccount,
    setRecoveryEmail
} = require('../controllers/profileController');
const { getAddresses, addAddress, updateAddress, deleteAddress } = require('../controllers/addressController');
const { getPaymentMethods, addPaymentMethod, deletePaymentMethod, setDefaultPayment } = require('../controllers/paymentController');
const { updateProfileRules, changePasswordRules, addressRules, paymentRules, validate } = require('../middleware/validationRules');

// All routes are protected
router.use(protect);

// Profile
router.get('/', getFullProfile);
router.put('/', updateProfileRules, validate, updateProfile);
router.put('/picture', updateProfilePicture);
router.put('/password', changePasswordRules, validate, changePassword);
router.put('/privacy', updatePrivacySettings);

// Email change
router.post('/change-email', requestEmailChange);
router.post('/confirm-email-change', confirmEmailChange);

// Account management
router.delete('/delete-account', deleteAccount);
router.put('/recovery-email', setRecoveryEmail);

// Addresses
router.get('/addresses', getAddresses);
router.post('/addresses', addressRules, validate, addAddress);
router.put('/addresses/:id', addressRules, validate, updateAddress);
router.delete('/addresses/:id', deleteAddress);

// Payment Methods
router.get('/payments', getPaymentMethods);
router.post('/payments', paymentRules, validate, addPaymentMethod);
router.delete('/payments/:id', deletePaymentMethod);
router.put('/payments/:id/default', setDefaultPayment);

module.exports = router;


