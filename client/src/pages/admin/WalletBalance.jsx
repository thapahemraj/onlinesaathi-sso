import { useEffect, useMemo, useState } from 'react';
import {
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Download,
    Search,
} from 'lucide-react';

const PAGE_SIZES = [10, 25, 50, 100];
const USER_ROLES = ['All', 'User', 'Member', 'Saathi', 'Agent', 'Sub Admin', 'Support Team'];

const BALANCE_ROWS = [
    { id: 1, lastTransactionDate: '2026-03-13T21:26', userName: 'Aarav Sharma', userRole: 'User', closingBalance: 12540, phoneNumber: '9876543210', transactionCounts: 12 },
    { id: 2, lastTransactionDate: '2026-03-13T19:12', userName: 'Priya Singh', userRole: 'Member', closingBalance: 35880, phoneNumber: '9891122334', transactionCounts: 28 },
    { id: 3, lastTransactionDate: '2026-03-13T18:47', userName: 'Rohan Verma', userRole: 'Saathi', closingBalance: 58210, phoneNumber: '9810011223', transactionCounts: 41 },
    { id: 4, lastTransactionDate: '2026-03-12T17:08', userName: 'Sneha Gupta', userRole: 'User', closingBalance: 9640, phoneNumber: '9900012345', transactionCounts: 9 },
    { id: 5, lastTransactionDate: '2026-03-12T15:31', userName: 'Vikram Yadav', userRole: 'Agent', closingBalance: 77430, phoneNumber: '9922233344', transactionCounts: 63 },
    { id: 6, lastTransactionDate: '2026-03-12T13:05', userName: 'Ananya Mishra', userRole: 'Member', closingBalance: 22360, phoneNumber: '9845566778', transactionCounts: 17 },
    { id: 7, lastTransactionDate: '2026-03-11T16:22', userName: 'Rahul Thapa', userRole: 'Support Team', closingBalance: 45210, phoneNumber: '9765432101', transactionCounts: 34 },
    { id: 8, lastTransactionDate: '2026-03-11T10:14', userName: 'Pooja Karki', userRole: 'Saathi', closingBalance: 68200, phoneNumber: '9755544332', transactionCounts: 56 },
    { id: 9, lastTransactionDate: '2026-03-10T11:50', userName: 'Amit Kumar', userRole: 'Sub Admin', closingBalance: 91200, phoneNumber: '9988776655', transactionCounts: 72 },
    { id: 10, lastTransactionDate: '2026-03-10T09:40', userName: 'Kavya Jha', userRole: 'User', closingBalance: 11820, phoneNumber: '9733311122', transactionCounts: 14 },
];

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
}).format(value);

const formatDateTime = (value) => {
    if (!value) return '-';

    return new Date(value).toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

const SortArrow = ({ active, direction }) => (
    <span className="ml-2 inline-flex flex-col leading-none">
        <ChevronUp size={12} className={active && direction === 'asc' ? 'text-green-600' : 'text-gray-300'} />
        <ChevronDown size={12} className={active && direction === 'desc' ? 'text-green-600' : 'text-gray-300'} />
    </span>
);

export default function WalletBalance() {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedDate, setSelectedDate] = useState('2026-03-13T21:26');
    const [selectedRole, setSelectedRole] = useState('All');
    const [pageSize, setPageSize] = useState(50);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState('lastTransactionDate');
    const [sortDirection, setSortDirection] = useState('desc');

    useEffect(() => {
        setPage(1);
    }, [selectedDate, selectedRole, pageSize, search]);

    const filteredRows = useMemo(() => {
        const query = search.trim().toLowerCase();
        const selectedDay = selectedDate ? selectedDate.slice(0, 10) : '';

        return BALANCE_ROWS.filter((row) => {
            const matchesRole = selectedRole === 'All' || row.userRole === selectedRole;
            const matchesSearch = !query || [
                row.userName,
                row.userRole,
                row.phoneNumber,
                String(row.transactionCounts),
            ].some((value) => String(value).toLowerCase().includes(query));
            const matchesDate = !selectedDay || row.lastTransactionDate.startsWith(selectedDay);

            return matchesRole && matchesSearch && matchesDate;
        });
    }, [search, selectedDate, selectedRole]);

    const sortedRows = useMemo(() => {
        const rows = [...filteredRows];

        rows.sort((left, right) => {
            const leftValue = sortField === 'lastTransactionDate'
                ? new Date(left[sortField]).getTime()
                : left[sortField];
            const rightValue = sortField === 'lastTransactionDate'
                ? new Date(right[sortField]).getTime()
                : right[sortField];

            if (leftValue < rightValue) {
                return sortDirection === 'asc' ? -1 : 1;
            }

            if (leftValue > rightValue) {
                return sortDirection === 'asc' ? 1 : -1;
            }

            return 0;
        });

        return rows;
    }, [filteredRows, sortDirection, sortField]);

    const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const visibleRows = sortedRows.slice((safePage - 1) * pageSize, safePage * pageSize);

    const pageNums = [];
    for (let i = 1; i <= totalPages; i += 1) {
        if (i === 1 || i === totalPages || Math.abs(i - safePage) <= 2) {
            pageNums.push(i);
        } else if (pageNums[pageNums.length - 1] !== '…') {
            pageNums.push('…');
        }
    }

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
            return;
        }

        setSortField(field);
        setSortDirection(field === 'lastTransactionDate' ? 'desc' : 'asc');
    };

    const exportRows = () => {
        if (!sortedRows.length) return;

        const header = ['Last Transaction Date', 'User Name', 'User Role', 'Closing Balance', 'Phone Number', 'Transaction Counts'];
        const body = sortedRows.map((row) => [
            formatDateTime(row.lastTransactionDate),
            row.userName,
            row.userRole,
            formatCurrency(row.closingBalance),
            row.phoneNumber,
            row.transactionCounts,
        ].join(','));

        const blob = new Blob([[header.join(','), ...body].join('\n')], { type: 'text/csv' });
        const link = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(blob),
            download: 'user-wallet-balance.csv',
        });

        link.click();
        URL.revokeObjectURL(link.href);
    };

    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={() => setCollapsed((current) => !current)}
                className="inline-flex items-center gap-1 text-[28px] font-bold uppercase tracking-wide text-[#586fe5]"
            >
                <span className="text-[28px] leading-none">User Wallet Balance</span>
                {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>

            {!collapsed && (
                <>
                    <div className="rounded-md border border-gray-200 bg-[#f4f4f5] p-5 dark:border-gray-700 dark:bg-[#2c2c2c]">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_200px_255px] lg:items-end">
                            <div className="min-h-[82px] rounded-md bg-transparent" />

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Select Date</label>
                                <div className="relative">
                                    <input
                                        type="datetime-local"
                                        value={selectedDate}
                                        onChange={(event) => setSelectedDate(event.target.value)}
                                        className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-700 focus:border-[#5a6ff0] focus:outline-none dark:border-gray-600 dark:bg-[#323232] dark:text-gray-200"
                                    />
                                    <CalendarDays size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">User Role</label>
                                <select
                                    value={selectedRole}
                                    onChange={(event) => setSelectedRole(event.target.value)}
                                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-[#5a6ff0] focus:outline-none dark:border-gray-600 dark:bg-[#323232] dark:text-gray-200"
                                >
                                    {USER_ROLES.map((role) => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-md border border-gray-200 bg-[#f4f4f5] p-5 dark:border-gray-700 dark:bg-[#2c2c2c]">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex items-center gap-3 text-[28px] text-gray-700 dark:text-gray-300">
                                <span className="text-sm">Show</span>
                                <select
                                    value={pageSize}
                                    onChange={(event) => setPageSize(Number(event.target.value))}
                                    className="w-[70px] rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-[#5a6ff0] focus:outline-none dark:border-gray-600 dark:bg-[#323232] dark:text-gray-200"
                                >
                                    {PAGE_SIZES.map((size) => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                                <span className="text-sm">entries</span>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <button
                                    type="button"
                                    onClick={exportRows}
                                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#5b6ff0] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4b5de0]"
                                >
                                    <Download size={14} />
                                    Export to Excel
                                </button>

                                <div className="flex overflow-hidden rounded-md border border-gray-300 bg-white dark:border-gray-600 dark:bg-[#323232]">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Search..."
                                        className="w-full min-w-[190px] border-0 bg-transparent px-4 py-2 text-sm text-gray-700 outline-none dark:text-gray-200"
                                    />
                                    <button
                                        type="button"
                                        className="inline-flex items-center justify-center bg-[#5b6ff0] px-4 text-white"
                                    >
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 overflow-hidden rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#262626]">
                            <div className="max-h-[520px] overflow-auto hide-scrollbar">
                                <table className="min-w-full text-sm">
                                    <thead className="sticky top-0 z-10 bg-[#f7f7f8] dark:bg-[#202020]">
                                        <tr className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                            <th className="border-b border-r border-gray-200 px-6 py-3 text-left dark:border-gray-700">
                                                <button type="button" onClick={() => handleSort('lastTransactionDate')} className="inline-flex items-center font-semibold">
                                                    Last Transaction Date
                                                    <SortArrow active={sortField === 'lastTransactionDate'} direction={sortDirection} />
                                                </button>
                                            </th>
                                            <th className="border-b border-r border-gray-200 px-6 py-3 text-left dark:border-gray-700">
                                                <button type="button" onClick={() => handleSort('userName')} className="inline-flex items-center font-semibold">
                                                    User Name
                                                    <SortArrow active={sortField === 'userName'} direction={sortDirection} />
                                                </button>
                                            </th>
                                            <th className="border-b border-r border-gray-200 px-6 py-3 text-left dark:border-gray-700">
                                                <button type="button" onClick={() => handleSort('userRole')} className="inline-flex items-center font-semibold">
                                                    User Role
                                                    <SortArrow active={sortField === 'userRole'} direction={sortDirection} />
                                                </button>
                                            </th>
                                            <th className="border-b border-r border-gray-200 px-6 py-3 text-left dark:border-gray-700">
                                                <button type="button" onClick={() => handleSort('closingBalance')} className="inline-flex items-center font-semibold">
                                                    Closing Balance
                                                    <SortArrow active={sortField === 'closingBalance'} direction={sortDirection} />
                                                </button>
                                            </th>
                                            <th className="border-b border-r border-gray-200 px-6 py-3 text-left dark:border-gray-700">Phone Number</th>
                                            <th className="border-b border-gray-200 px-6 py-3 text-left dark:border-gray-700">
                                                <button type="button" onClick={() => handleSort('transactionCounts')} className="inline-flex items-center font-semibold">
                                                    Transaction Counts
                                                    <SortArrow active={sortField === 'transactionCounts'} direction={sortDirection} />
                                                </button>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {visibleRows.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-500 dark:text-gray-400">
                                                    No wallet balance records found.
                                                </td>
                                            </tr>
                                        ) : visibleRows.map((row) => (
                                            <tr key={row.id} className="text-gray-700 transition-colors hover:bg-[#f8f9ff] dark:text-gray-200 dark:hover:bg-white/5">
                                                <td className="border-r border-gray-100 px-6 py-4 whitespace-nowrap dark:border-gray-800">{formatDateTime(row.lastTransactionDate)}</td>
                                                <td className="border-r border-gray-100 px-6 py-4 font-medium whitespace-nowrap dark:border-gray-800">{row.userName}</td>
                                                <td className="border-r border-gray-100 px-6 py-4 whitespace-nowrap dark:border-gray-800">{row.userRole}</td>
                                                <td className="border-r border-gray-100 px-6 py-4 font-semibold text-[#5168eb] whitespace-nowrap dark:border-gray-800">{formatCurrency(row.closingBalance)}</td>
                                                <td className="border-r border-gray-100 px-6 py-4 whitespace-nowrap dark:border-gray-800">{row.phoneNumber}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{row.transactionCounts}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50/70 px-5 py-4 dark:border-gray-700 dark:bg-black/10">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Showing{' '}
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {sortedRows.length === 0 ? 0 : (safePage - 1) * pageSize + 1}
                                    </span>
                                    –
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {Math.min(safePage * pageSize, sortedRows.length)}
                                    </span>
                                    {' '}of{' '}
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">{sortedRows.length}</span> entries
                                </p>

                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setPage(1)}
                                        disabled={safePage === 1}
                                        className="px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        «
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                                        disabled={safePage === 1}
                                        className="p-1.5 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>

                                    {pageNums.map((n, index) => (
                                        n === '…'
                                            ? <span key={`e-${index}`} className="px-2 text-xs text-gray-400">…</span>
                                            : (
                                                <button
                                                    type="button"
                                                    key={n}
                                                    onClick={() => setPage(n)}
                                                    className={`min-w-[30px] py-1.5 text-xs rounded border transition-colors ${safePage === n
                                                        ? 'bg-blue-600 border-blue-600 text-white font-semibold'
                                                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                    }`}
                                                >
                                                    {n}
                                                </button>
                                            )
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                        disabled={safePage === totalPages}
                                        className="p-1.5 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPage(totalPages)}
                                        disabled={safePage === totalPages}
                                        className="px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        »
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}