const express = require('express');
const router = express.Router();
const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse
} = require('../controllers/webauthnController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: WebAuthn
 *   description: FIDO2 / Biometric Authentication
 */

/**
 * @swagger
 * /auth/webauthn/register/options:
 *   get:
 *     summary: Generate WebAuthn registration options
 *     tags: [WebAuthn]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Registration options generated
 */
router.get('/register/options', protect, generateRegistrationOptions);

/**
 * @swagger
 * /auth/webauthn/register/verify:
 *   post:
 *     summary: Verify WebAuthn registration response
 *     tags: [WebAuthn]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Authenticator registered successfully
 */
router.post('/register/verify', protect, verifyRegistrationResponse);

/**
 * @swagger
 * /auth/webauthn/login/options:
 *   post:
 *     summary: Generate WebAuthn login options
 *     tags: [WebAuthn]
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
 *         description: Login options generated
 */
router.post('/login/options', generateAuthenticationOptions);

/**
 * @swagger
 * /auth/webauthn/login/verify:
 *   post:
 *     summary: Verify WebAuthn login response
 *     tags: [WebAuthn]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - body
 *             properties:
 *               email:
 *                 type: string
 *               body:
 *                 type: object
 *     responses:
 *       200:
 *         description: Authenticated successfully, returns JWT
 */
router.post('/login/verify', verifyAuthenticationResponse);

module.exports = router;
