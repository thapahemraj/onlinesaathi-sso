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
        required: false // Optional if using OAuth or Phone Auth
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
    lastLogin: {
        type: Date,
        default: null
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true });

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
