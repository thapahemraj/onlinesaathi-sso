import { useEffect, useMemo, useState } from 'react';
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Calculator,
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    CircleDollarSign,
    Coins,
    Download,
    Landmark,
    Search,
    Wallet,
    X,
} from 'lucide-react';

const PAGE_SIZES = [10, 25, 50, 100];

const METRIC_CARDS = [
    {
        id: 'add-money',
        label: 'ADD MONEY',
        value: 376677.0,
        bg: 'bg-[#efe6d8]',
        icon: Wallet,
        iconBg: 'bg-[#fff4de]',
        iconColor: 'text-[#e08a00]',
    },
    {
        id: 'transaction',
        label: 'TRANSACTION',
        value: 266545.0,
        bg: 'bg-[#dbe4ef]',
        icon: Coins,
        iconBg: 'bg-[#e4eeff]',
        iconColor: 'text-[#1670e8]',
    },
    {
        id: 'tds',
        label: 'TDS',
        value: 0.0,
        bg: 'bg-[#d9e8ee]',
        icon: Calculator,
        iconBg: 'bg-[#e6f8ff]',
        iconColor: 'text-[#0e95aa]',
    },
    {
        id: 'gst',
        label: 'GST',
        value: 0.0,
        bg: 'bg-[#e3d8ef]',
        icon: Landmark,
        iconBg: 'bg-[#efe7ff]',
        iconColor: 'text-[#6f43c7]',
    },
    {
        id: 'income',
        label: 'INCOME',
        value: 599.6,
        bg: 'bg-[#deeadf]',
        icon: ArrowUpCircle,
        iconBg: 'bg-[#e8f8ea]',
        iconColor: 'text-[#2ea44f]',
    },
    {
        id: 'expense',
        label: 'EXPENSE',
        value: 0.0,
        bg: 'bg-[#efdee3]',
        icon: ArrowDownCircle,
        iconBg: 'bg-[#feecef]',
        iconColor: 'text-[#d73a49]',
    },
    {
        id: 'customer-opening',
        label: 'CUSTOMER OPENING',
        value: 4541877.76,
        bg: 'bg-[#dbe7f0]',
        icon: CircleDollarSign,
        iconBg: 'bg-[#e5f4fb]',
        iconColor: 'text-[#1a9ab2]',
    },
    {
        id: 'customer-closing',
        label: 'CUSTOMER CLOSING',
        value: 3120653.56,
        bg: 'bg-[#ddece7]',
        icon: CircleDollarSign,
        iconBg: 'bg-[#e6f6ef]',
        iconColor: 'text-[#13a874]',
    },
    {
        id: 'admin-opening',
        label: 'ADMIN OPENING',
        value: 1566009.4,
        bg: 'bg-[#e6dcef]',
        icon: CircleDollarSign,
        iconBg: 'bg-[#f0e8fb]',
        iconColor: 'text-[#6f43c7]',
    },
    {
        id: 'admin-closing',
        label: 'ADMIN CLOSING',
        value: 1566526.85,
        bg: 'bg-[#f0e7da]',
        icon: CircleDollarSign,
        iconBg: 'bg-[#fff4de]',
        iconColor: 'text-[#e08a00]',
    },
];

const LEDGER_ROWS = [
    {
        id: 1,
        userName: 'Aarav Sharma',
        userRole: 'User',
        openingBalance: 150000,
        addMoney: 25000,
        transaction: 12000,
        platformFees: 220,
        serviceCharges: 180,
        gst: 32,
        tds: 0,
        commission: 190,
        refundAmount: 120,
        walletDeduct: 0,
    },
    {
        id: 2,
        userName: 'Priya Singh',
        userRole: 'Member',
        openingBalance: 98500,
        addMoney: 15000,
        transaction: 7600,
        platformFees: 150,
        serviceCharges: 125,
        gst: 22,
        tds: 0,
        commission: 95,
        refundAmount: 0,
        walletDeduct: 0,
    },
    {
        id: 3,
        userName: 'Rohan Verma',
        userRole: 'Saathi',
        openingBalance: 213400,
        addMoney: 50000,
        transaction: 22550,
        platformFees: 390,
        serviceCharges: 300,
        gst: 48,
        tds: 0,
        commission: 310,
        refundAmount: 0,
        walletDeduct: 120,
    },
    {
        id: 4,
        userName: 'Sneha Gupta',
        userRole: 'User',
        openingBalance: 78500,
        addMoney: 11000,
        transaction: 9500,
        platformFees: 140,
        serviceCharges: 130,
        gst: 20,
        tds: 0,
        commission: 5,
        refundAmount: 0,
        walletDeduct: 0,
    },
    {
        id: 5,
        userName: 'Vikram Yadav',
        userRole: 'Agent',
        openingBalance: 402100,
        addMoney: 70000,
        transaction: 36200,
        platformFees: 520,
        serviceCharges: 405,
        gst: 68,
        tds: 0,
        commission: 460,
        refundAmount: 0,
        walletDeduct: 380,
    },
    {
        id: 6,
        userName: 'Ananya Mishra',
        userRole: 'Member',
        openingBalance: 126700,
        addMoney: 21000,
        transaction: 10220,
        platformFees: 185,
        serviceCharges: 170,
        gst: 27,
        tds: 0,
        commission: 140,
        refundAmount: 80,
        walletDeduct: 0,
    },
    {
        id: 7,
        userName: 'Rahul Thapa',
        userRole: 'Support Team',
        openingBalance: 312000,
        addMoney: 46000,
        transaction: 29240,
        platformFees: 410,
        serviceCharges: 290,
        gst: 49,
        tds: 0,
        commission: 330,
        refundAmount: 0,
        walletDeduct: 0,
    },
    {
        id: 8,
        userName: 'Pooja Karki',
        userRole: 'Saathi',
        openingBalance: 284300,
        addMoney: 33000,
        transaction: 19410,
        platformFees: 275,
        serviceCharges: 240,
        gst: 39,
        tds: 0,
        commission: 260,
        refundAmount: 50,
        walletDeduct: 0,
    },
];

const formatNumber = (value) => new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
}).format(value || 0);

const calcClosingBalance = (row) => (
    row.openingBalance
    + row.addMoney
    + row.commission
    + row.refundAmount
    - row.transaction
    - row.platformFees
    - row.serviceCharges
    - row.gst
    - row.tds
    - row.walletDeduct
);

export default function AdminLedger() {
    const [summaryCollapsed, setSummaryCollapsed] = useState(false);
    const [dateRange, setDateRange] = useState('14/03/26 - 14/03/26');
    const [pageSize, setPageSize] = useState(50);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setPage(1);
    }, [search, pageSize]);

    const filteredRows = useMemo(() => {
        const query = search.trim().toLowerCase();

        return LEDGER_ROWS.filter((row) => {
            if (!query) return true;

            return [
                row.userName,
                row.userRole,
                formatNumber(row.openingBalance),
                formatNumber(calcClosingBalance(row)),
            ].some((value) => String(value).toLowerCase().includes(query));
        });
    }, [search]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const visibleRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize);

    const pageNums = [];
    for (let i = 1; i <= totalPages; i += 1) {
        if (i === 1 || i === totalPages || Math.abs(i - safePage) <= 2) {
            pageNums.push(i);
        } else if (pageNums[pageNums.length - 1] !== '...') {
            pageNums.push('...');
        }
    }

    const exportRows = () => {
        if (!filteredRows.length) return;

        const header = [
            'User Name',
            'User Role',
            'Opening Balance',
            'Add Money',
            'Transaction',
            'Platform Fees',
            'Service Charges',
            'GST',
            'TDS',
            'Commission',
            'Refund Amount',
            'Wallet Deduct',
            'Closing Balance',
        ];

        const body = filteredRows.map((row) => [
            row.userName,
            row.userRole,
            formatNumber(row.openingBalance),
            formatNumber(row.addMoney),
            formatNumber(row.transaction),
            formatNumber(row.platformFees),
            formatNumber(row.serviceCharges),
            formatNumber(row.gst),
            formatNumber(row.tds),
            formatNumber(row.commission),
            formatNumber(row.refundAmount),
            formatNumber(row.walletDeduct),
            formatNumber(calcClosingBalance(row)),
        ].join(','));

        const blob = new Blob([[header.join(','), ...body].join('\n')], { type: 'text/csv' });
        const anchor = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(blob),
            download: 'admin-ledger.csv',
        });

        anchor.click();
        URL.revokeObjectURL(anchor.href);
    };

    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={() => setSummaryCollapsed((current) => !current)}
                className="inline-flex items-center gap-1 text-[30px] font-bold uppercase tracking-wide text-[#586fe5]"
            >
                <span className="leading-none">Admin Ledger</span>
                {summaryCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>

            {!summaryCollapsed && (
                <div className="rounded-md border border-gray-200 bg-[#f4f4f5] p-5 dark:border-gray-700 dark:bg-[#2c2c2c]">
                    <div className="max-w-[280px] space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Transaction Date</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={dateRange}
                                onChange={(event) => setDateRange(event.target.value)}
                                className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-4 pr-16 text-sm text-gray-700 focus:border-[#5a6ff0] focus:outline-none dark:border-gray-600 dark:bg-[#323232] dark:text-gray-200"
                            />
                            <CalendarDays size={16} className="pointer-events-none absolute right-9 top-1/2 -translate-y-1/2 text-gray-500" />
                            <button
                                type="button"
                                onClick={() => setDateRange('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label="Clear date range"
                                title="Clear date range"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        {METRIC_CARDS.map((card) => (
                            <div key={card.id} className={`rounded-md px-4 py-3 shadow-sm ${card.bg}`}>
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${card.iconBg}`}>
                                        <card.icon size={12} className={card.iconColor} strokeWidth={2} />
                                    </span>
                                    <span className="text-sm font-semibold uppercase text-gray-600">{card.label}</span>
                                </div>
                                <p className="mt-1 text-[19px] sm:text-[21px] font-bold leading-tight text-gray-800">
                                    {formatNumber(card.value)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="rounded-md border border-gray-200 bg-[#f4f4f5] p-5 dark:border-gray-700 dark:bg-[#2c2c2c]">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
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
                            <button type="button" className="inline-flex items-center justify-center bg-[#5b6ff0] px-4 text-white">
                                <Search size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#262626]">
                    <div className="relative max-h-[520px] overflow-auto hide-scrollbar overscroll-x-contain">
                        <table className="w-full min-w-[1800px] text-sm text-left [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap">
                            <thead className="sticky top-0 z-10 bg-[#f7f7f8] dark:bg-[#202020]">
                                <tr className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">
                                        <Wallet size={14} />
                                    </th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">User Name</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">User Role</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Opening Balance</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Add Money</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Transaction</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Platform Fees</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Service Charges</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">GST</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">TDS</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Commission</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Refund Amount</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Wallet Deduct</th>
                                    <th className="border-b border-gray-200 px-4 py-3 text-left dark:border-gray-700">Closing Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {visibleRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={14} className="px-6 py-16 text-center text-sm text-gray-500 dark:text-gray-400">
                                            No admin ledger records found.
                                        </td>
                                    </tr>
                                ) : visibleRows.map((row) => (
                                    <tr key={row.id} className="text-gray-700 transition-colors hover:bg-[#f8f9ff] dark:text-gray-200 dark:hover:bg-white/5">
                                        <td className="border-r border-gray-100 px-4 py-4 dark:border-gray-800">
                                            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#e6eefc] text-[#4168de]">
                                                <Wallet size={12} />
                                            </span>
                                        </td>
                                        <td className="border-r border-gray-100 px-4 py-4 font-medium whitespace-nowrap dark:border-gray-800">{row.userName}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{row.userRole}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{formatNumber(row.openingBalance)}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{formatNumber(row.addMoney)}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{formatNumber(row.transaction)}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{formatNumber(row.platformFees)}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{formatNumber(row.serviceCharges)}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{formatNumber(row.gst)}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{formatNumber(row.tds)}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{formatNumber(row.commission)}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{formatNumber(row.refundAmount)}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{formatNumber(row.walletDeduct)}</td>
                                        <td className="px-4 py-4 font-semibold text-[#3f61dc] whitespace-nowrap">{formatNumber(calcClosingBalance(row))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50/70 px-5 py-4 dark:border-gray-700 dark:bg-black/10">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredRows.length === 0 ? 0 : (safePage - 1) * pageSize + 1}</span>
                            -<span className="font-semibold text-gray-700 dark:text-gray-300">{Math.min(safePage * pageSize, filteredRows.length)}</span>
                            {' '}of <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredRows.length}</span> entries
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
                                n === '...'
                                    ? <span key={`e-${index}`} className="px-2 text-xs text-gray-400">...</span>
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
