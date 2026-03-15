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
        <ChevronUp size={12} className={active && direction === 'asc' ? 'text-green-600' : 'text-gray-300'} />
        <ChevronDown size={12} className={active && direction === 'desc' ? 'text-green-600' : 'text-gray-300'} />
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
        <div className="space-y-3">
            <button
                type="button"
                onClick={() => setFiltersCollapsed((current) => !current)}
                className="inline-flex items-center gap-1 text-[28px] font-bold uppercase tracking-wide text-[#586fe5]"
            >
                <span className="text-[28px] leading-none">Wallet History</span>
                {filtersCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>

            {!filtersCollapsed && (
                <div className="rounded-md border border-gray-200 bg-[#f4f4f5] p-5 dark:border-gray-700 dark:bg-[#2c2c2c]">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:items-end">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Transaction Date</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={dateRange}
                                    onChange={(event) => setDateRange(event.target.value)}
                                    className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-700 focus:border-[#5a6ff0] focus:outline-none dark:border-gray-600 dark:bg-[#323232] dark:text-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setDateRange('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    title="Clear date range"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Account Type</label>
                            <select
                                value={accountType}
                                onChange={(event) => setAccountType(event.target.value)}
                                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-[#5a6ff0] focus:outline-none dark:border-gray-600 dark:bg-[#323232] dark:text-gray-200"
                            >
                                {ACCOUNT_TYPES.map((item) => (
                                    <option key={item} value={item}>{item === 'All' ? 'Select Account Type' : item}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Service Name</label>
                            <select
                                value={serviceName}
                                onChange={(event) => setServiceName(event.target.value)}
                                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-[#5a6ff0] focus:outline-none dark:border-gray-600 dark:bg-[#323232] dark:text-gray-200"
                            >
                                {SERVICES.map((item) => (
                                    <option key={item} value={item}>{item === 'All' ? 'Select Service' : item}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Sub Service Name</label>
                            <select
                                value={subServiceName}
                                onChange={(event) => setSubServiceName(event.target.value)}
                                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-[#5a6ff0] focus:outline-none dark:border-gray-600 dark:bg-[#323232] dark:text-gray-200"
                            >
                                {SUB_SERVICES.map((item) => (
                                    <option key={item} value={item}>{item === 'All' ? 'Select Sub Service' : item}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

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
                            onClick={() => window.alert('Deduct wallet action can be connected to backend API.')}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#ef6c66] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#e45750]"
                        >
                            <Wallet size={14} />
                            Deduct Wallet
                        </button>

                        <button
                            type="button"
                            onClick={handleExport}
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
                    <div className="relative max-h-[520px] overflow-auto hide-scrollbar overscroll-x-contain">
                        <table className="w-full min-w-[1900px] text-sm text-left [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap">
                            <thead className="sticky top-0 z-10 bg-[#f7f7f8] dark:bg-[#202020]">
                                <tr className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">
                                        <button type="button" onClick={() => handleSort('dateTime')} className="inline-flex items-center font-semibold">
                                            Date & Time
                                            <SortArrow active={sortField === 'dateTime'} direction={sortDirection} />
                                        </button>
                                    </th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Credit</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Debit</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Wallet Balance</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Service Charge</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Platform Fees</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">GST</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">TDS</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Account Type</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Service Name</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">User Name</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">UTR Number / Receipts</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Narration</th>
                                    <th className="border-b border-gray-200 px-4 py-3 text-left dark:border-gray-700">Opening Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {visibleRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={14} className="px-6 py-16 text-center text-sm text-gray-500 dark:text-gray-400">
                                            No wallet history records found.
                                        </td>
                                    </tr>
                                ) : visibleRows.map((row) => (
                                    <tr key={row.id} className="text-gray-700 transition-colors hover:bg-[#f8f9ff] dark:text-gray-200 dark:hover:bg-white/5">
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{formatDateTime(row.dateTime)}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 text-green-600 whitespace-nowrap dark:border-gray-800">{formatCurrency(row.credit)}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 text-red-500 whitespace-nowrap dark:border-gray-800">{formatCurrency(row.debit)}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 font-semibold text-[#5168eb] whitespace-nowrap dark:border-gray-800">{formatCurrency(row.walletBalance)}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{formatCurrency(row.serviceCharge)}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{formatCurrency(row.platformFees)}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{formatCurrency(row.gst)}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{formatCurrency(row.tds)}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{row.accountType}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{row.serviceName}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{row.userName}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{row.utrNumber}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{row.narration}</td>
                                        <td className="px-4 py-4 font-semibold text-[#5168eb] whitespace-nowrap">{formatCurrency(getOpeningBalance(row))}</td>
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
        </div>
    );
}