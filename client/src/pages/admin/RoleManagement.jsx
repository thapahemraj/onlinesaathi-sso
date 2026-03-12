import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Shield, CheckCircle, AlertCircle, ChevronDown, Search } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ROLES = ['user', 'member', 'saathi', 'agent', 'supportTeam', 'subAdmin', 'superAdmin'];

const ROLE_COLORS = {
    user: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    member: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    saathi: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    agent: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    supportTeam: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    subAdmin: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    superAdmin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const ROLE_LEVELS = { user: 10, member: 15, saathi: 20, agent: 30, supportTeam: 40, subAdmin: 70, superAdmin: 100, admin: 100 };

export default function RoleManagement() {
    const { user: me } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [assigningId, setAssigningId] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: 200 });
            if (filterRole !== 'all') params.set('role', filterRole);
            const { data } = await axios.get(`${API}/admin/users/by-role?${params}`, { withCredentials: true });
            setUsers(data.users || []);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, [filterRole]);

    const assignRole = async (userId, newRole) => {
        if (!window.confirm(`Change this user's role to "${newRole}"?`)) return;
        setAssigningId(userId);
        setError('');
        setSuccess('');
        try {
            await axios.put(`${API}/admin/users/${userId}/role`, { role: newRole }, { withCredentials: true });
            setSuccess(`Role updated to "${newRole}" successfully.`);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to assign role.');
        } finally {
            setAssigningId(null);
        }
    };

    const myLevel = ROLE_LEVELS[me?.role] || 0;

    // Roles this admin can assign to others
    const assignableRoles = ROLES.filter(r => {
        if (['superAdmin', 'admin'].includes(me?.role)) return true; // superAdmin can assign anything
        return ROLE_LEVELS[r] < myLevel;  // subAdmin can assign roles below their level
    });

    const filteredUsers = users.filter(u => {
        if (!search) return true;
        return (
            u.username?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.firstName?.toLowerCase().includes(search.toLowerCase())
        );
    });

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-[#323130] dark:text-white flex items-center gap-2">
                        <Shield size={26} className="text-[#0078D4]" />
                        Role Management
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Assign and manage user roles. Your level: <strong className="capitalize">{me?.role}</strong>.
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 rounded-lg mb-4 text-sm">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 rounded-lg mb-4 text-sm">
                        <CheckCircle size={16} /> {success}
                    </div>
                )}

                {/* Role Legend */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {ROLES.map(r => (
                        <span key={r} className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${ROLE_COLORS[r] || ''}`}>{r}</span>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search users..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2c2c2c] text-sm text-[#323130] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
                        />
                    </div>
                    <div className="relative">
                        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                            className="px-4 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2c2c2c] text-sm text-[#323130] dark:text-white focus:outline-none appearance-none cursor-pointer">
                            <option value="all">All Roles</option>
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-16 text-gray-400">Loading users...</div>
                ) : (
                    <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-[#1b1b1b] border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    {['User', 'Email / Phone', 'Current Role', 'KYC', 'Assigned', 'Assign Role'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredUsers.length === 0 ? (
                                    <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No users found.</td></tr>
                                ) : filteredUsers.map(u => {
                                    const isMe = u._id === me?._id;
                                    const targetLevel = ROLE_LEVELS[u.role] || 0;
                                    const canModify = !isMe && (
                                        ['superAdmin', 'admin'].includes(me?.role) ||
                                        (targetLevel < myLevel && !['superAdmin', 'admin'].includes(u.role))
                                    );

                                    return (
                                        <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-[#3b3b3b]">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-[#323130] dark:text-white">{u.username}</p>
                                                    <p className="text-xs text-gray-400">{u.firstName} {u.lastName}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                                                {u.email || u.phoneNumber || '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${ROLE_COLORS[u.role] || ''}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs capitalize text-gray-500">{u.kycStatus?.replace('_', ' ') || '—'}</span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-400">
                                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isMe ? (
                                                    <span className="text-xs text-gray-400 italic">You</span>
                                                ) : canModify ? (
                                                    <div className="relative inline-block">
                                                        <select
                                                            value=""
                                                            onChange={e => assignRole(u._id, e.target.value)}
                                                            disabled={assigningId === u._id}
                                                            className="pl-2 pr-7 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1b1b1b] text-xs text-[#323130] dark:text-white focus:outline-none appearance-none cursor-pointer disabled:opacity-60"
                                                        >
                                                            <option value="" disabled>Change role...</option>
                                                            {assignableRoles.filter(r => r !== u.role).map(r => (
                                                                <option key={r} value={r}>{r}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                                                )}
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
