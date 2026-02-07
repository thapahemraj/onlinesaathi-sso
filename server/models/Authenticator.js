const mongoose = require('mongoose');

const authenticatorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // SQL: Column(String, unique=True)
    credentialID: {
        type: String,
        required: true,
        unique: true
    },
    // SQL: Column(LargeBinary)
    credentialPublicKey: {
        type: Buffer,
        required: true
    },
    // SQL: Column(Integer)
    counter: {
        type: Number,
        required: true
    },
    // SQL: Column(String)
    transports: {
        type: [String],
        default: []
    },
    deviceType: {
        type: String,
        default: 'singleDevice'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUsed: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('Authenticator', authenticatorSchema);
