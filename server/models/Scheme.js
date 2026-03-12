const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
        type: String,
        enum: ['health', 'education', 'finance', 'housing', 'agriculture', 'employment', 'social_security', 'other'],
        default: 'other'
    },
    // Criteria used to determine eligibility
    eligibilityCriteria: {
        minAge: { type: Number, default: null },
        maxAge: { type: Number, default: null },
        // If empty array, open to all countries
        countries: [{ type: String }],
        gender: { type: String, enum: ['any', 'male', 'female'], default: 'any' },
        maxAnnualIncome: { type: Number, default: null }, // in NPR; null = no restriction
        // Document types required to be uploaded & verified
        requiredDocuments: [{ type: String }],
        otherCriteria: { type: String, default: '' }
    },
    benefits: { type: String, default: '' },         // What user gets
    howToApply: { type: String, default: '' },
    applicationUrl: { type: String, default: '' },
    applicationDeadline: { type: Date, default: null },
    imageUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Scheme', schemeSchema);
