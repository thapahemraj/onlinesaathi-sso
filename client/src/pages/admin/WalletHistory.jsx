import { useEffect, useMemo, useState } from 'react';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Download,
    Search,
    Wallet,
    X,
} from 'lucide-react';

const PAGE_SIZES = [10, 25, 50, 100];
const ACCOUNT_TYPES = ['All', 'User Wallet', 'Saathi Wallet', 'Partner Wallet'];
const SERVICES = ['All', 'Add Money', 'Recharge', 'Utility Bill', 'Government Service'];
const SUB_SERVICES = ['All', 'UPI', 'Card', 'Wallet Transfer', 'AEPS'];
const WALLET_HISTORY_COLUMN_WIDTHS = [
    '170px',
    '80px',
    '90px',
    '140px',
    '145px',
    '135px',
    '65px',
    '65px',
    '135px',
    '170px',
    '150px',
    '190px',
    '240px',
    '155px',
];

const WALLET_HISTORY_TABLE_MIN_WIDTH = WALLET_HISTORY_COLUMN_WIDTHS.reduce(
    (total, width) => total + Number.parseInt(width, 10),
    0
);

const HEADER_CELL_CLASS = 'border-b border-gray-200 bg-gray-50 px-4 py-3 text-center font-semibold whitespace-nowrap dark:border-gray-700 dark:bg-[#232323]';

const TRANSACTIONS = [
    {
        id: 1,
        dateTime: '2026-03-14T10:15',
        credit: 4500,
        debit: 0,
        walletBalance: 18420,
        serviceCharge: 20,
        platformFees: 10,
        gst: 5,
        tds: 0,
        accountType: 'User Wallet',
        serviceName: 'Add Money',
        subServiceName: 'UPI',
        userName: 'Aarav Sharma',
        utrNumber: 'UTR3322110099',
        narration: 'Wallet top-up via UPI',
    },
    {
        id: 2,
        dateTime: '2026-03-14T09:45',
        credit: 0,
        debit: 1299,
        walletBalance: 13920,
        serviceCharge: 15,
        platformFees: 8,
        gst: 4,
        tds: 0,
        accountType: 'User Wallet',
        serviceName: 'Recharge',
        subServiceName: 'Wallet Transfer',
        userName: 'Priya Singh',
        utrNumber: 'UTR9988776611',
        narration: 'Mobile recharge successful',
    },
    {
        id: 3,
        dateTime: '2026-03-14T09:10',
        credit: 3200,
        debit: 0,
        walletBalance: 25200,
        serviceCharge: 10,
        platformFees: 5,
        gst: 2,
        tds: 0,
        accountType: 'Saathi Wallet',
        serviceName: 'Government Service',
        subServiceName: 'AEPS',
        userName: 'Rohan Verma',
        utrNumber: 'UTR5544332211',
        narration: 'Commission settlement',
    },
    {
        id: 4,
        dateTime: '2026-03-13T17:58',
        credit: 0,
        debit: 800,
        walletBalance: 16750,
        serviceCharge: 12,
        platformFees: 6,
        gst: 3,
        tds: 1,
        accountType: 'Partner Wallet',
        serviceName: 'Utility Bill',
        subServiceName: 'Card',
        userName: 'Sneha Gupta',
        utrNumber: 'UTR1200345600',
        narration: 'Electricity bill payment',
    },
    {
        id: 5,
        dateTime: '2026-03-13T16:44',
        credit: 2200,
        debit: 0,
        walletBalance: 34800,
        serviceCharge: 9,
        platformFees: 5,
        gst: 2,
        tds: 0,
        accountType: 'Saathi Wallet',
        serviceName: 'Add Money',
        subServiceName: 'UPI',
        userName: 'Vikram Yadav',
        utrNumber: 'UTR2211334455',
        narration: 'Partner collection settlement',
    },
    {
        id: 6,
        dateTime: '2026-03-13T15:20',
        credit: 0,
        debit: 999,
        walletBalance: 14200,
        serviceCharge: 10,
        platformFees: 6,
        gst: 3,
        tds: 1,
        accountType: 'User Wallet',
        serviceName: 'Utility Bill',
        subServiceName: 'Wallet Transfer',
        userName: 'Ananya Mishra',
        utrNumber: 'UTR7788554422',
        narration: 'DTH recharge debit',
    },
    {
        id: 7,
        dateTime: '2026-03-13T14:11',
        credit: 5100,
        debit: 0,
        walletBalance: 41100,
        serviceCharge: 18,
        platformFees: 9,
        gst: 4,
        tds: 0,
        accountType: 'Partner Wallet',
        serviceName: 'Government Service',
        subServiceName: 'AEPS',
        userName: 'Rahul Thapa',
        utrNumber: 'UTR3344556677',
        narration: 'Service payout credit',
    },
    {
        id: 8,
        dateTime: '2026-03-13T13:00',
        credit: 0,
        debit: 1450,
        walletBalance: 29650,
        serviceCharge: 14,
        platformFees: 7,
        gst: 3,
        tds: 1,
        accountType: 'Saathi Wallet',
        serviceName: 'Recharge',
        subServiceName: 'Card',
        userName: 'Pooja Karki',
        utrNumber: 'UTR8899776655',
        narration: 'Data recharge processed',
    },
];

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
}).format(value);

const formatDateTime = (value) => {
    if (!value) return '-';

    return new Date(value).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
};

const getOpeningBalance = (row) => Math.max(row.walletBalance - row.credit + row.debit, 0);

const SortArrow = ({ active, direction }) => (
    <span className="ml-2 inline-flex flex-col leading-none">
        <ChevronUp size={12} className={active && direction === 'asc' ? 'text-blue-600' : 'text-gray-300 dark:text-gray-600'} />
        <ChevronDown size={12} className={active && direction === 'desc' ? 'text-blue-600' : 'text-gray-300 dark:text-gray-600'} />
    </span>
);

export default function WalletHistory() {
    const [filtersCollapsed, setFiltersCollapsed] = useState(false);
    const [dateRange, setDateRange] = useState('14/03/26 - 14/03/26');
    const [accountType, setAccountType] = useState('All');
    const [serviceName, setServiceName] = useState('All');
    const [subServiceName, setSubServiceName] = useState('All');
    const [search, setSearch] = useState('');
    const [pageSize, setPageSize] = useState(50);
    const [page, setPage] = useState(1);
    const [sortField, setSortField] = useState('dateTime');
    const [sortDirection, setSortDirection] = useState('desc');

    useEffect(() => {
        setPage(1);
    }, [accountType, serviceName, subServiceName, dateRange, search, pageSize]);

    const filteredRows = useMemo(() => {
        const query = search.trim().toLowerCase();

        return TRANSACTIONS.filter((row) => {
            const matchesAccount = accountType === 'All' || row.accountType === accountType;
            const matchesService = serviceName === 'All' || row.serviceName === serviceName;
            const matchesSubService = subServiceName === 'All' || row.subServiceName === subServiceName;
            const matchesSearch = !query || [
                row.userName,
                row.utrNumber,
                row.narration,
                row.accountType,
                row.serviceName,
                row.subServiceName,
                formatDateTime(row.dateTime),
            ].some((value) => String(value).toLowerCase().includes(query));

            return matchesAccount && matchesService && matchesSubService && matchesSearch;
        });
    }, [accountType, serviceName, subServiceName, search]);

    const sortedRows = useMemo(() => {
        const rows = [...filteredRows];

        rows.sort((left, right) => {
            const leftValue = sortField === 'dateTime' ? new Date(left.dateTime).getTime() : left[sortField];
            const rightValue = sortField === 'dateTime' ? new Date(right.dateTime).getTime() : right[sortField];

            if (leftValue < rightValue) return sortDirection === 'asc' ? -1 : 1;
            if (leftValue > rightValue) return sortDirection === 'asc' ? 1 : -1;
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
        setSortDirection(field === 'dateTime' ? 'desc' : 'asc');
    };

    const handleExport = () => {
        if (!sortedRows.length) return;

        const header = [
            'Date & Time',
            'Credit',
            'Debit',
            'Wallet Balance',
            'Service Charge',
            'Platform Fees',
            'GST',
            'TDS',
            'Account Type',
            'Service Name',
            'User Name',
            'UTR Number / Receipts',
            'Narration',
            'Opening Balance',
        ];

        const body = sortedRows.map((row) => [
            formatDateTime(row.dateTime),
            row.credit,
            row.debit,
            row.walletBalance,
            row.serviceCharge,
            row.platformFees,
            row.gst,
            row.tds,
            row.accountType,
            row.serviceName,
            row.userName,
            row.utrNumber,
            row.narration,
            formatCurrency(getOpeningBalance(row)),
        ].join(','));

        const blob = new Blob([[header.join(','), ...body].join('\n')], { type: 'text/csv' });
        const link = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(blob),
            download: 'wallet-history.csv',
        });

        link.click();
        URL.revokeObjectURL(link.href);
    };

    return (
        <div className="h-full min-h-0">
            <div className="bg-white dark:bg-[#2c2c2c] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 h-full min-h-0 flex flex-col">
                <div className="bg-white dark:bg-[#2c2c2c]">
                    <div
                        className="flex items-center gap-3 px-5 py-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer select-none"
                        onClick={() => setFiltersCollapsed((current) => !current)}
                    >
                        <Wallet size={16} className="text-blue-600 flex-shrink-0" />
                        <span className="font-semibold text-sm text-blue-600 tracking-wide uppercase">Wallet History</span>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${filtersCollapsed ? '' : 'rotate-180'}`} />
                    </div>

                    {!filtersCollapsed && (
                        <div className="flex flex-wrap items-end justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex-1 min-w-[160px]" />

                            <div className="overflow-x-auto hide-scrollbar w-full xl:w-auto xl:max-w-[1120px]">
                                <div className="grid grid-cols-4 gap-3 min-w-[860px]">
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Transaction Date</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={dateRange}
                                                onChange={(event) => setDateRange(event.target.value)}
                                                className="w-full pl-3 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setDateRange('')}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400"
                                                title="Clear date range"
                                            >
                                                <X size={13} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1 min-w-0">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Account Type</label>
                                        <select
                                            value={accountType}
                                            onChange={(event) => setAccountType(event.target.value)}
                                            className="w-full py-2 pl-3 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200"
                                        >
                                            {ACCOUNT_TYPES.map((item) => (
                                                <option key={item} value={item}>{item === 'All' ? 'Select Account Type' : item}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-1 min-w-0">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Service Name</label>
                                        <select
                                            value={serviceName}
                                            onChange={(event) => setServiceName(event.target.value)}
                                            className="w-full py-2 pl-3 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200"
                                        >
                                            {SERVICES.map((item) => (
                                                <option key={item} value={item}>{item === 'All' ? 'Select Service' : item}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-1 min-w-0">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Sub Service Name</label>
                                        <select
                                            value={subServiceName}
                                            onChange={(event) => setSubServiceName(event.target.value)}
                                            className="w-full py-2 pl-3 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200"
                                        >
                                            {SUB_SERVICES.map((item) => (
                                                <option key={item} value={item}>{item === 'All' ? 'Select Sub Service' : item}</option>
                                            ))}
                                        </select>
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
                            onChange={(event) => setPageSize(Number(event.target.value))}
                            className="border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-2.5 bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200 text-sm"
                        >
                            {PAGE_SIZES.map((size) => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                        <span className="text-sm text-gray-600 dark:text-gray-400">entries</span>

                        <div className="flex-1" />

                        <button
                            type="button"
                            onClick={() => window.alert('Deduct wallet action can be connected to backend API.')}
                            className="flex items-center gap-2 bg-[#ef6c66] hover:bg-[#e45750] text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm"
                        >
                            <Wallet size={14} /> Deduct Wallet
                        </button>

                        <button
                            type="button"
                            onClick={handleExport}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm"
                        >
                            <Download size={14} /> Export to Excel
                        </button>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="pl-3 pr-9 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200 w-44"
                            />
                            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="relative flex-1 min-h-0 overflow-auto hide-scrollbar overscroll-x-contain">
                        <table
                            className="table-fixed border-separate border-spacing-0 text-sm [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap"
                            style={{ width: WALLET_HISTORY_TABLE_MIN_WIDTH, minWidth: WALLET_HISTORY_TABLE_MIN_WIDTH }}
                        >
                            <colgroup>
                                {WALLET_HISTORY_COLUMN_WIDTHS.map((width, index) => (
                                    <col key={`${width}-${index}`} style={{ width }} />
                                ))}
                            </colgroup>
                            <thead>
                                <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    <th className={HEADER_CELL_CLASS}>
                                        <button type="button" onClick={() => handleSort('dateTime')} className="inline-flex items-center justify-center w-full font-semibold">
                                            Date & Time
                                            <SortArrow active={sortField === 'dateTime'} direction={sortDirection} />
                                        </button>
                                    </th>
                                    <th className={HEADER_CELL_CLASS}>Credit</th>
                                    <th className={HEADER_CELL_CLASS}>Debit</th>
                                    <th className={HEADER_CELL_CLASS}>Wallet Balance</th>
                                    <th className={HEADER_CELL_CLASS}>Service Charge</th>
                                    <th className={HEADER_CELL_CLASS}>Platform Fees</th>
                                    <th className={HEADER_CELL_CLASS}>GST</th>
                                    <th className={HEADER_CELL_CLASS}>TDS</th>
                                    <th className={HEADER_CELL_CLASS}>Account Type</th>
                                    <th className={HEADER_CELL_CLASS}>Service Name</th>
                                    <th className={HEADER_CELL_CLASS}>User Name</th>
                                    <th className={HEADER_CELL_CLASS}>UTR Number / Receipts</th>
                                    <th className={HEADER_CELL_CLASS}>Narration</th>
                                    <th className={HEADER_CELL_CLASS}>Opening Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {visibleRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={WALLET_HISTORY_COLUMN_WIDTHS.length} className="px-6 py-16 text-center text-sm text-gray-500 dark:text-gray-400">
                                            No wallet history records found.
                                        </td>
                                    </tr>
                                ) : visibleRows.map((row) => (
                                    <tr key={row.id} className="hover:bg-blue-50/30 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-xs text-gray-500 dark:text-gray-400">{formatDateTime(row.dateTime)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-green-600">{formatCurrency(row.credit)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-red-500">{formatCurrency(row.debit)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(row.walletBalance)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-600 dark:text-gray-400">{formatCurrency(row.serviceCharge)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-600 dark:text-gray-400">{formatCurrency(row.platformFees)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-600 dark:text-gray-400">{formatCurrency(row.gst)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-600 dark:text-gray-400">{formatCurrency(row.tds)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-600 dark:text-gray-400">{row.accountType}</td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-600 dark:text-gray-400">{row.serviceName}</td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center font-semibold text-gray-700 dark:text-gray-200">{row.userName}</td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-600 dark:text-gray-400">{row.utrNumber}</td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-600 dark:text-gray-400">
                                            <span className="inline-block max-w-[220px] truncate align-middle">{row.narration}</span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(getOpeningBalance(row))}</td>
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
                            -
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
        </div>
    );
}