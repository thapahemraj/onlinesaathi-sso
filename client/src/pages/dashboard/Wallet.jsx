import { useState, useEffect } from 'react';
import {
    Wallet,
    Plus,
    ArrowDownCircle,
    ArrowUpCircle,
    Clock,
    CheckCircle2,
    XCircle,
    Copy,
    Upload,
    X,
    ChevronRight,
    Loader2,
    RefreshCw,
    Info,
    Building2,
    Hash,
    BadgeCheck,
} from 'lucide-react';
import axios from 'axios';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatNPR = (amount) =>
    new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', minimumFractionDigits: 2 }).format(amount ?? 0);

const STATUS_CONFIG = {
    pending:  { icon: Clock,         color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/20',  label: 'Pending'  },
    approved: { icon: CheckCircle2,  color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20',  label: 'Approved' },
    rejected: { icon: XCircle,       color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20',      label: 'Rejected' },
    completed:{ icon: CheckCircle2,  color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20',  label: 'Completed'},
};

// ─── Bank Details ──────────────────────────────────────────────────────────────

const BANK_DETAILS = {
    bankName:       'Nepal Investment Mega Bank (NIMB)',
    accountName:    'OnlineSaathi Pvt. Ltd.',
    accountNumber:  '1234567890',
    branch:         'Kathmandu, New Road',
};

// ─── Add Money Modal ───────────────────────────────────────────────────────────

const STEPS = ['Amount', 'Bank Details', 'Submit Proof'];

const AddMoneyModal = ({ isOpen, onClose, onSuccess, referenceId }) => {
    const [step, setStep]     = useState(0);
    const [amount, setAmount] = useState('');
    const [voucher, setVoucher] = useState('');
    const [screenshot, setScreenshot] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError]   = useState('');
    const [copied, setCopied] = useState('');

    const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

    useEffect(() => {
        if (!isOpen) { setStep(0); setAmount(''); setVoucher(''); setScreenshot(''); setError(''); }
    }, [isOpen]);

    if (!isOpen) return null;

    const copyText = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(''), 1500);
    };

    const handleNext = () => {
        setError('');
        if (step === 0) {
            const amt = Number(amount);
            if (!amt || amt < 100) return setError('Minimum top-up is NPR 100');
            if (amt > 100000)      return setError('Maximum per transaction is NPR 1,00,000');
        }
        setStep(s => s + 1);
    };

    const handleSubmit = async () => {
        if (!voucher.trim()) return setError('Please enter the bank voucher / transaction number');
        setLoading(true);
        setError('');
        try {
            await axios.post('/wallet/topup', {
                amount:           Number(amount),
                method:           'bank_transfer',
                referenceId,
                bankVoucherNumber: voucher,
                screenshotUrl:    screenshot || undefined,
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'w-full h-11 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#3b3b3b] text-[#323130] dark:text-white focus:border-[#0078D4] focus:outline-none focus:ring-2 focus:ring-[#0078D4]/20 text-sm transition';

    const CopyBtn = ({ text, id }) => (
        <button
            onClick={() => copyText(text, id)}
            className="ml-2 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-400 hover:text-[#0078D4]"
            title="Copy"
        >
            {copied === id ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white dark:bg-[#242424] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0078D4] to-[#005da6] px-6 py-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-white text-xl font-bold">Add Money</h2>
                        <p className="text-white/70 text-sm mt-0.5">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-gray-200 dark:bg-gray-700">
                    <div
                        className="h-1 bg-[#0078D4] transition-all duration-500"
                        style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                    />
                </div>

                <div className="p-6 space-y-5">
                    {/* ── STEP 0: Amount ── */}
                    {step === 0 && (
                        <>
                            <div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                                    Enter Amount <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">NPR</span>
                                    <input
                                        type="number"
                                        min="100"
                                        max="100000"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className={`${inputClass} pl-14 text-lg font-semibold`}
                                        onKeyDown={e => e.key === 'Enter' && handleNext()}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1.5">Min: NPR 100 &nbsp;•&nbsp; Max: NPR 1,00,000</p>
                            </div>

                            {/* Quick amounts */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Quick Select</p>
                                <div className="flex flex-wrap gap-2">
                                    {QUICK_AMOUNTS.map(a => (
                                        <button
                                            key={a}
                                            onClick={() => setAmount(String(a))}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${
                                                Number(amount) === a
                                                    ? 'bg-[#0078D4] text-white border-[#0078D4]'
                                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#0078D4]'
                                            }`}
                                        >
                                            {formatNPR(a)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Info box */}
                            <div className="flex gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                <Info size={16} className="text-[#0078D4] mt-0.5 shrink-0" />
                                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                    After clicking Next, you'll see our bank details. Transfer the exact amount and submit your
                                    bank voucher. Your wallet will be credited after admin verification (within 24 hours).
                                </p>
                            </div>
                        </>
                    )}

                    {/* ── STEP 1: Bank Details ── */}
                    {step === 1 && (
                        <>
                            <div className="bg-gradient-to-br from-[#0078D4]/10 to-blue-50 dark:from-[#0078D4]/20 dark:to-[#242424] border border-[#0078D4]/30 rounded-xl p-5 space-y-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Building2 size={18} className="text-[#0078D4]" />
                                    <span className="font-bold text-[#323130] dark:text-white">Bank Transfer Details</span>
                                </div>

                                {[
                                    { label: 'Bank Name',       value: BANK_DETAILS.bankName,       id: 'bank' },
                                    { label: 'Account Name',    value: BANK_DETAILS.accountName,    id: 'accname' },
                                    { label: 'Account Number',  value: BANK_DETAILS.accountNumber,  id: 'accnum' },
                                    { label: 'Branch',          value: BANK_DETAILS.branch,         id: 'branch' },
                                ].map(({ label, value, id }) => (
                                    <div key={id} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                                            <p className="font-semibold text-[#323130] dark:text-white text-sm">{value}</p>
                                        </div>
                                        <CopyBtn text={value} id={id} />
                                    </div>
                                ))}

                                <div className="pt-2 border-t border-[#0078D4]/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <Hash size={13} className="text-[#0078D4]" />
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Your Unique Reference ID</p>
                                            </div>
                                            <p className="font-bold text-[#0078D4] text-base tracking-wide">{referenceId}</p>
                                        </div>
                                        <CopyBtn text={referenceId} id="ref" />
                                    </div>
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
                                        ⚠️ Add this Reference ID in the bank transfer remarks
                                    </p>
                                </div>
                            </div>

                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                                <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">Transfer Exactly</p>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatNPR(Number(amount))}</p>
                            </div>
                        </>
                    )}

                    {/* ── STEP 2: Submit Proof ── */}
                    {step === 2 && (
                        <>
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Amount to credit</p>
                                    <p className="text-xl font-bold text-[#323130] dark:text-white">{formatNPR(Number(amount))}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Reference ID</p>
                                    <p className="font-semibold text-[#0078D4] text-sm">{referenceId}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                                    Bank Voucher / Transaction Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={voucher}
                                    onChange={e => setVoucher(e.target.value)}
                                    placeholder="e.g. NIMB-TXN-9876543"
                                    className={inputClass}
                                />
                                <p className="text-xs text-gray-400 mt-1">This is the transaction ID on your bank receipt</p>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                                    Screenshot URL <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <div className="relative">
                                    <Upload size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <input
                                        type="url"
                                        value={screenshot}
                                        onChange={e => setScreenshot(e.target.value)}
                                        placeholder="https://..."
                                        className={`${inputClass} pl-9`}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                                <BadgeCheck size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                                <p className="text-xs text-amber-700 dark:text-amber-300">
                                    Wallet will be credited within <strong>1–24 hours</strong> after admin verification.
                                </p>
                            </div>
                        </>
                    )}

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2.5">
                            {error}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        {step > 0 && (
                            <button
                                onClick={() => setStep(s => s - 1)}
                                className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-[#323130] dark:text-white font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                            >
                                Back
                            </button>
                        )}
                        {step < STEPS.length - 1 ? (
                            <button
                                onClick={handleNext}
                                className="flex-1 py-2.5 rounded-lg bg-[#0078D4] text-white font-semibold text-sm hover:bg-[#005da6] transition flex items-center justify-center gap-2"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 py-2.5 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><CheckCircle2 size={16} /> Submit Request</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Transaction Item ──────────────────────────────────────────────────────────

const TxnItem = ({ txn }) => {
    const cfg = STATUS_CONFIG[txn.status] || STATUS_CONFIG.pending;
    const StatusIcon = cfg.icon;
    const isCredit = txn.type === 'topup' || txn.type === 'credit';

    return (
        <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#333] transition rounded-xl">
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${cfg.bg}`}>
                    {isCredit
                        ? <ArrowDownCircle size={20} className="text-green-500" />
                        : <ArrowUpCircle size={20} className="text-red-500" />
                    }
                </div>
                <div>
                    <p className="font-semibold text-[#323130] dark:text-white text-sm capitalize">
                        {txn.type?.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(txn.createdAt).toLocaleString('en-NP', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    {txn.referenceId && (
                        <p className="text-xs text-gray-400 font-mono">Ref: {txn.referenceId}</p>
                    )}
                </div>
            </div>
            <div className="text-right">
                <p className={`font-bold text-base ${isCredit ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                    {isCredit ? '+' : '-'}{formatNPR(txn.amount)}
                </p>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color} mt-1`}>
                    <StatusIcon size={11} />
                    {cfg.label}
                </span>
            </div>
        </div>
    );
};

// ─── Main Wallet Page ──────────────────────────────────────────────────────────

const WalletPage = () => {
    const [wallet, setWallet]   = useState(null);
    const [txns, setTxns]       = useState([]);
    const [loading, setLoading] = useState(true);
    const [txnLoading, setTxnLoading] = useState(true);
    const [showModal, setShowModal]   = useState(false);
    const [toast, setToast]   = useState('');

    // Generate a stable reference ID for this user session
    const referenceId = `ONS-${Date.now().toString(36).toUpperCase()}`;

    const fetchWallet = async () => {
        try {
            const { data } = await axios.get('/wallet');
            setWallet(data.data ?? data);
        } catch { /* handled silently */ } finally { setLoading(false); }
    };

    const fetchTxns = async () => {
        setTxnLoading(true);
        try {
            const { data } = await axios.get('/wallet/transactions');
            setTxns(data.data ?? data ?? []);
        } catch { setTxns([]); } finally { setTxnLoading(false); }
    };

    useEffect(() => { fetchWallet(); fetchTxns(); }, []);

    const handleSuccess = () => {
        fetchWallet();
        fetchTxns();
        setToast('Top-up request submitted! Your wallet will be credited after verification.');
        setTimeout(() => setToast(''), 5000);
    };

    return (
        <div className="max-w-2xl">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 animate-bounce">
                    <CheckCircle2 size={18} /> {toast}
                </div>
            )}

            {/* Page Title */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#323130] dark:text-white">My Wallet</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your balance and transactions</p>
                </div>
                <button
                    onClick={() => { fetchWallet(); fetchTxns(); }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-400 hover:text-[#0078D4]"
                    title="Refresh"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-[#0078D4] via-[#005da6] to-[#003a70] rounded-2xl p-7 mb-6 text-white shadow-lg relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/5 rounded-full" />
                <div className="absolute -bottom-10 -left-6 w-44 h-44 bg-white/5 rounded-full" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <Wallet size={18} className="text-white/70" />
                        <span className="text-white/70 text-sm font-medium">Available Balance</span>
                    </div>
                    {loading ? (
                        <div className="h-10 w-40 bg-white/20 animate-pulse rounded-lg mt-2" />
                    ) : (
                        <p className="text-4xl font-bold tracking-tight mt-1">
                            {formatNPR(wallet?.balance)}
                        </p>
                    )}
                    {wallet?.pendingTopup > 0 && (
                        <p className="text-sm text-amber-300 mt-2 flex items-center gap-1.5">
                            <Clock size={13} />
                            {formatNPR(wallet.pendingTopup)} pending verification
                        </p>
                    )}

                    <button
                        onClick={() => setShowModal(true)}
                        className="mt-6 flex items-center gap-2 bg-white text-[#0078D4] font-bold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition text-sm shadow-md"
                    >
                        <Plus size={18} /> Add Money
                    </button>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white dark:bg-[#2c2c2c] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="font-bold text-[#323130] dark:text-white text-lg">Transaction History</h2>
                    <span className="text-xs text-gray-400">{txns.length} records</span>
                </div>

                {txnLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="animate-spin text-[#0078D4]" size={32} />
                    </div>
                ) : txns.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700/50 px-2">
                        {txns.map(txn => <TxnItem key={txn._id} txn={txn} />)}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Wallet size={48} className="mx-auto text-gray-200 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 font-semibold">No transactions yet</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Add money to get started</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="mt-4 text-[#0078D4] hover:underline font-semibold text-sm flex items-center gap-1 mx-auto"
                        >
                            <Plus size={14} /> Add Money
                        </button>
                    </div>
                )}
            </div>

            <AddMoneyModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={handleSuccess}
                referenceId={referenceId}
            />
        </div>
    );
};

export default WalletPage;
