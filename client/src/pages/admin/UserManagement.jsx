import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Trash2, Search, ChevronDown, ChevronUp,
    Download, ChevronLeft, ChevronRight, UserCheck, UserX, Users,
    Pencil, X, UserPlus, Loader2, Settings, User, Check
} from 'lucide-react';

/* ── constants ── */
const ROLES = ['all', 'user', 'member', 'saathi', 'agent', 'subAdmin', 'superAdmin', 'admin'];
const STATUSES = ['All', 'Active', 'Inactive'];
const PAGE_SIZES = [10, 25, 50, 100];
const COUNTRY_CODES = ['+91', '+977', '+1', '+44'];
const GENDERS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
];
const ROLE_VALUES = ROLES.filter(r => r !== 'all');

/* ── helpers ── */
const roleBadgeClass = (role) => {
    const map = {
        admin:      'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
        superAdmin: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
        subAdmin:   'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
        agent:      'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
        saathi:     'bg-teal-100  text-teal-700  dark:bg-teal-900/40  dark:text-teal-300',
        member:     'bg-cyan-100  text-cyan-700  dark:bg-cyan-900/40  dark:text-cyan-300',
        user:       'bg-blue-100  text-blue-700  dark:bg-blue-900/40  dark:text-blue-300',
    };
    return map[role] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
};

const avatarBg = (name = '') => {
    const palette = ['bg-blue-500','bg-purple-500','bg-green-500','bg-orange-500',
                     'bg-pink-500','bg-teal-500','bg-indigo-500','bg-red-500'];
    return palette[(name.charCodeAt(0) || 0) % palette.length];
};

const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
};

const formatDateTime = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const formatGender = (gender) => {
    if (!gender) return '—';
    const map = {
        male: 'Male',
        female: 'Female',
        other: 'Other',
        prefer_not_to_say: 'Prefer not to say'
    };
    return map[gender] || '—';
};

const parseFullName = (fullName = '') => {
    const tokens = String(fullName).trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) return { firstName: '', lastName: '' };
    return {
        firstName: tokens[0],
        lastName: tokens.slice(1).join(' ')
    };
};

const normalizeUser = (user) => ({
    ...user,
    phone: user?.phone || user?.phoneNumber || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    gender: user?.gender || '',
    dateOfBirth: user?.dateOfBirth || null,
    lastLogin: user?.lastLogin || null,
    city: user?.city || '',
    state: user?.state || '',
    parent: user?.parent || '',
    emailVerified: Boolean(user?.emailVerified)
});

const makeUsername = ({ firstName, lastName, email }) => {
    const emailBase = email ? email.split('@')[0] : '';
    const nameBase = [firstName, lastName].filter(Boolean).join('.');
    const base = (emailBase || nameBase || 'user').toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'user';
    return `${base}${Date.now().toString().slice(-5)}`;
};

const makeTempPassword = () => `Temp@${Math.random().toString(36).slice(-6)}1A`;

const exportCSV = (rows) => {
    if (!rows.length) return;
    const header = ['Created DateTime','Name','Phone Number','Email','Gender','Birthdate','Last Login','City','State','Parent'];
    const body = rows.map((u, i) => [
        formatDateTime(u.createdAt),
        `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || '—',
        u.phone || '—',
        u.email || '—',
        formatGender(u.gender),
        formatDate(u.dateOfBirth),
        formatDateTime(u.lastLogin),
        u.city || '—',
        u.state || '—',
        u.parent || '—'
    ].join(','));
    const blob = new Blob([[header.join(','), ...body].join('\n')], { type: 'text/csv' });
    const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob), download: 'users.csv'
    });
    a.click(); URL.revokeObjectURL(a.href);
};

/* ══════════════════════════════════════
   DEMO USERS (shown when API fails)
══════════════════════════════════════ */
const DEMO_NAMES = ['Aarav','Priya','Rohan','Sneha','Vikram','Ananya','Rahul','Pooja','Amit','Kavya'];
const DEMO = Array.from({ length: 120 }, (_, i) => ({
    _id: `d${i}`,
    username: `${DEMO_NAMES[i % 10]} ${i + 1}`,
    firstName: DEMO_NAMES[i % 10],
    lastName: `${i + 1}`,
    email: `user${i + 1}@example.com`,
    phone: `98${String(10000000 + i * 37).slice(0, 8)}`,
    role: ['user','member','saathi','agent','subAdmin','admin'][i % 6],
    gender: ['male', 'female', 'other'][i % 3],
    dateOfBirth: new Date(Date.now() - (20 + (i % 15)) * 365 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    city: ['Delhi', 'Kathmandu', 'Patna', 'Lucknow', 'Mumbai'][i % 5],
    state: ['Delhi', 'Bagmati', 'Bihar', 'Uttar Pradesh', 'Maharashtra'][i % 5],
    parent: `Parent ${((i % 8) + 1)}`,
    isActive: i % 7 !== 0,
    createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
}));

/* ══════════════════════════════════════
   SORT ICON
══════════════════════════════════════ */
const SortIcon = ({ active, dir }) => (
    <span className="ml-1 inline-flex flex-col leading-none">
        <ChevronUp   size={10} className={active && dir==='asc'  ? 'text-blue-600' : 'text-gray-300 dark:text-gray-600'} />
        <ChevronDown size={10} className={active && dir==='desc' ? 'text-blue-600' : 'text-gray-300 dark:text-gray-600'} />
    </span>
);

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function UserManagement() {
    const navigate = useNavigate();
    const [users,        setUsers]       = useState([]);
    const [loading,      setLoading]     = useState(true);
    const [isDemoMode,   setIsDemoMode]  = useState(false);
    const [search,       setSearch]      = useState('');
    const [status,       setStatus]      = useState('All');
    const [pageSize,     setPageSize]    = useState(50);
    const [page,         setPage]        = useState(1);
    const [sortField,    setSortField]   = useState('createdAt');
    const [sortDir,      setSortDir]     = useState('desc');
    const [collapsed,    setCollapsed]   = useState(false);
    const [deletingUser, setDeletingUser]= useState(null);
    const [viewingUser,  setViewingUser] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [creatingUser, setCreatingUser] = useState(false);
    const [addError, setAddError] = useState('');
    const [createdTempPassword, setCreatedTempPassword] = useState('');
    const [photoPreview, setPhotoPreview] = useState('');
    const [addForm, setAddForm] = useState({
        firstName: '',
        lastName: '',
        countryCode: '+91',
        phoneNumber: '',
        email: '',
        birthDate: '',
        gender: 'prefer_not_to_say',
        profilePhoto: null
    });

    /* ── fetch ── */
    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const res = await axios.get('/admin/users');
            const incoming = Array.isArray(res.data)
                ? res.data
                : (Array.isArray(res.data?.users) ? res.data.users : []);

            if (incoming.length > 0) {
                setUsers(incoming.map(normalizeUser));
                setIsDemoMode(false);
            } else {
                setUsers(DEMO.map(normalizeUser));
                setIsDemoMode(true);
            }
        } catch {
            setUsers(DEMO.map(normalizeUser));
            setIsDemoMode(true);
        } finally {
            setLoading(false);
        }
    };

    /* ── reset page on filter change ── */
    useEffect(() => { setPage(1); }, [search, status, pageSize]);

    /* ── delete ── */
    const confirmDelete = async () => {
        if (!deletingUser) return;
        try {
            await axios.delete(`/admin/users/${deletingUser._id}`);
            setUsers(p => p.filter(u => u._id !== deletingUser._id));
        } catch { alert('Failed to delete user'); }
        finally { setDeletingUser(null); }
    };

    /* ── role change ── */
    const changeRole = async (u, newRole) => {
        try {
            await axios.put(`/admin/users/${u._id}`, { role: newRole });
            setUsers(p => p.map(x => x._id === u._id ? { ...x, role: newRole } : x));
        } catch { alert('Failed to update role'); }
    };

    const openAddModal = () => {
        setAddError('');
        setCreatedTempPassword('');
        setPhotoPreview('');
        setAddForm({
            firstName: '',
            lastName: '',
            countryCode: '+91',
            phoneNumber: '',
            email: '',
            birthDate: '',
            gender: 'prefer_not_to_say',
            profilePhoto: null
        });
        setIsAddModalOpen(true);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0] || null;
        setAddForm(prev => ({ ...prev, profilePhoto: file }));
        if (!file) {
            setPhotoPreview('');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setPhotoPreview(String(reader.result || ''));
        reader.readAsDataURL(file);
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setAddError('');
        setCreatedTempPassword('');

        const firstName = addForm.firstName.trim();
        const lastName = addForm.lastName.trim();
        const email = addForm.email.trim().toLowerCase();
        const phoneCore = addForm.phoneNumber.trim();
        const phoneNumber = phoneCore ? `${addForm.countryCode}${phoneCore}` : '';
        const username = makeUsername({ firstName, lastName, email });
        const tempPassword = makeTempPassword();

        const payload = {
            username,
            email,
            phoneNumber,
            password: tempPassword,
            role: 'user',
            firstName,
            lastName,
            dateOfBirth: addForm.birthDate || undefined,
            gender: addForm.gender || 'prefer_not_to_say'
        };

        if (!firstName) {
            setAddError('First name is required.');
            return;
        }
        if (!lastName) {
            setAddError('Last name is required.');
            return;
        }
        if (!payload.email && !payload.phoneNumber) {
            setAddError('Provide at least email or phone number.');
            return;
        }

        setCreatingUser(true);
        try {
            if (isDemoMode) {
                const demoUser = normalizeUser({
                    _id: `local-${Date.now()}`,
                    username: payload.username,
                    firstName,
                    lastName,
                    email: payload.email || `${payload.username.toLowerCase().replace(/\s+/g, '')}@example.com`,
                    phone: payload.phoneNumber,
                    role: 'user',
                    isActive: true,
                    createdAt: new Date().toISOString()
                });
                setUsers(prev => [demoUser, ...prev]);
            } else {
                const res = await axios.post('/admin/users', payload);
                const created = normalizeUser(res.data?.user || res.data);
                setUsers(prev => [created, ...prev]);
            }

            setCreatedTempPassword(tempPassword);
            setIsAddModalOpen(false);
        } catch (error) {
            setAddError(error?.response?.data?.message || 'Failed to add user.');
        } finally {
            setCreatingUser(false);
        }
    };

    const updateUserRecord = async (userId, payload) => {
        if (isDemoMode) {
            setUsers(prev => prev.map(u => (u._id === userId ? normalizeUser({ ...u, ...payload }) : u)));
            return;
        }
        const res = await axios.put(`/admin/users/${userId}`, payload);
        const updated = normalizeUser(res.data || {});
        setUsers(prev => prev.map(u => (u._id === userId ? { ...u, ...updated } : u)));
    };

    const handleConfigureUserRole = async (u) => {
        const entered = window.prompt(`Enter role (${ROLE_VALUES.join(', ')})`, u.role || 'user');
        if (entered === null) return;
        const nextRole = entered.trim();
        if (!ROLE_VALUES.includes(nextRole)) {
            alert('Invalid role.');
            return;
        }
        await changeRole(u, nextRole);
    };

    const handleEditUser = async (u) => {
        const currentName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || '';
        const fullName = window.prompt('Enter full name', currentName);
        if (fullName === null) return;
        const email = window.prompt('Enter email', u.email || '');
        if (email === null) return;
        const phoneNumber = window.prompt('Enter phone number', u.phone || '');
        if (phoneNumber === null) return;

        const { firstName, lastName } = parseFullName(fullName);
        if (!firstName) {
            alert('First name is required.');
            return;
        }

        try {
            await updateUserRecord(u._id, {
                firstName,
                lastName,
                username: u.username,
                email: email.trim(),
                phoneNumber: phoneNumber.trim()
            });
        } catch {
            alert('Failed to edit user.');
        }
    };

    const handleToggleDeactivateUser = async (u) => {
        const nextActive = !(u.isActive !== false);
        const confirmed = window.confirm(nextActive ? 'Activate this user?' : 'Deactivate this user?');
        if (!confirmed) return;
        try {
            await updateUserRecord(u._id, { isActive: nextActive });
        } catch {
            alert('Failed to update user status.');
        }
    };

    const handleConvertToMember = async (u) => {
        if (u.role === 'member') return;
        const confirmed = window.confirm('Convert this user to member?');
        if (!confirmed) return;
        await changeRole(u, 'member');
    };

    const handleToggleEmailVerified = async (u) => {
        try {
            await updateUserRecord(u._id, { emailVerified: !u.emailVerified });
        } catch {
            alert('Failed to update email verification.');
        }
    };

    /* ── sort toggle ── */
    const toggleSort = (f) => {
        if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(f); setSortDir('asc'); }
    };

    /* ── filter + sort ── */
    const filtered = users.filter(u => {
        const t = search.toLowerCase();
         const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
         if (t && !(u.username||'').toLowerCase().includes(t)
             && !fullName.toLowerCase().includes(t)
               && !(u.email||'').toLowerCase().includes(t)
               && !(u.phone||'').includes(t)
               && !(u.city||'').toLowerCase().includes(t)
               && !(u.state||'').toLowerCase().includes(t)
               && !(u.parent||'').toLowerCase().includes(t)) return false;
        if (status === 'Active'   && u.isActive === false) return false;
        if (status === 'Inactive' && u.isActive !== false) return false;
        return true;
    });

    const sorted = [...filtered].sort((a, b) => {
        const isDateField = ['createdAt', 'dateOfBirth', 'lastLogin'].includes(sortField);
        const va = sortField === 'name'
            ? `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase()
            : isDateField
                ? new Date(a[sortField] || 0)
                : String(a[sortField] || '').toLowerCase();
        const vb = sortField === 'name'
            ? `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase()
            : isDateField
                ? new Date(b[sortField] || 0)
                : String(b[sortField] || '').toLowerCase();
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ?  1 : -1;
        return 0;
    });

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage   = Math.min(page, totalPages);
    const rows       = sorted.slice((safePage-1)*pageSize, safePage*pageSize);

    const total    = users.length;
    const active   = users.filter(u => u.isActive !== false).length;
    const inactive = users.filter(u => u.isActive === false).length;

    /* ── page numbers ── */
    const pageNums = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - safePage) <= 2) pageNums.push(i);
        else if (pageNums[pageNums.length-1] !== '…') pageNums.push('…');
    }

    /* ── LOADING ── */
    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading users…</p>
            </div>
        </div>
    );

    return (
        <div className="h-full min-h-0">
            <div className="bg-white dark:bg-[#2c2c2c] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 h-full min-h-0 flex flex-col">
                <div className="bg-white dark:bg-[#2c2c2c]">
                    {/* ── HEADER BAR ── */}
                    <div
                        className="flex items-center gap-3 px-5 py-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer select-none"
                        onClick={() => {
                            setCollapsed(c => {
                                const next = !c;
                                if (next) setIsAddModalOpen(false);
                                return next;
                            });
                        }}
                    >
                        <Users size={16} className="text-blue-600 flex-shrink-0" />
                        <span className="font-semibold text-sm text-gray-800 dark:text-white tracking-wide uppercase">
                            User List
                        </span>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} />
                    </div>

                    {!collapsed && (
                    <>
                    {/* ── CONTROLS ROW ── */}
                    <div className="flex flex-wrap items-end justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="inline-flex items-center gap-4 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#303030] px-3 py-2">
                            <span className="flex items-center gap-1.5 text-sm font-bold text-blue-700 dark:text-blue-300">
                                <Users size={15} /> {total.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1.5 text-sm font-bold text-green-600 dark:text-green-400">
                                <UserCheck size={15} /> {active.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1.5 text-sm font-bold text-red-500 dark:text-red-400">
                                <UserX size={15} /> {inactive.toLocaleString()}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-end justify-end gap-3 ml-auto">
                            {/* Date placeholder */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Created Date</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        readOnly
                                        placeholder="Select Date Range"
                                        className="pl-3 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 w-52 cursor-default"
                                    />
                                    <X size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Status</label>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                    className="py-2 pl-3 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 w-28 cursor-pointer"
                                >
                                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>

                            {/* Add User */}
                            <button
                                onClick={() => navigate('/dashboard/admin/users/add')}
                                title="Add user"
                                aria-label="Add user"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 text-white transition-colors shadow-sm hover:bg-blue-700"
                            >
                                <UserPlus size={18} />
                            </button>
                        </div>
                    </div>
                    </>
                    )}
                </div>

                {!collapsed && (
                <>
                    {createdTempPassword && (
                        <div className="mx-5 mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300">
                            User created successfully. Temporary password: <span className="font-semibold">{createdTempPassword}</span>
                        </div>
                    )}

                    {isAddModalOpen && (
                        <div className="m-5 mt-4 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2c2c2c] p-4 sm:p-5">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h3 className="text-lg font-semibold tracking-wide text-blue-600 uppercase">Add User</h3>
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    title="Close form"
                                    aria-label="Close form"
                                    className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-[#2f2f2f] dark:text-gray-200"
                                >
                                    <X size={14} />
                                    Close Form
                                </button>
                            </div>

                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">First Name</label>
                                        <input
                                            type="text"
                                            value={addForm.firstName}
                                            onChange={(e) => setAddForm(prev => ({ ...prev, firstName: e.target.value }))}
                                            placeholder="Enter First Name"
                                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3b3b3b] px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Lastname</label>
                                        <input
                                            type="text"
                                            value={addForm.lastName}
                                            onChange={(e) => setAddForm(prev => ({ ...prev, lastName: e.target.value }))}
                                            placeholder="Enter Last Name"
                                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3b3b3b] px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Phone No</label>
                                        <div className="flex gap-0">
                                            <select
                                                value={addForm.countryCode}
                                                onChange={(e) => setAddForm(prev => ({ ...prev, countryCode: e.target.value }))}
                                                className="w-28 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3b3b3b] px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                                            >
                                                {COUNTRY_CODES.map(code => (
                                                    <option key={code} value={code}>{code}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="text"
                                                value={addForm.phoneNumber}
                                                onChange={(e) => setAddForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                                placeholder="Enter PhoneNo"
                                                className="flex-1 rounded-r-md border-y border-r border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3b3b3b] px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={addForm.email}
                                            onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                                            placeholder="Enter Email"
                                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3b3b3b] px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">BirthDate</label>
                                        <input
                                            type="date"
                                            value={addForm.birthDate}
                                            onChange={(e) => setAddForm(prev => ({ ...prev, birthDate: e.target.value }))}
                                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3b3b3b] px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Gender</label>
                                        <select
                                            value={addForm.gender}
                                            onChange={(e) => setAddForm(prev => ({ ...prev, gender: e.target.value }))}
                                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3b3b3b] px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                                        >
                                            {GENDERS.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Profile Photo</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3b3b3b] text-sm text-gray-700 dark:text-gray-200 file:mr-3 file:border-0 file:bg-gray-100 dark:file:bg-[#444] file:px-3 file:py-2"
                                        />
                                        <div className="mt-3 h-36 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-[#303030]">
                                            {photoPreview ? (
                                                <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">No photo uploaded</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {addError && (
                                    <p className="text-xs text-red-600 dark:text-red-400">{addError}</p>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={creatingUser}
                                        className="inline-flex items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 px-5 py-2 text-sm font-medium text-white transition-colors disabled:opacity-60"
                                    >
                                        {creatingUser && <Loader2 size={14} className="animate-spin" />}
                                        Register
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </>
                )}

                {!isAddModalOpen && (
                <div className="flex flex-1 min-h-0 flex-col">
                    {/* ── TABLE TOOLBAR ── */}
                    <div className="flex flex-wrap items-center gap-3 px-5 py-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
                        <select
                            value={pageSize}
                            onChange={e => setPageSize(Number(e.target.value))}
                            className="border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-2.5 bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                            {PAGE_SIZES.map(n => <option key={n}>{n}</option>)}
                        </select>
                        <span className="text-sm text-gray-600 dark:text-gray-400">entries</span>

                        <div className="flex-1" />

                        <button
                            onClick={() => exportCSV(sorted)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm"
                        >
                            <Download size={14} /> Export to Excel
                        </button>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-3 pr-9 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 w-44"
                            />
                            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* ── TABLE (body scroll only) ── */}
                    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto hide-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-gray-50 dark:bg-black/10 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    <th className="px-4 py-3 font-semibold whitespace-nowrap">&nbsp;</th>
                                    <th className="px-4 py-3 font-semibold cursor-pointer whitespace-nowrap" onClick={() => toggleSort('createdAt')}>
                                        <span className="flex items-center">Created DateTime <SortIcon active={sortField==='createdAt'} dir={sortDir}/></span>
                                    </th>
                                    <th className="px-4 py-3 font-semibold cursor-pointer whitespace-nowrap" onClick={() => toggleSort('name')}>
                                        <span className="flex items-center">Name <SortIcon active={sortField==='name'} dir={sortDir}/></span>
                                    </th>
                                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Phone Number</th>
                                    <th className="px-4 py-3 font-semibold cursor-pointer whitespace-nowrap" onClick={() => toggleSort('email')}>
                                        <span className="flex items-center">Email <SortIcon active={sortField==='email'} dir={sortDir}/></span>
                                    </th>
                                    <th className="px-4 py-3 font-semibold cursor-pointer whitespace-nowrap" onClick={() => toggleSort('gender')}>
                                        <span className="flex items-center">Gender <SortIcon active={sortField==='gender'} dir={sortDir}/></span>
                                    </th>
                                    <th className="px-4 py-3 font-semibold cursor-pointer whitespace-nowrap" onClick={() => toggleSort('dateOfBirth')}>
                                        <span className="flex items-center">Birthdate <SortIcon active={sortField==='dateOfBirth'} dir={sortDir}/></span>
                                    </th>
                                    <th className="px-4 py-3 font-semibold cursor-pointer whitespace-nowrap" onClick={() => toggleSort('lastLogin')}>
                                        <span className="flex items-center">Last Login <SortIcon active={sortField==='lastLogin'} dir={sortDir}/></span>
                                    </th>
                                    <th className="px-4 py-3 font-semibold cursor-pointer whitespace-nowrap" onClick={() => toggleSort('city')}>
                                        <span className="flex items-center">City <SortIcon active={sortField==='city'} dir={sortDir}/></span>
                                    </th>
                                    <th className="px-4 py-3 font-semibold cursor-pointer whitespace-nowrap" onClick={() => toggleSort('state')}>
                                        <span className="flex items-center">State <SortIcon active={sortField==='state'} dir={sortDir}/></span>
                                    </th>
                                    <th className="px-4 py-3 font-semibold cursor-pointer whitespace-nowrap" onClick={() => toggleSort('parent')}>
                                        <span className="flex items-center">Parent <SortIcon active={sortField==='parent'} dir={sortDir}/></span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="py-16 text-center text-gray-400 dark:text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Users size={40} strokeWidth={1} />
                                                <p className="text-sm">No users found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : rows.map((u, i) => {
                                    const displayName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username;
                                    return (
                                    <tr key={u._id} className="hover:bg-blue-50/30 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    title="Configure user role"
                                                    onClick={() => handleConfigureUserRole(u)}
                                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                >
                                                    <Settings size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="View user"
                                                    onClick={() => setViewingUser(u)}
                                                    className="text-orange-500 hover:text-orange-600"
                                                >
                                                    <User size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Edit user"
                                                    onClick={() => handleEditUser(u)}
                                                    className="text-green-600 hover:text-green-700"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    title={u.isActive !== false ? 'Deactivate user' : 'Activate user'}
                                                    onClick={() => handleToggleDeactivateUser(u)}
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    <UserX size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Convert to member"
                                                    onClick={() => handleConvertToMember(u)}
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <UserCheck size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    title={u.emailVerified ? 'Email verified' : 'Mark email verified'}
                                                    onClick={() => handleToggleEmailVerified(u)}
                                                    className={u.emailVerified ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}
                                                >
                                                    <Check size={15} />
                                                </button>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                                            {formatDateTime(u.createdAt)}
                                        </td>

                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-8 h-8 rounded-full ${avatarBg(displayName)} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                                                    {(displayName || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{displayName}</span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                            {u.phone || <span className="text-gray-300 dark:text-gray-600">—</span>}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[280px] truncate">
                                            {u.email || <span className="text-gray-300 dark:text-gray-600">—</span>}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                            {formatGender(u.gender)}
                                        </td>

                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                                            {formatDate(u.dateOfBirth)}
                                        </td>

                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                                            {formatDateTime(u.lastLogin)}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                            {u.city || <span className="text-gray-300 dark:text-gray-600">—</span>}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                            {u.state || <span className="text-gray-300 dark:text-gray-600">—</span>}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                            {u.parent || <span className="text-gray-300 dark:text-gray-600">—</span>}
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* ── PAGINATION ── */}
                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-black/10">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Showing{' '}
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {sorted.length === 0 ? 0 : (safePage-1)*pageSize + 1}
                            </span>–<span className="font-semibold text-gray-700 dark:text-gray-300">
                                {Math.min(safePage*pageSize, sorted.length)}
                            </span>{' '}of{' '}
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{sorted.length}</span> users
                        </p>

                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(1)} disabled={safePage===1}
                                className="px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">«</button>
                            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={safePage===1}
                                className="p-1.5 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <ChevronLeft size={14} /></button>

                            {pageNums.map((n, i) =>
                                n === '…'
                                    ? <span key={`e${i}`} className="px-2 text-gray-400 text-xs">…</span>
                                    : <button key={n} onClick={() => setPage(n)}
                                        className={`min-w-[30px] py-1.5 text-xs rounded border transition-colors ${safePage===n ? 'bg-blue-600 border-blue-600 text-white font-semibold' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                                        {n}
                                      </button>
                            )}

                            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={safePage===totalPages}
                                className="p-1.5 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <ChevronRight size={14} /></button>
                            <button onClick={() => setPage(totalPages)} disabled={safePage===totalPages}
                                className="px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">»</button>
                        </div>
                    </div>
                </div>
                )}
            </div>

            {/* ══ DELETE MODAL ══ */}
            {deletingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <Trash2 size={20} className="text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Delete User</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">This cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
                            Delete <span className="font-semibold text-gray-900 dark:text-white">{deletingUser.username}</span>?
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeletingUser(null)}
                                className="flex-1 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#3b3b3b] font-medium transition-colors">
                                Cancel
                            </button>
                            <button onClick={confirmDelete}
                                className="flex-1 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ VIEW MODAL ══ */}
            {viewingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-2xl w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white">User Details</h3>
                            <button onClick={() => setViewingUser(null)}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3b3b3b] text-gray-400">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-14 h-14 rounded-full ${avatarBg(viewingUser.username)} text-white flex items-center justify-center text-xl font-bold`}>
                                    {(viewingUser.username||'?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{viewingUser.username}</p>
                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${roleBadgeClass(viewingUser.role)}`}>
                                        {viewingUser.role}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { label: 'Email',   value: viewingUser.email },
                                    { label: 'Phone',   value: viewingUser.phone || '—' },
                                    { label: 'Status',  value: viewingUser.isActive !== false ? 'Active' : 'Inactive' },
                                    { label: 'Joined',  value: formatDate(viewingUser.createdAt) },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">{label}</span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <button onClick={() => setViewingUser(null)}
                                className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
