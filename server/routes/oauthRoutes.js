const express = require('express');
const router = express.Router();
const {
    authorize,
    getConsentInfo,
    consent,
    tokenExchange,
    userinfo,
    jwks
} = require('../controllers/oauthController');

/**
 * @swagger
 * tags:
 *   name: OAuth
 *   description: OAuth 2.0 and OpenID Connect Endpoints
 */

/**
 * @swagger
 * /oauth/authorize:
 *   get:
 *     summary: OAuth 2.0 Authorization Endpoint
 *     tags: [OAuth]
 *     parameters:
 *       - in: query
 *         name: client_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: redirect_uri
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: response_type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [code]
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: code_challenge
 *         schema:
 *           type: string
 *         description: PKCE code challenge (S256)
 *       - in: query
 *         name: code_challenge_method
 *         schema:
 *           type: string
 *           enum: [S256]
 *     responses:
 *       302:
 *         description: Redirects to consent page or login
 */
router.get('/authorize', authorize);

/**
 * @swagger
 * /oauth/consent-info:
 *   get:
 *     summary: Get application info for consent screen
 *     tags: [OAuth]
 *     parameters:
 *       - in: query
 *         name: client_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: App name, description, logo, scopes
 */
router.get('/consent-info', getConsentInfo);

/**
 * @swagger
 * /oauth/consent:
 *   post:
 *     summary: Process user consent approval/denial
 *     tags: [OAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [client_id, redirect_uri, approved]
 *             properties:
 *               client_id:
 *                 type: string
 *               redirect_uri:
 *                 type: string
 *               scope:
 *                 type: string
 *               state:
 *                 type: string
 *               code_challenge:
 *                 type: string
 *               code_challenge_method:
 *                 type: string
 *               approved:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Returns redirectUrl with authorization code
 */
router.post('/consent', consent);

/**
 * @swagger
 * /oauth/token:
 *   post:
 *     summary: OAuth 2.0 Token Exchange (supports PKCE)
 *     tags: [OAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [grant_type, code, client_id, redirect_uri]
 *             properties:
 *               grant_type:
 *                 type: string
 *               code:
 *                 type: string
 *               client_id:
 *                 type: string
 *               client_secret:
 *                 type: string
 *               redirect_uri:
 *                 type: string
 *               code_verifier:
 *                 type: string
 *                 description: PKCE code verifier
 *     responses:
 *       200:
 *         description: access_token, id_token, token_type, expires_in
 */
router.post('/token', tokenExchange);

/**
 * @swagger
 * /oauth/userinfo:
 *   get:
 *     summary: OpenID Connect UserInfo Endpoint
 *     tags: [OAuth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User claims based on granted scopes
 */
router.get('/userinfo', userinfo);

router.get('/jwks', jwks);

module.exports = router;
