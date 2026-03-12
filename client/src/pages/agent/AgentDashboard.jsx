import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { UserCheck, Clock, CheckCircle, XCircle, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20', icon: Clock },
    under_review: { label: 'In Review', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', icon: Eye },
    approved: { label: 'Approved', color: 'text-green-600 bg-green-50 dark:bg-green-900/20', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'text-red-600 bg-red-50 dark:bg-red-900/20', icon: XCircle },
};

export default function AgentDashboard() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [stats, setStats] = useState({ pending: 0, under_review: 0, approved: 0, rejected: 0 });

    const fetchRecords = async (status) => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.get(`${API}/kyc/queue?status=${status}&limit=50`, { withCredentials: true });
            setRecords(data.records || []);
            // Fetch all-status counts for stats bar
            const allData = await axios.get(`${API}/kyc/admin/all`, { withCredentials: true });
            setStats(allData.data.stats || {});
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load KYC queue.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRecords(statusFilter); }, [statusFilter]);

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[#323130] dark:text-white flex items-center gap-2">
                            <UserCheck size={28} className="text-[#0078D4]" />
                            KYC Management
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and process identity verification requests.</p>
                    </div>
                    <button onClick={() => fetchRecords(statusFilter)} className="flex items-center gap-2 text-sm text-[#0078D4] hover:underline">
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <button
                            key={key}
                            onClick={() => setStatusFilter(key)}
                            className={`rounded-lg p-4 text-left transition-all border-2 ${statusFilter === key ? 'border-[#0078D4]' : 'border-transparent'} bg-white dark:bg-[#2c2c2c] shadow-sm`}
                        >
                            <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${cfg.color}`}>
                                <cfg.icon size={12} /> {cfg.label}
                            </div>
                            <div className="text-2xl font-bold text-[#323130] dark:text-white">{stats[key] ?? 0}</div>
                        </button>
                    ))}
                </div>

                {/* Filter bar */}
                <div className="flex gap-2 mb-4">
                    {['pending', 'under_review', 'approved', 'rejected', 'all'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${statusFilter === s ? 'bg-[#0078D4] text-white' : 'bg-white dark:bg-[#2c2c2c] text-[#323130] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3b3b3b]'}`}
                        >
                            {s.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg mb-4">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-16 text-gray-400">Loading KYC requests...</div>
                ) : records.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <UserCheck size={48} className="mx-auto mb-4 opacity-30" />
                        <p>No {statusFilter === 'all' ? '' : statusFilter} KYC requests.</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-[#1b1b1b] border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    {['User', 'Email', 'Submitted', 'Status', 'Reviewed By', ''].map(h => (
                                        <th key={h} className="px-4 py-3 text-left font-semibold text-[#323130] dark:text-gray-300">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {records.map(r => {
                                    const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                                    return (
                                        <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-[#3b3b3b] transition-colors">
                                            <td className="px-4 py-3 font-medium text-[#323130] dark:text-white">
                                                {r.user?.firstName || r.user?.username}
                                                {r.user?.lastName ? ` ${r.user.lastName}` : ''}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{r.user?.email || r.user?.phoneNumber}</td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                                {new Date(r.submittedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${cfg.color}`}>
                                                    <cfg.icon size={11} /> {cfg.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                                {r.agent ? `${r.agent.firstName || r.agent.username}` : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link
                                                    to={`/agent/kyc/${r._id}`}
                                                    className="inline-flex items-center gap-1 text-sm text-[#0078D4] hover:underline font-medium"
                                                >
                                                    <Eye size={14} /> Review
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
