const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Application = require('../models/Application');
const AuthorizationCode = require('../models/AuthorizationCode');

// Helper to generate random string
const generateCode = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Helper to create S256 code challenge from verifier
const createS256Challenge = (verifier) => {
    return crypto.createHash('sha256').update(verifier).digest('base64url');
};

// Scope descriptions for consent screen
const SCOPE_DESCRIPTIONS = {
    openid: 'Sign you in and read your unique identifier',
    profile: 'View your name and profile picture',
    email: 'View your email address',
    phone: 'View your phone number',
    address: 'View your address information'
};

// ============================================================
// @desc    OAuth Authorize — validates params, redirects to consent page
// @route   GET /api/oauth/authorize
// ============================================================
const authorize = async (req, res) => {
    try {
        const { client_id, redirect_uri, response_type, state, scope, code_challenge, code_challenge_method } = req.query;

        // 1. Validate response_type
        if (response_type !== 'code') {
            return res.status(400).json({ error: 'unsupported_response_type', error_description: 'Only "code" response type is supported.' });
        }

        // 2. Validate client
        const app = await Application.findOne({ clientId: client_id });
        if (!app) {
            return res.status(400).json({ error: 'invalid_client', error_description: 'Unknown client_id.' });
        }

        if (!app.isEnabled) {
            return res.status(400).json({ error: 'invalid_client', error_description: 'This application has been disabled.' });
        }

        // 3. Validate redirect_uri
        if (!app.redirectUris.includes(redirect_uri)) {
            return res.status(400).json({ error: 'invalid_redirect_uri', error_description: 'The redirect_uri is not registered for this application.' });
        }

        // 4. Validate scopes against app's allowed scopes
        const requestedScopes = (scope || 'openid').split(' ');
        const invalidScopes = requestedScopes.filter(s => !app.allowedScopes.includes(s));
        if (invalidScopes.length > 0) {
            return res.status(400).json({ error: 'invalid_scope', error_description: `Scopes not allowed: ${invalidScopes.join(', ')}` });
        }

        // 5. PKCE validation
        if (code_challenge && code_challenge_method && code_challenge_method !== 'S256') {
            return res.status(400).json({ error: 'invalid_request', error_description: 'Only S256 code_challenge_method is supported.' });
        }

        // 6. Check if user is logged in
        let token;
        if (req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            // Redirect to login with return URL
            const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
            const returnUrl = encodeURIComponent(req.originalUrl);
            return res.redirect(`${clientUrl}/login?returnUrl=${returnUrl}`);
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
            return res.redirect(`${clientUrl}/login?returnUrl=${encodeURIComponent(req.originalUrl)}`);
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
            return res.redirect(`${clientUrl}/login?returnUrl=${encodeURIComponent(req.originalUrl)}`);
        }

        // 7. Redirect to consent page
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const consentParams = new URLSearchParams({
            client_id,
            redirect_uri,
            scope: requestedScopes.join(' '),
            state: state || '',
            code_challenge: code_challenge || '',
            code_challenge_method: code_challenge_method || ''
        });

        return res.redirect(`${clientUrl}/oauth/consent?${consentParams.toString()}`);

    } catch (error) {
        console.error('OAuth Authorize Error:', error);
        return res.status(500).json({ error: 'server_error', error_description: 'Internal server error.' });
    }
};

// ============================================================
// @desc    Get app info for consent screen (called by frontend)
// @route   GET /api/oauth/consent-info
// ============================================================
const getConsentInfo = async (req, res) => {
    try {
        const { client_id, scope } = req.query;

        const app = await Application.findOne({ clientId: client_id });
        if (!app) {
            return res.status(400).json({ error: 'invalid_client' });
        }

        const requestedScopes = (scope || 'openid').split(' ');
        const scopeDetails = requestedScopes.map(s => ({
            name: s,
            description: SCOPE_DESCRIPTIONS[s] || s
        }));

        res.json({
            appName: app.name,
            appDescription: app.description || '',
            appLogo: app.logoUrl || '',
            appHomepage: app.homepageUrl || app.website || '',
            scopes: scopeDetails
        });
    } catch (error) {
        console.error('Consent Info Error:', error);
        res.status(500).json({ error: 'server_error' });
    }
};

// ============================================================
// @desc    User approves consent → generates auth code → redirects to client
// @route   POST /api/oauth/consent
// ============================================================
const consent = async (req, res) => {
    try {
        const { client_id, redirect_uri, scope, state, code_challenge, code_challenge_method, approved } = req.body;

        // Identify user from JWT cookie
        let token;
        if (req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ error: 'unauthorized', error_description: 'User not authenticated.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'unauthorized' });
        }

        // If user denied
        if (!approved) {
            const redirectUrl = new URL(redirect_uri);
            redirectUrl.searchParams.append('error', 'access_denied');
            redirectUrl.searchParams.append('error_description', 'User denied the request.');
            if (state) redirectUrl.searchParams.append('state', state);
            return res.json({ redirectUrl: redirectUrl.toString() });
        }

        // Validate client
        const app = await Application.findOne({ clientId: client_id });
        if (!app || !app.isEnabled) {
            return res.status(400).json({ error: 'invalid_client' });
        }

        if (!app.redirectUris.includes(redirect_uri)) {
            return res.status(400).json({ error: 'invalid_redirect_uri' });
        }

        // Generate authorization code
        const code = generateCode();

        await AuthorizationCode.create({
            code,
            clientId: client_id,
            userId: user._id,
            redirectUri: redirect_uri,
            scope: scope || 'openid',
            codeChallenge: code_challenge || undefined,
            codeChallengeMethod: code_challenge ? (code_challenge_method || 'S256') : undefined,
            consentGiven: true
        });

        // Build redirect URL
        const redirectUrl = new URL(redirect_uri);
        redirectUrl.searchParams.append('code', code);
        if (state) redirectUrl.searchParams.append('state', state);

        res.json({ redirectUrl: redirectUrl.toString() });

    } catch (error) {
        console.error('OAuth Consent Error:', error);
        res.status(500).json({ error: 'server_error' });
    }
};

// ============================================================
// @desc    OAuth Token Exchange — PKCE verified
// @route   POST /api/oauth/token
// ============================================================
const tokenExchange = async (req, res) => {
    try {
        const { grant_type, code, client_id, client_secret, redirect_uri, code_verifier } = req.body;

        if (grant_type !== 'authorization_code') {
            return res.status(400).json({ error: 'unsupported_grant_type' });
        }

        // Validate client
        const app = await Application.findOne({ clientId: client_id });
        if (!app) {
            return res.status(401).json({ error: 'invalid_client' });
        }

        // For confidential clients, validate client_secret
        // For public clients using PKCE, client_secret is not required
        if (client_secret && app.clientSecret !== client_secret) {
            return res.status(401).json({ error: 'invalid_client', error_description: 'Client secret mismatch.' });
        }

        // Validate authorization code
        const authCode = await AuthorizationCode.findOne({ code });
        if (!authCode) {
            return res.status(400).json({ error: 'invalid_grant', error_description: 'Authorization code is invalid or expired.' });
        }

        if (authCode.clientId !== client_id) {
            return res.status(400).json({ error: 'invalid_grant', error_description: 'Code was not issued to this client.' });
        }

        if (authCode.redirectUri !== redirect_uri) {
            return res.status(400).json({ error: 'invalid_grant', error_description: 'Redirect URI mismatch.' });
        }

        // PKCE verification
        if (authCode.codeChallenge) {
            if (!code_verifier) {
                return res.status(400).json({ error: 'invalid_grant', error_description: 'code_verifier is required for PKCE flow.' });
            }

            const computedChallenge = createS256Challenge(code_verifier);
            if (computedChallenge !== authCode.codeChallenge) {
                return res.status(400).json({ error: 'invalid_grant', error_description: 'PKCE code_verifier does not match.' });
            }
        } else if (!client_secret) {
            // If no PKCE and no client_secret, reject
            return res.status(401).json({ error: 'invalid_client', error_description: 'Either client_secret or PKCE is required.' });
        }

        // Find user
        const user = await User.findById(authCode.userId);
        if (!user) {
            return res.status(400).json({ error: 'invalid_grant', error_description: 'User not found.' });
        }

        // Parse scopes
        const scopes = (authCode.scope || 'openid').split(' ');

        // Build ID token payload (OIDC)
        const idTokenPayload = {
            iss: process.env.API_URL || 'http://localhost:5000/api',
            sub: user._id.toString(),
            aud: client_id,
            exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
            iat: Math.floor(Date.now() / 1000),
            nonce: req.body.nonce || undefined
        };

        // Add claims based on scopes
        if (scopes.includes('profile')) {
            idTokenPayload.name = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username;
            idTokenPayload.picture = user.profilePicture || '';
            idTokenPayload.preferred_username = user.username;
        }

        if (scopes.includes('email')) {
            idTokenPayload.email = user.email;
            idTokenPayload.email_verified = true;
        }

        const id_token = jwt.sign(idTokenPayload, process.env.JWT_SECRET);

        // Access token (includes scopes for userinfo endpoint)
        const access_token = jwt.sign(
            { id: user._id, scope: authCode.scope, clientId: client_id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Delete used code (one-time use)
        await AuthorizationCode.deleteOne({ _id: authCode._id });

        res.json({
            access_token,
            id_token,
            token_type: 'Bearer',
            expires_in: 3600,
            scope: authCode.scope
        });

    } catch (error) {
        console.error('OAuth Token Error:', error);
        res.status(500).json({ error: 'server_error' });
    }
};

// ============================================================
// @desc    UserInfo endpoint — returns user profile based on scopes
// @route   GET /api/oauth/userinfo
// ============================================================
const userinfo = async (req, res) => {
    try {
        // Extract Bearer token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'invalid_token', error_description: 'Bearer token required.' });
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ error: 'invalid_token', error_description: 'Token is invalid or expired.' });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'invalid_token', error_description: 'User not found.' });
        }

        const scopes = (decoded.scope || 'openid').split(' ');
        const response = {
            sub: user._id.toString()
        };

        if (scopes.includes('profile')) {
            response.name = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username;
            response.preferred_username = user.username;
            response.picture = user.profilePicture || '';
            if (user.dateOfBirth) response.birthdate = user.dateOfBirth;
            if (user.language) response.locale = user.language;
        }

        if (scopes.includes('email')) {
            response.email = user.email;
            response.email_verified = true;
        }

        if (scopes.includes('phone') && user.phoneNumber) {
            response.phone_number = user.phoneNumber;
            response.phone_number_verified = false;
        }

        if (scopes.includes('address') && user.addresses && user.addresses.length > 0) {
            const addr = user.addresses[0];
            response.address = {
                street_address: addr.street || '',
                locality: addr.city || '',
                region: addr.state || '',
                postal_code: addr.zipCode || '',
                country: addr.country || ''
            };
        }

        res.json(response);

    } catch (error) {
        console.error('UserInfo Error:', error);
        res.status(500).json({ error: 'server_error' });
    }
};

// ============================================================
// @desc    JWKS Endpoint
// @route   GET /api/oauth/jwks
// ============================================================
const jwks = (req, res) => {
    // Using HS256 (symmetric), JWKS is for RS256 public keys
    // Return empty for now — clients using HS256 shouldn't need this
    res.json({ keys: [] });
};

// ============================================================
// @desc    OpenID Connect Discovery Document
// @route   GET /.well-known/openid-configuration
// ============================================================
const discovery = (req, res) => {
    const issuer = process.env.API_URL || 'http://localhost:5000/api';

    res.json({
        issuer,
        authorization_endpoint: `${issuer}/oauth/authorize`,
        token_endpoint: `${issuer}/oauth/token`,
        userinfo_endpoint: `${issuer}/oauth/userinfo`,
        jwks_uri: `${issuer}/oauth/jwks`,
        scopes_supported: ['openid', 'profile', 'email', 'phone', 'address'],
        response_types_supported: ['code'],
        grant_types_supported: ['authorization_code'],
        subject_types_supported: ['public'],
        id_token_signing_alg_values_supported: ['HS256'],
        token_endpoint_auth_methods_supported: ['client_secret_post', 'none'],
        code_challenge_methods_supported: ['S256']
    });
};

module.exports = {
    authorize,
    getConsentInfo,
    consent,
    tokenExchange,
    userinfo,
    jwks,
    discovery
};
