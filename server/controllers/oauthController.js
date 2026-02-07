const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Application = require('../models/Application');
const AuthorizationCode = require('../models/AuthorizationCode');

// Helper to generate random string
const generateCode = () => {
    return crypto.randomBytes(16).toString('hex');
};

// @desc    OAuth Authorize Token
// @route   GET /api/oauth/authorize
const authorize = async (req, res) => {
    const { client_id, redirect_uri, response_type, state, scope } = req.query;

    if (response_type !== 'code') {
        return res.status(400).json({ error: 'unsupported_response_type' });
    }

    const app = await Application.findOne({ clientId: client_id });

    if (!app) {
        return res.status(400).json({ error: 'invalid_client' });
    }

    if (!app.redirectUris.includes(redirect_uri)) {
        return res.status(400).json({ error: 'invalid_redirect_uri' });
    }

    // Identify user from session cookie (similar to protect middleware)
    let token;
    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        // Redirect to login page with return URL
        const loginPage = process.env.NODE_ENV === 'development'
            ? 'http://localhost:5173/login'
            : 'https://accounts.i-sewa.in/login'; // Updated to new production domain

        return res.redirect(`${loginPage}?returnUrl=${returnUrl}`);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            const loginPage = process.env.NODE_ENV === 'development'
                ? 'http://localhost:5173/login'
                : 'https://accounts.i-sewa.in/login';
            return res.redirect(`${loginPage}?returnUrl=${encodeURIComponent(req.originalUrl)}`);
        }

        // Generate Auth Code
        const code = generateCode();

        await AuthorizationCode.create({
            code,
            clientId: client_id,
            userId: user._id,
            redirectUri: redirect_uri,
            scope: scope || 'openid profile email'
        });

        // Redirect back to client app
        const redirectUrl = new URL(redirect_uri);
        redirectUrl.searchParams.append('code', code);
        if (state) redirectUrl.searchParams.append('state', state);

        res.redirect(redirectUrl.toString());

    } catch (error) {
        console.error("OAuth Authorize Error:", error);
        const loginPage = process.env.NODE_ENV === 'development'
            ? 'http://localhost:5173/login'
            : 'https://accounts.i-sewa.in/login';
        return res.redirect(`${loginPage}?returnUrl=${encodeURIComponent(req.originalUrl)}`);
    }
};

// @desc    OAuth Token Exchange
// @route   POST /api/oauth/token
const token = async (req, res) => {
    const { grant_type, code, client_id, client_secret, redirect_uri } = req.body;

    if (grant_type !== 'authorization_code') {
        return res.status(400).json({ error: 'unsupported_grant_type' });
    }

    // Validate Client
    const app = await Application.findOne({ clientId: client_id });
    if (!app || app.clientSecret !== client_secret) {
        return res.status(401).json({ error: 'invalid_client' });
    }

    // Validate Code
    const authCode = await AuthorizationCode.findOne({ code });
    if (!authCode) {
        return res.status(400).json({ error: 'invalid_grant' });
    }

    if (authCode.clientId !== client_id) {
        return res.status(400).json({ error: 'invalid_grant' });
    }

    // Some strict OIDC clients verify redirect_uri match exactly
    // if (authCode.redirectUri !== redirect_uri) ... 

    // Find User
    const user = await User.findById(authCode.userId);
    if (!user) {
        return res.status(400).json({ error: 'invalid_grant' });
    }

    // Generate Tokens
    // For ID Token, we strictly follow OIDC format
    const idTokenPayload = {
        iss: process.env.VITE_API_URL || 'https://onlinesaathi-sso.vercel.app',
        sub: user._id.toString(),
        aud: client_id,
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
        iat: Math.floor(Date.now() / 1000),
        name: user.username,
        email: user.email,
        picture: user.profilePicture
    };

    const id_token = jwt.sign(idTokenPayload, process.env.JWT_SECRET); // Using HS256 for now (should be RS256)

    // Access Token (for userinfo endpoint)
    const access_token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Remove used code
    await AuthorizationCode.deleteOne({ _id: authCode._id });

    res.json({
        access_token,
        id_token,
        token_type: 'Bearer',
        expires_in: 3600
    });
};

// @desc    JWKS Endpoint (Mock for RS256 if we implement it later)
// @route   GET /api/oauth/jwks
const jwks = (req, res) => {
    // Return empty keys for now as we utilize HS256 (symmetric) and this is mostly for RS256 clients checking
    // If strict clients need RS256, we must generate keys.
    // For now, return empty or dummy.
    res.json({ keys: [] });
};

module.exports = {
    authorize,
    token,
    jwks
};
