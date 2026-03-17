const express = require('express');
const router = express.Router();
const { getWallet, getTransactions, topUpWallet } = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

/**
 * @swagger
 * /account:
 *   get:
 *     summary: Get user account balance details
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account details retrieved successfully
 *       404:
 *         description: Account not found
 */
router.get('/', getWallet);

/**
 * @swagger
 * /account/transactions:
 *   get:
 *     summary: Get user account transaction history
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
 */
router.get('/transactions', getTransactions);

/**
 * @swagger
 * /account/topup:
 *   post:
 *     summary: Initiate an account top-up request
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - bankVoucherNumber
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to top-up
 *               bankVoucherNumber:
 *                 type: string
 *                 description: Bank voucher or transaction number
 *               referenceId:
 *                 type: string
 *                 description: Unique reference ID for the transaction
 *               screenshotUrl:
 *                 type: string
 *                 description: Optional URL to proof of payment screenshot
 *               description:
 *                 type: string
 *                 description: Optional description
 *     responses:
 *       200:
 *         description: Top-up request submitted successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/topup', topUpWallet);

module.exports = router;
