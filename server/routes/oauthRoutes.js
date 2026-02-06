const express = require('express');
const router = express.Router();
const { authorize, token, jwks } = require('../controllers/oauthController');

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
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirects to client with code
 */
router.get('/authorize', authorize);

/**
 * @swagger
 * /oauth/token:
 *   post:
 *     summary: OAuth 2.0 Token Endpoint
 *     tags: [OAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - grant_type
 *               - code
 *               - client_id
 *               - client_secret
 *               - redirect_uri
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
 *     responses:
 *       200:
 *         description: access_token and id_token
 */
router.post('/token', token);

router.get('/jwks', jwks);

module.exports = router;
