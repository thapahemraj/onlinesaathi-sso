const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Organization = require('../models/Organization');

// Helper to find or create organization and wallet for a user
const getOrCreateUserContext = async (userId, username) => {
    let org = await Organization.findOne({ owner: userId });
    
    if (!org) {
        // Create a default personal organization for the user
        const slug = `${username.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
        org = await Organization.create({
            name: `${username}'s Workspace`,
            slug,
            owner: userId
        });
    }

    let wallet = await Wallet.findOne({ organization: org._id });
    if (!wallet) {
        wallet = await Wallet.create({ organization: org._id });
    }

    return { org, wallet };
};

// @desc    Get organization wallet
// @route   GET /api/wallet
// @access  Private
const getWallet = async (req, res) => {
    try {
        const { org, wallet } = await getOrCreateUserContext(req.user._id, req.user.username);

        // Calculate pending top-ups
        const pendingTransactions = await Transaction.find({
            organization: org._id,
            type: 'credit',
            status: 'pending',
            category: 'topup'
        });
        const pendingTopup = pendingTransactions.reduce((acc, curr) => acc + curr.amount, 0);

        res.json({
            ...wallet.toObject(),
            pendingTopup
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get transaction history
// @route   GET /api/wallet/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const { org } = await getOrCreateUserContext(req.user._id, req.user.username);

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
        const { amount, description, referenceId, bankVoucherNumber, screenshotUrl } = req.body;
        const { org, wallet } = await getOrCreateUserContext(req.user._id, req.user.username);

        // Create a PENDING transaction instead of immediate credit
        const transaction = await Transaction.create({
            wallet: wallet._id,
            organization: org._id,
            type: 'credit',
            amount,
            description: description || 'Balance Top-up Request',
            category: 'topup',
            status: 'pending',
            referenceId: referenceId || `TOPUP-${Date.now()}`,
            metadata: {
                bankVoucherNumber,
                screenshotUrl
            }
        });

        res.json({ 
            message: 'Top-up request submitted. Pending admin verification.', 
            transactionId: transaction._id,
            status: 'pending'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getWallet,
    getTransactions,
    topUpWallet
};
