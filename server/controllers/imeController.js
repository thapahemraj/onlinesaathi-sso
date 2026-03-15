const axios = require('axios');

// ─── IME Forex API Config ─────────────────────────────────────────────────────
const IME_BASE_URL  = process.env.IME_API_BASE_URL  || 'https://imerex.imepay.com.np';
const IME_USERNAME  = process.env.IME_API_USERNAME  || '';
const IME_PASSWORD  = process.env.IME_API_PASSWORD  || '';
const IME_TOKEN_URL = process.env.IME_TOKEN_URL     || `${IME_BASE_URL}/token`;

// ─── Token Cache (in-process; reuse until near expiry) ────────────────────────
let cachedToken      = null;
let tokenExpiresAt   = 0;

const getAccessToken = async () => {
    if (cachedToken && Date.now() < tokenExpiresAt - 60_000) return cachedToken;

    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username',   IME_USERNAME);
    params.append('password',   IME_PASSWORD);

    const { data } = await axios.post(IME_TOKEN_URL, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15_000,
    });

    cachedToken    = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1_000;
    return cachedToken;
};

const imeGet  = async (path, params = {}) => {
    const token = await getAccessToken();
    const { data } = await axios.get(`${IME_BASE_URL}${path}`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15_000,
    });
    return data;
};

const imePost = async (path, body = {}) => {
    const token = await getAccessToken();
    const { data } = await axios.post(`${IME_BASE_URL}${path}`, body, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        timeout: 15_000,
    });
    return data;
};

// ─── Respond helpers ─────────────────────────────────────────────────────────
const ok  = (res, data)        => res.json({ success: true, data });
const err = (res, e, fallback) => {
    console.error(`[IME] ${fallback}:`, e?.response?.data || e.message);
    res.status(e?.response?.status || 500).json({
        success: false,
        message: e?.response?.data?.Message || e.message || fallback,
    });
};

// ─── 1. Search / validate customer ───────────────────────────────────────────
const searchCustomer = async (req, res) => {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ success: false, message: 'mobile required' });
    try {
        const data = await imePost('/api/Remittance/CustomerValidation', {
            txnMobileNo: mobile,
        });
        ok(res, data);
    } catch (e) { err(res, e, 'Customer search failed'); }
};

// ─── 2. Get receivers for a customer ─────────────────────────────────────────
const getReceivers = async (req, res) => {
    const { mobile } = req.params;
    try {
        const data = await imeGet('/api/Remittance/GetBeneficiary', { txnMobileNo: mobile });
        ok(res, data);
    } catch (e) { err(res, e, 'Get receivers failed'); }
};

// ─── 3. Add receiver ─────────────────────────────────────────────────────────
const addReceiver = async (req, res) => {
    const {
        txnMobileNo, receiverName, receiverMobile, gender, relationship,
        country, municipalityId, paymentType,
        bankId, bankBranchId, accountNumber, purposeId,
    } = req.body;
    try {
        const data = await imePost('/api/Remittance/AddBeneficiary', {
            txnMobileNo, receiverName, receiverMobile, gender, relationship,
            country, municipalityId, paymentType,
            bankId, bankBranchId, accountNumber, purposeId,
        });
        ok(res, data);
    } catch (e) { err(res, e, 'Add receiver failed'); }
};

// ─── 4. Update receiver ───────────────────────────────────────────────────────
const updateReceiver = async (req, res) => {
    const { id } = req.params;
    try {
        const data = await imePost('/api/Remittance/UpdateBeneficiary', { ...req.body, beneficiaryId: id });
        ok(res, data);
    } catch (e) { err(res, e, 'Update receiver failed'); }
};

// ─── 5. Send money ────────────────────────────────────────────────────────────
const sendMoney = async (req, res) => {
    const {
        txnMobileNo, beneficiaryId, amount, collectAmount, payoutAmount,
        purposeId, remarks,
    } = req.body;
    try {
        const data = await imePost('/api/Remittance/SendMoney', {
            txnMobileNo, beneficiaryId, amount, collectAmount, payoutAmount,
            purposeId, remarks,
        });
        ok(res, data);
    } catch (e) { err(res, e, 'Send money failed'); }
};

// ─── 6. Get bank list ─────────────────────────────────────────────────────────
const getBanks = async (req, res) => {
    try {
        const data = await imeGet('/api/Remittance/GetBank');
        ok(res, data);
    } catch (e) { err(res, e, 'Get banks failed'); }
};

// ─── 7. Get bank branches ─────────────────────────────────────────────────────
const getBankBranches = async (req, res) => {
    const { bankId } = req.params;
    try {
        const data = await imeGet('/api/Remittance/GetBankBranch', { BankID: bankId });
        ok(res, data);
    } catch (e) { err(res, e, 'Get bank branches failed'); }
};

// ─── 8. Get districts ─────────────────────────────────────────────────────────
const getDistricts = async (req, res) => {
    try {
        const data = await imeGet('/api/Remittance/GetDistrict');
        ok(res, data);
    } catch (e) { err(res, e, 'Get districts failed'); }
};

// ─── 9. Get municipalities ────────────────────────────────────────────────────
const getMunicipalities = async (req, res) => {
    const { districtId } = req.params;
    try {
        const data = await imeGet('/api/Common/GetMunicipality', { DistrictID: districtId });
        ok(res, data);
    } catch (e) { err(res, e, 'Get municipalities failed'); }
};

// ─── 10. Get exchange rate ────────────────────────────────────────────────────
const getExchangeRate = async (req, res) => {
    try {
        const data = await imeGet('/api/Remittance/GetExchangeRate');
        ok(res, data);
    } catch (e) { err(res, e, 'Get exchange rate failed'); }
};

module.exports = {
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
};
