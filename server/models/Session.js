const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    token: {
        type: String,
        required: true
    },
    deviceInfo: {
        deviceName: { type: String, default: 'Unknown Device' },
        deviceType: { type: String, default: 'desktop' },
        os: { type: String, default: 'Unknown' },
        browser: { type: String, default: 'Unknown' }
    },
    ipAddress: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: 'Unknown'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

// Index for auto-cleanup of expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Session', sessionSchema);
