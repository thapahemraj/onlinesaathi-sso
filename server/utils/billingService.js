const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

/**
 * Deduct credits from an organization's wallet
 * @param {string} organizationId - The ID of the organization
 * @param {number} amount - Amount to deduct
 * @param {string} description - Description for the transaction
 * @param {string} category - Category (e.g., 'voice-ai', 'analytics')
 */
const deductCredits = async (organizationId, amount, description, category = 'usage') => {
    const session = await Wallet.startSession();
    session.startTransaction();

    try {
        const wallet = await Wallet.findOne({ organization: organizationId }).session(session);

        if (!wallet) {
            throw new Error('Wallet not found for this organization');
        }

        if (wallet.balance < amount) {
            throw new Error('Insufficient balance');
        }

        // Deduct balance
        wallet.balance -= amount;
        await wallet.save({ session });

        // Record transaction
        await Transaction.create([{
            wallet: wallet._id,
            organization: organizationId,
            type: 'debit',
            amount: amount,
            description: description,
            category: category,
            status: 'completed'
        }], { session });

        await session.commitTransaction();
        session.endSession();

        return { success: true, remainingBalance: wallet.balance };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(`[Billing] Deduction failed:`, error.message);
        throw error;
    }
};

module.exports = { deductCredits };
