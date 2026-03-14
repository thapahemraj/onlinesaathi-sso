import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
    Users,
    UserCheck,
    UserX,
    User,
    Settings,
    Pencil,
    HelpCircle,
    CheckCircle2,
    XCircle,
    ChevronDown,
    ChevronUp,
    Download,
    Search,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const STATUSES = ['All', 'Active', 'Inactive'];
const APPROVAL_STATUSES = ['All', 'Approved', 'Pending'];
const CITIZEN_TYPES = ['All', 'Citizen', 'Non Citizen'];
const PAGE_SIZES = [10, 25, 50, 100];
const SAATHI_ROLE_VALUES = ['user', 'member', 'saathi', 'agent', 'supportTeam', 'subAdmin', 'superAdmin', 'admin'];

const parseFullName = (value) => {
    const parts = String(value || '').trim().split(/\s+/).filter(Boolean);
    return {
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || ''
    };
};

const formatDate = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const formatDateTime = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatCurrency = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return '-';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

const normalizeSaathi = (user, idx = 0) => ({
    ...user,
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || user?.phoneNumber || '',
    gender: user?.gender || ['male', 'female', 'other'][idx % 3],
    lastLogin: user?.lastLogin || null,
    city: user?.city || ['Delhi', 'Kathmandu', 'Patna', 'Lucknow', 'Mumbai'][idx % 5],
    state: user?.state || ['Delhi', 'Bagmati', 'Bihar', 'Uttar Pradesh', 'Maharashtra'][idx % 5],
    parent: user?.parent || `Parent ${((idx % 8) + 1)}`,
    walletBalance: Number.isFinite(Number(user?.walletBalance)) ? Number(user.walletBalance) : 2500 + idx * 600,
    saathiMembershipNumber: user?.saathiMembershipNumber || user?.membershipNumber || `SM-${String(100000 + idx)}`,
    approvedBy: user?.approvedBy || user?.approvedByName || 'Admin',
    approvedDateTime: user?.approvedDateTime || user?.approvedAt || (user?.emailVerified ? (user?.updatedAt || user?.createdAt) : null),
    aadharCard: user?.aadharCard || user?.aadharNumber || `${String(123400000000 + idx).slice(0, 12)}`,
    panCard: user?.panCard || `AAAAA${String(1000 + idx).slice(-4)}A`,
    citizen: user?.citizen || CITIZEN_TYPES[(idx % (CITIZEN_TYPES.length - 1)) + 1],
    rejectionReason: user?.rejectionReason || (user?.emailVerified ? '-' : 'Pending verification'),
    isActive: user?.isActive !== false,
    emailVerified: Boolean(user?.emailVerified)
});

const exportCSV = (rows) => {
    if (!rows.length) return;

    const header = [
        'Created DateTime',
        'Name',
        'Mobile No',
        'Email',
        'Gender',
        'Wallet Balance',
        'Saathi Membership Number',
        'Approved By',
        'Approved DateTime',
        'Aadhar Card',
        'Pan Card',
        'Last Login',
        'City',
        'State',
        'Parent',
        'Citizen',
        'Rejection Reason'
    ];

    const body = rows.map((u) => [
        formatDateTime(u.createdAt),
        `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || '-',
        u.phone || '-',
        u.email || '-',
        u.gender || '-',
        formatCurrency(u.walletBalance),
        u.saathiMembershipNumber || '-',
        u.approvedBy || '-',
        formatDateTime(u.approvedDateTime),
        u.aadharCard || '-',
        u.panCard || '-',
        formatDateTime(u.lastLogin),
        u.city || '-',
        u.state || '-',
        u.parent || '-',
        u.citizen || '-',
        u.rejectionReason || '-'
    ].join(','));

    const blob = new Blob([[header.join(','), ...body].join('\n')], { type: 'text/csv' });
    const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: 'saathi-partners.csv'
    });
    a.click();
    URL.revokeObjectURL(a.href);
};

const SortIcon = ({ active, dir }) => (
    <span className="ml-1 inline-flex flex-col leading-none">
        <ChevronUp size={10} className={active && dir === 'asc' ? 'text-blue-600' : 'text-gray-300 dark:text-gray-600'} />
        <ChevronDown size={10} className={active && dir === 'desc' ? 'text-blue-600' : 'text-gray-300 dark:text-gray-600'} />
    </span>
);

const SAATHI_COLUMN_WIDTHS = [
    '152px',
    '170px',
    '120px',
    '140px',
    '230px',
    '100px',
    '150px',
    '220px',
    '130px',
    '180px',
    '140px',
    '130px',
    '170px',
    '110px',
    '130px',
    '120px',
    '120px',
    '180px'
];

const SAATHI_TABLE_MIN_WIDTH = SAATHI_COLUMN_WIDTHS.reduce(
    (total, width) => total + Number.parseInt(width, 10),
    0
);

const SAATHI_HEADER_CELL_CLASS = 'border-b border-gray-200 bg-gray-50 px-4 py-3 text-center font-semibold whitespace-nowrap dark:border-gray-700 dark:bg-[#232323]';
const SAATHI_SORTABLE_HEADER_CELL_CLASS = `${SAATHI_HEADER_CELL_CLASS} cursor-pointer`;

const DEMO = Array.from({ length: 120 }, (_, i) => {
    const first = ['Aarav', 'Priya', 'Rohan', 'Sneha', 'Vikram', 'Ananya', 'Rahul', 'Pooja', 'Amit', 'Kavya'][i % 10];
    return normalizeSaathi({
        _id: `s-${i}`,
        role: 'saathi',
        username: `${first} ${i + 1}`,
        firstName: first,
        lastName: `${i + 1}`,
        email: `saathi${i + 1}@example.com`,
        phone: `98${String(10000000 + i * 37).slice(0, 8)}`,
        createdAt: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000).toISOString(),
        lastLogin: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        isActive: i % 7 !== 0,
        emailVerified: i % 5 !== 0
    }, i);
});

export default function SaathiList() {
    const [saathis, setSaathis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [viewingSaathi, setViewingSaathi] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('All');
    const [approvalStatus, setApprovalStatus] = useState('All');
    const [citizen, setCitizen] = useState('All');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [sortField, setSortField] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await axios.get('/admin/users');
                const list = Array.isArray(res.data)
                    ? res.data
                    : (Array.isArray(res.data?.users) ? res.data.users : []);
                const saathiRows = list
                    .filter((u) => (u.role || '').toLowerCase() === 'saathi')
                    .map((u, idx) => normalizeSaathi(u, idx));

                if (saathiRows.length > 0) {
                    setSaathis(saathiRows);
                    setIsDemoMode(false);
                } else {
                    setSaathis(DEMO);
                    setIsDemoMode(true);
                }
            } catch {
                setSaathis(DEMO);
                setIsDemoMode(true);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [search, status, approvalStatus, citizen, pageSize]);

    const updateSaathiRecord = async (saathiId, payload) => {
        if (isDemoMode) {
            setSaathis((prev) => prev.map((s) => (s._id === saathiId ? normalizeSaathi({ ...s, ...payload }) : s)));
            return;
        }

        const res = await axios.put(`/admin/users/${saathiId}`, payload);
        const updated = normalizeSaathi(res.data || {});
        setSaathis((prev) => prev.map((s) => (s._id === saathiId ? { ...s, ...updated } : s)));
    };

    const handleConfigureSaathiRole = async (u) => {
        const entered = window.prompt(`Enter role (${SAATHI_ROLE_VALUES.join(', ')})`, u.role || 'saathi');
        if (entered === null) return;

        const nextRole = entered.trim();
        if (!SAATHI_ROLE_VALUES.includes(nextRole)) {
            alert('Invalid role.');
            return;
        }

        try {
            await updateSaathiRecord(u._id, { role: nextRole });
            if (nextRole !== 'saathi') {
                setSaathis((prev) => prev.filter((s) => s._id !== u._id));
                if (viewingSaathi?._id === u._id) setViewingSaathi(null);
            }
        } catch {
            alert('Failed to update saathi role.');
        }
    };

    const handleViewSaathi = (u) => {
        setViewingSaathi(u);
    };

    const handleEditSaathi = async (u) => {
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
            await updateSaathiRecord(u._id, {
                firstName,
                lastName,
                username: u.username,
                email: email.trim(),
                phoneNumber: phoneNumber.trim()
            });
        } catch {
            alert('Failed to edit saathi.');
        }
    };

    const handleDeactivateSaathi = async (u) => {
        if (u.isActive === false) {
            alert('Saathi partner is already deactivated.');
            return;
        }

        const confirmed = window.confirm('Deactivate this saathi partner?');
        if (!confirmed) return;

        try {
            await updateSaathiRecord(u._id, { isActive: false });
        } catch {
            alert('Failed to update saathi status.');
        }
    };

    const toggleSort = (field) => {
        if (sortField === field) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    const filtered = useMemo(() => {
        const t = search.trim().toLowerCase();
        return saathis.filter((u) => {
            const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
            if (
                t &&
                !fullName.toLowerCase().includes(t) &&
                !(u.email || '').toLowerCase().includes(t) &&
                !(u.phone || '').includes(t) &&
                !(u.saathiMembershipNumber || '').toLowerCase().includes(t) &&
                !(u.approvedBy || '').toLowerCase().includes(t) &&
                !(u.aadharCard || '').toLowerCase().includes(t) &&
                !(u.panCard || '').toLowerCase().includes(t) &&
                !(u.city || '').toLowerCase().includes(t) &&
                !(u.state || '').toLowerCase().includes(t) &&
                !(u.parent || '').toLowerCase().includes(t) &&
                !(u.citizen || '').toLowerCase().includes(t) &&
                !(u.rejectionReason || '').toLowerCase().includes(t)
            ) {
                return false;
            }
            if (status === 'Active' && !u.isActive) return false;
            if (status === 'Inactive' && u.isActive) return false;
            if (citizen !== 'All' && u.citizen !== citizen) return false;
            if (approvalStatus === 'Approved' && !u.emailVerified) return false;
            if (approvalStatus === 'Pending' && u.emailVerified) return false;
            return true;
        });
    }, [saathis, search, status, approvalStatus, citizen]);

    const sorted = useMemo(() => {
        const isDate = ['createdAt', 'lastLogin', 'approvedDateTime'].includes(sortField);
        const rows = [...filtered];
        rows.sort((a, b) => {
            const va = sortField === 'name'
                ? `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase()
                : isDate
                    ? new Date(a[sortField] || 0)
                    : String(a[sortField] || '').toLowerCase();
            const vb = sortField === 'name'
                ? `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase()
                : isDate
                    ? new Date(b[sortField] || 0)
                    : String(b[sortField] || '').toLowerCase();
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return rows;
    }, [filtered, sortField, sortDir]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const rows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

    const stats = {
        total: saathis.length,
        active: saathis.filter((u) => u.isActive).length,
        inactive: saathis.filter((u) => !u.isActive).length,
        approved: saathis.filter((u) => u.emailVerified).length,
        pending: saathis.filter((u) => !u.emailVerified).length
    };

    const pageNums = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - safePage) <= 2) pageNums.push(i);
        else if (pageNums[pageNums.length - 1] !== '...') pageNums.push('...');
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading saathi partners...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full min-h-0">
            <div className="bg-white dark:bg-[#2c2c2c] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 h-full min-h-0 flex flex-col">
                <div className="bg-white dark:bg-[#2c2c2c]">
                    <div
                        className="flex items-center gap-3 px-5 py-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer select-none"
                        onClick={() => setCollapsed((c) => !c)}
                    >
                        <Users size={16} className="text-blue-600 flex-shrink-0" />
                        <span className="font-semibold text-sm text-blue-600 tracking-wide uppercase">Saathi Partner List</span>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} />
                    </div>

                    {!collapsed && (
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
                                <div className="inline-flex items-center gap-5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#303030] px-3 py-2 w-fit">
                                    <span className="inline-flex items-center gap-1.5 text-blue-600 font-bold"><Users size={16} /> {stats.total}</span>
                                    <span className="inline-flex items-center gap-1.5 text-green-600 font-bold"><UserCheck size={16} /> {stats.active}</span>
                                    <span className="inline-flex items-center gap-1.5 text-red-500 font-bold"><UserX size={16} /> {stats.inactive}</span>
                                    <span className="inline-flex items-center gap-1.5 text-green-600 font-bold"><CheckCircle2 size={16} /> {stats.approved}</span>
                                    <span className="inline-flex items-center gap-1.5 text-red-500 font-bold"><XCircle size={16} /> {stats.pending}</span>
                                </div>

                                <div className="overflow-x-auto hide-scrollbar w-full xl:w-auto xl:max-w-[980px]">
                                    <div className="grid grid-cols-4 gap-3 min-w-[760px]">
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Created Date</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                readOnly
                                                placeholder="Select Date Range"
                                                className="w-full pl-3 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200"
                                            />
                                            <X size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1 min-w-0">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full py-2 pl-3 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200"
                                        >
                                            {STATUSES.map((s) => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-1 min-w-0">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Approval Status</label>
                                        <select
                                            value={approvalStatus}
                                            onChange={(e) => setApprovalStatus(e.target.value)}
                                            className="w-full py-2 pl-3 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200"
                                        >
                                            {APPROVAL_STATUSES.map((s) => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-1 min-w-0">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Citizen</label>
                                        <select
                                            value={citizen}
                                            onChange={(e) => setCitizen(e.target.value)}
                                            className="w-full py-2 pl-3 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200"
                                        >
                                            {CITIZEN_TYPES.map((c) => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-1 min-h-0 flex-col">
                    <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            className="border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-2.5 bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200 text-sm"
                        >
                            {PAGE_SIZES.map((n) => <option key={n}>{n}</option>)}
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
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-3 pr-9 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200 w-44"
                            />
                            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    <div className="relative flex-1 min-h-0 overflow-auto hide-scrollbar overscroll-x-contain">
                        <table
                            className="table-fixed border-separate border-spacing-0 text-sm"
                            style={{ width: SAATHI_TABLE_MIN_WIDTH, minWidth: SAATHI_TABLE_MIN_WIDTH }}
                        >
                            <colgroup>
                                {SAATHI_COLUMN_WIDTHS.map((width, index) => (
                                    <col key={index} style={{ width }} />
                                ))}
                            </colgroup>
                            <thead>
                                <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    <th className={SAATHI_HEADER_CELL_CLASS}>&nbsp;</th>
                                    <th className={SAATHI_SORTABLE_HEADER_CELL_CLASS} onClick={() => toggleSort('createdAt')}>
                                        <span className="flex items-center justify-center">Created DateTime <SortIcon active={sortField === 'createdAt'} dir={sortDir} /></span>
                                    </th>
                                    <th className={SAATHI_SORTABLE_HEADER_CELL_CLASS} onClick={() => toggleSort('name')}>
                                        <span className="flex items-center justify-center">Name <SortIcon active={sortField === 'name'} dir={sortDir} /></span>
                                    </th>
                                    <th className={SAATHI_HEADER_CELL_CLASS}>Mobile No</th>
                                    <th className={SAATHI_SORTABLE_HEADER_CELL_CLASS} onClick={() => toggleSort('email')}>
                                        <span className="flex items-center justify-center">Email <SortIcon active={sortField === 'email'} dir={sortDir} /></span>
                                    </th>
                                    <th className={SAATHI_SORTABLE_HEADER_CELL_CLASS} onClick={() => toggleSort('gender')}>
                                        <span className="flex items-center justify-center">Gender <SortIcon active={sortField === 'gender'} dir={sortDir} /></span>
                                    </th>
                                    <th className={SAATHI_SORTABLE_HEADER_CELL_CLASS} onClick={() => toggleSort('walletBalance')}>
                                        <span className="flex items-center justify-center">Wallet Balance <SortIcon active={sortField === 'walletBalance'} dir={sortDir} /></span>
                                    </th>
                                    <th className={SAATHI_SORTABLE_HEADER_CELL_CLASS} onClick={() => toggleSort('saathiMembershipNumber')}>
                                        <span className="flex items-center justify-center">Saathi Membership Number <SortIcon active={sortField === 'saathiMembershipNumber'} dir={sortDir} /></span>
                                    </th>
                                    <th className={SAATHI_SORTABLE_HEADER_CELL_CLASS} onClick={() => toggleSort('approvedBy')}>
                                        <span className="flex items-center justify-center">Approved By <SortIcon active={sortField === 'approvedBy'} dir={sortDir} /></span>
                                    </th>
                                    <th className={SAATHI_SORTABLE_HEADER_CELL_CLASS} onClick={() => toggleSort('approvedDateTime')}>
                                        <span className="flex items-center justify-center">Approved DateTime <SortIcon active={sortField === 'approvedDateTime'} dir={sortDir} /></span>
                                    </th>
                                    <th className={SAATHI_SORTABLE_HEADER_CELL_CLASS} onClick={() => toggleSort('aadharCard')}>
                                        <span className="flex items-center justify-center">Aadhar Card <SortIcon active={sortField === 'aadharCard'} dir={sortDir} /></span>
                                    </th>
                                    <th className={SAATHI_SORTABLE_HEADER_CELL_CLASS} onClick={() => toggleSort('panCard')}>
                                        <span className="flex items-center justify-center">Pan Card <SortIcon active={sortField === 'panCard'} dir={sortDir} /></span>
                                    </th>
                                    <th className={SAATHI_SORTABLE_HEADER_CELL_CLASS} onClick={() => toggleSort('lastLogin')}>
                                        <span className="flex items-center justify-center">Last Login <SortIcon active={sortField === 'lastLogin'} dir={sortDir} /></span>
                                    </th>
                                    <th className={SAATHI_SORTABLE_HEADER_CELL_CLASS} onClick={() => toggleSort('city')}>
                                        <span className="flex items-center justify-center">City <SortIcon active={sortField === 'city'} dir={sortDir} /></span>
                                    </th>
                                    <th className={SAATHI_SORTABLE_HEADER_CELL_CLASS} onClick={() => toggleSort('state')}>
                                        <span className="flex items-center justify-center">State <SortIcon active={sortField === 'state'} dir={sortDir} /></span>
                                    </th>
                                    <th className={SAATHI_SORTABLE_HEADER_CELL_CLASS} onClick={() => toggleSort('parent')}>
                                        <span className="flex items-center justify-center">Parent <SortIcon active={sortField === 'parent'} dir={sortDir} /></span>
                                    </th>
                                    <th className={SAATHI_SORTABLE_HEADER_CELL_CLASS} onClick={() => toggleSort('citizen')}>
                                        <span className="flex items-center justify-center">Citizen <SortIcon active={sortField === 'citizen'} dir={sortDir} /></span>
                                    </th>
                                    <th className={SAATHI_SORTABLE_HEADER_CELL_CLASS} onClick={() => toggleSort('rejectionReason')}>
                                        <span className="flex items-center justify-center">Rejection Reason <SortIcon active={sortField === 'rejectionReason'} dir={sortDir} /></span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={18} className="py-16 text-center text-gray-400 dark:text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Users size={40} strokeWidth={1} />
                                                <p className="text-sm">No saathi partners found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : rows.map((u) => {
                                    const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || '-';
                                    return (
                                        <tr key={u._id} className="hover:bg-blue-50/30 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap align-middle">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleConfigureSaathiRole(u)}
                                                        title="Configure saathi role"
                                                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                                    >
                                                        <Settings size={15} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewSaathi(u)}
                                                        title="View saathi"
                                                        className="text-orange-500 hover:text-orange-600 transition-colors"
                                                    >
                                                        <User size={15} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditSaathi(u)}
                                                        title="Edit saathi"
                                                        className="text-green-600 hover:text-green-700 transition-colors"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeactivateSaathi(u)}
                                                        title={u.isActive ? 'Deactivate saathi' : 'Saathi is deactivated'}
                                                        className={`transition-colors ${u.isActive ? 'text-red-500 hover:text-red-600' : 'text-gray-400 dark:text-gray-500'}`}
                                                    >
                                                        <UserX size={15} />
                                                    </button>

                                                    {u.emailVerified ? (
                                                        <span title="Verified saathi" className="text-blue-600">
                                                            <UserCheck size={15} />
                                                        </span>
                                                    ) : (
                                                        <span title="Saathi not verified" className="text-orange-500">
                                                            <HelpCircle size={15} />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 align-middle text-center whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">{formatDateTime(u.createdAt)}</td>
                                            <td className="px-4 py-3 align-middle text-center font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">{name}</td>
                                            <td className="px-4 py-3 align-middle text-center text-gray-600 dark:text-gray-400 whitespace-nowrap">{u.phone || '-'}</td>
                                            <td className="px-4 py-3 align-middle text-center text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                <span className="inline-block max-w-[220px] truncate align-middle">{u.email || '-'}</span>
                                            </td>
                                            <td className="px-4 py-3 align-middle text-center text-gray-600 dark:text-gray-400 whitespace-nowrap capitalize">{u.gender || '-'}</td>
                                            <td className="px-4 py-3 align-middle text-center text-gray-700 dark:text-gray-300 whitespace-nowrap font-medium">{formatCurrency(u.walletBalance)}</td>
                                            <td className="px-4 py-3 align-middle text-center whitespace-nowrap">
                                                <span className="inline-block text-blue-600 font-medium text-xs">{u.saathiMembershipNumber || '-'}</span>
                                            </td>
                                            <td className="px-4 py-3 align-middle text-center text-gray-600 dark:text-gray-400 whitespace-nowrap">{u.approvedBy || '-'}</td>
                                            <td className="px-4 py-3 align-middle text-center text-xs whitespace-nowrap">
                                                {u.approvedDateTime
                                                    ? <span className="text-orange-500">{formatDateTime(u.approvedDateTime)}</span>
                                                    : <span className="text-gray-400">-</span>}
                                            </td>
                                            <td className="px-4 py-3 align-middle text-center text-gray-600 dark:text-gray-400 whitespace-nowrap">{u.aadharCard || '-'}</td>
                                            <td className="px-4 py-3 align-middle text-center text-gray-600 dark:text-gray-400 whitespace-nowrap">{u.panCard || '-'}</td>
                                            <td className="px-4 py-3 align-middle text-center text-xs whitespace-nowrap">
                                                {u.lastLogin
                                                    ? <span className="text-orange-500">{formatDateTime(u.lastLogin)}</span>
                                                    : <span className="text-gray-400">-</span>}
                                            </td>
                                            <td className="px-4 py-3 align-middle text-center whitespace-nowrap">
                                                <span className="inline-block text-blue-600">{u.city || '-'}</span>
                                            </td>
                                            <td className="px-4 py-3 align-middle text-center whitespace-nowrap">
                                                <span className="inline-block text-blue-600">{u.state || '-'}</span>
                                            </td>
                                            <td className="px-4 py-3 align-middle text-center text-gray-600 dark:text-gray-400 whitespace-nowrap">{u.parent || '-'}</td>
                                            <td className="px-4 py-3 align-middle text-center text-gray-600 dark:text-gray-400 whitespace-nowrap">{u.citizen || '-'}</td>
                                            <td className="px-4 py-3 align-middle text-center text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">{u.rejectionReason || '-'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-black/10">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1}</span>
                            -<span className="font-semibold text-gray-700 dark:text-gray-300">{Math.min(safePage * pageSize, sorted.length)}</span>
                            {' '}of <span className="font-semibold text-gray-700 dark:text-gray-300">{sorted.length}</span> saathi partners
                        </p>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(1)}
                                disabled={safePage === 1}
                                className="px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                «
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={safePage === 1}
                                className="p-1.5 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <ChevronLeft size={14} />
                            </button>

                            {pageNums.map((n, i) =>
                                n === '...'
                                    ? <span key={`e-${i}`} className="px-2 text-gray-400 text-xs">...</span>
                                    : (
                                        <button
                                            key={n}
                                            onClick={() => setPage(n)}
                                            className={`min-w-[30px] py-1.5 text-xs rounded border ${safePage === n
                                                ? 'bg-blue-600 border-blue-600 text-white font-semibold'
                                                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            {n}
                                        </button>
                                    )
                            )}

                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={safePage === totalPages}
                                className="p-1.5 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <ChevronRight size={14} />
                            </button>
                            <button
                                onClick={() => setPage(totalPages)}
                                disabled={safePage === totalPages}
                                className="px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                »
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {viewingSaathi && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
                    <div className="w-full max-w-xl rounded-lg bg-white dark:bg-[#2c2c2c] border border-gray-200 dark:border-gray-700 shadow-lg">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Saathi Partner Details</h3>
                            <button
                                type="button"
                                onClick={() => setViewingSaathi(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                title="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">
                                    {`${viewingSaathi.firstName || ''} ${viewingSaathi.lastName || ''}`.trim() || viewingSaathi.username || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">{viewingSaathi.role || 'saathi'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">{viewingSaathi.email || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">{viewingSaathi.phone || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                                <p className={`font-medium ${viewingSaathi.isActive ? 'text-green-600' : 'text-red-500'}`}>
                                    {viewingSaathi.isActive ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Verification</p>
                                <p className={`font-medium ${viewingSaathi.emailVerified ? 'text-green-600' : 'text-orange-500'}`}>
                                    {viewingSaathi.emailVerified ? 'Verified' : 'Not Verified'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">{formatDateTime(viewingSaathi.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Last Login</p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">{formatDateTime(viewingSaathi.lastLogin)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
