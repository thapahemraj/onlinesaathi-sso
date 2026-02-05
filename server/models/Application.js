const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    clientId: {
        type: String,
        required: true,
        unique: true
    },
    clientSecret: {
        type: String, // In a real app, this should be hashed. Storing plain for "view once" demo simplicity or we can hash it and never show again.
        // Let's store it plaintext for this demo to allow "Show Secret" functionality easily without complex key management.
        // In PROD, store hash and only show once at creation.
        required: true
    },
    redirectUris: [{
        type: String
    }],
    homepageUrl: {
        type: String
    },
    description: {
        type: String
    },
    logoUrl: {
        type: String
    },
    isEnabled: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
