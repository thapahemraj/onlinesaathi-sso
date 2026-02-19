const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deviceName: {
        type: String,
        required: true // e.g. "Chrome on Windows"
    },
    deviceType: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet'],
        default: 'desktop'
    },
    os: {
        type: String,
        default: '' // Windows 11, iOS 17, Android 14
    },
    browser: {
        type: String,
        default: '' // Chrome, Firefox, Safari
    },
    ip: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: '' // City, Country
    },
    fingerprint: {
        type: String,
        default: '' // Unique hash from UA + IP for duplicate detection
    },
    isTrusted: {
        type: Boolean,
        default: false
    },
    trustedAt: {
        type: Date
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
