const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const User = require('../models/User');
const crypto = require('crypto');

// @desc    Setup 2FA — generate secret and QR code
// @route   POST /api/2fa/setup
// @access  Private
const setupTwoFactor = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user.twoFactorEnabled) {
            return res.status(400).json({ message: '2FA is already enabled. Disable it first to reconfigure.' });
        }

        // Generate secret
        const secret = authenticator.generateSecret();

        // Save secret temporarily (not enabled yet until verified)
        user.twoFactorSecret = secret;
        await user.save();

        // Generate QR code
        const appName = 'OnlineSaathi';
        const otpAuthUrl = authenticator.keyuri(user.email || user.username, appName, secret);
        const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

        res.json({
            secret,
            qrCode: qrCodeDataUrl,
            message: 'Scan the QR code with your authenticator app, then verify with a code.'
        });
    } catch (error) {
        console.error('2FA Setup Error:', error);
        res.status(500).json({ message: 'Failed to setup 2FA' });
    }
};

// @desc    Verify TOTP code and enable 2FA
// @route   POST /api/2fa/verify
// @access  Private
const verifyAndEnable = async (req, res) => {
    try {
        const { code } = req.body;
        const user = await User.findById(req.user._id);

        if (!user.twoFactorSecret) {
            return res.status(400).json({ message: 'Please setup 2FA first.' });
        }

        // Verify the code
        const isValid = authenticator.verify({ token: code, secret: user.twoFactorSecret });

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid verification code. Please try again.' });
        }

        // Generate backup codes
        const backupCodes = [];
        for (let i = 0; i < 8; i++) {
            backupCodes.push({
                code: crypto.randomBytes(4).toString('hex').toUpperCase(),
                used: false
            });
        }

        user.twoFactorEnabled = true;
        user.backupCodes = backupCodes;
        await user.save();

        res.json({
            message: '2FA enabled successfully!',
            backupCodes: backupCodes.map(bc => bc.code)
        });
    } catch (error) {
        console.error('2FA Verify Error:', error);
        res.status(500).json({ message: 'Failed to verify 2FA' });
    }
};

// @desc    Disable 2FA
// @route   DELETE /api/2fa/disable
// @access  Private
const disableTwoFactor = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user._id);

        if (!user.twoFactorEnabled) {
            return res.status(400).json({ message: '2FA is not enabled.' });
        }

        // Verify password before disabling
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password.' });
        }

        user.twoFactorEnabled = false;
        user.twoFactorSecret = null;
        user.backupCodes = [];
        await user.save();

        res.json({ message: '2FA disabled successfully.' });
    } catch (error) {
        console.error('2FA Disable Error:', error);
        res.status(500).json({ message: 'Failed to disable 2FA' });
    }
};

// @desc    Verify 2FA code during login
// @route   POST /api/2fa/login-verify
// @access  Public (with temp token)
const verifyLoginCode = async (req, res) => {
    try {
        const { userId, code } = req.body;

        const user = await User.findById(userId);
        if (!user || !user.twoFactorEnabled) {
            return res.status(400).json({ message: 'Invalid request.' });
        }

        // Check TOTP code
        let isValid = authenticator.verify({ token: code, secret: user.twoFactorSecret });

        // If not valid, check backup codes
        if (!isValid) {
            const backupIndex = user.backupCodes.findIndex(bc => bc.code === code.toUpperCase() && !bc.used);
            if (backupIndex !== -1) {
                user.backupCodes[backupIndex].used = true;
                await user.save();
                isValid = true;
            }
        }

        if (!isValid) {
            return res.status(401).json({ message: 'Invalid 2FA code.' });
        }

        // Generate JWT and set cookie (same as login)
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        const isProduction = process.env.NODE_ENV !== 'development';

        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'lax' : 'strict',
            domain: isProduction ? '.i-sewa.in' : undefined,
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        // Track device
        const { trackDevice } = require('./deviceController');
        trackDevice(user._id, req);

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error('2FA Login Verify Error:', error);
        res.status(500).json({ message: 'Failed to verify 2FA code' });
    }
};

// @desc    Get 2FA status
// @route   GET /api/2fa/status
// @access  Private
const getTwoFactorStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const unusedBackupCount = user.backupCodes.filter(bc => !bc.used).length;

        res.json({
            enabled: user.twoFactorEnabled,
            backupCodesRemaining: unusedBackupCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get 2FA status' });
    }
};

module.exports = { setupTwoFactor, verifyAndEnable, disableTwoFactor, verifyLoginCode, getTwoFactorStatus };
