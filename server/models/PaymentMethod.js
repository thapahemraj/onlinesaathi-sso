const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['card', 'upi', 'wallet'],
        required: true
    },
    label: {
        type: String,
        required: true // e.g. "Visa ending in 4242", "UPI - user@paytm"
    },
    last4: {
        type: String,
        default: '' // Last 4 digits for cards
    },
    cardBrand: {
        type: String,
        default: '' // Visa, Mastercard, etc.
    },
    expiryMonth: {
        type: Number,
        default: null
    },
    expiryYear: {
        type: Number,
        default: null
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
