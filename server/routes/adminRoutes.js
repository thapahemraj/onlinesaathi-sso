const express = require('express');
const router = express.Router();
const { protect, isSupportPlus, isSubAdmin, isSuperAdmin, requireMinRole } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/adminController');

// All routes require authentication + at least supportTeam level
router.use(protect);
router.use(isSupportPlus);

router.get('/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/lookup', lookupUser);             // Support team can use this
router.get('/users/by-role', isSubAdmin, getUsersByRole);
router.route('/users/:id')
    .delete(isSubAdmin, deleteUser)
    .put(isSubAdmin, updateUser);
router.put('/users/:id/role', isSubAdmin, assignRole); // subAdmin and above

// Transaction management (Approvals)
router.get('/transactions/pending', isSubAdmin, getPendingTransactions);
router.put('/transactions/:id/approve', isSubAdmin, approveTransaction);
router.put('/transactions/:id/reject', isSubAdmin, rejectTransaction);

module.exports = router;
