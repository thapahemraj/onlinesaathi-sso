const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deviceName: {
        type: String,
        required: true
    },
    deviceType: {
        type: String, // 'desktop', 'mobile', 'tablet'
        default: 'unknown'
    },
    platform: {
        type: String, // 'Windows', 'macOS', 'iOS', 'Android'
        default: 'unknown'
    },
    browser: {
        type: String,
        default: 'unknown'
    },
    ipAddress: {
        type: String,
        required: false
    },
    location: {
        type: String, // 'City, Country' - approximated from IP
        default: 'Unknown'
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    isCurrent: {
        type: Boolean,
        default: false // Helper for frontend, usually derived dynamically
    },
    trusted: {
        type: Boolean,
        default: true // Default to true for now, can be toggleable
    },
    userAgent: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Index for quick lookups by user
deviceSchema.index({ user: 1, lastActive: -1 });

module.exports = mongoose.model('Device', deviceSchema);
