const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const crypto = require('crypto');

// RP (Relying Party) Configuration
const rpName = 'Online Saathi SSO';
const rpID = process.env.RP_ID || 'localhost';
const origin = process.env.CLIENT_URL || 'http://localhost:5173';

// Helper to log activities
const logActivity = async (userId, action, details, status = 'SUCCESS') => {
    try {
        await ActivityLog.create({
            actor: userId,
            action,
            details,
            status
        });
    } catch (err) {
        console.error('Failed to log activity:', err);
    }
};

/**
 * Registration: Step 1 - Generate Options
 */
exports.generateRegistrationOptions = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            userID: user._id.toString(),
            userName: user.email || user.username,
            // Don't exclude credentials yet, allow multiple devices
            // excludeCredentials: user.webauthnCredentials.map(authenticator => ({
            //     id: authenticator.credentialID,
            //     type: 'public-key',
            //     transports: authenticator.transports,
            // })),
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred',
                authenticatorAttachment: 'platform',
            },
        });

        // Save challenge to user (temporary - in production use Redis or similar session store)
        user.currentChallenge = options.challenge;
        await user.save();

        res.json(options);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to generate registration options' });
    }
};

/**
 * Registration: Step 2 - Verify Response
 */
exports.verifyRegistration = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { body } = req;

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
            await logActivity(user._id, 'PASSKEY_REGISTER', { error: error.message }, 'FAILURE');
            return res.status(400).json({ message: error.message });
        }

        const { verified, registrationInfo } = verification;

        if (verified && registrationInfo) {
            const { credentialPublicKey, credentialID, counter } = registrationInfo;

            // Save new authenticator
            user.webauthnCredentials.push({
                credentialID: Buffer.from(credentialID).toString('base64'),
                credentialPublicKey: Buffer.from(credentialPublicKey),
                counter,
                transports: body.response.transports,
            });

            user.currentChallenge = undefined; // Clear challenge
            await user.save();

            await logActivity(user._id, 'PASSKEY_REGISTER', { credentialID: Buffer.from(credentialID).toString('base64') });
            res.json({ verified: true });
        } else {
            res.status(400).json({ verified: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to verify registration' });
    }
};

/**
 * Authentication: Step 1 - Generate Options
 */
exports.generateAuthenticationOptions = async (req, res) => {
    try {
        // Since this is passwordless, we might not know the user yet unless they provide a username first
        // Or if they are doing 2FA/re-auth.
        // For "Discoverable Credentials" (Usernameless), we don't pass allowCredentials

        const options = await generateAuthenticationOptions({
            rpID,
            userVerification: 'preferred',
        });

        // Store challenge in a temporary session or cookie since we don't know the user yet
        // For simplicity in this demo, we'll return it and expect the client to send it back signed (not secure for prod without session)
        // Ideally: req.session.currentChallenge = options.challenge;
        // BUT, since we are stateless JWT, we can't easily store it on server without a User ID.
        // ALTERNATIVE: Use a signed cookie for the challenge.

        res.cookie('authChallenge', options.challenge, { httpOnly: true, maxAge: 60000, secure: process.env.NODE_ENV === 'production' });
        res.json(options);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to generate authentication options' });
    }
};

/**
 * Authentication: Step 2 - Verify Response
 */
exports.verifyAuthentication = async (req, res) => {
    try {
        const { body } = req;
        const challenge = req.cookies.authChallenge;

        if (!challenge) {
            return res.status(400).json({ message: 'Authentication timed out or invalid session' });
        }

        // We need to find the user who owns this credential
        const credentialID = body.id;
        const user = await User.findOne({
            'webauthnCredentials.credentialID': credentialID
        });

        if (!user) {
            return res.status(404).json({ message: 'Passkey not found' });
        }

        const authenticator = user.webauthnCredentials.find(
            cred => cred.credentialID === credentialID
        );

        if (!authenticator) {
            return res.status(400).json({ message: 'Authenticator not registered' });
        }

        let verification;
        try {
            verification = await verifyAuthenticationResponse({
                response: body,
                expectedChallenge: challenge,
                expectedOrigin: origin,
                expectedRPID: rpID,
                authenticator: {
                    credentialPublicKey: authenticator.credentialPublicKey,
                    credentialID: Buffer.from(authenticator.credentialID, 'base64'),
                    counter: authenticator.counter,
                },
            });
        } catch (error) {
            console.error(error);
            await logActivity(user._id, 'PASSKEY_LOGIN', { error: error.message }, 'FAILURE');
            return res.status(400).json({ message: error.message });
        }

        const { verified, authenticationInfo } = verification;

        if (verified) {
            // Update counter
            authenticator.counter = authenticationInfo.newCounter;
            await user.save();

            // Login successful - Issue JWT
            const token = require('jsonwebtoken').sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.clearCookie('authChallenge');
            await logActivity(user._id, 'PASSKEY_LOGIN', { credentialID });

            res.json({
                verified: true,
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture
                }
            });
        } else {
            res.status(400).json({ verified: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to verify authentication' });
    }
};
