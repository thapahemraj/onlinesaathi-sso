const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    clientId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    clientSecret: {
        type: String,
        required: true
    },
    redirectUris: [{
        type: String,
        required: true
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String
    },
    website: {
        type: String
    },
    homepageUrl: {
        type: String
    },
    logoUrl: {
        type: String
    },
    isEnabled: {
        type: Boolean,
        default: true
    },
    allowedScopes: {
        type: [String],
        default: ['openid', 'profile', 'email']
    },
    grantTypes: {
        type: [String],
        default: ['authorization_code']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Application', applicationSchema);

