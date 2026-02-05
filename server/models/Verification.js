const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true // One valid OTP per email at a time
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Expires in 10 minutes (600 seconds)
    }
});

module.exports = mongoose.model('Verification', verificationSchema);
