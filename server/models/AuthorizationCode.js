const mongoose = require('mongoose');

const authorizationCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    clientId: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    redirectUri: {
        type: String,
        required: true
    },
    scope: {
        type: String,
        default: 'openid profile email'
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => Date.now() + 10 * 60 * 1000 // 10 minutes
    }
});

// Auto-expire documents
authorizationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('AuthorizationCode', authorizationCodeSchema);
