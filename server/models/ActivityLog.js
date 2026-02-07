const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        uppercase: true,
        index: true
    },
    target: {
        type: String,
        required: false
    },
    details: {
        ip: String,
        userAgent: String,
        device: String,
        browser: String,
        os: String,
        metadata: mongoose.Schema.Types.Mixed
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILURE', 'WARNING'],
        default: 'SUCCESS'
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Index for efficient querying of a user's history
activityLogSchema.index({ actor: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
