const User = require('../models/User');
const KYCRecord = require('../models/KYCRecord');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const { ROLE_LEVELS } = require('../middleware/authMiddleware');
const { logAction } = require('./auditController');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
        const newUsersToday = await User.countDocuments({ createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } });

        // Role breakdown
        const roleBreakdown = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        // KYC stats
        const pendingKYC = await KYCRecord.countDocuments({ status: 'pending' });
        const approvedKYC = await KYCRecord.countDocuments({ status: 'approved' });

        const stats = {
            totalUsers,
            activeUsers,
            newUsersToday,
            totalApps: 12,
            securityAlerts: 0,
            pendingKYC,
            approvedKYC,
            roleBreakdown: roleBreakdown.reduce((acc, r) => { acc[r._id] = r.count; return acc; }, {})
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update user (promote/demote)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.role = req.body.role || user.role;
            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Assign / change a user's role (with hierarchy enforcement)
// @route   PUT /api/admin/users/:id/role
// @access  Private (subAdmin can assign up to agent; superAdmin can assign anything)
const assignRole = async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ['user', 'member', 'saathi', 'agent', 'supportTeam', 'subAdmin', 'superAdmin'];

        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified.' });
        }

        const targetUser = await User.findById(req.params.id);
        if (!targetUser) return res.status(404).json({ message: 'User not found.' });

        const requesterLevel = ROLE_LEVELS[req.user.role] || 0;
        const targetCurrentLevel = ROLE_LEVELS[targetUser.role] || 0;
        const targetNewLevel = ROLE_LEVELS[role] || 0;

        // Cannot modify a superAdmin unless you are superAdmin
        if ((targetUser.role === 'superAdmin' || targetUser.role === 'admin') && !['superAdmin', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Cannot modify a Super Admin.' });
        }
        // Cannot assign a role equal to or above your own (except superAdmin can do anything)
        if (!['superAdmin', 'admin'].includes(req.user.role) && targetNewLevel >= requesterLevel) {
            return res.status(403).json({ message: 'Cannot assign a role at or above your own level.' });
        }
        // subAdmin cannot manage other subAdmins
        if (req.user.role === 'subAdmin' && targetCurrentLevel >= ROLE_LEVELS['subAdmin']) {
            return res.status(403).json({ message: 'Sub Admin cannot manage Sub Admin or higher roles.' });
        }

        targetUser.role = role;
        await targetUser.save();

        await logAction(req, 'Assign Role', 'User', targetUser._id, { newRole: role }, 'Success');

        res.json({
            message: `Role updated to "${role}".`,
            user: { _id: targetUser._id, username: targetUser.username, email: targetUser.email, role: targetUser.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get users filtered by role
// @route   GET /api/admin/users/by-role?role=agent
// @access  Private (subAdmin, superAdmin)
const getUsersByRole = async (req, res) => {
    try {
        const { role, page = 1, limit = 50 } = req.query;
        const filter = role && role !== 'all' ? { role } : {};
        const users = await User.find(filter)
            .select('-password -twoFactorSecret -backupCodes')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const total = await User.countDocuments(filter);
        res.json({ users, total });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Support team: look up a user by email/username/phone
// @route   GET /api/admin/users/lookup?q=searchterm
// @access  Private (supportTeam and above)
const lookupUser = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: 'Search query required.' });

        const users = await User.find({
            $or: [
                { username: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
                { phoneNumber: { $regex: q, $options: 'i' } }
            ]
        }).select('-password -twoFactorSecret -backupCodes -resetPasswordToken').limit(10);

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all pending transactions for approval
// @route   GET /api/admin/transactions/pending
// @access  Private/Admin
const getPendingTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ status: 'pending', type: 'credit', category: 'topup' })
            .populate('organization', 'name')
            .sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Approve a pending top-up transaction
// @route   PUT /api/admin/transactions/:id/approve
// @access  Private/Admin
const approveTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        if (transaction.status !== 'pending') return res.status(400).json({ message: 'Transaction is already processed' });

        const wallet = await Wallet.findById(transaction.wallet);
        if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

        // Update status and credit balance
        transaction.status = 'completed';
        wallet.balance += transaction.amount;

        await transaction.save();
        await wallet.save();

        await logAction(req, 'Approve Top-up', 'Transaction', transaction._id, { amount: transaction.amount }, 'Success');

        res.json({ message: 'Transaction approved and wallet credited', transaction });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Reject a pending top-up transaction
// @route   PUT /api/admin/transactions/:id/reject
// @access  Private/Admin
const rejectTransaction = async (req, res) => {
    try {
        const { reason } = req.body;
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        if (transaction.status !== 'pending') return res.status(400).json({ message: 'Transaction is already processed' });

        transaction.status = 'rejected';
        transaction.description = `${transaction.description} (Rejected: ${reason || 'No reason provided'})`;

        await transaction.save();

        await logAction(req, 'Reject Top-up', 'Transaction', transaction._id, { reason }, 'Success');

        res.json({ message: 'Transaction rejected', transaction });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    deleteUser,
    updateUser,
    assignRole,
    getUsersByRole,
    lookupUser,
    getPendingTransactions,
    approveTransaction,
    rejectTransaction
};
