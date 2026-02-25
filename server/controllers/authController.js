const crypto = require('crypto');
const User = require('../models/User');

const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken');
const { trackDevice } = require('./deviceController');
const { createSession } = require('./sessionController');
const { logAction } = require('./auditController');
const Session = require('../models/Session');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        await connectDB();
        const { username, email, password, phoneNumber, firebaseUid } = req.body;

        // Check for existing user by email, username, or phone individually to give better error message
        if (email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) return res.status(400).json({ message: 'Email already exists' });
        }
        if (phoneNumber) {
            const phoneExists = await User.findOne({ phoneNumber });
            if (phoneExists) return res.status(400).json({ message: 'Phone number already exists' });
        }
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            // If auto-generated username exists, we should ideally retry, but for now just error
            return res.status(400).json({ message: 'Username taken, please try again' });
        }

        const user = await User.create({
            username,
            email,
            password,
            phoneNumber,
            firebaseUid
        });

        if (user) {
            const token = generateToken(user._id);

            // Determine cookie options based on environment
            const isProduction = process.env.NODE_ENV !== 'development';

            res.cookie('token', token, {
                httpOnly: true,
                secure: isProduction, // Secure in production
                sameSite: 'lax', // Use Lax for both dev and prod to ensure reliable cookie delivery
                domain: isProduction ? '.i-sewa.in' : undefined,
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    await connectDB();
    const { email, password } = req.body;

    // Find user by email OR phoneNumber
    const user = await User.findOne({
        $or: [
            { email: email },
            { phoneNumber: email }
        ]
    });

    if (!user) {
        // Audit Log: Login Failure (User not found)
        await logAction(req, 'Login', 'User', null, { method: 'password', identifier: email, error: 'User not found' }, 'Failure');
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is locked
    if (user.isLocked) {
        const remainingMs = user.lockUntil - Date.now();
        const remainingMin = Math.ceil(remainingMs / 60000);
        // Audit Log: Login Failure (Account Locked)
        await logAction(req, 'Login', 'User', user._id, { method: 'password', error: 'Account locked' }, 'Failure');
        return res.status(423).json({
            message: `Account locked due to too many failed attempts. Try again in ${remainingMin} minute${remainingMin > 1 ? 's' : ''}.`,
            lockedUntil: user.lockUntil
        });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        // Increment failed login attempts
        await user.incLoginAttempts();
        const attemptsLeft = 5 - (user.loginAttempts + 1);
        const msg = attemptsLeft > 0
            ? `Invalid email or password. ${attemptsLeft} attempt${attemptsLeft > 1 ? 's' : ''} remaining.`
            : 'Account locked due to too many failed attempts. Try again in 30 minutes.';
        // Audit Log: Login Failure (Invalid Password)
        await logAction(req, 'Login', 'User', user._id, { method: 'password', error: 'Invalid password' }, 'Failure');
        return res.status(401).json({ message: msg });
    }

    // Successful login — reset attempts
    if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
    }

    // Track device and create session on login
    // We track device BEFORE 2FA check to see if it's trusted
    const CurrentDevice = await trackDevice(user._id, req);

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
        // If device is trusted, skip 2FA
        if (CurrentDevice && CurrentDevice.isTrusted) {
            await logAction(req, 'Login', 'User', user._id, { method: 'password', skip2FA: true, deviceId: CurrentDevice._id }, 'Success');
        } else {
            // Audit Log: Login Requires 2FA
            await logAction(req, 'Login', 'User', user._id, { method: 'password', status: '2FA Required' }, 'Pending');
            return res.json({
                requires2FA: true,
                userId: user._id,
                email: user.email,
                message: 'Please enter your 2FA code.'
            });
        }
    }

    const token = generateToken(user._id); // Fixed: generateToken(id)

    // Determine cookie options based on environment
    const isProduction = process.env.NODE_ENV !== 'development';

    res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction, // Secure in production
        sameSite: 'lax', // Use Lax for both dev and prod
        domain: isProduction ? '.i-sewa.in' : undefined,
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    await createSession(user._id, token, req);
    // Device already tracked above

    // Audit Log: Login Success
    await logAction(req, 'Login', 'User', user._id, { method: 'password' }, 'Success');

    res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled
    });
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res) => {
    const isProduction = process.env.NODE_ENV !== 'development';

    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0),
    });

    if (req.user) {
        await logAction(req, 'Logout', 'User', req.user._id, {}, 'Success');
    }

    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

const connectDB = require('../config/db');

// @desc    Check if email or phone exists
// @route   POST /api/auth/check-email
// @access  Public
const checkEmail = async (req, res) => {
    console.log("checkEmail: Request received");
    try {
        await connectDB(); // Ensure DB is connected
        // Support 'email' key (legacy) or 'identifier' key
        const { email, identifier } = req.body;
        const queryValue = identifier || email;

        console.log("checkEmail: Identifier extracted:", queryValue);

        if (!queryValue) {
            console.log("checkEmail: No identifier provided");
            return res.status(400).json({ message: 'Email or Phone required' });
        }

        console.log("checkEmail: Querying DB...");
        // Check both email and phoneNumber fields
        const user = await User.findOne({
            $or: [
                { email: queryValue },
                { phoneNumber: queryValue }
            ]
        });
        console.log("checkEmail: DB Query Result:", user ? "Found" : "Not Found");

        if (user) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error('Check Email/Phone Error Stack:', error);
        res.status(500).json({ message: 'Server error checking identifier', error: error.message });
    }
};

const sendEmail = require('../utils/sendEmail');

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        // Audit Log: Forgot Password Request Failure (User not found)
        await logAction(req, 'Forgot Password Request', 'User', null, { identifier: email, error: 'User not found' }, 'Failure');
        return res.status(404).json({ message: 'User not found' });
    }

    // Generate a 4-digit numeric OTP for simplicity (Microsoft style often calls it "code")
    const resetToken = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    const message = `Your password reset code is: ${resetToken}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Request',
            message,
        });

        // Audit Log: Forgot Password Request Success
        await logAction(req, 'Forgot Password Request', 'User', user._id, {}, 'Success');

        res.status(200).json({ message: 'Email sent', mockOtp: process.env.NODE_ENV === 'development' ? resetToken : null });
    } catch (err) {
        console.error(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        // Audit Log: Forgot Password Request Failure (Email Send Error)
        await logAction(req, 'Forgot Password Request', 'User', user._id, { error: err.message }, 'Failure');
        return res.status(500).json({ message: 'Email could not be sent', error: err.message });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
        email,
        resetPasswordToken: otp,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        // Audit Log: Password Reset Failure (Invalid/Expired Code)
        await logAction(req, 'Password Reset', 'User', null, { identifier: email, error: 'Invalid or expired code' }, 'Failure');
        return res.status(400).json({ message: 'Invalid code or expired' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Audit Log: Password Reset Success
    await logAction(req, 'Password Reset', 'User', user._id, {}, 'Success');

    res.status(200).json({ message: 'Password updated successfully' });
};

// Exports moved to bottom

const Verification = require('../models/Verification');

// @desc    Send Registration Verification Code
// @route   POST /api/auth/send-verification
// @access  Public
const sendVerificationCode = async (req, res) => {
    const { email } = req.body;

    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit code

    // Upsert verification record
    await Verification.findOneAndUpdate(
        { email },
        { email, otp, createdAt: Date.now() },
        { upsert: true, new: true }
    );

    const message = `Your Online Saathi verification code is: ${otp}`;

    try {
        await sendEmail({
            email,
            subject: 'Verify your email address',
            message,
        });

        res.json({ message: 'Verification code sent', mockOtp: process.env.NODE_ENV === 'development' ? otp : null });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Email could not be sent', error: err.message });
    }
};

// @desc    Verify Registration Code (Optional check before register)
// @route   POST /api/auth/verify-code
// @access  Public
const verifyVerificationCode = async (req, res) => {
    console.log("verifyVerificationCode: Request body:", req.body);
    let { email, otp } = req.body;

    if (!email || !otp) {
        console.log("verifyVerificationCode: Missing email or otp");
        return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    email = email.trim();
    otp = otp.trim();
    console.log(`verifyVerificationCode: Verifying for ${email} with otp ${otp}`);

    // Check if verification record exists
    const record = await Verification.findOne({ email, otp });

    if (record) {
        res.json({ success: true, message: 'Code verified' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }
};

const googleLogin = async (req, res) => {
    try {
        await connectDB();
        const { uid, email, displayName, photoURL } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required from Google' });
        }

        // 1. Check if user exists by email
        let user = await User.findOne({ email });

        if (!user) {
            // 2. Create new user if they don't exist
            // For Google login, we don't have a password, so we set a random one or keep it empty if allowed
            // Our model likely requires a password, so we'll generate a random string
            const randomPassword = crypto.randomBytes(16).toString('hex');


            user = await User.create({
                username: displayName || email.split('@')[0],
                email,
                password: randomPassword,
                isVerified: true, // Google emails are already verified
                profilePicture: photoURL,
                firebaseUid: uid,
                provider: 'google'
            });
            // Audit Log: Account Created via Google
            await logAction(req, 'Register', 'User', user._id, { method: 'google' }, 'Success');
        } else {
            // Update firebaseUid if not set
            if (!user.firebaseUid) {
                user.firebaseUid = uid;
                await user.save();
            }
        }

        // Check if account is locked
        if (user.isLocked) {
            return res.status(423).json({ message: 'Account locked' });
        }

        const token = generateToken(user._id);
        const isProduction = process.env.NODE_ENV !== 'development';

        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            domain: isProduction ? '.i-sewa.in' : undefined,
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        await createSession(user._id, token, req);
        await logAction(req, 'Login', 'User', user._id, { method: 'google' }, 'Success');

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            isVerified: user.isVerified
        });
    } catch (error) {
        console.error("Google Login Error:", error);
        res.status(500).json({ message: 'Server error during Google login', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    checkEmail,
    forgotPassword,
    resetPassword,
    sendVerificationCode,
    verifyVerificationCode,
    googleLogin,
};


