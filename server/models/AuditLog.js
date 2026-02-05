const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    resource: {
        type: String, // e.g., 'User', 'Application', 'Organization'
        required: true
    },
    resourceId: {
        type: String
    },
    details: {
        type: Object
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    status: {
        type: String,
        enum: ['Success', 'Failure'],
        default: 'Success'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 30 * 6 // Auto-delete after 6 months
    }
}, { timestamps: true });

// Index for searching
auditLogSchema.index({ user: 1, action: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
