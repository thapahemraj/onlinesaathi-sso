const SimpleWebAuthnServer = require('@simplewebauthn/server');
const { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } = require('@simplewebauthn/server');
const User = require('../models/User');
const Authenticator = require('../models/Authenticator');

const rpName = 'Online Saathi SSO';

// Helper to get RP ID and Origin from Request
const getRpConfig = (req) => {
    // 1. Determine Origin (Client URL)
    // In production, this might come from Origin header or Referer
    const origin = req.get('Origin') || process.env.CLIENT_URL || 'https://accounts.i-sewa.in';

    // 2. Determine RP ID (Domain without port)
    // If we are on localhost, it's 'localhost'
    // If we are on 'accounts.i-sewa.in', it should be 'i-sewa.in' or 'accounts.i-sewa.in'
    // WebAuthn spec says RP ID must be effective domain.

    let rpID = process.env.RP_ID || 'localhost';

    try {
        const url = new URL(origin);
        rpID = url.hostname;
    } catch (e) {
        console.warn("Invalid origin URL, falling back to ENV or localhost");
    }

    return { rpID, origin };
};

// Helper to encode User ID safely
const isoUint8Array = (str) => {
    return new Uint8Array(Buffer.from(str));
}

/**
 * Registration: Generate Options
 */
const generateRegistrationOptionsHandler = async (req, res) => {
    const { rpID } = getRpConfig(req);
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const userAuthenticators = await Authenticator.find({ user: user._id });

    const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID: isoUint8Array(user._id.toString()),
        userName: user.email || user.username,
        excludeCredentials: userAuthenticators.map(auth => ({
            id: auth.credentialID,
            type: 'public-key',
            transports: auth.transports,
        })),
        authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'preferred',
            authenticatorAttachment: 'platform',
        },
    });

    await User.findByIdAndUpdate(user._id, { currentChallenge: options.challenge });

    res.json(options);
};

/**
 * Registration: Verify Response
 */
const verifyRegistrationResponseHandler = async (req, res) => {
    const { rpID, origin } = getRpConfig(req);
    const { body } = req;
    const user = await User.findById(req.user._id);

    if (!user || !user.currentChallenge) {
        return res.status(400).json({ error: 'Challenge not found or expired' });
    }

    let verification;
    try {
        verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge: user.currentChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: error.message });
    }

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
        const { credentialPublicKey, credentialID, counter } = registrationInfo;

        const newAuthenticator = new Authenticator({
            user: user._id,
            credentialID,
            credentialPublicKey: Buffer.from(credentialPublicKey),
            counter,
            transports: body.response.transports || [],
        });

        await newAuthenticator.save();
        await User.findByIdAndUpdate(user._id, { currentChallenge: '' });

        res.json({ verified: true });
    } else {
        res.status(400).json({ verified: false, error: 'Verification failed' });
    }
};

/**
 * Login: Generate Options
 */
const generateAuthenticationOptionsHandler = async (req, res) => {
    const { rpID } = getRpConfig(req);
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const userAuthenticators = await Authenticator.find({ user: user._id });

    const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: userAuthenticators.map(auth => ({
            id: auth.credentialID,
            type: 'public-key',
            transports: auth.transports,
        })),
        userVerification: 'preferred',
    });

    await User.findByIdAndUpdate(user._id, { currentChallenge: options.challenge });

    res.json(options);
};

/**
 * Login: Verify Response
 */
const verifyAuthenticationResponseHandler = async (req, res) => {
    const { rpID, origin } = getRpConfig(req);
    const { body, email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const authenticator = await Authenticator.findOne({
        credentialID: body.id,
        user: user._id
    });

    if (!authenticator) {
        return res.status(400).json({ error: 'Authenticator not found' });
    }

    let verification;
    try {
        verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge: user.currentChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: {
                credentialID: authenticator.credentialID,
                credentialPublicKey: authenticator.credentialPublicKey,
                counter: authenticator.counter,
                transports: authenticator.transports,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: error.message });
    }

    const { verified, authenticationInfo } = verification;

    if (verified) {
        authenticator.counter = authenticationInfo.newCounter;
        authenticator.lastUsed = new Date();
        await authenticator.save();
        await User.findByIdAndUpdate(user._id, { currentChallenge: '' });

        const generateToken = require('../utils/generateToken');
        const token = generateToken(user._id);

        res.json({
            verified: true, token, user: {
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                role: user.role
            }
        });
    } else {
        res.status(400).json({ verified: false, error: 'Verification failed' });
    }
};

module.exports = {
    generateRegistrationOptions: generateRegistrationOptionsHandler,
    verifyRegistrationResponse: verifyRegistrationResponseHandler,
    generateAuthenticationOptions: generateAuthenticationOptionsHandler,
    verifyAuthenticationResponse: verifyAuthenticationResponseHandler
};
