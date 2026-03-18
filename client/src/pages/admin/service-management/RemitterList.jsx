import { useMemo, useState } from 'react';
import {
    Search,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    UserPlus,
    X,
} from 'lucide-react';

const PAGE_SIZES = [10, 25, 50, 100];

// Intentionally empty to match the screenshot state with only table headers visible.
const DEMO_REMITTERS = [];

const COLUMN_COUNT = 5;
const HEADER_CELL = 'border-b border-r border-gray-200 bg-gray-50 px-4 py-3 text-left font-semibold whitespace-nowrap dark:border-gray-700 dark:bg-[#232323]';

const formatDate = (value) => {
    if (!value) return '-';

    return new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
    });
};

export default function RemitterList() {
    const [filtersCollapsed, setFiltersCollapsed] = useState(false);
    const [remitters] = useState(DEMO_REMITTERS);
    const [dateRange, setDateRange] = useState('Select date range');
    const [searchTerm, setSearchTerm] = useState('');
    const [pageSize, setPageSize] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredRemitters = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return remitters.filter((item) => (
            !query ||
            (item.mobileNumber || '').toLowerCase().includes(query) ||
            (item.eKycId || '').toLowerCase().includes(query) ||
            (item.stateRes || '').toLowerCase().includes(query)
        ));
    }, [remitters, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredRemitters.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const startIdx = (safePage - 1) * pageSize;
    const visibleRemitters = filteredRemitters.slice(startIdx, startIdx + pageSize);

    return (
        <div className="h-full min-h-0">
            <div className="bg-white dark:bg-[#2c2c2c] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 h-full min-h-0 flex flex-col overflow-hidden">
                <div>
                    <div
                        className="flex items-center gap-1 px-4 py-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer select-none"
                        onClick={() => setFiltersCollapsed((current) => !current)}
                    >
                        <span className="text-lg font-bold uppercase tracking-wide text-[#586fe5]">REMITTER LIST</span>
                        {filtersCollapsed
                            ? <ChevronDown size={16} className="text-gray-600 dark:text-gray-300" />
                            : <ChevronUp size={16} className="text-gray-600 dark:text-gray-300" />}
                    </div>

                    {!filtersCollapsed && (
                        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex flex-wrap items-end justify-end gap-4">
                                <div className="flex flex-col gap-1 w-full md:w-[220px]">
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Created Date</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={dateRange}
                                            readOnly
                                            placeholder="Select date range"
                                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3b3b3b] px-3 py-2.5 pr-9 text-sm text-gray-700 dark:text-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setDateRange('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400"
                                            title="Clear date range"
                                        >
                                            <X size={15} />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="inline-flex h-[36px] w-[40px] items-center justify-center rounded-md bg-[#586fe5] text-white transition-colors hover:bg-[#4960d6]"
                                    title="Add remitter"
                                    aria-label="Add remitter"
                                >
                                    <UserPlus size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3 px-5 py-7 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3b3b3b] px-2.5 py-1.5 text-sm text-gray-700 dark:text-gray-200"
                    >
                        {PAGE_SIZES.map((size) => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                    <span className="text-sm text-gray-700 dark:text-gray-300">entries</span>

                    <div className="flex-1" />

                    <div className="flex overflow-hidden rounded-md border border-gray-300 bg-white dark:border-gray-600 dark:bg-[#3b3b3b]">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="min-w-[190px] border-0 bg-transparent px-3 py-1.5 text-sm text-gray-700 outline-none dark:text-gray-200"
                        />
                        <button type="button" className="inline-flex items-center justify-center bg-[#586fe5] px-4 text-white">
                            <Search size={14} />
                        </button>
                    </div>
                </div>

                <div className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden hide-scrollbar">
                    <table className="w-full table-auto border-separate border-spacing-0 text-sm">
                        <thead>
                            <tr className="text-xs text-gray-500 dark:text-gray-400">
                                <th className={HEADER_CELL}>Actions</th>
                                <th className={HEADER_CELL}>Created Date</th>
                                <th className={HEADER_CELL}>Mobile Number</th>
                                <th className={HEADER_CELL}>eKYC ID</th>
                                <th className={HEADER_CELL}>State Res</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {visibleRemitters.map((item, index) => (
                                <tr key={item.id || index} className="hover:bg-blue-50/30 dark:hover:bg-white/5 transition-colors">
                                    <td className="border-r border-gray-100 px-4 py-3 text-gray-600 dark:text-gray-400 dark:border-gray-800">-</td>
                                    <td className="border-r border-gray-100 px-4 py-3 text-gray-700 dark:text-gray-300 dark:border-gray-800">{formatDate(item.createdDate)}</td>
                                    <td className="border-r border-gray-100 px-4 py-3 text-gray-600 dark:text-gray-400 dark:border-gray-800">{item.mobileNumber || '-'}</td>
                                    <td className="border-r border-gray-100 px-4 py-3 text-gray-600 dark:text-gray-400 dark:border-gray-800">{item.eKycId || '-'}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.stateRes || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-black/10">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredRemitters.length === 0 ? 0 : startIdx + 1}</span>
                        -<span className="font-semibold text-gray-700 dark:text-gray-300">{Math.min(startIdx + pageSize, filteredRemitters.length)}</span>
                        {' '}of <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredRemitters.length}</span> remitters
                    </p>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            disabled={safePage === 1}
                            onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="flex gap-1">
                            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                <button
                                    type="button"
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                                        safePage === page
                                            ? 'bg-[#586fe5] text-white'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3b3b3b]'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            disabled={safePage === totalPages}
                            onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}