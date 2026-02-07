const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { username, email, password, phoneNumber, firebaseUid } = req.body;

    // Check for existing user by email, username, or phone
    const query = [
        { email },
        { username }
    ];
    if (phoneNumber) query.push({ phoneNumber });

    const userExists = await User.findOne({ $or: query });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
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
            sameSite: isProduction ? 'lax' : 'strict', // Lax allows subdomains if domain is set
            domain: isProduction ? '.i-sewa.in' : undefined, // Share across subdomains (.i-sewa.in)
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
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    // Allow 'email' to serve as a generic identifier (email or phone)
    const { email, password } = req.body;

    // Find user by email OR phoneNumber
    const user = await User.findOne({
        $or: [
            { email: email },
            { phoneNumber: email }
        ]
    });

    if (user && (await user.matchPassword(password))) {
        const token = generateToken(user._id);

        const isProduction = process.env.NODE_ENV !== 'development';

        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'lax' : 'strict',
            domain: isProduction ? '.i-sewa.in' : undefined,
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
    const isProduction = process.env.NODE_ENV !== 'development';

    res.cookie('token', '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'lax' : 'strict',
        domain: isProduction ? '.i-sewa.in' : undefined,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out' });
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

// @desc    Check if email or phone exists
// @route   POST /api/auth/check-email
// @access  Public
const checkEmail = async (req, res) => {
    console.log("checkEmail: Request received");
    try {
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
            subject: 'Your Online Saathi account password reset code',
            message,
        });

        res.json({ message: 'Email sent', mockOtp: process.env.NODE_ENV === 'development' ? resetToken : null });
    } catch (err) {
        console.error(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        return res.status(500).json({ message: 'Email could not be sent' });
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
        return res.status(400).json({ message: 'Invalid code or expired' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: 'Password updated successfully' });
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
        return res.status(500).json({ message: 'Email could not be sent' });
    }
};

// @desc    Verify Registration Code (Optional check before register)
// @route   POST /api/auth/verify-code
// @access  Public
const verifyVerificationCode = async (req, res) => {
    const { email, otp } = req.body;

    // Check if verification record exists
    const record = await Verification.findOne({ email, otp });

    if (record) {
        res.json({ success: true, message: 'Code verified' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid or expired code' });
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
};

