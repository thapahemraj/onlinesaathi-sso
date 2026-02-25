const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Organization = require('../models/Organization');

// @desc    Get organization wallet
// @route   GET /api/wallet
// @access  Private
const getWallet = async (req, res) => {
    try {
        // Assuming the user is linked to an organization. 
        // For now, if the user doesn't have an organization, we'll return an error or find the one they own.
        const org = await Organization.findOne({ owner: req.user._id });
        if (!org) return res.status(404).json({ message: 'Organization not found' });

        let wallet = await Wallet.findOne({ organization: org._id });

        // Auto-create wallet if missing (fail-safe)
        if (!wallet) {
            wallet = await Wallet.create({ organization: org._id });
        }

        res.json(wallet);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get transaction history
// @route   GET /api/wallet/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const org = await Organization.findOne({ owner: req.user._id });
        if (!org) return res.status(404).json({ message: 'Organization not found' });

        const transactions = await Transaction.find({ organization: org._id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Top up wallet (Mock implementation for now)
// @route   POST /api/wallet/topup
// @access  Private
const topUpWallet = async (req, res) => {
    try {
        const { amount, description } = req.body;
        const org = await Organization.findOne({ owner: req.user._id });
        if (!org) return res.status(404).json({ message: 'Organization not found' });

        const wallet = await Wallet.findOne({ organization: org._id });
        if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

        wallet.balance += Number(amount);
        await wallet.save();

        await Transaction.create({
            wallet: wallet._id,
            organization: org._id,
            type: 'credit',
            amount,
            description: description || 'Balance Top-up',
            category: 'topup'
        });

        res.json({ message: 'Top-up successful', balance: wallet.balance });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getWallet,
    getTransactions,
    topUpWallet
};
