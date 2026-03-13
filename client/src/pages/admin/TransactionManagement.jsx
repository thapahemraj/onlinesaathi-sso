import { useState, useEffect } from 'react';
import { 
    CheckCircle2, 
    XCircle, 
    Clock, 
    ExternalLink, 
    MoreVertical, 
    Search, 
    Filter,
    Loader2,
    Building2,
    Eye,
    Hash,
    Wallet
} from 'lucide-react';
import axios from 'axios';

const formatNPR = (amount) =>
    new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', minimumFractionDigits: 2 }).format(amount ?? 0);

const TransactionManagement = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [search, setSearch] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [selectedTxn, setSelectedTxn] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);

    const fetchPendingTransactions = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/admin/transactions/pending');
            setTransactions(data);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingTransactions();
    }, []);

    const handleApprove = async (id) => {
        if (!window.confirm('Are you sure you want to approve this transaction and credit the wallet?')) return;
        setActionLoading(id);
        try {
            await axios.put(`/admin/transactions/${id}/approve`);
            setTransactions(prev => prev.filter(t => t._id !== id));
            alert('Transaction approved successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to approve');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        setActionLoading(selectedTxn._id);
        try {
            await axios.put(`/admin/transactions/${selectedTxn._id}/reject`, { reason: rejectReason });
            setTransactions(prev => prev.filter(t => t._id !== selectedTxn._id));
            setShowRejectModal(false);
            setRejectReason('');
            alert('Transaction rejected');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to reject');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredTxns = transactions.filter(t => 
        t.referenceId?.toLowerCase().includes(search.toLowerCase()) ||
        t.organization?.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#323130] dark:text-white flex items-center gap-2">
                    <Wallet className="text-[#0078D4]" /> Wallet Top-up Approvals
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Review and approve pending balance top-up requests</p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by Reference ID or Org Name..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#2c2c2c] text-sm focus:border-[#0078D4] focus:outline-none transition"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition">
                    <Filter size={16} /> Filters
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-[#0078D4]" size={32} />
                    </div>
                ) : filteredTxns.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-[#333] border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-4">Organization</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Details</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredTxns.map((txn) => (
                                    <tr key={txn._id} className="hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                    <Building2 size={20} className="text-[#0078D4]" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-[#323130] dark:text-white text-sm">{txn.organization?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-400"># {txn.organization?._id?.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-green-600 dark:text-green-400 text-sm">{formatNPR(txn.amount)}</p>
                                            <p className="text-xs text-gray-400">Method: {txn.category}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Hash size={12} /> Ref: {txn.referenceId}
                                                </p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Filter size={12} /> Voucher: {txn.metadata?.bankVoucherNumber || 'N/A'}
                                                </p>
                                                {txn.metadata?.screenshotUrl && (
                                                    <a href={txn.metadata.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs flex items-center gap-1">
                                                        <Eye size={12} /> View Receipt
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {new Date(txn.createdAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleApprove(txn._id)}
                                                    disabled={actionLoading === txn._id}
                                                    className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 transition rounded-lg"
                                                    title="Approve"
                                                >
                                                    {actionLoading === txn._id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                                </button>
                                                <button 
                                                    onClick={() => { setSelectedTxn(txn); setShowRejectModal(true); }}
                                                    disabled={actionLoading === txn._id}
                                                    className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 transition rounded-lg"
                                                    title="Reject"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Clock size={48} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 font-semibold">No pending top-up requests</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">When users request a top-up, they will appear here.</p>
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-xl w-full max-w-md p-6 animate-scale-in">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-[#323130] dark:text-white">Reject Transaction</h3>
                            <button onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-600 rounded-full transition"><Clock size={20} className="rotate-45" /></button>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Please provide a reason for rejecting the request from {selectedTxn?.organization?.name}.</p>
                            <textarea 
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#3b3b3b] text-sm focus:border-[#0078D4] focus:outline-none h-24"
                                placeholder="e.g. Invalid voucher number, payment not received"
                            ></textarea>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleReject}
                                disabled={actionLoading}
                                className="flex-1 py-2 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition flex items-center justify-center"
                            >
                                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : 'Reject Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionManagement;
