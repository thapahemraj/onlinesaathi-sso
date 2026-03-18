import { useEffect, useMemo, useState } from 'react';
import {
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Download,
    Eye,
    FileDown,
    Search,
    UserPlus,
    X,
} from 'lucide-react';

const PAGE_SIZES = [10, 25, 50, 100];
const STATUS_OPTIONS = ['Not Verified', 'Verified', 'Rejected'];
const BANK_OPTIONS = ['Select Bank', 'Nabil Bank', 'SBI', 'HDFC', 'ICICI'];
const DEPOSIT_VIA_OPTIONS = ['Select Deposit Via', 'Cash Deposit', 'UPI', 'Bank Transfer', 'Card'];

// Placeholder receipt images — replace with real URLs / API responses in production
const RECEIPT_IMAGES = [
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80',
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80',
    'https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80',
];

const REQUEST_ROWS = [
    {
        id: 1,
        receipt: 'RCPT-2001',
        receiptImageUrl: RECEIPT_IMAGES[0],
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
        receiptImageUrl: RECEIPT_IMAGES[1],
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
        receiptImageUrl: RECEIPT_IMAGES[2],
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
        receiptImageUrl: RECEIPT_IMAGES[3],
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
        receiptImageUrl: RECEIPT_IMAGES[4],
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

const AMR_COLUMN_WIDTHS = [
    '110px', // approve/reject
    '130px', // receipt
    '160px', // transaction date
    '150px', // depositor name
    '140px', // mobile number
    '130px', // bank name
    '130px', // deposit via
    '170px', // txn ref no
    '110px', // amount
    '140px', // closing balance
    '140px', // approved/rejected by
    '175px', // approve/reject datetime
    '145px', // reject reason
    '160px', // request datetime
];

const AMR_TABLE_MIN_WIDTH = AMR_COLUMN_WIDTHS.reduce(
    (total, w) => total + Number.parseInt(w, 10),
    0
);

const AMR_HEADER_CELL = 'border-b border-r border-gray-200 bg-[#f7f7f8] px-4 py-3 text-left font-semibold whitespace-nowrap dark:border-gray-700 dark:bg-[#202020]';

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

// ---------------------------------------------------------------------------
// Build a minimal valid PDF blob containing the receipt image and trigger a
// direct file download — no print dialog, no external dependencies.
// ---------------------------------------------------------------------------
const downloadReceiptAsPdf = async (receiptId, imageUrl) => {
    // 1. Load the image onto a canvas to obtain raw JPEG bytes
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // continue with blank canvas on failure
        img.src = imageUrl;
    });

    const naturalW = img.naturalWidth || 400;
    const naturalH = img.naturalHeight || 300;
    const canvas = document.createElement('canvas');
    canvas.width = naturalW;
    canvas.height = naturalH;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, naturalW, naturalH);
    if (img.naturalWidth) ctx.drawImage(img, 0, 0);

    const jpegBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (!jpegBlob) return;
    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());

    // 2. Scale image to fit an A4 page (595.28 × 841.89 pt) with margins
    const pageW = 595.28;
    const pageH = 841.89;
    const margin = 40;
    const scale = Math.min((pageW - margin * 2) / naturalW, (pageH - margin * 2) / naturalH, 1);
    const drawW = (naturalW * scale).toFixed(2);
    const drawH = (naturalH * scale).toFixed(2);
    const x = ((pageW - parseFloat(drawW)) / 2).toFixed(2);
    const y = ((pageH - parseFloat(drawH)) / 2).toFixed(2);

    // 3. Build the PDF objects (all ASCII, so byte length === string length)
    const enc = new TextEncoder();
    const hdr = '%PDF-1.4\n';
    const o1  = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
    const o2  = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
    const o3  = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW.toFixed(2)} ${pageH.toFixed(2)}] /Contents 4 0 R /Resources << /XObject << /Im1 5 0 R >> >> >>\nendobj\n`;
    const stream = `q\n${drawW} 0 0 ${drawH} ${x} ${y} cm\n/Im1 Do\nQ\n`;
    const o4  = `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`;
    const o5h = `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${naturalW} /Height ${naturalH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`;
    const o5f = '\nendstream\nendobj\n';

    const [bH, b1, b2, b3, b4, b5h, b5f] = [hdr, o1, o2, o3, o4, o5h, o5f].map((s) => enc.encode(s));

    // 4. Compute exact byte offsets for the cross-reference table
    const off1 = bH.length;
    const off2 = off1 + b1.length;
    const off3 = off2 + b2.length;
    const off4 = off3 + b3.length;
    const off5 = off4 + b4.length;
    const xrefStart = off5 + b5h.length + jpegBytes.length + b5f.length;

    const xref =
        'xref\n0 6\n' +
        '0000000000 65535 f \n' +
        `${String(off1).padStart(10, '0')} 00000 n \n` +
        `${String(off2).padStart(10, '0')} 00000 n \n` +
        `${String(off3).padStart(10, '0')} 00000 n \n` +
        `${String(off4).padStart(10, '0')} 00000 n \n` +
        `${String(off5).padStart(10, '0')} 00000 n \n`;
    const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
    const bX = enc.encode(xref);
    const bT = enc.encode(trailer);

    // 5. Concatenate all parts into a single Uint8Array
    const chunks = [bH, b1, b2, b3, b4, b5h, jpegBytes, b5f, bX, bT];
    const pdf = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
    let pos = 0;
    for (const chunk of chunks) { pdf.set(chunk, pos); pos += chunk.length; }

    // 6. Trigger direct browser download — no dialog
    const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receiptId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
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
    // Row statuses managed locally; in production this would hit an API
    const [rowStatuses, setRowStatuses] = useState(() =>
        Object.fromEntries(REQUEST_ROWS.map((r) => [r.id, r.status]))
    );
    // Lightbox state
    const [lightbox, setLightbox] = useState(null); // { receiptId, imageUrl }

    const approve = (id) => setRowStatuses((prev) => ({ ...prev, [id]: 'Verified' }));
    const reject  = (id) => setRowStatuses((prev) => ({ ...prev, [id]: 'Rejected' }));

    useEffect(() => {
        setPage(1);
    }, [search, pageSize, status, bank, depositVia]);

    // Augment each row with the live local status
    const rowsWithStatus = useMemo(
        () => REQUEST_ROWS.map((r) => ({ ...r, status: rowStatuses[r.id] ?? r.status })),
        [rowStatuses]
    );

    const filteredRows = useMemo(() => {
        const query = search.trim().toLowerCase();

        return rowsWithStatus.filter((row) => {
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
    }, [rowsWithStatus, search, status, bank, depositVia]);

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
        <>
        {/* ── Receipt image lightbox ── */}
        {lightbox && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                onClick={() => setLightbox(null)}
            >
                <div
                    className="relative max-h-[90vh] max-w-[90vw] rounded-lg bg-white p-3 shadow-2xl dark:bg-[#2c2c2c]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            Receipt — {lightbox.receiptId}
                        </span>
                        <button
                            type="button"
                            onClick={() => setLightbox(null)}
                            className="ml-4 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:text-gray-400"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <img
                        src={lightbox.imageUrl}
                        alt={`Receipt ${lightbox.receiptId}`}
                        className="block max-h-[75vh] max-w-[80vw] rounded object-contain"
                    />
                </div>
            </div>
        )}

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
                        <table
                            className="table-fixed border-separate border-spacing-0 text-sm text-left [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap"
                            style={{ width: AMR_TABLE_MIN_WIDTH, minWidth: AMR_TABLE_MIN_WIDTH }}
                        >
                            <colgroup>
                                {AMR_COLUMN_WIDTHS.map((w, i) => (
                                    <col key={`${w}-${i}`} style={{ width: w }} />
                                ))}
                            </colgroup>
                            <thead>
                                <tr className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                    <th className={`${AMR_HEADER_CELL} text-center`}>Action</th>
                                    <th className={`${AMR_HEADER_CELL} text-center`}>Receipt</th>
                                    <th
                                        className={`${AMR_HEADER_CELL} cursor-pointer`}
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
                                    <th className={AMR_HEADER_CELL}>Depositor Name</th>
                                    <th className={AMR_HEADER_CELL}>Mobile Number</th>
                                    <th className={AMR_HEADER_CELL}>Bank Name</th>
                                    <th className={AMR_HEADER_CELL}>Deposit Via</th>
                                    <th className={AMR_HEADER_CELL}>Transaction Ref No</th>
                                    <th className={AMR_HEADER_CELL}>Amount</th>
                                    <th className={AMR_HEADER_CELL}>Closing Balance</th>
                                    <th className={AMR_HEADER_CELL}>Approve/Reject By</th>
                                    <th className={AMR_HEADER_CELL}>Approve/Reject DateTime</th>
                                    <th className={AMR_HEADER_CELL}>Reject Reason</th>
                                    <th className="border-b border-gray-200 bg-[#f7f7f8] px-4 py-3 text-left font-semibold whitespace-nowrap dark:border-gray-700 dark:bg-[#202020]">Request Date Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {visibleRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={AMR_COLUMN_WIDTHS.length} className="px-6 py-16 text-center text-sm text-gray-500 dark:text-gray-400">
                                            No add money requests found.
                                        </td>
                                    </tr>
                                ) : visibleRows.map((row) => {
                                    const liveStatus = rowStatuses[row.id] ?? row.status;
                                    const isPending  = liveStatus === 'Not Verified';
                                    const isApproved = liveStatus === 'Verified';
                                    const isRejected = liveStatus === 'Rejected';
                                    return (
                                    <tr key={row.id} className="text-gray-700 transition-colors hover:bg-[#f8f9ff] dark:text-gray-200 dark:hover:bg-white/5">
                                        {/* ── Col 1: Approve / Reject ── */}
                                        <td className="border-r border-gray-100 px-3 py-4 text-center dark:border-gray-800">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Approve ✓ */}
                                                <button
                                                    type="button"
                                                    disabled={!isPending}
                                                    onClick={() => approve(row.id)}
                                                    title={isApproved ? 'Already approved' : 'Approve request'}
                                                    className={`inline-flex h-7 w-7 items-center justify-center rounded transition-colors
                                                        ${ isApproved
                                                            ? 'bg-green-100 text-green-700 cursor-default dark:bg-green-900/30 dark:text-green-400'
                                                            : isPending
                                                            ? 'bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                                                            : 'text-gray-300 cursor-not-allowed dark:text-gray-600'
                                                        }`}
                                                >
                                                    <Check size={14} strokeWidth={3} />
                                                </button>
                                                {/* Reject ✗ */}
                                                <button
                                                    type="button"
                                                    disabled={!isPending}
                                                    onClick={() => reject(row.id)}
                                                    title={isRejected ? 'Already rejected' : 'Reject request'}
                                                    className={`inline-flex h-7 w-7 items-center justify-center rounded transition-colors
                                                        ${ isRejected
                                                            ? 'bg-red-100 text-red-700 cursor-default dark:bg-red-900/30 dark:text-red-400'
                                                            : isPending
                                                            ? 'bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                                                            : 'text-gray-300 cursor-not-allowed dark:text-gray-600'
                                                        }`}
                                                >
                                                    <X size={14} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </td>
                                        {/* ── Col 2: Receipt thumbnail + PDF download ── */}
                                        <td className="border-r border-gray-100 px-3 py-3 text-center dark:border-gray-800">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Thumbnail — click to open lightbox */}
                                                <button
                                                    type="button"
                                                    onClick={() => setLightbox({ receiptId: row.receipt, imageUrl: row.receiptImageUrl })}
                                                    className="group relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#333]"
                                                    title={`View receipt ${row.receipt}`}
                                                >
                                                    <img
                                                        src={row.receiptImageUrl}
                                                        alt={`Receipt ${row.receipt}`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                        <Eye size={14} className="text-white" />
                                                    </span>
                                                </button>
                                                {/* PDF download button */}
                                                <button
                                                    type="button"
                                                    onClick={() => downloadReceiptAsPdf(row.receipt, row.receiptImageUrl)}
                                                    className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#fde8e8] text-[#e04040] transition-colors hover:bg-[#fbd5d5] hover:text-[#c03030] dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                                    title={`Download receipt ${row.receipt} as PDF`}
                                                >
                                                    <FileDown size={15} />
                                                </button>
                                            </div>
                                        </td>
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
                                    </tr>);
                                })}
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
        </>
    );
}
