const mongoose = require('mongoose');

const COMMISSION_TYPES = ['flat', 'percent'];

const roleServiceRuleSchema = new mongoose.Schema({
    key: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
    commission: {
        type: {
            type: String,
            enum: COMMISSION_TYPES,
            default: 'percent'
        },
        value: { type: Number, default: 0, min: 0 },
        minAmount: { type: Number, default: 0, min: 0 },
        maxAmount: { type: Number, default: null, min: 0 }
    }
}, { _id: false });

const roleServiceConfigSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        unique: true,
        enum: ['user', 'member', 'saathi', 'agent', 'supportTeam', 'subAdmin', 'superAdmin', 'admin']
    },
    services: {
        type: [roleServiceRuleSchema],
        default: []
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('RoleServiceConfig', roleServiceConfigSchema);
