const express = require('express');
const router = express.Router();
const { getWallet, getTransactions, topUpWallet } = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getWallet);
router.get('/transactions', getTransactions);
router.post('/topup', topUpWallet);

module.exports = router;
