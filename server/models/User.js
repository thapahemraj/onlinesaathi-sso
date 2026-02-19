const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    phoneNumber: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    firebaseUid: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },
    provider: {
        type: String,
        default: 'local'
    },
    providerId: {
        type: String
    },
    profilePicture: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // Profile fields
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    dateOfBirth: { type: Date, default: null },
    country: { type: String, default: '' },
    language: { type: String, default: 'English (United States)' },
    // Privacy settings
    privacySettings: {
        locationActivity: { type: Boolean, default: true },
        browsingHistory: { type: Boolean, default: true },
        searchHistory: { type: Boolean, default: true },
        appActivity: { type: Boolean, default: true },
        loginNotifications: { type: Boolean, default: true }
    },
    lastLogin: {
        type: Date,
        default: null
    },
    // Two-Factor Authentication
    twoFactorSecret: { type: String, default: null },
    twoFactorEnabled: { type: Boolean, default: false },
    backupCodes: [{ code: String, used: { type: Boolean, default: false } }],
    // Brute force protection
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    // Email change verification
    emailChangeOtp: { type: String, default: null },
    emailChangeTo: { type: String, default: null },
    emailChangeExpires: { type: Date, default: null },
    // Account recovery
    recoveryEmail: { type: String, default: null },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true });

// Virtual: check if account is currently locked
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Increment login attempts and lock after 5 failures
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes

userSchema.methods.incLoginAttempts = async function () {
    // If previous lock has expired, reset
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }
    const updates = { $inc: { loginAttempts: 1 } };
    // Lock the account if we've reached max attempts
    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + LOCK_TIME };
    }
    return this.updateOne(updates);
};

// Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = function () {
    return this.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 }
    });
};

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
