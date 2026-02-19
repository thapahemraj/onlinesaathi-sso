const PaymentMethod = require('../models/PaymentMethod');

// @desc    Get all payment methods for user
// @route   GET /api/profile/payments
// @access  Private
const getPaymentMethods = async (req, res) => {
    try {
        const methods = await PaymentMethod.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
        res.json(methods);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add a payment method
// @route   POST /api/profile/payments
// @access  Private
const addPaymentMethod = async (req, res) => {
    try {
        const { type, label, last4, cardBrand, expiryMonth, expiryYear, isDefault } = req.body;

        if (isDefault) {
            await PaymentMethod.updateMany({ user: req.user._id }, { isDefault: false });
        }

        const method = await PaymentMethod.create({
            user: req.user._id,
            type, label, last4, cardBrand, expiryMonth, expiryYear, isDefault
        });

        res.status(201).json(method);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a payment method
// @route   DELETE /api/profile/payments/:id
// @access  Private
const deletePaymentMethod = async (req, res) => {
    try {
        const method = await PaymentMethod.findOne({ _id: req.params.id, user: req.user._id });
        if (!method) return res.status(404).json({ message: 'Payment method not found' });

        await method.deleteOne();
        res.json({ message: 'Payment method removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Set a payment method as default
// @route   PUT /api/profile/payments/:id/default
// @access  Private
const setDefaultPayment = async (req, res) => {
    try {
        await PaymentMethod.updateMany({ user: req.user._id }, { isDefault: false });

        const method = await PaymentMethod.findOne({ _id: req.params.id, user: req.user._id });
        if (!method) return res.status(404).json({ message: 'Payment method not found' });

        method.isDefault = true;
        await method.save();
        res.json(method);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getPaymentMethods, addPaymentMethod, deletePaymentMethod, setDefaultPayment };
