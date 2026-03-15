const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    searchCustomer,
    getReceivers,
    addReceiver,
    updateReceiver,
    sendMoney,
    getBanks,
    getBankBranches,
    getDistricts,
    getMunicipalities,
    getExchangeRate,
} = require('../controllers/imeController');

// All IME routes require authentication
router.use(protect);

router.post('/search-customer',          searchCustomer);
router.get('/receivers/:mobile',         getReceivers);
router.post('/receivers',                addReceiver);
router.put('/receivers/:id',             updateReceiver);
router.post('/send-money',               sendMoney);
router.get('/banks',                     getBanks);
router.get('/banks/:bankId/branches',    getBankBranches);
router.get('/districts',                 getDistricts);
router.get('/districts/:districtId/municipalities', getMunicipalities);
router.get('/exchange-rate',             getExchangeRate);

module.exports = router;
