const SimpleWebAuthnServer = require('@simplewebauthn/server');
const User = require('../models/User');
const Authenticator = require('../models/Authenticator');

const rpName = 'Online Saathi SSO';
const rpID = process.env.RP_ID || 'localhost';
const origin = process.env.CLIENT_URL || 'http://localhost:5173';

// Helper to encode User ID safely
const isoUint8Array = (str) => {
    return new Uint8Array(Buffer.from(str));
}

/**
 * Registration: Generate Options
 */
const generateRegistrationOptions = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Get user's existing authenticators to exclude them
    const userAuthenticators = await Authenticator.find({ user: user._id });

    const options = await SimpleWebAuthnServer.generateRegistrationOptions({
        rpName,
        rpID,
        userID: isoUint8Array(user._id.toString()),
        userName: user.email || user.username,
        // Don't prompt user for checking if they want to register a device they already have
        excludeCredentials: userAuthenticators.map(auth => ({
            id: auth.credentialID,
            type: 'public-key',
            transports: auth.transports,
        })),
        authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'preferred',
            authenticatorAttachment: 'platform', // Force platform (TouchID/FaceID) for "Biometrics" feel
        },
    });

    // Save challenge to session or DB (Here we use session which requires express-session, 
    // BUT since we are stateless JWT, we might need to sign the challenge and send it back 
    // OR store it in a temporary "Challenge" collection. 
    // For simplicity in a JWT setup without Redis/Sessions, we'll return it and expect the client to sign it? 
    // NO, that's insecure. 
    // Best Practice for stateless: Store challenge in a short-lived HTTP-only cookie or DB record linked to user.
    // Let's assume we store it in the User model temporarily or a separate collection.
    // For this implementation, let's use a temporary "currentChallenge" field on the User model.

    // NOTE: This modifies the User model schema implicitly if not defined, but Mongoose supports it if strict: false or we add it. 
    // Let's assume we create a DB record or use the User.

    // We will verify against this user record later.
    // Ideally use a separate cache (Redis), but we use User for simplicity.
    req.user.currentChallenge = options.challenge;
    // We need to save this to the DB because subsequent request comes from client
    // However, req.user is usually from JWT middleware. We need to save to the actual DB doc.
    await User.findByIdAndUpdate(user._id, { currentChallenge: options.challenge });

    res.json(options);
};

/**
 * Registration: Verify Response
 */
const verifyRegistrationResponse = async (req, res) => {
    const { body } = req;
    const user = await User.findById(req.user._id);

    if (!user || !user.currentChallenge) {
        return res.status(400).json({ error: 'Challenge not found or expired' });
    }

    let verification;
    try {
        verification = await SimpleWebAuthnServer.verifyRegistrationResponse({
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

        // Clear challenge
        await User.findByIdAndUpdate(user._id, { currentChallenge: '' });

        res.json({ verified: true });
    } else {
        res.status(400).json({ verified: false, error: 'Verification failed' });
    }
};

/**
 * Login: Generate Options
 */
const generateAuthenticationOptions = async (req, res) => {
    // Determine user from email/username provided in body
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const userAuthenticators = await Authenticator.find({ user: user._id });

    const options = await SimpleWebAuthnServer.generateAuthenticationOptions({
        rpID,
        allowCredentials: userAuthenticators.map(auth => ({
            id: auth.credentialID,
            type: 'public-key',
            transports: auth.transports,
        })),
        userVerification: 'preferred',
    });

    // Save challenge
    await User.findByIdAndUpdate(user._id, { currentChallenge: options.challenge });

    res.json(options);
};

/**
 * Login: Verify Response
 */
const verifyAuthenticationResponse = async (req, res) => {
    const { body, email } = req.body; // email passed back or inferred? Client should send email + credential

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
        verification = await SimpleWebAuthnServer.verifyAuthenticationResponse({
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
        // Update counter
        authenticator.counter = authenticationInfo.newCounter;
        authenticator.lastUsed = new Date();
        await authenticator.save();

        // Clear challenge
        await User.findByIdAndUpdate(user._id, { currentChallenge: '' });

        // Generate JWT
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
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse
};
