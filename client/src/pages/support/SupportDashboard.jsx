import { useState } from 'react';
import axios from 'axios';
import { Search, User, Shield, Phone, Mail, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_ORIGIN = API.replace(/\/api\/?$/, '');

const KYC_BADGE = {
    not_submitted: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    pending: 'bg-yellow-100 text-yellow-700',
    under_review: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

export default function SupportDashboard() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        setError('');
        setResults([]);
        setSelectedUser(null);
        setSearched(true);
        try {
            const { data } = await axios.get(`${API}/admin/users/lookup?q=${encodeURIComponent(query.trim())}`, { withCredentials: true });
            setResults(data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Search failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-[#323130] dark:text-white flex items-center gap-2">
                        <Shield size={26} className="text-[#0078D4]" />
                        Support Centre
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Look up user accounts to assist with support requests. Read-only access.
                    </p>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search by username, email or phone..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2c2c2c] text-[#323130] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
                        />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-[#0078D4] text-white rounded-lg text-sm font-medium hover:bg-[#006cbd] transition-colors">
                        Search
                    </button>
                </form>

                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 rounded-lg mb-4 text-sm">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {!selectedUser ? (
                    <>
                        {loading && <div className="text-center py-8 text-gray-400">Searching...</div>}
                        {searched && !loading && results.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                                <User size={40} className="mx-auto mb-3 opacity-30" />
                                <p>No users found for "{query}"</p>
                            </div>
                        )}
                        {results.length > 0 && (
                            <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-[#1b1b1b] border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            {['User', 'Contact', 'Role', 'KYC', 'Last Login', ''].map(h => (
                                                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {results.map(u => (
                                            <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-[#3b3b3b]">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        {u.profilePicture ? (
                                                            <img src={`${API_ORIGIN}${u.profilePicture.startsWith('/') ? u.profilePicture : ''}`} className="w-7 h-7 rounded-full" alt="" />
                                                        ) : (
                                                            <div className="w-7 h-7 rounded-full bg-[#0078D4]/20 flex items-center justify-center text-xs font-bold text-[#0078D4]">
                                                                {u.username?.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-[#323130] dark:text-white">{u.username}</p>
                                                            <p className="text-xs text-gray-400">{u.firstName} {u.lastName}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                                    <div className="flex flex-col gap-0.5">
                                                        {u.email && <span className="flex items-center gap-1"><Mail size={11} /> {u.email}</span>}
                                                        {u.phoneNumber && <span className="flex items-center gap-1"><Phone size={11} /> {u.phoneNumber}</span>}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs capitalize bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-full">{u.role}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {u.kycStatus && (
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${KYC_BADGE[u.kycStatus] || ''}`}>
                                                            {u.kycStatus.replace('_', ' ')}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-400">
                                                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button onClick={() => setSelectedUser(u)} className="text-xs text-[#0078D4] hover:underline font-medium">
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                ) : (
                    /* User Detail View */
                    <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm p-6">
                        <button onClick={() => setSelectedUser(null)} className="text-sm text-[#0078D4] hover:underline mb-4 flex items-center gap-1">
                            ← Back to results
                        </button>
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-[#0078D4]/10 flex items-center justify-center text-xl font-bold text-[#0078D4]">
                                {selectedUser.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[#323130] dark:text-white">{selectedUser.firstName || ''} {selectedUser.lastName || selectedUser.username}</h2>
                                <p className="text-sm text-gray-500">@{selectedUser.username}</p>
                                <span className={`text-xs capitalize px-2 py-0.5 rounded-full mt-1 inline-block ${KYC_BADGE[selectedUser.kycStatus] || 'bg-gray-100 text-gray-600'}`}>
                                    KYC: {selectedUser.kycStatus?.replace('_', ' ') || 'N/A'}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {[
                                { label: 'Email', value: selectedUser.email || '—' },
                                { label: 'Phone', value: selectedUser.phoneNumber || '—' },
                                { label: 'Role', value: selectedUser.role || '—' },
                                { label: 'Country', value: selectedUser.country || '—' },
                                { label: 'Member since', value: selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : '—' },
                                { label: 'Last Login', value: selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'Never' },
                                { label: '2FA Enabled', value: selectedUser.twoFactorEnabled ? 'Yes' : 'No' },
                                { label: 'Provider', value: selectedUser.provider || 'local' },
                            ].map(({ label, value }) => (
                                <div key={label} className="bg-gray-50 dark:bg-[#1b1b1b] rounded-lg p-3">
                                    <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">{label}</p>
                                    <p className="font-medium text-[#323130] dark:text-white capitalize">{value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg text-xs text-yellow-700 dark:text-yellow-400">
                            ⚠ Support team view is read-only. Contact a Sub Admin to make changes to this account.
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
