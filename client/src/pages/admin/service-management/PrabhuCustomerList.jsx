import { useMemo, useState } from 'react';
import {
    Search,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    UserPlus,
    User,
    RefreshCw,
    X,
    ArrowUp,
} from 'lucide-react';

const PAGE_SIZES = [10, 25, 50, 100];
const STATUS_OPTIONS = ['All', 'Active', 'Inactive', 'Pending'];
const STATE_OPTIONS = ['All', 'Bagmati', 'Madhesh', 'Gandaki', 'Koshi', 'Lumbini'];
const STATUS_ROTATION = ['Pending', 'Active', 'Inactive'];

const DEMO_CUSTOMERS = [
    {
        id: 1,
        createdDateTime: '2026-03-17T09:10:00',
        name: 'Sita Adhikari',
        gender: 'Female',
        mobileNumber: '9841234501',
        email: 'sita.adhikari@example.com',
        address: 'New Baneshwor',
        city: 'Kathmandu',
        state: 'Bagmati',
        status: 'Active',
    },
    {
        id: 2,
        createdDateTime: '2026-03-16T15:25:00',
        name: 'Milan Thapa',
        gender: 'Male',
        mobileNumber: '9851123402',
        email: 'milan.thapa@example.com',
        address: 'Butwal-8',
        city: 'Butwal',
        state: 'Lumbini',
        status: 'Pending',
    },
    {
        id: 3,
        createdDateTime: '2026-03-15T12:45:00',
        name: 'Pooja Koirala',
        gender: 'Female',
        mobileNumber: '9862234503',
        email: 'pooja.koirala@example.com',
        address: 'Chipledhunga',
        city: 'Pokhara',
        state: 'Gandaki',
        status: 'Active',
    },
    {
        id: 4,
        createdDateTime: '2026-03-14T10:05:00',
        name: 'Rakesh Yadav',
        gender: 'Male',
        mobileNumber: '9803234504',
        email: 'rakesh.yadav@example.com',
        address: 'Janakpur-7',
        city: 'Janakpur',
        state: 'Madhesh',
        status: 'Inactive',
    },
    {
        id: 5,
        createdDateTime: '2026-03-13T08:30:00',
        name: 'Nabin Rai',
        gender: 'Male',
        mobileNumber: '9814234505',
        email: 'nabin.rai@example.com',
        address: 'Biratnagar-2',
        city: 'Biratnagar',
        state: 'Koshi',
        status: 'Active',
    },
];

const COLUMN_COUNT = 9;
const HEADER_CELL = 'border-b border-r border-gray-200 bg-gray-50 px-4 py-3 text-center font-semibold whitespace-nowrap dark:border-gray-700 dark:bg-[#232323]';

const formatDateTime = (value) => {
    if (!value) return '-';

    return new Date(value).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).replace(',', '');
};

export default function PrabhuCustomerList() {
    const [filtersCollapsed, setFiltersCollapsed] = useState(false);
    const [customers, setCustomers] = useState(DEMO_CUSTOMERS);
    const [viewingCustomer, setViewingCustomer] = useState(null);
    const [refreshingCustomerId, setRefreshingCustomerId] = useState(null);
    const [dateRange, setDateRange] = useState('17/03/26 - 17/03/26');
    const [selectedState, setSelectedState] = useState('All');
    const [status, setStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [pageSize, setPageSize] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredCustomers = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return customers.filter((customer) => {
            const matchesState = selectedState === 'All' || customer.state === selectedState;
            const matchesStatus = status === 'All' || customer.status === status;
            const matchesSearch =
                !query ||
                customer.name.toLowerCase().includes(query) ||
                customer.mobileNumber.includes(query) ||
                customer.email.toLowerCase().includes(query) ||
                customer.city.toLowerCase().includes(query) ||
                customer.state.toLowerCase().includes(query);

            return matchesState && matchesStatus && matchesSearch;
        });
    }, [customers, searchTerm, selectedState, status]);

    const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const startIdx = (safePage - 1) * pageSize;
    const visibleCustomers = filteredCustomers.slice(startIdx, startIdx + pageSize);

    const getNextStatus = (currentStatus) => {
        const currentIndex = STATUS_ROTATION.indexOf(currentStatus);
        if (currentIndex === -1) return STATUS_ROTATION[0];
        return STATUS_ROTATION[(currentIndex + 1) % STATUS_ROTATION.length];
    };

    const handleRefreshStatus = (customerId) => {
        setRefreshingCustomerId(customerId);
        setCustomers((prev) => prev.map((customer) => (
            customer.id === customerId
                ? { ...customer, status: getNextStatus(customer.status) }
                : customer
        )));

        window.setTimeout(() => {
            setRefreshingCustomerId((current) => (current === customerId ? null : current));
        }, 350);
    };

    return (
        <div className="h-full min-h-0">
            <div className="bg-white dark:bg-[#2c2c2c] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 h-full min-h-0 flex flex-col overflow-hidden">
                <div>
                    <div
                        className="flex items-center gap-1 px-4 py-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer select-none"
                        onClick={() => setFiltersCollapsed((current) => !current)}
                    >
                        <span className="text-lg font-bold uppercase tracking-wide text-[#586fe5]">PRABHU CUSTOMER LIST</span>
                        {filtersCollapsed
                            ? <ChevronDown size={16} className="text-gray-600 dark:text-gray-300" />
                            : <ChevronUp size={16} className="text-gray-600 dark:text-gray-300" />}
                    </div>

                    {!filtersCollapsed && (
                        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex flex-wrap items-end justify-end gap-6">
                                <div className="flex flex-col gap-1 w-full md:w-[250px]">
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Created Date</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={dateRange}
                                            readOnly
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

                                <div className="flex flex-col gap-1 w-full md:w-[250px]">
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">State</label>
                                    <select
                                        value={selectedState}
                                        onChange={(e) => {
                                            setSelectedState(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3b3b3b] px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200"
                                    >
                                        {STATE_OPTIONS.map((option) => (
                                            <option key={option} value={option}>
                                                {option === 'All' ? 'Select State' : option}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1 w-full md:w-[250px]">
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => {
                                            setStatus(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3b3b3b] px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200"
                                    >
                                        {STATUS_OPTIONS.map((option) => (
                                            <option key={option} value={option}>
                                                {option === 'All' ? 'Select Status' : option}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type="button"
                                    className="inline-flex h-[37px] min-w-[250px] items-center justify-center gap-2 rounded-md bg-[#586fe5] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#4960d6]"
                                >
                                    <UserPlus size={16} strokeWidth={3} />
                                    Add Customer
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
                                <th className={HEADER_CELL}>
                                    <div className="flex items-center justify-center gap-2">
                                        <span>Created DateTime</span>
                                        <ArrowUp size={14} className="text-green-600" />
                                    </div>
                                </th>
                                <th className={HEADER_CELL}>Name</th>
                                <th className={HEADER_CELL}>Gender</th>
                                <th className={HEADER_CELL}>Mobile Number</th>
                                <th className={HEADER_CELL}>Email</th>
                                <th className={HEADER_CELL}>Address</th>
                                <th className={HEADER_CELL}>City</th>
                                <th className={HEADER_CELL}>State</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {visibleCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={COLUMN_COUNT} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No Prabhu customers found.
                                    </td>
                                </tr>
                            ) : (
                                visibleCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-blue-50/30 dark:hover:bg-white/5 transition-colors">
                                        <td className="border-r border-gray-100 px-4 py-3 text-center dark:border-gray-800">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    type="button"
                                                    title="Refresh status"
                                                    onClick={() => handleRefreshStatus(customer.id)}
                                                    className="p-1 text-green-600 hover:text-green-700 dark:hover:text-green-400 transition-colors"
                                                >
                                                    <RefreshCw size={16} className={refreshingCustomerId === customer.id ? 'animate-spin' : ''} />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="View customer"
                                                    onClick={() => setViewingCustomer(customer)}
                                                    className="p-1 text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                                >
                                                    <User size={16} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="border-r border-gray-100 px-4 py-3 text-center text-gray-700 dark:text-gray-300 dark:border-gray-800">{formatDateTime(customer.createdDateTime)}</td>
                                        <td className="border-r border-gray-100 px-4 py-3 text-center text-gray-700 dark:text-gray-300 dark:border-gray-800">{customer.name}</td>
                                        <td className="border-r border-gray-100 px-4 py-3 text-center text-gray-600 dark:text-gray-400 dark:border-gray-800">{customer.gender}</td>
                                        <td className="border-r border-gray-100 px-4 py-3 text-center text-gray-600 dark:text-gray-400 dark:border-gray-800">{customer.mobileNumber}</td>
                                        <td className="border-r border-gray-100 px-4 py-3 text-center text-gray-600 dark:text-gray-400 dark:border-gray-800">{customer.email}</td>
                                        <td className="border-r border-gray-100 px-4 py-3 text-center text-gray-600 dark:text-gray-400 dark:border-gray-800">{customer.address}</td>
                                        <td className="border-r border-gray-100 px-4 py-3 text-center text-gray-600 dark:text-gray-400 dark:border-gray-800">{customer.city}</td>
                                        <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{customer.state}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-black/10">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredCustomers.length === 0 ? 0 : startIdx + 1}</span>
                        -<span className="font-semibold text-gray-700 dark:text-gray-300">{Math.min(startIdx + pageSize, filteredCustomers.length)}</span>
                        {' '}of <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredCustomers.length}</span> customers
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

                {viewingCustomer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
                        <div className="w-full max-w-xl rounded-lg bg-white dark:bg-[#2c2c2c] border border-gray-200 dark:border-gray-700 shadow-lg">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Prabhu Customer Details</h3>
                                <button
                                    type="button"
                                    onClick={() => setViewingCustomer(null)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    aria-label="Close customer details"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingCustomer.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingCustomer.gender}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Mobile Number</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingCustomer.mobileNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100 break-all">{viewingCustomer.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingCustomer.address}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">City</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingCustomer.city}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">State</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingCustomer.state}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingCustomer.status}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}