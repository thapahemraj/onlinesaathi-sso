const mongoose = require('mongoose');

const kycRecordSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Documents submitted for KYC
    documents: [{
        documentType: {
            type: String,
            enum: ['passport', 'national_id', 'driving_license', 'birth_certificate',
                   'income_certificate', 'residence_proof', 'utility_bill', 'bank_statement', 'other'],
            required: true
        },
        documentName: { type: String },
        fileUrl: { type: String, required: true },
        documentNumber: { type: String },
        issuingCountry: { type: String },
        expiryDate: { type: Date }
    }],
    // Personal info snapshot at submission time
    personalInfo: {
        fullName: String,
        dateOfBirth: Date,
        address: String,
        nationality: String
    },
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected'],
        default: 'pending'
    },
    notes: { type: String, default: '' },           // Agent internal notes
    rejectionReason: { type: String, default: '' }, // Shown to user on rejection
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('KYCRecord', kycRecordSchema);
