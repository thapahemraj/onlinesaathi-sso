const { body, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()[0].msg,
            errors: errors.array()
        });
    }
    next();
};

// Auth validation rules
const registerRules = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[@$!%*?&#]/).withMessage('Password must contain at least one special character (@$!%*?&#)'),
];

const loginRules = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email or phone is required'),
    body('password')
        .notEmpty().withMessage('Password is required'),
];

const forgotPasswordRules = [
    body('email')
        .trim()
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
];

const resetPasswordRules = [
    body('email')
        .trim()
        .isEmail().withMessage('Please enter a valid email'),
    body('otp')
        .notEmpty().withMessage('OTP is required'),
    body('newPassword')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

// Profile validation rules
const updateProfileRules = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('First name is too long'),
    body('lastName')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Last name is too long'),
    body('country')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Country name is too long'),
];

const changePasswordRules = [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number'),
];

// Address validation rules
const addressRules = [
    body('fullName')
        .trim()
        .notEmpty().withMessage('Full name is required'),
    body('addressLine1')
        .trim()
        .notEmpty().withMessage('Address line 1 is required'),
    body('city')
        .trim()
        .notEmpty().withMessage('City is required'),
    body('state')
        .trim()
        .notEmpty().withMessage('State is required'),
    body('postalCode')
        .trim()
        .notEmpty().withMessage('Postal code is required'),
    body('country')
        .trim()
        .notEmpty().withMessage('Country is required'),
];

// Payment validation rules
const paymentRules = [
    body('type')
        .isIn(['card', 'upi', 'wallet']).withMessage('Invalid payment type'),
    body('label')
        .trim()
        .notEmpty().withMessage('Payment label is required'),
];

module.exports = {
    validate,
    registerRules,
    loginRules,
    forgotPasswordRules,
    resetPasswordRules,
    updateProfileRules,
    changePasswordRules,
    addressRules,
    paymentRules,
};
