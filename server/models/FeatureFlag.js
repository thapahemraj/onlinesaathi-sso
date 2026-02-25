const mongoose = require('mongoose');

const featureFlagSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    isEnabled: {
        type: Boolean,
        default: false
    },
    scope: {
        type: String,
        enum: ['global', 'organization'],
        default: 'global'
    },
    // If scope is organization, this flag only applies to specific IDs or tiers
    conditions: {
        plans: [String], // e.g. ['premium', 'enterprise']
        allowedOrganizations: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization'
        }]
    }
}, { timestamps: true });

module.exports = mongoose.model('FeatureFlag', featureFlagSchema);
