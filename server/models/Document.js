const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    documentType: {
        type: String,
        enum: [
            'passport', 'national_id', 'driving_license', 'birth_certificate',
            'income_certificate', 'residence_proof', 'utility_bill', 'bank_statement', 'other'
        ],
        required: true
    },
    documentName: { type: String, required: true },   // Display name e.g. "Passport - John"
    fileUrl: { type: String, required: true },         // Relative server path
    fileName: { type: String },                        // Original filename
    fileSize: { type: Number },                        // Bytes
    mimeType: { type: String },
    expiryDate: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    verifiedAt: { type: Date, default: null },
    // Link to a KYC record if this doc was used in a KYC submission
    kycRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'KYCRecord', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
