const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    sendVerificationCode,
    verifyVerificationCode,
    checkEmail,
    forgotPassword,
    resetPassword,
    googleLogin
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');
const { authLimiter, registerLimiter, otpLimiter } = require('../middleware/rateLimiter');
const { loginRules, registerRules, forgotPasswordRules, resetPasswordRules, validate } = require('../middleware/validationRules');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               firebaseUid:
 *                  type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 */
router.post('/register', registerLimiter, registerRules, validate, registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email or Phone Number
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authLimiter, loginRules, validate, loginUser);

/**
 * @swagger
 * /auth/check-email:
 *   post:
 *     summary: Check if email or phone exists
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               identifier:
 *                 type: string
 *     responses:
 *       200:
 *         description: Check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 */
router.post('/check-email', checkEmail);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent
 */
router.post('/forgot-password', otpLimiter, forgotPasswordRules, validate, forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.post('/reset-password', otpLimiter, resetPasswordRules, validate, resetPassword);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', logoutUser);

/**
 * @swagger
 * /auth/send-verification:
 *   post:
 *     summary: Send email verification code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification code sent
 */
router.post('/send-verification', otpLimiter, sendVerificationCode);

/**
 * @swagger
 * /auth/verify-code:
 *   post:
 *     summary: Verify email code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified
 */
router.post('/verify-code', verifyVerificationCode);

/**
 * @swagger
 * /auth/google-login:
 *   post:
 *     summary: Login with Google
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uid:
 *                 type: string
 *               email:
 *                 type: string
 *               displayName:
 *                 type: string
 *               photoURL:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/google-login', googleLogin);


/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 */
router.get('/profile', protect, getUserProfile);

/**
 * @swagger
 * /auth/.well-known/openid-configuration:
 *   get:
 *     summary: OIDC Discovery Endpoint
 *     description: Returns the OpenID Connect configuration for setting up this SSO as an Identity Provider (IDP).
 *     tags: [OIDC]
 *     responses:
 *       200:
 *         description: OIDC Configuration JSON
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issuer:
 *                   type: string
 *                   example: "https://onlinesaathi-sso.vercel.app"
 *                 authorization_endpoint:
 *                   type: string
 *                   example: "https://onlinesaathi-sso.vercel.app/oauth/authorize"
 *                 token_endpoint:
 *                   type: string
 *                   example: "https://onlinesaathi-sso.vercel.app/oauth/token"
 *                 userinfo_endpoint:
 *                   type: string
 *                   example: "https://onlinesaathi-sso.vercel.app/api/auth/profile"
 *                 jwks_uri:
 *                   type: string
 *                   example: "https://onlinesaathi-sso.vercel.app/oauth/jwks"
 */
router.get('/.well-known/openid-configuration', (req, res) => {
    // Mock OIDC Discovery response
    const baseUrl = process.env.API_URL || 'http://localhost:5000/api';

    res.json({
        issuer: baseUrl,
        authorization_endpoint: `${baseUrl}/oauth/authorize`,
        token_endpoint: `${baseUrl}/oauth/token`,
        userinfo_endpoint: `${baseUrl}/auth/profile`,
        jwks_uri: `${baseUrl}/oauth/jwks`,
        response_types_supported: ["code", "token", "id_token"],
        subject_types_supported: ["public"],
        id_token_signing_alg_values_supported: ["HS256"] // We are using HS256 in authController
    });
});


module.exports = router;
