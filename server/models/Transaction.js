const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['topup', 'usage', 'subscription', 'refund', 'other', 'voice-ai', 'analytics'],
        default: 'other'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    metadata: {
        type: Object,
        default: {}
    },
    referenceId: {
        type: String, // External payment ref or System internal ID
        unique: true,
        sparse: true
    }
}, { timestamps: true });

// Index for fast reporting
transactionSchema.index({ organization: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
