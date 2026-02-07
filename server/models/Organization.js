const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add an organization name'],
        trim: true
    },
    slug: {
        type: String,
        required: [true, 'Please add a slug'],
        unique: true,
        trim: true,
        lowercase: true
    },
    domain: {
        type: String,
        trim: true,
        lowercase: true,
        help: 'Verified domain for auto-discovery'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    branding: {
        logoUrl: String,
        primaryColor: {
            type: String,
            default: '#ffffffff' 
        }
    },
    settings: {
        enforceMfa: {
            type: Boolean,
            default: false
        },
        restrictSignupToDomain: {
            type: Boolean,
            default: false
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Prevent duplicate slugs
organizationSchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model('Organization', organizationSchema);
