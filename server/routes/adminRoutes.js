const express = require('express');
const router = express.Router();
const { protect, isSupportPlus, isSubAdmin, isSuperAdmin, requireMinRole } = require('../middleware/authMiddleware');
const {
    getDashboardStats,
    getAllUsers,
    createUser,
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
router.post('/users', createUser);
router.get('/users/lookup', lookupUser);             // Support team can use this
router.get('/users/by-role', isSubAdmin, getUsersByRole);
router.route('/users/:id')
    .delete(isSubAdmin, deleteUser)
    .put(isSubAdmin, updateUser);
router.put('/users/:id/role', isSubAdmin, assignRole); // subAdmin and above

// Transaction management (Approvals)
/**
 * @swagger
 * /admin/transactions/pending:
 *   get:
 *     summary: Get all pending top-up transactions
 *     tags: [Admin / Wallet]
 *     responses:
 *       200:
 *         description: List of pending transactions retrieved successfully
 */
router.get('/transactions/pending', isSubAdmin, getPendingTransactions);
/**
 * @swagger
 * /admin/transactions/{id}/approve:
 *   put:
 *     summary: Approve a pending top-up transaction
 *     tags: [Admin / Wallet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction approved successfully
 */
router.put('/transactions/:id/approve', isSubAdmin, approveTransaction);
/**
 * @swagger
 * /admin/transactions/{id}/reject:
 *   put:
 *     summary: Reject a pending top-up transaction
 *     tags: [Admin / Wallet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *     responses:
 *       200:
 *         description: Transaction rejected successfully
 */
router.put('/transactions/:id/reject', isSubAdmin, rejectTransaction);

module.exports = router;
