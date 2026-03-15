import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Home, Search, Plus, X, Edit2, Send, Loader2, ChevronDown, AlertCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '/api';

// ─── Axios instance with credentials ─────────────────────────────────────────
const api = axios.create({ baseURL: API, withCredentials: true });

// ─── Static data ──────────────────────────────────────────────────────────────
const RELATIONSHIPS = [
    'Father','Mother','Grand Father','Grand Mother','Husband','Wife',
    'Father in Law','Mother in Law','Brother','Brother in Law','Sister',
    'Sister in Law','Son','Daughter','Uncle','Aunty','Cousin','Nephew','Niece','Self','Other',
];

const GENDERS = ['Male', 'Female', 'Other'];

const PURPOSES = [
    'Family Maintenance','Education','Medical','Business','Gift','Other',
];

const EMPTY_FORM = {
    receiverName:'', receiverMobile:'', gender:'', relationship:'',
    country:'Nepal', districtId:'', municipalityId:'', municipalityName:'',
    paymentType:'Bank Deposit',
    bankId:'', bankName:'', bankBranchId:'', bankBranchName:'',
    accountNumber:'', purposeId:'',
};

// ─── Small UI helpers ─────────────────────────────────────────────────────────
const FieldGroup = ({ label, children }) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</label>
        {children}
    </div>
);

const Input = ({ ...props }) => (
    <input
        {...props}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm
            bg-white dark:bg-[#2a2a2a] dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
    />
);

const Select = ({ value, onChange, options, placeholder }) => (
    <div className="relative">
        <select
            value={value}
            onChange={onChange}
            className="w-full appearance-none border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm
                bg-white dark:bg-[#2a2a2a] dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 pr-8"
        >
            <option value="">{placeholder || 'Select'}</option>
            {options.map(o => (
                <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
            ))}
        </select>
        <ChevronDown size={14} className="absolute right-2 top-3 text-gray-400 pointer-events-none" />
    </div>
);

// ─── Receiver Form Modal ──────────────────────────────────────────────────────
const ReceiverModal = ({ isOpen, onClose, onSave, customerMobile, editData }) => {
    const [form, setForm]           = useState(EMPTY_FORM);
    const [banks, setBanks]         = useState([]);
    const [branches, setBranches]   = useState([]);
    const [districts, setDistricts] = useState([]);
    const [munis, setMunis]         = useState([]);
    const [muniSearch, setMuniSearch] = useState('');
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState('');

    // Populate form when editing
    useEffect(() => {
        if (editData) setForm({ ...EMPTY_FORM, ...editData });
        else          setForm(EMPTY_FORM);
        setError('');
    }, [editData, isOpen]);

    // Load banks + districts once
    useEffect(() => {
        if (!isOpen) return;
        Promise.all([
            api.get('/ime/banks'),
            api.get('/ime/districts'),
        ]).then(([b, d]) => {
            setBanks((b.data.data || []).map(x => ({ value: x.BankID || x.id, label: x.BankName || x.name })));
            setDistricts((d.data.data || []).map(x => ({ value: x.DistrictID || x.id, label: x.DistrictName || x.name })));
        }).catch(() => {});
    }, [isOpen]);

    // Load branches when bank changes
    useEffect(() => {
        if (!form.bankId) { setBranches([]); return; }
        api.get(`/ime/banks/${form.bankId}/branches`)
            .then(r => setBranches((r.data.data || []).map(x => ({ value: x.BranchID || x.id, label: x.BranchName || x.name }))))
            .catch(() => {});
    }, [form.bankId]);

    // Load municipalities when district changes
    useEffect(() => {
        if (!form.districtId) { setMunis([]); return; }
        api.get(`/ime/districts/${form.districtId}/municipalities`)
            .then(r => setMunis((r.data.data || []).map(x => ({ value: x.MunicipalityID || x.id, label: x.MunicipalityName || x.name }))))
            .catch(() => {});
    }, [form.districtId]);

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    const filteredMunis = munis.filter(m => m.label.toLowerCase().includes(muniSearch.toLowerCase()));

    const handleSave = async () => {
        if (!form.receiverName || !form.receiverMobile || !form.gender || !form.relationship) {
            setError('Please fill all required fields.'); return;
        }
        setLoading(true); setError('');
        try {
            const payload = { ...form, txnMobileNo: customerMobile };
            if (editData?.beneficiaryId) {
                await api.put(`/ime/receivers/${editData.beneficiaryId}`, payload);
            } else {
                await api.post('/ime/receivers', payload);
            }
            onSave();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to save receiver.');
        } finally { setLoading(false); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
                    <h2 className="text-lg font-semibold dark:text-white">Receiver Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>

                {/* Form */}
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldGroup label="Receiver Full Name *">
                        <Input value={form.receiverName} onChange={set('receiverName')} placeholder="Receiver full name" />
                        <span className="text-xs text-teal-600">As per government ID</span>
                    </FieldGroup>

                    <FieldGroup label="Contact Number *">
                        <Input value={form.receiverMobile} onChange={set('receiverMobile')} placeholder="Enter receiver mobile" />
                    </FieldGroup>

                    <FieldGroup label="Gender *">
                        <Select value={form.gender} onChange={set('gender')} options={GENDERS} placeholder="Select" />
                    </FieldGroup>

                    <FieldGroup label="Relationship *">
                        <Select value={form.relationship} onChange={set('relationship')} options={RELATIONSHIPS} placeholder="Select" />
                    </FieldGroup>

                    <FieldGroup label="Country">
                        <Input value={form.country} onChange={set('country')} />
                    </FieldGroup>

                    <FieldGroup label="Municipality (गाउपलिका/नगरपालिका)">
                        <div className="space-y-1">
                            <Select
                                value={form.districtId}
                                onChange={e => setForm(f => ({ ...f, districtId: e.target.value, municipalityId: '', municipalityName: '' }))}
                                options={districts}
                                placeholder="Select district"
                            />
                            {form.districtId && (
                                <>
                                    <Input
                                        value={muniSearch}
                                        onChange={e => setMuniSearch(e.target.value)}
                                        placeholder="Search municipality..."
                                    />
                                    <Select
                                        value={form.municipalityId}
                                        onChange={e => setForm(f => ({
                                            ...f,
                                            municipalityId: e.target.value,
                                            municipalityName: filteredMunis.find(m => String(m.value) === e.target.value)?.label || '',
                                        }))}
                                        options={filteredMunis}
                                        placeholder="Select municipality"
                                    />
                                </>
                            )}
                            {form.municipalityName && (
                                <p className="text-xs text-gray-500">{form.municipalityName}</p>
                            )}
                        </div>
                    </FieldGroup>

                    <FieldGroup label="Payment Type">
                        <Select
                            value={form.paymentType}
                            onChange={e => setForm(f => ({ ...f, paymentType: e.target.value, bankId: '', bankBranchId: '', accountNumber: '' }))}
                            options={['Bank Deposit','Cash Payment']}
                            placeholder="Select"
                        />
                    </FieldGroup>

                    {form.paymentType === 'Bank Deposit' && (
                        <>
                            <FieldGroup label="Bank Name">
                                <Select
                                    value={form.bankId}
                                    onChange={e => setForm(f => ({ ...f, bankId: e.target.value, bankBranchId: '' }))}
                                    options={banks}
                                    placeholder="Select"
                                />
                            </FieldGroup>

                            <FieldGroup label="Bank Branch">
                                <Select
                                    value={form.bankBranchId}
                                    onChange={set('bankBranchId')}
                                    options={branches}
                                    placeholder="Select"
                                />
                            </FieldGroup>

                            <FieldGroup label="Account Number">
                                <Input value={form.accountNumber} onChange={set('accountNumber')} placeholder="Enter account number" />
                            </FieldGroup>
                        </>
                    )}

                    <FieldGroup label="Purpose of Transaction">
                        <Select value={form.purposeId} onChange={set('purposeId')} options={PURPOSES} placeholder="Select" />
                    </FieldGroup>
                </div>

                {error && (
                    <div className="mx-5 mb-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                        <AlertCircle size={16}/> {error}
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-end gap-3 p-5 border-t dark:border-gray-700">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-medium hover:bg-gray-300 dark:text-white">
                        Close
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
                    >
                        {loading && <Loader2 size={14} className="animate-spin"/>}
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Send Money Modal ─────────────────────────────────────────────────────────
const SendMoneyModal = ({ isOpen, onClose, customerMobile, receiver }) => {
    const [amount, setAmount]   = useState('');
    const [purpose, setPurpose] = useState('');
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => { if (!isOpen) { setAmount(''); setError(''); setSuccess(''); } }, [isOpen]);

    const handleSend = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            setError('Enter a valid amount.'); return;
        }
        setLoading(true); setError('');
        try {
            const res = await api.post('/ime/send-money', {
                txnMobileNo: customerMobile,
                beneficiaryId: receiver?.BeneficiaryID || receiver?.beneficiaryId,
                amount: Number(amount),
                purposeId: purpose,
                remarks,
            });
            setSuccess(`Transaction sent! Ref: ${res.data.data?.ReferenceNo || 'N/A'}`);
        } catch (e) {
            setError(e.response?.data?.message || 'Transaction failed.');
        } finally { setLoading(false); }
    };

    if (!isOpen || !receiver) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
                    <h2 className="text-lg font-semibold dark:text-white">Send Money to {receiver.ReceiverName || receiver.receiverName}</h2>
                    <button onClick={onClose}><X size={20} className="text-gray-400"/></button>
                </div>
                <div className="p-5 space-y-4">
                    {success ? (
                        <div className="text-green-600 bg-green-50 p-4 rounded-lg text-sm font-medium">{success}</div>
                    ) : (
                        <>
                            <FieldGroup label="Amount (INR) *">
                                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" />
                            </FieldGroup>
                            <FieldGroup label="Purpose">
                                <Select value={purpose} onChange={e => setPurpose(e.target.value)} options={PURPOSES} placeholder="Select" />
                            </FieldGroup>
                            <FieldGroup label="Remarks">
                                <Input value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional remarks" />
                            </FieldGroup>
                            {error && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                    <AlertCircle size={16}/> {error}
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div className="flex justify-end gap-3 p-5 border-t dark:border-gray-700">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm hover:bg-gray-300 dark:text-white">
                        {success ? 'Close' : 'Cancel'}
                    </button>
                    {!success && (
                        <button onClick={handleSend} disabled={loading}
                            className="px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-60 flex items-center gap-2">
                            {loading && <Loader2 size={14} className="animate-spin"/>}
                            <Send size={14}/> Send
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Main IME Page ────────────────────────────────────────────────────────────
const IMEPage = () => {
    const navigate = useNavigate();

    // ── State ──────────────────────────────────────────────────────────────────
    const [step, setStep]               = useState('search'); // 'search' | 'details'
    const [mobile, setMobile]           = useState('');
    const [searching, setSearching]     = useState(false);
    const [searchErr, setSearchErr]     = useState('');
    const [customer, setCustomer]       = useState(null);
    const [receivers, setReceivers]     = useState([]);
    const [receiverModal, setReceiverModal] = useState(false);
    const [editReceiver, setEditReceiver]   = useState(null);
    const [sendModal, setSendModal]         = useState(false);
    const [selectedReceiver, setSelectedReceiver] = useState(null);

    // ── Search customer ────────────────────────────────────────────────────────
    const handleSearch = async () => {
        if (!mobile.trim()) { setSearchErr('Please enter a mobile number.'); return; }
        setSearching(true); setSearchErr('');
        try {
            const res = await api.post('/ime/search-customer', { mobile: mobile.trim() });
            setCustomer(res.data.data);
            await fetchReceivers(mobile.trim());
            setStep('details');
        } catch (e) {
            setSearchErr(e.response?.data?.message || 'Customer not found.');
        } finally { setSearching(false); }
    };

    // ── Fetch receivers ────────────────────────────────────────────────────────
    const fetchReceivers = useCallback(async (mob) => {
        try {
            const r = await api.get(`/ime/receivers/${mob || mobile}`);
            setReceivers(r.data.data || []);
        } catch { setReceivers([]); }
    }, [mobile]);

    // ── Normalise customer field names (API may vary) ─────────────────────────
    const customerName     = customer?.CustomerName     || customer?.name         || '—';
    const customerMobile   = customer?.MobileNo         || customer?.mobile       || mobile;
    const canSend          = customer?.CanSendTransaction || customer?.canSend     || 'Yes';
    const kycStatus        = customer?.KYCStatus         || customer?.kycStatus    || '—';

    return (
        <div className="max-w-4xl mx-auto py-6 px-4 space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/IME_Logo.svg/200px-IME_Logo.svg.png"
                        alt="IME"
                        className="h-8 object-contain"
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                    <h1 className="text-xl font-bold dark:text-white">Indo-Nepal Money Transfer</h1>
                </div>
                <button
                    onClick={() => navigate('/dashboard/services')}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                    <Home size={14}/> Home
                </button>
            </div>

            {/* ── STEP 1: Search ──────────────────────────────────────────────── */}
            {step === 'search' && (
                <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm p-8">
                    <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/IME_Logo.svg/200px-IME_Logo.svg.png"
                            alt="IME"
                            className="h-16 object-contain"
                            onError={e => { e.target.style.display='none'; }}
                        />
                        <h2 className="text-xl font-semibold text-center dark:text-white">Search Customer</h2>

                        <div className="w-full space-y-3">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                Customer Mobile Number
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    value={mobile}
                                    onChange={e => setMobile(e.target.value)}
                                    placeholder="Mobile Number"
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                />
                                <button
                                    onClick={handleSearch}
                                    disabled={searching}
                                    className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2 whitespace-nowrap"
                                >
                                    {searching ? <Loader2 size={15} className="animate-spin"/> : <Search size={15}/>}
                                    Search
                                </button>
                            </div>
                            {searchErr && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle size={14}/> {searchErr}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── STEP 2: Customer Details + Receivers ────────────────────────── */}
            {step === 'details' && customer && (
                <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm overflow-hidden">
                    {/* IME logo centered */}
                    <div className="flex flex-col items-center py-5 border-b dark:border-gray-700">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/IME_Logo.svg/200px-IME_Logo.svg.png"
                            alt="IME" className="h-14 object-contain"
                            onError={e => { e.target.style.display='none'; }}
                        />
                        <h2 className="mt-2 text-base font-semibold dark:text-white">Customer Details</h2>
                    </div>

                    {/* Customer info table */}
                    <div className="p-5">
                        <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <tbody>
                                <tr className="border-b dark:border-gray-700">
                                    <td className="px-4 py-3 font-semibold bg-gray-50 dark:bg-[#252525] dark:text-white w-1/4">Name</td>
                                    <td className="px-4 py-3 dark:text-gray-200">{customerName}</td>
                                    <td className="px-4 py-3 font-semibold bg-gray-50 dark:bg-[#252525] dark:text-white w-1/4">Mobile</td>
                                    <td className="px-4 py-3 dark:text-gray-200">{customerMobile}</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-semibold bg-gray-50 dark:bg-[#252525] dark:text-white">Can Send Transaction</td>
                                    <td className="px-4 py-3 dark:text-gray-200">{canSend}</td>
                                    <td className="px-4 py-3 font-semibold bg-gray-50 dark:bg-[#252525] dark:text-white">KYC Status</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                            kycStatus === 'Approved'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-amber-100 text-amber-700'
                                        }`}>{kycStatus}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Receiver list */}
                    <div className="px-5 pb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-800 dark:text-white">Receiver Details</h3>
                            <button
                                onClick={() => { setEditReceiver(null); setReceiverModal(true); }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                            >
                                <Plus size={14}/> Add
                            </button>
                        </div>

                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-[#252525]">
                                    <tr>
                                        {['#','Name','Mobile','Payment Type','Collect','Payout','Action'].map(h => (
                                            <th key={h} className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {receivers.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-6 text-sm text-amber-600">
                                                No receivers found. Please add a receiver.
                                            </td>
                                        </tr>
                                    ) : receivers.map((r, i) => {
                                        const name         = r.ReceiverName     || r.receiverName     || r.name          || '—';
                                        const rmobile      = r.ReceiverMobile   || r.receiverMobile   || r.mobile        || '—';
                                        const pType        = r.PaymentType      || r.paymentType      || '—';
                                        const relationship = r.Relationship     || r.relationship     || '';
                                        return (
                                            <tr key={r.BeneficiaryID || r.beneficiaryId || i} className="border-t dark:border-gray-700">
                                                <td className="px-3 py-2 dark:text-gray-300">{i+1}</td>
                                                <td className="px-3 py-2 dark:text-gray-300">
                                                    {name}{relationship ? ` (${relationship})` : ''}
                                                </td>
                                                <td className="px-3 py-2 dark:text-gray-300">{rmobile}</td>
                                                <td className="px-3 py-2 dark:text-gray-300">{pType}</td>
                                                <td className="px-3 py-2">
                                                    <input placeholder="Collect"
                                                        className="border rounded px-2 py-1 text-xs w-20 dark:bg-[#2a2a2a] dark:border-gray-600 dark:text-white" readOnly />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input placeholder="Payout"
                                                        className="border rounded px-2 py-1 text-xs w-20 dark:bg-[#2a2a2a] dark:border-gray-600 dark:text-white" readOnly />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => { setSelectedReceiver(r); setSendModal(true); }}
                                                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center gap-1"
                                                        >
                                                            <Send size={10}/> Send
                                                        </button>
                                                        <button
                                                            onClick={() => { setEditReceiver(r); setReceiverModal(true); }}
                                                            className="px-2 py-1 bg-gray-200 dark:bg-gray-700 dark:text-white text-xs rounded hover:bg-gray-300 flex items-center gap-1"
                                                        >
                                                            <Edit2 size={10}/> Edit
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Back to search */}
                        <button
                            onClick={() => { setStep('search'); setCustomer(null); setReceivers([]); }}
                            className="mt-4 text-sm text-blue-600 hover:underline"
                        >
                            ← Search another customer
                        </button>
                    </div>
                </div>
            )}

            {/* Receiver Modal */}
            <ReceiverModal
                isOpen={receiverModal}
                onClose={() => setReceiverModal(false)}
                onSave={() => { setReceiverModal(false); fetchReceivers(); }}
                customerMobile={mobile}
                editData={editReceiver}
            />

            {/* Send Money Modal */}
            <SendMoneyModal
                isOpen={sendModal}
                onClose={() => setSendModal(false)}
                customerMobile={mobile}
                receiver={selectedReceiver}
            />
        </div>
    );
};

export default IMEPage;
