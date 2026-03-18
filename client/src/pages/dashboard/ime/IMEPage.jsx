import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Home, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const api = axios.create({ baseURL: '/api', withCredentials: true });

const inputClass = 'w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-[#2a2a2a] dark:text-white';

const Section = ({ title, children }) => (
    <section className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white">{title}</h2>
        {children}
    </section>
);

const LabeledInput = ({ label, required, ...props }) => (
    <div className="space-y-1">
        <label className="text-xs text-gray-600 dark:text-gray-300">
            {label}{required ? <span className="text-red-500"> *</span> : null}
        </label>
        <input {...props} className={inputClass} />
    </div>
);

const LabeledSelect = ({ label, required, options, value, onChange }) => (
    <div className="space-y-1">
        <label className="text-xs text-gray-600 dark:text-gray-300">
            {label}{required ? <span className="text-red-500"> *</span> : null}
        </label>
        <select value={value} onChange={onChange} className={inputClass}>
            <option value="">Select</option>
            {options.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.value}</option>
            ))}
        </select>
    </div>
);

const toDataList = (res) => {
    const list = res?.data?.data?.DataList?.Data || [];
    if (Array.isArray(list)) return list.map((item) => ({ id: String(item?.Id || ''), value: String(item?.Value || '') }));
    if (list?.Id || list?.Value) return [{ id: String(list?.Id || ''), value: String(list?.Value || '') }];
    return [];
};

const toNestedValue = (payload, keys = []) => {
    for (const key of keys) {
        if (payload?.[key] !== undefined && payload?.[key] !== null) return payload[key];
    }
    return '';
};

const pretty = (value) => {
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value || '');
    }
};

const fileToBase64 = (file) => new Promise((resolve, reject) => {
    if (!file) {
        resolve('');
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        const result = reader.result || '';
        const base = String(result).includes(',') ? String(result).split(',')[1] : String(result);
        resolve(base);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

const IMEPage = () => {
    const navigate = useNavigate();

    const [loadingKey, setLoadingKey] = useState('');
    const [latestResponse, setLatestResponse] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const [step, setStep] = useState(1);
    const [showConfirmOtpModal, setShowConfirmOtpModal] = useState(false);
    const [confirmOtp, setConfirmOtp] = useState('');
    const [confirmSendRefNo, setConfirmSendRefNo] = useState('');
    const [confirmSendOtpToken, setConfirmSendOtpToken] = useState('');

    const [checkMobile, setCheckMobile] = useState('');
    const [customerCheck, setCustomerCheck] = useState(null);
    const [customerToken, setCustomerToken] = useState('');
    const [customerOtpToken, setCustomerOtpToken] = useState('');
    const [customerVerified, setCustomerVerified] = useState(false);
    const [receiverCreated, setReceiverCreated] = useState(false);

    const [lookups, setLookups] = useState({
        countries: [],
        genders: [],
        marital: [],
        occupations: [],
        sources: [],
        idTypes: [],
        purpose: [],
        relationship: [],
        banks: [],
        nepStates: [],
        indiaStates: [],
        permDistricts: [],
        tempDistricts: [],
        permMunicipalities: [],
        bankBranches: [],
        receiverDistricts: [],
        receiverMunicipalities: [],
    });

    const [receiverForm, setReceiverForm] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        gender: '',
        relationship: '',
        mobileNo: '',
        country: 'NPL',
        state: '',
        district: '',
        municipality: '',
        paymentType: 'C',
        bankId: '',
        bankBranchId: '',
        accountNo: '',
        purposeOfRemittance: '',
    });

    const [customerForm, setCustomerForm] = useState({
        mobileNo: '',
        membershipId: '',
        firstName: '',
        middleName: '',
        lastName: '',
        nationality: 'NPL',
        maritalStatus: '',
        dob: '',
        gender: '',
        fatherOrMotherName: '',
        email: '',
        occupation: '',
        sourceOfFund: '',
        temporaryAddress_State: '',
        temporaryAddress_District: '',
        temporaryAddress_Address: '',
        temporaryAddress_PostalCode: '',
        temporaryAddress_HouseNo: '',
        permanentAddress_State: '',
        permanentAddress_District: '',
        permanentAddress_Municipality: '',
        permanentAddress_Address: '',
        permanentAddress_WardNo: '',
        permanentAddress_Tole: '',
        permanentAddress_HouseNo: '',
        idType: '',
        idNo: '',
        idPlaceOfIssue: '',
        issueDate: '',
        expiryDate: '',
        idData: '',
        idDataType: '',
        photoData: '',
        photoDataType: '',
    });

    const [txnForm, setTxnForm] = useState({
        senderName: '',
        senderMobileNo: '',
        occupation: '',
        receiverName: '',
        receiverAddress: '',
        receiverGender: '',
        receiverMobileNo: '',
        receiverCity: '',
        receiverCountry: 'NPL',
        forexSessionId: '',
        agentTxnRefId: '',
        collectAmount: '',
        payoutAmount: '',
        sourceOfFund: '',
        relationship: '',
        purposeOfRemittance: '',
        paymentType: 'C',
        bankId: '',
        bankBranchId: '',
        bankAccountNumber: '',
        calcBy: 'C',
    });

    const [calcForm, setCalcForm] = useState({
        payoutAgentId: '',
        remitAmount: '',
        paymentType: 'C',
        payoutCountry: 'NPL',
        calcBy: 'C',
    });

    const loadCommonLookups = async () => {
        try {
            const [countries, genders, marital, occupations, sources, idTypes, purpose, relationship, banks, nepStates, indiaStates] = await Promise.all([
                api.get('/IME/Countries'),
                api.get('/IME/Genders'),
                api.get('/IME/MaritalStatus'),
                api.get('/IME/Occupation'),
                api.get('/IME/SourceOfFundList'),
                api.get('/IME/GetIdTypes?country=NPL'),
                api.get('/IME/PurposeOfRemittance'),
                api.get('/IME/RelationshipList'),
                api.get('/IME/BankList/NPL'),
                api.get('/IME/States/NPL'),
                api.get('/IME/States/IND'),
            ]);

            setLookups((prev) => ({
                ...prev,
                countries: toDataList(countries),
                genders: toDataList(genders),
                marital: toDataList(marital),
                occupations: toDataList(occupations),
                sources: toDataList(sources),
                idTypes: toDataList(idTypes),
                purpose: toDataList(purpose),
                relationship: toDataList(relationship),
                banks: toDataList(banks),
                nepStates: toDataList(nepStates),
                indiaStates: toDataList(indiaStates),
            }));
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || error.message || 'Static data load failed');
        }
    };

    useEffect(() => {
        loadCommonLookups();
    }, []);

    useEffect(() => {
        const stateId = customerForm.permanentAddress_State;
        if (!stateId) {
            setLookups((prev) => ({ ...prev, permDistricts: [], permMunicipalities: [] }));
            return;
        }

        api.get(`/IME/Districts/${stateId}`)
            .then((res) => setLookups((prev) => ({ ...prev, permDistricts: toDataList(res), permMunicipalities: [] })))
            .catch(() => setLookups((prev) => ({ ...prev, permDistricts: [], permMunicipalities: [] })));
    }, [customerForm.permanentAddress_State]);

    useEffect(() => {
        const districtId = customerForm.permanentAddress_District;
        if (!districtId) {
            setLookups((prev) => ({ ...prev, permMunicipalities: [] }));
            return;
        }

        api.get(`/IME/Municipalities/${districtId}`)
            .then((res) => setLookups((prev) => ({ ...prev, permMunicipalities: toDataList(res) })))
            .catch(() => setLookups((prev) => ({ ...prev, permMunicipalities: [] })));
    }, [customerForm.permanentAddress_District]);

    useEffect(() => {
        const stateId = customerForm.temporaryAddress_State;
        if (!stateId) {
            setLookups((prev) => ({ ...prev, tempDistricts: [] }));
            return;
        }
        api.get(`/IME/Districts/${stateId}`)
            .then((res) => setLookups((prev) => ({ ...prev, tempDistricts: toDataList(res) })))
            .catch(() => setLookups((prev) => ({ ...prev, tempDistricts: [] })));
    }, [customerForm.temporaryAddress_State]);

    useEffect(() => {
        const bankId = receiverForm.bankId || txnForm.bankId;
        if (!bankId) {
            setLookups((prev) => ({ ...prev, bankBranches: [] }));
            return;
        }
        api.get(`/IME/BankBranchList/${bankId}`)
            .then((res) => setLookups((prev) => ({ ...prev, bankBranches: toDataList(res) })))
            .catch(() => setLookups((prev) => ({ ...prev, bankBranches: [] })));
    }, [txnForm.bankId, receiverForm.bankId]);

    useEffect(() => {
        const stateId = receiverForm.state;
        if (!stateId) {
            setLookups((prev) => ({ ...prev, receiverDistricts: [], receiverMunicipalities: [] }));
            return;
        }

        api.get(`/IME/Districts/${stateId}`)
            .then((res) => setLookups((prev) => ({ ...prev, receiverDistricts: toDataList(res), receiverMunicipalities: [] })))
            .catch(() => setLookups((prev) => ({ ...prev, receiverDistricts: [], receiverMunicipalities: [] })));
    }, [receiverForm.state]);

    useEffect(() => {
        const districtId = receiverForm.district;
        if (!districtId) {
            setLookups((prev) => ({ ...prev, receiverMunicipalities: [] }));
            return;
        }

        api.get(`/IME/Municipalities/${districtId}`)
            .then((res) => setLookups((prev) => ({ ...prev, receiverMunicipalities: toDataList(res) })))
            .catch(() => setLookups((prev) => ({ ...prev, receiverMunicipalities: [] })));
    }, [receiverForm.district]);

    const runCall = async (key, method, url, data = undefined) => {
        setLoadingKey(key);
        setErrorMessage('');
        try {
            const res = await api({ method, url, data });
            setLatestResponse({ ok: true, status: res.status, url, method: method.toUpperCase(), data: res.data });
            return res;
        } catch (error) {
            const payload = error?.response?.data || { message: error.message };
            setLatestResponse({ ok: false, status: error?.response?.status || 500, url, method: method.toUpperCase(), data: payload });
            setErrorMessage(payload?.message || error.message || 'Request failed');
            throw error;
        } finally {
            setLoadingKey('');
        }
    };

    const paymentModeText = useMemo(() => (txnForm.paymentType === 'B' ? 'Bank Deposit' : 'Cash Payment'), [txnForm.paymentType]);

    const handleCheckCustomer = async () => {
        if (!checkMobile) return;
        const res = await runCall('checkCustomer', 'get', `/IME/CheckCustomer/${checkMobile}`);
        setCustomerCheck(res.data?.data || null);

        const code = toNestedValue(res.data?.data, ['RESPONSE', 'Response'])?.Code || res.data?.code;
        const name = toNestedValue(res.data?.data, ['Name']);

        setCustomerForm((prev) => ({
            ...prev,
            mobileNo: checkMobile,
            firstName: prev.firstName || String(name || '').split(' ')[0] || '',
            lastName: prev.lastName || String(name || '').split(' ').slice(1).join(' ') || '',
        }));

        if (String(code) === '0') {
            setCustomerVerified(true);
            setStep(3);
        } else {
            setStep(2);
        }
    };

    const handleCustomerRegistration = async () => {
        const payload = {
            ...customerForm,
            mobileNo: customerForm.mobileNo || checkMobile,
        };

        const res = await runCall('registerCustomer', 'post', '/IME/CustomerRegistration', payload);
        const token = toNestedValue(res.data?.data, ['CustomerToken']) || '';
        setCustomerToken(token);
        if (token) {
            const otpRes = await runCall('sendOtpCR', 'post', '/IME/SendOTP', { module: 'CR', referenceValue: token });
            setCustomerOtpToken(toNestedValue(otpRes.data?.data, ['OTPToken']) || '');
        }
    };

    const handleConfirmCustomer = async () => {
        if (!customerToken || !customerOtpToken) {
            setErrorMessage('CustomerToken or OTPToken missing. Register customer first.');
            return;
        }

        const otpValue = customerForm.confirmOtp || '';
        await runCall('confirmCustomer', 'post', '/IME/ConfirmCustomerRegistration', {
            otp: otpValue,
            customerToken,
            otpToken: customerOtpToken,
        });

        setCustomerVerified(true);
        setStep(3);
    };

    const handleCreateReceiver = () => {
        if (!receiverForm.firstName || !receiverForm.lastName || !receiverForm.mobileNo || !receiverForm.gender || !receiverForm.relationship || !receiverForm.purposeOfRemittance) {
            setErrorMessage('Please fill required receiver details before continuing.');
            return;
        }

        const fullName = `${receiverForm.firstName} ${receiverForm.middleName} ${receiverForm.lastName}`.replace(/\s+/g, ' ').trim();

        setTxnForm((prev) => ({
            ...prev,
            receiverName: fullName,
            receiverMobileNo: receiverForm.mobileNo,
            receiverGender: receiverForm.gender,
            receiverAddress: receiverForm.municipality ? `${receiverForm.municipality}, ${receiverForm.district}, ${receiverForm.state}` : `${receiverForm.district}, ${receiverForm.state}`,
            receiverCity: receiverForm.municipality,
            receiverCountry: receiverForm.country,
            relationship: receiverForm.relationship,
            purposeOfRemittance: receiverForm.purposeOfRemittance,
            paymentType: receiverForm.paymentType,
            bankId: receiverForm.bankId,
            bankBranchId: receiverForm.bankBranchId,
            bankAccountNumber: receiverForm.accountNo,
        }));

        setCalcForm((prev) => ({
            ...prev,
            paymentType: receiverForm.paymentType,
            payoutAgentId: receiverForm.bankId,
        }));

        setReceiverCreated(true);
        setStep(4);
        setErrorMessage('');
    };

    const handleGetCalculation = async () => {
        const res = await runCall('getCalculation', 'post', '/IME/GetCalculation', calcForm);
        const data = res.data?.data || {};

        setTxnForm((prev) => ({
            ...prev,
            forexSessionId: toNestedValue(data, ['ForexSessionId']),
            collectAmount: toNestedValue(data, ['CollectAmount']),
            payoutAmount: toNestedValue(data, ['PayoutAmount']),
            paymentType: calcForm.paymentType,
            calcBy: calcForm.calcBy,
            bankId: calcForm.payoutAgentId,
        }));
    };

    const handleSendTransaction = async () => {
        const payload = {
            ...txnForm,
            senderMobileNo: customerForm.mobileNo || checkMobile,
            senderName: `${customerForm.firstName} ${customerForm.lastName}`.trim(),
            occupation: customerForm.occupation,
            sourceOfFund: customerForm.sourceOfFund,
            agentTxnRefId: txnForm.agentTxnRefId || `TXN-${Date.now()}`,
        };

        const res = await runCall('sendTxn', 'post', '/IME/SendTransaction', payload);
        const refNo = toNestedValue(res.data?.data, ['RefNo']) || '';

        if (!refNo) {
            setErrorMessage('Reference number not returned from SendTransaction.');
            return;
        }

        const otpRes = await runCall('sendOtpST', 'post', '/IME/SendOTP', { module: 'ST', referenceValue: refNo });
        setConfirmSendRefNo(refNo);
        setConfirmSendOtpToken(toNestedValue(otpRes.data?.data, ['OTPToken']) || '');
        setShowConfirmOtpModal(true);
    };

    const handleConfirmSend = async () => {
        if (!confirmSendRefNo || !confirmSendOtpToken || !confirmOtp) {
            setErrorMessage('RefNo, OTPToken or OTP missing.');
            return;
        }

        await runCall('confirmSendTxn', 'post', '/IME/ConfirmSendTransaction', {
            refNo: confirmSendRefNo,
            otpToken: confirmSendOtpToken,
            otp: confirmOtp,
        });

        setShowConfirmOtpModal(false);
        setConfirmOtp('');
        setStep(4);
    };

    const handleFilePick = async (event, dataKey, typeKey) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const base = await fileToBase64(file);
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        setCustomerForm((prev) => ({ ...prev, [dataKey]: base, [typeKey]: ext }));
    };

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold dark:text-white">Send Money Indo-Nepal</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Send Indo-Nepal Transaction / Check Customer</p>
                </div>
                <button onClick={() => navigate('/dashboard/services')} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                    <Home size={14} /> Home
                </button>
            </div>

            <div className="bg-red-600 text-white text-xs rounded-md px-3 py-2">
                Please fill proper customer information as per ID document during KYC. Unclear/edited IDs are not accepted.
            </div>

            <Section title="1) Check Customer">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div className="md:col-span-3">
                        <LabeledInput
                            label="Sender Mobile No."
                            required
                            placeholder="Enter sender mobile no"
                            value={checkMobile}
                            onChange={(e) => setCheckMobile(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleCheckCustomer}
                        disabled={!checkMobile || loadingKey === 'checkCustomer'}
                        className="h-[42px] px-4 py-2 rounded-md bg-slate-800 text-white text-sm disabled:opacity-60"
                    >
                        {loadingKey === 'checkCustomer' ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
                        Search
                    </button>
                </div>

                {customerCheck ? (
                    <div className="rounded-md border border-gray-200 dark:border-gray-700 p-3 text-sm dark:text-gray-200">
                        <p><strong>Name:</strong> {toNestedValue(customerCheck, ['Name']) || '-'}</p>
                        <p><strong>Mobile:</strong> {toNestedValue(customerCheck, ['MobileNo']) || checkMobile}</p>
                        <p><strong>KYC Status:</strong> {toNestedValue(customerCheck, ['KYCStatus']) || '-'}</p>
                    </div>
                ) : null}
            </Section>

            {step >= 2 ? (
                <Section title="2) Customer Registration">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <LabeledInput label="Mobile Number" required value={customerForm.mobileNo} onChange={(e) => setCustomerForm((p) => ({ ...p, mobileNo: e.target.value }))} />
                        <LabeledInput label="Membership ID" value={customerForm.membershipId} onChange={(e) => setCustomerForm((p) => ({ ...p, membershipId: e.target.value }))} />
                        <LabeledInput label="First Name" required value={customerForm.firstName} onChange={(e) => setCustomerForm((p) => ({ ...p, firstName: e.target.value }))} />
                        <LabeledInput label="Middle Name" value={customerForm.middleName} onChange={(e) => setCustomerForm((p) => ({ ...p, middleName: e.target.value }))} />
                        <LabeledInput label="Last Name" required value={customerForm.lastName} onChange={(e) => setCustomerForm((p) => ({ ...p, lastName: e.target.value }))} />
                        <LabeledSelect label="Nationality" required options={lookups.countries} value={customerForm.nationality} onChange={(e) => setCustomerForm((p) => ({ ...p, nationality: e.target.value }))} />
                        <LabeledSelect label="Marital Status" required options={lookups.marital} value={customerForm.maritalStatus} onChange={(e) => setCustomerForm((p) => ({ ...p, maritalStatus: e.target.value }))} />
                        <LabeledInput type="date" label="Date of Birth" required value={customerForm.dob} onChange={(e) => setCustomerForm((p) => ({ ...p, dob: e.target.value }))} />
                        <LabeledSelect label="Gender" required options={lookups.genders} value={customerForm.gender} onChange={(e) => setCustomerForm((p) => ({ ...p, gender: e.target.value }))} />
                        <LabeledInput label="Father/Mother Name" required value={customerForm.fatherOrMotherName} onChange={(e) => setCustomerForm((p) => ({ ...p, fatherOrMotherName: e.target.value }))} />
                        <LabeledInput label="Email" value={customerForm.email} onChange={(e) => setCustomerForm((p) => ({ ...p, email: e.target.value }))} />
                        <LabeledSelect label="Occupation" required options={lookups.occupations} value={customerForm.occupation} onChange={(e) => setCustomerForm((p) => ({ ...p, occupation: e.target.value }))} />
                        <LabeledSelect label="Source Of Fund" options={lookups.sources} value={customerForm.sourceOfFund} onChange={(e) => setCustomerForm((p) => ({ ...p, sourceOfFund: e.target.value }))} />
                    </div>

                    <h3 className="text-sm font-semibold mt-2 dark:text-white">Temporary Address (India)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <LabeledSelect label="State" required options={lookups.indiaStates} value={customerForm.temporaryAddress_State} onChange={(e) => setCustomerForm((p) => ({ ...p, temporaryAddress_State: e.target.value }))} />
                        <LabeledSelect label="District" required options={lookups.tempDistricts} value={customerForm.temporaryAddress_District} onChange={(e) => setCustomerForm((p) => ({ ...p, temporaryAddress_District: e.target.value }))} />
                        <LabeledInput label="Address" required value={customerForm.temporaryAddress_Address} onChange={(e) => setCustomerForm((p) => ({ ...p, temporaryAddress_Address: e.target.value }))} />
                        <LabeledInput label="Postal Code" value={customerForm.temporaryAddress_PostalCode} onChange={(e) => setCustomerForm((p) => ({ ...p, temporaryAddress_PostalCode: e.target.value }))} />
                    </div>

                    <h3 className="text-sm font-semibold mt-2 dark:text-white">Permanent Address (Nepal)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <LabeledSelect label="State" required options={lookups.nepStates} value={customerForm.permanentAddress_State} onChange={(e) => setCustomerForm((p) => ({ ...p, permanentAddress_State: e.target.value }))} />
                        <LabeledSelect label="District" required options={lookups.permDistricts} value={customerForm.permanentAddress_District} onChange={(e) => setCustomerForm((p) => ({ ...p, permanentAddress_District: e.target.value }))} />
                        <LabeledSelect label="Municipality" options={lookups.permMunicipalities} value={customerForm.permanentAddress_Municipality} onChange={(e) => setCustomerForm((p) => ({ ...p, permanentAddress_Municipality: e.target.value }))} />
                        <LabeledInput label="Address" required value={customerForm.permanentAddress_Address} onChange={(e) => setCustomerForm((p) => ({ ...p, permanentAddress_Address: e.target.value }))} />
                    </div>

                    <h3 className="text-sm font-semibold mt-2 dark:text-white">Identity Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <LabeledSelect label="ID Type" required options={lookups.idTypes} value={customerForm.idType} onChange={(e) => setCustomerForm((p) => ({ ...p, idType: e.target.value }))} />
                        <LabeledInput label="ID Number" required value={customerForm.idNo} onChange={(e) => setCustomerForm((p) => ({ ...p, idNo: e.target.value }))} />
                        <LabeledInput label="ID Issue Place" value={customerForm.idPlaceOfIssue} onChange={(e) => setCustomerForm((p) => ({ ...p, idPlaceOfIssue: e.target.value }))} />
                        <LabeledInput type="date" label="Issue Date" required value={customerForm.issueDate} onChange={(e) => setCustomerForm((p) => ({ ...p, issueDate: e.target.value }))} />
                        <LabeledInput type="date" label="Expiry Date" value={customerForm.expiryDate} onChange={(e) => setCustomerForm((p) => ({ ...p, expiryDate: e.target.value }))} />
                    </div>

                    <h3 className="text-sm font-semibold mt-2 dark:text-white">Upload Document</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4">
                            <p className="text-sm mb-2 dark:text-gray-300">ID Photo (required)</p>
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFilePick(e, 'idData', 'idDataType')} className="text-sm" />
                        </div>
                        <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4">
                            <p className="text-sm mb-2 dark:text-gray-300">Personal Image (optional)</p>
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFilePick(e, 'photoData', 'photoDataType')} className="text-sm" />
                        </div>
                    </div>

                    {!customerVerified ? (
                        <div className="space-y-3">
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={handleCustomerRegistration}
                                    disabled={loadingKey === 'registerCustomer'}
                                    className="px-4 py-2 rounded-md bg-green-600 text-white text-sm"
                                >
                                    {loadingKey === 'registerCustomer' ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
                                    Save & Next
                                </button>
                            </div>
                            {customerToken ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                                    <LabeledInput label="Customer Token" value={customerToken} readOnly />
                                    <LabeledInput label="OTP Token" value={customerOtpToken} readOnly />
                                    <LabeledInput label="OTP" required value={customerForm.confirmOtp || ''} onChange={(e) => setCustomerForm((p) => ({ ...p, confirmOtp: e.target.value }))} />
                                    <div>
                                        <button onClick={handleConfirmCustomer} className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm" disabled={loadingKey === 'confirmCustomer'}>
                                            Verify OTP
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <div className="text-sm rounded-md bg-green-50 text-green-700 p-3">Customer verified. You can continue to send money flow.</div>
                    )}
                </Section>
            ) : null}

            {step >= 3 && customerVerified ? (
                <Section title="3) Receiver Registration">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <LabeledInput label="First Name" required value={receiverForm.firstName} onChange={(e) => setReceiverForm((p) => ({ ...p, firstName: e.target.value }))} />
                        <LabeledInput label="Middle Name" value={receiverForm.middleName} onChange={(e) => setReceiverForm((p) => ({ ...p, middleName: e.target.value }))} />
                        <LabeledInput label="Last Name" required value={receiverForm.lastName} onChange={(e) => setReceiverForm((p) => ({ ...p, lastName: e.target.value }))} />
                        <LabeledSelect label="Gender" required options={lookups.genders} value={receiverForm.gender} onChange={(e) => setReceiverForm((p) => ({ ...p, gender: e.target.value }))} />
                        <LabeledSelect label="Relationship" required options={lookups.relationship} value={receiverForm.relationship} onChange={(e) => setReceiverForm((p) => ({ ...p, relationship: e.target.value }))} />
                        <LabeledInput label="Contact Number" required value={receiverForm.mobileNo} onChange={(e) => setReceiverForm((p) => ({ ...p, mobileNo: e.target.value }))} />
                        <LabeledSelect label="Country" required options={lookups.countries} value={receiverForm.country} onChange={(e) => setReceiverForm((p) => ({ ...p, country: e.target.value }))} />
                        <LabeledSelect label="State" required options={lookups.nepStates} value={receiverForm.state} onChange={(e) => setReceiverForm((p) => ({ ...p, state: e.target.value }))} />
                        <LabeledSelect label="District" required options={lookups.receiverDistricts} value={receiverForm.district} onChange={(e) => setReceiverForm((p) => ({ ...p, district: e.target.value }))} />
                        <LabeledSelect label="Municipality/VDC" options={lookups.receiverMunicipalities} value={receiverForm.municipality} onChange={(e) => setReceiverForm((p) => ({ ...p, municipality: e.target.value }))} />
                        <LabeledSelect label="Preferred Payment Type" required options={[{ id: 'C', value: 'Cash Payment' }, { id: 'B', value: 'Bank Deposit' }]} value={receiverForm.paymentType} onChange={(e) => setReceiverForm((p) => ({ ...p, paymentType: e.target.value }))} />
                        <LabeledSelect label="Purpose Of Transaction" required options={lookups.purpose} value={receiverForm.purposeOfRemittance} onChange={(e) => setReceiverForm((p) => ({ ...p, purposeOfRemittance: e.target.value }))} />
                        {receiverForm.paymentType === 'B' ? (
                            <>
                                <LabeledSelect label="Bank Name" required options={lookups.banks} value={receiverForm.bankId} onChange={(e) => setReceiverForm((p) => ({ ...p, bankId: e.target.value }))} />
                                <LabeledSelect label="Bank Branch" required options={lookups.bankBranches} value={receiverForm.bankBranchId} onChange={(e) => setReceiverForm((p) => ({ ...p, bankBranchId: e.target.value }))} />
                                <LabeledInput label="Account No." required value={receiverForm.accountNo} onChange={(e) => setReceiverForm((p) => ({ ...p, accountNo: e.target.value }))} />
                            </>
                        ) : null}
                    </div>

                    <div className="flex gap-2">
                        <button onClick={handleCreateReceiver} className="px-4 py-2 rounded-md bg-green-600 text-white text-sm">
                            Create Receiver
                        </button>
                        {receiverCreated ? <span className="text-sm text-green-600 self-center">Receiver created. Continue to send money.</span> : null}
                    </div>
                </Section>
            ) : null}

            {step >= 4 && customerVerified && receiverCreated ? (
                <Section title="4) Send Transaction Summary">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-800 text-white rounded-xl p-4 space-y-1">
                            <h3 className="font-semibold">Sender Details</h3>
                            <p className="text-sm"><strong>Name:</strong> {`${customerForm.firstName} ${customerForm.lastName}`.trim() || '-'}</p>
                            <p className="text-sm"><strong>Mobile:</strong> {customerForm.mobileNo || checkMobile}</p>
                            <p className="text-sm"><strong>Address:</strong> {customerForm.temporaryAddress_Address || '-'}</p>
                        </div>
                        <div className="bg-orange-400 text-white rounded-xl p-4 space-y-1">
                            <h3 className="font-semibold">Receiver Details</h3>
                            <p className="text-sm"><strong>Name:</strong> {txnForm.receiverName || '-'}</p>
                            <p className="text-sm"><strong>Mobile:</strong> {txnForm.receiverMobileNo || '-'}</p>
                            <p className="text-sm"><strong>Address:</strong> {txnForm.receiverAddress || '-'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <LabeledInput label="Remit Amount (INR)" required value={calcForm.remitAmount} onChange={(e) => setCalcForm((p) => ({ ...p, remitAmount: e.target.value }))} />
                        <LabeledSelect label="Payment Mode" required options={[{ id: 'C', value: 'Cash Payment' }, { id: 'B', value: 'Bank Deposit' }]} value={calcForm.paymentType} onChange={(e) => setCalcForm((p) => ({ ...p, paymentType: e.target.value }))} />
                        <LabeledSelect label="Bank" options={lookups.banks} value={calcForm.payoutAgentId} onChange={(e) => setCalcForm((p) => ({ ...p, payoutAgentId: e.target.value }))} />
                        <LabeledSelect label="Calc By" required options={[{ id: 'C', value: 'By Collect Amount' }, { id: 'P', value: 'By Payout Amount' }]} value={calcForm.calcBy} onChange={(e) => setCalcForm((p) => ({ ...p, calcBy: e.target.value }))} />
                        <LabeledInput label="Sender Name" required value={txnForm.senderName} onChange={(e) => setTxnForm((p) => ({ ...p, senderName: e.target.value }))} />
                        <LabeledInput label="Receiver Name" required value={txnForm.receiverName} onChange={(e) => setTxnForm((p) => ({ ...p, receiverName: e.target.value }))} />
                        <LabeledInput label="Receiver Mobile" required value={txnForm.receiverMobileNo} onChange={(e) => setTxnForm((p) => ({ ...p, receiverMobileNo: e.target.value }))} />
                        <LabeledInput label="Receiver Address" required value={txnForm.receiverAddress} onChange={(e) => setTxnForm((p) => ({ ...p, receiverAddress: e.target.value }))} />
                        <LabeledSelect label="Receiver Gender" required options={lookups.genders} value={txnForm.receiverGender} onChange={(e) => setTxnForm((p) => ({ ...p, receiverGender: e.target.value }))} />
                        <LabeledSelect label="Relationship" required options={lookups.relationship} value={txnForm.relationship} onChange={(e) => setTxnForm((p) => ({ ...p, relationship: e.target.value }))} />
                        <LabeledSelect label="Purpose" required options={lookups.purpose} value={txnForm.purposeOfRemittance} onChange={(e) => setTxnForm((p) => ({ ...p, purposeOfRemittance: e.target.value }))} />
                        <LabeledSelect label="Source Of Fund" required options={lookups.sources} value={txnForm.sourceOfFund} onChange={(e) => setTxnForm((p) => ({ ...p, sourceOfFund: e.target.value }))} />
                        {calcForm.paymentType === 'B' ? (
                            <>
                                <LabeledSelect label="Bank Name" required options={lookups.banks} value={txnForm.bankId} onChange={(e) => setTxnForm((p) => ({ ...p, bankId: e.target.value }))} />
                                <LabeledSelect label="Bank Branch" required options={lookups.bankBranches} value={txnForm.bankBranchId} onChange={(e) => setTxnForm((p) => ({ ...p, bankBranchId: e.target.value }))} />
                                <LabeledInput label="Account No" required value={txnForm.bankAccountNumber} onChange={(e) => setTxnForm((p) => ({ ...p, bankAccountNumber: e.target.value }))} />
                            </>
                        ) : null}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <LabeledInput label="Collect Amount" value={txnForm.collectAmount} readOnly />
                        <LabeledInput label="Payout Amount" value={txnForm.payoutAmount} readOnly />
                        <LabeledInput label="Forex Session ID" value={txnForm.forexSessionId} readOnly />
                    </div>

                    <div className="rounded-lg bg-gray-50 dark:bg-[#232323] p-3 text-sm dark:text-gray-300">
                        <p><strong>Payment Mode:</strong> {paymentModeText}</p>
                        <p><strong>Purpose Of Remittance:</strong> {txnForm.purposeOfRemittance || '-'}</p>
                        <p><strong>Source Of Fund:</strong> {txnForm.sourceOfFund || '-'}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button onClick={handleGetCalculation} disabled={loadingKey === 'getCalculation'} className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm">
                            {loadingKey === 'getCalculation' ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
                            Get Calculation
                        </button>
                        <button onClick={handleSendTransaction} disabled={loadingKey === 'sendTxn'} className="px-4 py-2 rounded-md bg-green-600 text-white text-sm">
                            {loadingKey === 'sendTxn' ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
                            Submit Transaction
                        </button>
                    </div>
                </Section>
            ) : null}

            {showConfirmOtpModal ? (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
                    <div className="w-full max-w-md bg-white dark:bg-[#1e1e1e] rounded-lg overflow-hidden">
                        <div className="bg-red-600 text-white px-4 py-3 font-semibold">Enter OTP</div>
                        <div className="p-4 space-y-3">
                            <LabeledInput label="OTP" required placeholder="Enter OTP" value={confirmOtp} onChange={(e) => setConfirmOtp(e.target.value)} />
                            <p className="text-xs text-red-500">Please try again after a few seconds if OTP not received.</p>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setShowConfirmOtpModal(false)} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-sm">Cancel</button>
                                <button onClick={handleConfirmSend} disabled={loadingKey === 'confirmSendTxn'} className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm">
                                    {loadingKey === 'confirmSendTxn' ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
                                    Proceed
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            <Section title="Latest API Response">
                {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
                {!latestResponse ? (
                    <p className="text-sm text-gray-500">Flow execute karne ke baad response yahan dikhega.</p>
                ) : (
                    <div className={`rounded-lg p-3 text-sm ${latestResponse.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            {latestResponse.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                            <span className="font-semibold">{latestResponse.method} {latestResponse.url}</span>
                            <span className="ml-auto">HTTP {latestResponse.status}</span>
                        </div>
                        <textarea rows={14} value={pretty(latestResponse.data)} readOnly className={`${inputClass} text-xs`} />
                    </div>
                )}
            </Section>
        </div>
    );
};

export default IMEPage;
