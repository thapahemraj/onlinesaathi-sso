import { useState, useEffect } from 'react';
import { Plus, CreditCard, Trash2, Star, Loader2, X, Wallet } from 'lucide-react';
import axios from 'axios';

const AddPaymentModal = ({ isOpen, onClose, onAdded }) => {
    const [form, setForm] = useState({ type: 'card', label: '', last4: '', cardBrand: 'Visa', expiryMonth: '', expiryYear: '', isDefault: false });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...form };
            if (form.type === 'card') {
                payload.label = `${form.cardBrand} ending in ${form.last4}`;
            }
            await axios.post('/profile/payments', payload);
            onAdded();
            onClose();
            setForm({ type: 'card', label: '', last4: '', cardBrand: 'Visa', expiryMonth: '', expiryYear: '', isDefault: false });
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-[#323130] dark:text-white focus:border-[#0067b8] focus:outline-none text-sm";

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#323130] dark:text-white">Add payment method</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} className="text-gray-500" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Type</label>
                        <select className={inputClass} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                            <option value="card">Credit/Debit Card</option>
                            <option value="upi">UPI</option>
                            <option value="wallet">Digital Wallet</option>
                        </select>
                    </div>
                    {form.type === 'card' ? (
                        <>
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Card brand</label>
                                <select className={inputClass} value={form.cardBrand} onChange={e => setForm({ ...form, cardBrand: e.target.value })}>
                                    <option value="Visa">Visa</option>
                                    <option value="Mastercard">Mastercard</option>
                                    <option value="Amex">American Express</option>
                                    <option value="RuPay">RuPay</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Last 4 digits</label>
                                <input className={inputClass} maxLength={4} placeholder="1234" value={form.last4} onChange={e => setForm({ ...form, last4: e.target.value.replace(/\D/g, '') })} required />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Expiry month</label>
                                    <select className={inputClass} value={form.expiryMonth} onChange={e => setForm({ ...form, expiryMonth: e.target.value })} required>
                                        <option value="">Month</option>
                                        {[...Array(12)].map((_, i) => <option key={i} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Expiry year</label>
                                    <select className={inputClass} value={form.expiryYear} onChange={e => setForm({ ...form, expiryYear: e.target.value })} required>
                                        <option value="">Year</option>
                                        {[...Array(10)].map((_, i) => <option key={i} value={2024 + i}>{2024 + i}</option>)}
                                    </select>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">{form.type === 'upi' ? 'UPI ID' : 'Wallet name'}</label>
                            <input className={inputClass} placeholder={form.type === 'upi' ? 'yourname@upi' : 'e.g. PayTM, Google Pay'} value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} required />
                        </div>
                    )}
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} className="rounded" />
                        Set as default payment method
                    </label>
                    <button type="submit" disabled={loading} className="w-full bg-[#0067b8] text-white py-2.5 rounded-md font-semibold hover:bg-[#005da6] transition-colors text-sm">
                        {loading ? 'Adding...' : 'Add payment method'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const PaymentOptions = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [deleting, setDeleting] = useState(null);

    const fetchPayments = async () => {
        try {
            const { data } = await axios.get('/profile/payments');
            setPayments(data);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPayments(); }, []);

    const handleDelete = async (id) => {
        setDeleting(id);
        try {
            await axios.delete(`/profile/payments/${id}`);
            setPayments(prev => prev.filter(p => p._id !== id));
        } catch (error) {
            console.error('Failed to delete:', error);
        } finally {
            setDeleting(null);
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await axios.put(`/profile/payments/${id}/default`);
            fetchPayments();
        } catch (error) {
            console.error('Failed to set default:', error);
        }
    };

    const getIcon = (type) => {
        if (type === 'card') return CreditCard;
        return Wallet;
    };

    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-[#323130] dark:text-white">Payment options</h1>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#0067b8] text-white px-4 py-2 rounded-md hover:bg-[#005da6] transition-colors text-sm font-semibold">
                    <Plus size={16} /> Add new
                </button>
            </div>

            <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="animate-spin text-[#0078D4]" size={32} />
                    </div>
                ) : payments.length > 0 ? (
                    payments.map(pm => {
                        const Icon = getIcon(pm.type);
                        return (
                            <div key={pm._id} className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-[#333] transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                        <Icon size={24} className="text-[#323130] dark:text-gray-300" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-[#323130] dark:text-white flex items-center gap-2">
                                            {pm.label}
                                            {pm.isDefault && <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-[#0078D4] dark:text-[#4f93ce] rounded-full">Default</span>}
                                        </div>
                                        {pm.type === 'card' && pm.expiryMonth && (
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Expires {String(pm.expiryMonth).padStart(2, '0')}/{pm.expiryYear}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {!pm.isDefault && (
                                        <button onClick={() => handleSetDefault(pm._id)} className="text-[#0067b8] dark:text-[#4f93ce] hover:underline text-sm font-semibold flex items-center gap-1">
                                            <Star size={14} /> Set default
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(pm._id)} disabled={deleting === pm._id} className="text-red-500 hover:text-red-700 dark:text-red-400 text-sm font-semibold flex items-center gap-1">
                                        {deleting === pm._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Remove
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-16">
                        <CreditCard size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No payment methods</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Add a payment method to get started</p>
                        <button onClick={() => setShowModal(true)} className="mt-4 text-[#0067b8] dark:text-[#4f93ce] hover:underline font-semibold text-sm">+ Add payment method</button>
                    </div>
                )}
            </div>

            <AddPaymentModal isOpen={showModal} onClose={() => setShowModal(false)} onAdded={fetchPayments} />
        </div>
    );
};

export default PaymentOptions;
