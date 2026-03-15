import { useEffect, useMemo, useState } from 'react';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Download,
    Receipt,
    Search,
    UserPlus,
    X,
} from 'lucide-react';

const PAGE_SIZES = [10, 25, 50, 100];
const STATUS_OPTIONS = ['Not Verified', 'Verified', 'Rejected'];
const BANK_OPTIONS = ['Select Bank', 'Nabil Bank', 'SBI', 'HDFC', 'ICICI'];
const DEPOSIT_VIA_OPTIONS = ['Select Deposit Via', 'Cash Deposit', 'UPI', 'Bank Transfer', 'Card'];

const REQUEST_ROWS = [
    {
        id: 1,
        receipt: 'RCPT-2001',
        transactionDate: '2026-03-14T10:22',
        requestDateTime: '2026-03-14T10:10',
        approveRejectDateTime: '',
        rejectReason: '',
        depositorName: 'Aarav Sharma',
        mobileNumber: '9876543210',
        bankName: 'Nabil Bank',
        depositVia: 'Bank Transfer',
        transactionRefNo: 'TXN-983421',
        amount: 50000,
        closingBalance: 126500,
        approvedBy: 'System',
        status: 'Not Verified',
    },
    {
        id: 2,
        receipt: 'RCPT-2002',
        transactionDate: '2026-03-14T09:40',
        requestDateTime: '2026-03-14T09:18',
        approveRejectDateTime: '2026-03-14T09:45',
        rejectReason: '',
        depositorName: 'Priya Singh',
        mobileNumber: '9891122334',
        bankName: 'SBI',
        depositVia: 'Cash Deposit',
        transactionRefNo: 'TXN-983422',
        amount: 25000,
        closingBalance: 81500,
        approvedBy: 'Admin 1',
        status: 'Verified',
    },
    {
        id: 3,
        receipt: 'RCPT-2003',
        transactionDate: '2026-03-13T18:12',
        requestDateTime: '2026-03-13T17:59',
        approveRejectDateTime: '',
        rejectReason: '',
        depositorName: 'Rohan Verma',
        mobileNumber: '9810011223',
        bankName: 'HDFC',
        depositVia: 'UPI',
        transactionRefNo: 'TXN-983423',
        amount: 12500,
        closingBalance: 72200,
        approvedBy: 'Admin 2',
        status: 'Not Verified',
    },
    {
        id: 4,
        receipt: 'RCPT-2004',
        transactionDate: '2026-03-13T17:08',
        requestDateTime: '2026-03-13T16:57',
        approveRejectDateTime: '2026-03-13T17:20',
        rejectReason: 'Receipt mismatch',
        depositorName: 'Sneha Gupta',
        mobileNumber: '9900012345',
        bankName: 'ICICI',
        depositVia: 'Card',
        transactionRefNo: 'TXN-983424',
        amount: 18000,
        closingBalance: 96400,
        approvedBy: 'Admin 1',
        status: 'Rejected',
    },
    {
        id: 5,
        receipt: 'RCPT-2005',
        transactionDate: '2026-03-13T14:31',
        requestDateTime: '2026-03-13T14:15',
        approveRejectDateTime: '',
        rejectReason: '',
        depositorName: 'Vikram Yadav',
        mobileNumber: '9922233344',
        bankName: 'Nabil Bank',
        depositVia: 'Bank Transfer',
        transactionRefNo: 'TXN-983425',
        amount: 65000,
        closingBalance: 167450,
        approvedBy: 'System',
        status: 'Not Verified',
    },
];

const formatNumber = (value) => new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
}).format(value || 0);

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

export default function AddMoneyRequest() {
    const [filtersCollapsed, setFiltersCollapsed] = useState(false);
    const [dateFilter, setDateFilter] = useState('Select Date');
    const [status, setStatus] = useState('Not Verified');
    const [bank, setBank] = useState('Select Bank');
    const [depositVia, setDepositVia] = useState('Select Deposit Via');
    const [search, setSearch] = useState('');
    const [pageSize, setPageSize] = useState(50);
    const [page, setPage] = useState(1);
    const [sortDirection, setSortDirection] = useState('desc');

    useEffect(() => {
        setPage(1);
    }, [search, pageSize, status, bank, depositVia]);

    const filteredRows = useMemo(() => {
        const query = search.trim().toLowerCase();

        return REQUEST_ROWS.filter((row) => {
            const matchesStatus = status === 'Not Verified' ? row.status === 'Not Verified' : row.status === status;
            const matchesBank = bank === 'Select Bank' || row.bankName === bank;
            const matchesDepositVia = depositVia === 'Select Deposit Via' || row.depositVia === depositVia;
            const matchesSearch = !query || [
                row.receipt,
                row.depositorName,
                row.mobileNumber,
                row.bankName,
                row.depositVia,
                row.transactionRefNo,
                row.approvedBy,
            ].some((value) => String(value).toLowerCase().includes(query));

            return matchesStatus && matchesBank && matchesDepositVia && matchesSearch;
        });
    }, [search, status, bank, depositVia]);

    const sortedRows = useMemo(() => {
        const rows = [...filteredRows];
        rows.sort((left, right) => {
            const leftValue = new Date(left.transactionDate).getTime();
            const rightValue = new Date(right.transactionDate).getTime();

            if (leftValue < rightValue) return sortDirection === 'asc' ? -1 : 1;
            if (leftValue > rightValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        return rows;
    }, [filteredRows, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const visibleRows = sortedRows.slice((safePage - 1) * pageSize, safePage * pageSize);

    const pageNums = [];
    for (let i = 1; i <= totalPages; i += 1) {
        if (i === 1 || i === totalPages || Math.abs(i - safePage) <= 2) {
            pageNums.push(i);
        } else if (pageNums[pageNums.length - 1] !== '...') {
            pageNums.push('...');
        }
    }

    const pendingMoney = REQUEST_ROWS
        .filter((row) => row.status === 'Not Verified')
        .reduce((sum, row) => sum + row.amount, 0);

    const exportRows = () => {
        if (!sortedRows.length) return;

        const header = [
            'Receipt',
            'Transaction Date',
            'Depositor Name',
            'Mobile Number',
            'Bank Name',
            'Deposit Via',
            'Transaction Ref No',
            'Amount',
            'Closing Balance',
            'Approve/Reject By',
            'Approve/Reject DateTime',
            'Reject Reason',
            'Request Date Time',
        ];

        const body = sortedRows.map((row) => [
            row.receipt,
            formatDateTime(row.transactionDate),
            row.depositorName,
            row.mobileNumber,
            row.bankName,
            row.depositVia,
            row.transactionRefNo,
            formatNumber(row.amount),
            formatNumber(row.closingBalance),
            row.approvedBy,
            row.approveRejectDateTime ? formatDateTime(row.approveRejectDateTime) : '-',
            row.rejectReason || '-',
            row.requestDateTime ? formatDateTime(row.requestDateTime) : '-',
        ].join(','));

        const blob = new Blob([[header.join(','), ...body].join('\n')], { type: 'text/csv' });
        const anchor = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(blob),
            download: 'add-money-history.csv',
        });
        anchor.click();
        URL.revokeObjectURL(anchor.href);
    };

    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={() => setFiltersCollapsed((current) => !current)}
                className="inline-flex items-center gap-1 text-[30px] font-bold uppercase tracking-wide text-[#586fe5]"
            >
                <span className="leading-none">Add Money History</span>
                {filtersCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>

            {!filtersCollapsed && (
                <div className="rounded-md border border-gray-200 bg-[#f4f4f5] p-5 dark:border-gray-700 dark:bg-[#2c2c2c]">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                        <div className="min-h-[64px] flex-1" />

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[66px_140px_205px_138px_138px_160px]">
                            <div className="flex items-end">
                                <button
                                    type="button"
                                    className="h-10 w-full rounded-md bg-[#586fe5] text-white inline-flex items-center justify-center"
                                    title="Add request"
                                >
                                    <UserPlus size={18} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Pending Money</label>
                                <div className="h-10 rounded-md bg-[#efb645] px-3 text-center text-[26px] font-bold text-white leading-10">
                                    {Math.round(pendingMoney)}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Transaction Date</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={dateFilter}
                                        onChange={(event) => setDateFilter(event.target.value)}
                                        className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-700 focus:border-[#5a6ff0] focus:outline-none dark:border-gray-600 dark:bg-[#323232] dark:text-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setDateFilter('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        aria-label="Clear date filter"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Status</label>
                                <select
                                    value={status}
                                    onChange={(event) => setStatus(event.target.value)}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-[#5a6ff0] focus:outline-none dark:border-gray-600 dark:bg-[#323232] dark:text-gray-200"
                                >
                                    {STATUS_OPTIONS.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Bank</label>
                                <select
                                    value={bank}
                                    onChange={(event) => setBank(event.target.value)}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-[#5a6ff0] focus:outline-none dark:border-gray-600 dark:bg-[#323232] dark:text-gray-200"
                                >
                                    {BANK_OPTIONS.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Deposit Via</label>
                                <select
                                    value={depositVia}
                                    onChange={(event) => setDepositVia(event.target.value)}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-[#5a6ff0] focus:outline-none dark:border-gray-600 dark:bg-[#323232] dark:text-gray-200"
                                >
                                    {DEPOSIT_VIA_OPTIONS.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
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
                        <table className="w-full min-w-[2250px] text-sm text-left [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap">
                            <thead className="sticky top-0 z-10 bg-[#f7f7f8] dark:bg-[#202020]">
                                <tr className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">
                                        <Receipt size={14} />
                                    </th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Receipt</th>
                                    <th
                                        className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700 cursor-pointer"
                                        onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))}
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            Transaction Date
                                            {sortDirection === 'asc' ? (
                                                <ChevronUp size={14} className="text-green-600" />
                                            ) : (
                                                <ChevronDown size={14} className="text-green-600" />
                                            )}
                                        </span>
                                    </th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Depositor Name</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Mobile Number</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Bank Name</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Deposit Via</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Transaction Ref No</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Amount</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Closing Balance</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Approve/Reject By</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Approve/Reject DateTime</th>
                                    <th className="border-b border-r border-gray-200 px-4 py-3 text-left dark:border-gray-700">Reject Reason</th>
                                    <th className="border-b border-gray-200 px-4 py-3 text-left dark:border-gray-700">Request Date Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {visibleRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={14} className="px-6 py-16 text-center text-sm text-gray-500 dark:text-gray-400">
                                            No add money requests found.
                                        </td>
                                    </tr>
                                ) : visibleRows.map((row) => (
                                    <tr key={row.id} className="text-gray-700 transition-colors hover:bg-[#f8f9ff] dark:text-gray-200 dark:hover:bg-white/5">
                                        <td className="border-r border-gray-100 px-4 py-4 dark:border-gray-800">
                                            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#e9edff] text-[#526be7]">
                                                <Receipt size={12} />
                                            </span>
                                        </td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{row.receipt}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{formatDateTime(row.transactionDate)}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{row.depositorName}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{row.mobileNumber}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{row.bankName}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{row.depositVia}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{row.transactionRefNo}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{formatNumber(row.amount)}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{formatNumber(row.closingBalance)}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">{row.approvedBy}</td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">
                                            {row.approveRejectDateTime ? formatDateTime(row.approveRejectDateTime) : '-'}
                                        </td>
                                        <td className="border-r border-gray-100 px-4 py-4 whitespace-nowrap dark:border-gray-800">
                                            {row.rejectReason || '-'}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            {row.requestDateTime ? formatDateTime(row.requestDateTime) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50/70 px-5 py-4 dark:border-gray-700 dark:bg-black/10">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{sortedRows.length === 0 ? 0 : (safePage - 1) * pageSize + 1}</span>
                            -<span className="font-semibold text-gray-700 dark:text-gray-300">{Math.min(safePage * pageSize, sortedRows.length)}</span>
                            {' '}of <span className="font-semibold text-gray-700 dark:text-gray-300">{sortedRows.length}</span> requests
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
