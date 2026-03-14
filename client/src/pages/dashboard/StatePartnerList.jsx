import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
    Users,
    UserCheck,
    UserX,
    UserPlus,
    User,
    Settings,
    Pencil,
    ChevronDown,
    ChevronUp,
    Download,
    Search,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const STATUSES = ['All', 'Active', 'Inactive'];
const COUNTRIES = ['All', 'India', 'Nepal'];
const STATES = ['All', 'Delhi', 'Bagmati', 'Bihar', 'Uttar Pradesh', 'Maharashtra'];
const PAGE_SIZES = [10, 25, 50, 100];
const PARTNER_TYPES = ['State Partner', 'Regional Partner', 'Enterprise Partner'];
const EXPERTISE_AREAS = ['Public Services', 'Finance', 'KYC', 'Welfare Schemes', 'Employment'];
const STATE_ROLE_VALUES = ['user', 'member', 'saathi', 'agent', 'supportTeam', 'subAdmin', 'superAdmin', 'admin'];
const STATE_SOURCE_ROLES = new Set(['subadmin', 'supportteam']);

const parseFullName = (value) => {
    const parts = String(value || '').trim().split(/\s+/).filter(Boolean);
    return {
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || ''
    };
};

const makeUsername = ({ firstName, lastName, email }) => {
    const emailBase = email ? email.split('@')[0] : '';
    const nameBase = [firstName, lastName].filter(Boolean).join('.');
    const base = (emailBase || nameBase || 'statepartner').toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'statepartner';
    return `${base}${Date.now().toString().slice(-5)}`;
};

const makeTempPassword = () => `Temp@${Math.random().toString(36).slice(-6)}1A`;

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const formatCurrency = (value) => {
    const amount = toNumber(value, 0);
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
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

const normalizeStatePartner = (user, idx = 0) => ({
    ...user,
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || user?.phoneNumber || '',
    country: user?.country || COUNTRIES[(idx % (COUNTRIES.length - 1)) + 1],
    state: user?.state || STATES[(idx % (STATES.length - 1)) + 1],
    walletBalance: toNumber(user?.walletBalance, 1000 + idx * 500),
    partnerType: user?.partnerType || PARTNER_TYPES[idx % PARTNER_TYPES.length],
    areaOfExpertise: user?.areaOfExpertise || EXPERTISE_AREAS[idx % EXPERTISE_AREAS.length],
    createdAt: user?.createdAt || null,
    lastLogin: user?.lastLogin || null,
    isActive: user?.isActive !== false
});

const exportCSV = (rows) => {
    if (!rows.length) return;

    const header = [
        'Created DateTime',
        'Name',
        'Mobile No',
        'Email',
        'Wallet Balance',
        'Partner Type',
        'Area Of Expertise',
        'Country',
        'State'
    ];

    const body = rows.map((u) => [
        formatDateTime(u.createdAt),
        `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || '-',
        u.phone || '-',
        u.email || '-',
        u.walletBalance,
        u.partnerType || '-',
        u.areaOfExpertise || '-',
        u.country || '-',
        u.state || '-'
    ].join(','));

    const blob = new Blob([[header.join(','), ...body].join('\n')], { type: 'text/csv' });
    const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: 'state-partners.csv'
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

const DEMO = Array.from({ length: 36 }, (_, i) => {
    const first = ['Aarav', 'Priya', 'Rohan', 'Sneha', 'Vikram', 'Ananya', 'Rahul', 'Pooja', 'Amit', 'Kavya'][i % 10];
    return normalizeStatePartner({
        _id: `sp-${i}`,
        role: 'subAdmin',
        username: `${first} ${i + 1}`,
        firstName: first,
        lastName: `${i + 1}`,
        email: `state${i + 1}@example.com`,
        phone: `98${String(10000000 + i * 37).slice(0, 8)}`,
        country: COUNTRIES[(i % (COUNTRIES.length - 1)) + 1],
        state: STATES[(i % (STATES.length - 1)) + 1],
        walletBalance: 2000 + i * 900,
        partnerType: PARTNER_TYPES[i % PARTNER_TYPES.length],
        areaOfExpertise: EXPERTISE_AREAS[i % EXPERTISE_AREAS.length],
        createdAt: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000).toISOString(),
        lastLogin: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        isActive: i % 7 !== 0
    }, i);
});

export default function StatePartnerList() {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [viewingPartner, setViewingPartner] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('All');
    const [country, setCountry] = useState('All');
    const [stateFilter, setStateFilter] = useState('All');
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
                const stateRows = list
                    .filter((u) => STATE_SOURCE_ROLES.has((u.role || '').toLowerCase()))
                    .map((u, idx) => normalizeStatePartner(u, idx));

                if (stateRows.length > 0) {
                    setPartners(stateRows);
                    setIsDemoMode(false);
                } else {
                    setPartners(DEMO);
                    setIsDemoMode(true);
                }
            } catch {
                setPartners(DEMO);
                setIsDemoMode(true);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [search, status, country, stateFilter, pageSize]);

    const updatePartnerRecord = async (partnerId, payload) => {
        if (isDemoMode) {
            setPartners((prev) => prev.map((p) => (p._id === partnerId ? normalizeStatePartner({ ...p, ...payload }) : p)));
            return;
        }

        const res = await axios.put(`/admin/users/${partnerId}`, payload);
        const updated = normalizeStatePartner({ ...res.data, ...payload });
        setPartners((prev) => prev.map((p) => (p._id === partnerId ? { ...p, ...updated } : p)));
    };

    const handleAddStatePartner = async () => {
        const fullName = window.prompt('Enter state partner full name');
        if (fullName === null) return;

        const email = window.prompt('Enter state partner email', '');
        if (email === null) return;

        const phoneNumber = window.prompt('Enter state partner phone number', '');
        if (phoneNumber === null) return;

        const selectedCountry = window.prompt(`Enter country (${COUNTRIES.slice(1).join(', ')})`, 'India');
        if (selectedCountry === null) return;

        const selectedState = window.prompt(`Enter state (${STATES.slice(1).join(', ')})`, 'Delhi');
        if (selectedState === null) return;

        const selectedPartnerType = window.prompt(`Enter partner type (${PARTNER_TYPES.join(', ')})`, 'State Partner');
        if (selectedPartnerType === null) return;

        const selectedExpertise = window.prompt(`Enter area of expertise (${EXPERTISE_AREAS.join(', ')})`, 'Public Services');
        if (selectedExpertise === null) return;

        const walletInput = window.prompt('Enter wallet balance', '0');
        if (walletInput === null) return;

        const { firstName, lastName } = parseFullName(fullName);
        if (!firstName) {
            alert('First name is required.');
            return;
        }

        const normalizedCountry = selectedCountry.trim();
        const normalizedState = selectedState.trim();
        const normalizedPartnerType = selectedPartnerType.trim();
        const normalizedExpertise = selectedExpertise.trim();

        if (!COUNTRIES.includes(normalizedCountry)) {
            alert('Invalid country.');
            return;
        }
        if (!STATES.includes(normalizedState)) {
            alert('Invalid state.');
            return;
        }

        const walletBalance = toNumber(walletInput, 0);
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPhone = phoneNumber.trim();
        const username = makeUsername({ firstName, lastName, email: trimmedEmail });

        try {
            if (isDemoMode) {
                const demoPartner = normalizeStatePartner({
                    _id: `local-${Date.now()}`,
                    role: 'subAdmin',
                    username,
                    firstName,
                    lastName,
                    email: trimmedEmail,
                    phone: trimmedPhone,
                    country: normalizedCountry,
                    state: normalizedState,
                    walletBalance,
                    partnerType: normalizedPartnerType,
                    areaOfExpertise: normalizedExpertise,
                    isActive: true,
                    createdAt: new Date().toISOString()
                });
                setPartners((prev) => [demoPartner, ...prev]);
                return;
            }

            const payload = {
                username,
                email: trimmedEmail,
                phoneNumber: trimmedPhone,
                password: makeTempPassword(),
                role: 'subAdmin',
                firstName,
                lastName,
                country: normalizedCountry,
                state: normalizedState,
                city: normalizedState,
                walletBalance,
                partnerType: normalizedPartnerType,
                areaOfExpertise: normalizedExpertise,
                isActive: true
            };
            const res = await axios.post('/admin/users', payload);
            const created = normalizeStatePartner({ ...payload, ...(res.data?.user || res.data) });
            setPartners((prev) => [created, ...prev]);
        } catch {
            alert('Failed to add state partner.');
        }
    };

    const handleConfigurePartnerRole = async (u) => {
        const entered = window.prompt(`Enter role (${STATE_ROLE_VALUES.join(', ')})`, u.role || 'subAdmin');
        if (entered === null) return;

        const nextRole = entered.trim();
        if (!STATE_ROLE_VALUES.includes(nextRole)) {
            alert('Invalid role.');
            return;
        }

        try {
            await updatePartnerRecord(u._id, { role: nextRole });
            if (!STATE_SOURCE_ROLES.has(nextRole.toLowerCase())) {
                setPartners((prev) => prev.filter((p) => p._id !== u._id));
                if (viewingPartner?._id === u._id) setViewingPartner(null);
            }
        } catch {
            alert('Failed to update state partner role.');
        }
    };

    const handleEditPartner = async (u) => {
        const currentName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || '';
        const fullName = window.prompt('Enter full name', currentName);
        if (fullName === null) return;

        const email = window.prompt('Enter email', u.email || '');
        if (email === null) return;

        const phoneNumber = window.prompt('Enter phone number', u.phone || '');
        if (phoneNumber === null) return;

        const selectedCountry = window.prompt(`Enter country (${COUNTRIES.slice(1).join(', ')})`, u.country || 'India');
        if (selectedCountry === null) return;

        const selectedState = window.prompt(`Enter state (${STATES.slice(1).join(', ')})`, u.state || 'Delhi');
        if (selectedState === null) return;

        const selectedPartnerType = window.prompt(`Enter partner type (${PARTNER_TYPES.join(', ')})`, u.partnerType || 'State Partner');
        if (selectedPartnerType === null) return;

        const selectedExpertise = window.prompt(`Enter area of expertise (${EXPERTISE_AREAS.join(', ')})`, u.areaOfExpertise || 'Public Services');
        if (selectedExpertise === null) return;

        const walletInput = window.prompt('Enter wallet balance', String(toNumber(u.walletBalance, 0)));
        if (walletInput === null) return;

        const { firstName, lastName } = parseFullName(fullName);
        if (!firstName) {
            alert('First name is required.');
            return;
        }

        const normalizedCountry = selectedCountry.trim();
        const normalizedState = selectedState.trim();

        if (!COUNTRIES.includes(normalizedCountry) || !STATES.includes(normalizedState)) {
            alert('Invalid country/state values.');
            return;
        }

        try {
            await updatePartnerRecord(u._id, {
                firstName,
                lastName,
                username: u.username,
                email: email.trim(),
                phoneNumber: phoneNumber.trim(),
                country: normalizedCountry,
                state: normalizedState,
                city: normalizedState,
                walletBalance: toNumber(walletInput, 0),
                partnerType: selectedPartnerType.trim(),
                areaOfExpertise: selectedExpertise.trim()
            });
        } catch {
            alert('Failed to edit state partner.');
        }
    };

    const handleDeactivatePartner = async (u) => {
        if (u.isActive === false) {
            alert('State partner is already deactivated.');
            return;
        }

        const confirmed = window.confirm('Deactivate this state partner?');
        if (!confirmed) return;

        try {
            await updatePartnerRecord(u._id, { isActive: false });
        } catch {
            alert('Failed to update state partner status.');
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
        return partners.filter((u) => {
            const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
            if (
                t &&
                !fullName.toLowerCase().includes(t) &&
                !(u.email || '').toLowerCase().includes(t) &&
                !(u.phone || '').includes(t) &&
                !(u.country || '').toLowerCase().includes(t) &&
                !(u.state || '').toLowerCase().includes(t) &&
                !(u.partnerType || '').toLowerCase().includes(t) &&
                !(u.areaOfExpertise || '').toLowerCase().includes(t)
            ) {
                return false;
            }

            if (status === 'Active' && !u.isActive) return false;
            if (status === 'Inactive' && u.isActive) return false;
            if (country !== 'All' && u.country !== country) return false;
            if (stateFilter !== 'All' && u.state !== stateFilter) return false;
            return true;
        });
    }, [partners, search, status, country, stateFilter]);

    const sorted = useMemo(() => {
        const isDate = ['createdAt', 'lastLogin'].includes(sortField);
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
        total: partners.length,
        active: partners.filter((u) => u.isActive).length,
        inactive: partners.filter((u) => !u.isActive).length
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading state partners...</p>
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
                        <span className="font-semibold text-sm text-blue-600 tracking-wide uppercase">State Partner List</span>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} />
                    </div>

                    {!collapsed && (
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
                                <div className="inline-flex items-center gap-5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#303030] px-3 py-2 w-fit">
                                    <span className="inline-flex items-center gap-1.5 text-blue-600 font-bold"><Users size={16} /> {stats.total}</span>
                                    <span className="inline-flex items-center gap-1.5 text-green-600 font-bold"><UserCheck size={16} /> {stats.active}</span>
                                    <span className="inline-flex items-center gap-1.5 text-red-500 font-bold"><UserX size={16} /> {stats.inactive}</span>
                                </div>

                                <div className="overflow-x-auto hide-scrollbar w-full xl:w-auto xl:max-w-[1000px]">
                                    <div className="grid grid-cols-5 gap-3 min-w-[880px]">
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
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Country</label>
                                            <select
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value)}
                                                className="w-full py-2 pl-3 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200"
                                            >
                                                {COUNTRIES.map((item) => (
                                                    <option key={item} value={item}>
                                                        {item === 'All' ? 'Select Country' : item}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-1 min-w-0">
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">State</label>
                                            <select
                                                value={stateFilter}
                                                onChange={(e) => setStateFilter(e.target.value)}
                                                className="w-full py-2 pl-3 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200"
                                            >
                                                {STATES.map((item) => (
                                                    <option key={item} value={item}>
                                                        {item === 'All' ? 'Select State' : item}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                onClick={handleAddStatePartner}
                                                title="Add state partner"
                                                className="h-10 w-12 inline-flex items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                            >
                                                <UserPlus size={18} />
                                            </button>
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

                    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto hide-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-gray-50 dark:bg-black/10 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    <th className="px-4 py-3 font-semibold whitespace-nowrap">&nbsp;</th>
                                    <th className="px-4 py-3 font-semibold cursor-pointer whitespace-nowrap" onClick={() => toggleSort('createdAt')}>
                                        <span className="flex items-center">Created DateTime <SortIcon active={sortField === 'createdAt'} dir={sortDir} /></span>
                                    </th>
                                    <th className="px-4 py-3 font-semibold cursor-pointer whitespace-nowrap" onClick={() => toggleSort('name')}>
                                        <span className="flex items-center">Name <SortIcon active={sortField === 'name'} dir={sortDir} /></span>
                                    </th>
                                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Mobile No</th>
                                    <th className="px-4 py-3 font-semibold cursor-pointer whitespace-nowrap" onClick={() => toggleSort('email')}>
                                        <span className="flex items-center">Email <SortIcon active={sortField === 'email'} dir={sortDir} /></span>
                                    </th>
                                    <th className="px-4 py-3 font-semibold cursor-pointer whitespace-nowrap" onClick={() => toggleSort('walletBalance')}>
                                        <span className="flex items-center">Wallet Balance <SortIcon active={sortField === 'walletBalance'} dir={sortDir} /></span>
                                    </th>
                                    <th className="px-4 py-3 font-semibold cursor-pointer whitespace-nowrap" onClick={() => toggleSort('partnerType')}>
                                        <span className="flex items-center">Partner Type <SortIcon active={sortField === 'partnerType'} dir={sortDir} /></span>
                                    </th>
                                    <th className="px-4 py-3 font-semibold cursor-pointer whitespace-nowrap" onClick={() => toggleSort('areaOfExpertise')}>
                                        <span className="flex items-center">Area Of Expertise <SortIcon active={sortField === 'areaOfExpertise'} dir={sortDir} /></span>
                                    </th>
                                    <th className="px-4 py-3 font-semibold cursor-pointer whitespace-nowrap" onClick={() => toggleSort('country')}>
                                        <span className="flex items-center">Country <SortIcon active={sortField === 'country'} dir={sortDir} /></span>
                                    </th>
                                    <th className="px-4 py-3 font-semibold cursor-pointer whitespace-nowrap" onClick={() => toggleSort('state')}>
                                        <span className="flex items-center">State <SortIcon active={sortField === 'state'} dir={sortDir} /></span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="py-16 text-center text-gray-400 dark:text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Users size={40} strokeWidth={1} />
                                                <p className="text-sm">No state partners found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : rows.map((u) => {
                                    const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || '-';
                                    return (
                                        <tr key={u._id} className="hover:bg-blue-50/30 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleConfigurePartnerRole(u)}
                                                        title="Configure state partner role"
                                                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                                    >
                                                        <Settings size={15} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setViewingPartner(u)}
                                                        title="View state partner"
                                                        className="text-orange-500 hover:text-orange-600 transition-colors"
                                                    >
                                                        <User size={15} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditPartner(u)}
                                                        title="Edit state partner"
                                                        className="text-green-600 hover:text-green-700 transition-colors"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeactivatePartner(u)}
                                                        title={u.isActive ? 'Deactivate state partner' : 'State partner is deactivated'}
                                                        className={`transition-colors ${u.isActive ? 'text-red-500 hover:text-red-600' : 'text-gray-400 dark:text-gray-500'}`}
                                                    >
                                                        <UserX size={15} />
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">{formatDateTime(u.createdAt)}</td>
                                            <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{name}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{u.phone || '-'}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[280px] truncate">{u.email || '-'}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatCurrency(u.walletBalance)}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{u.partnerType || '-'}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{u.areaOfExpertise || '-'}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{u.country || '-'}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{u.state || '-'}</td>
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
                            {' '}of <span className="font-semibold text-gray-700 dark:text-gray-300">{sorted.length}</span> state partners
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

            {viewingPartner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
                    <div className="w-full max-w-xl rounded-lg bg-white dark:bg-[#2c2c2c] border border-gray-200 dark:border-gray-700 shadow-lg">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">State Partner Details</h3>
                            <button
                                type="button"
                                onClick={() => setViewingPartner(null)}
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
                                    {`${viewingPartner.firstName || ''} ${viewingPartner.lastName || ''}`.trim() || viewingPartner.username || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">{viewingPartner.role || 'subAdmin'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">{viewingPartner.email || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Mobile No</p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">{viewingPartner.phone || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                                <p className={`font-medium ${viewingPartner.isActive ? 'text-green-600' : 'text-red-500'}`}>
                                    {viewingPartner.isActive ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Wallet Balance</p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">{formatCurrency(viewingPartner.walletBalance)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Partner Type</p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">{viewingPartner.partnerType || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Area Of Expertise</p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">{viewingPartner.areaOfExpertise || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Country</p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">{viewingPartner.country || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">State</p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">{viewingPartner.state || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">{formatDateTime(viewingPartner.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Last Login</p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">{formatDateTime(viewingPartner.lastLogin)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
