const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getFullProfile,
    updateProfile,
    updateProfilePicture,
    changePassword,
    updatePrivacySettings
} = require('../controllers/profileController');
const { getAddresses, addAddress, updateAddress, deleteAddress } = require('../controllers/addressController');
const { getPaymentMethods, addPaymentMethod, deletePaymentMethod, setDefaultPayment } = require('../controllers/paymentController');

// All routes are protected
router.use(protect);

// Profile
router.get('/', getFullProfile);
router.put('/', updateProfile);
router.put('/picture', updateProfilePicture);
router.put('/password', changePassword);
router.put('/privacy', updatePrivacySettings);

// Addresses
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);

// Payment Methods
router.get('/payments', getPaymentMethods);
router.post('/payments', addPaymentMethod);
router.delete('/payments/:id', deletePaymentMethod);
router.put('/payments/:id/default', setDefaultPayment);

module.exports = router;
