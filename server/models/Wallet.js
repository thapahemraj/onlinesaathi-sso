const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR',
        uppercase: true
    },
    status: {
        type: String,
        enum: ['active', 'frozen'],
        default: 'active'
    },
    lowBalanceThreshold: {
        type: Number,
        default: 100
    }
}, { timestamps: true });

// Ensure balance doesn't go negative during debit
walletSchema.methods.canAfford = function (amount) {
    return this.balance >= amount;
};

module.exports = mongoose.model('Wallet', walletSchema);
