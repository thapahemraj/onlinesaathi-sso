import { useMemo, useState } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, UserPlus, RefreshCw, User, X } from 'lucide-react';

const PAGE_SIZES = [10, 20, 50, 100];
const STATUS_OPTIONS = ['All', 'Active', 'Inactive', 'Pending'];
const GENDER_OPTIONS = ['All', 'Male', 'Female', 'Other'];
const STATUS_ROTATION = ['Pending', 'Active', 'Inactive'];

const DEMO_CUSTOMERS = [
    {
        id: 1,
        firstName: 'Aarav',
        lastName: 'Sharma',
        mobileNumber: '9876543210',
        nationality: 'Nepali',
        gender: 'Male',
        dateOfBirth: '1995-03-12',
        createdDate: '2026-03-14T10:15:00',
        district: 'Kathmandu',
        state: 'Bagmati',
        status: 'Active',
    },
    {
        id: 2,
        firstName: 'Priya',
        lastName: 'Singh',
        mobileNumber: '9891122334',
        nationality: 'Indian',
        gender: 'Female',
        dateOfBirth: '1998-07-01',
        createdDate: '2026-03-13T15:40:00',
        district: 'Bhaktapur',
        state: 'Bagmati',
        status: 'Active',
    },
    {
        id: 3,
        firstName: 'Rohan',
        lastName: 'Verma',
        mobileNumber: '9810011223',
        nationality: 'Nepali',
        gender: 'Male',
        dateOfBirth: '1992-11-22',
        createdDate: '2026-03-13T11:05:00',
        district: 'Lalitpur',
        state: 'Bagmati',
        status: 'Pending',
    },
    {
        id: 4,
        firstName: 'Sneha',
        lastName: 'Gupta',
        mobileNumber: '9900012345',
        nationality: 'Indian',
        gender: 'Female',
        dateOfBirth: '1999-09-18',
        createdDate: '2026-03-12T09:20:00',
        district: 'Pokhara',
        state: 'Gandaki',
        status: 'Inactive',
    },
    {
        id: 5,
        firstName: 'Vikram',
        lastName: 'Yadav',
        mobileNumber: '9922233344',
        nationality: 'Nepali',
        gender: 'Male',
        dateOfBirth: '1990-01-30',
        createdDate: '2026-03-11T17:30:00',
        district: 'Biratnagar',
        state: 'Koshi',
        status: 'Active',
    },
];

const CUSTOMER_COLUMNS_COUNT = 11;

const HEADER_CELL = 'border-b border-gray-200 bg-gray-50 px-4 py-3 text-center font-semibold whitespace-nowrap dark:border-gray-700 dark:bg-[#232323]';

const formatDate = (value) => {
    if (!value) return '-';

    return new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const statusBadgeClass = (status) => {
    const map = {
        Active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        Inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    };

    return map[status] || map.Inactive;
};

export default function IMEKYCCustomer() {
    const [filtersCollapsed, setFiltersCollapsed] = useState(false);
    const [customers, setCustomers] = useState(DEMO_CUSTOMERS);
    const [viewingCustomer, setViewingCustomer] = useState(null);
    const [refreshingCustomerId, setRefreshingCustomerId] = useState(null);
    const [dateRange, setDateRange] = useState('Select date range');
    const [gender, setGender] = useState('All');
    const [status, setStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [pageSize, setPageSize] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredCustomers = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return customers.filter((row) => {
            const matchesGender = gender === 'All' || row.gender === gender;
            const matchesStatus = status === 'All' || row.status === status;
            const matchesSearch =
                !query ||
                row.firstName.toLowerCase().includes(query) ||
                row.lastName.toLowerCase().includes(query) ||
                row.mobileNumber.includes(query) ||
                row.district.toLowerCase().includes(query) ||
                row.state.toLowerCase().includes(query);

            return matchesGender && matchesStatus && matchesSearch;
        });
    }, [customers, gender, status, searchTerm]);

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

    const handleViewCustomer = (customer) => {
        setViewingCustomer(customer);
    };

    const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const startIdx = (safePage - 1) * pageSize;
    const visibleRows = filteredCustomers.slice(startIdx, startIdx + pageSize);

    return (
        <div className="h-full min-h-0">
            <div className="bg-white dark:bg-[#2c2c2c] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 h-full min-h-0 flex flex-col">
                <div className="bg-white dark:bg-[#2c2c2c]">
                    <div
                        className="flex items-center gap-1 px-5 py-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer select-none"
                        onClick={() => setFiltersCollapsed((current) => !current)}
                    >
                        <span className="text-lg font-bold uppercase tracking-wide text-[#586fe5]">IME CUSTOMER LIST</span>
                        {filtersCollapsed
                            ? <ChevronDown size={16} className="text-gray-600 dark:text-gray-300" />
                            : <ChevronUp size={16} className="text-gray-600 dark:text-gray-300" />}
                    </div>

                    {!filtersCollapsed && (
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex flex-wrap items-end justify-end gap-3">
                                <div className="flex flex-col gap-1 w-full sm:w-[220px]">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Registration Date</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Select date range"
                                            value={dateRange}
                                            readOnly
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

                                <div className="flex flex-col gap-1 w-full sm:w-[140px]">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Gender</label>
                                    <select
                                        value={gender}
                                        onChange={(e) => {
                                            setGender(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full py-2 pl-3 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200"
                                    >
                                        {GENDER_OPTIONS.map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type="button"
                                    className="inline-flex h-9 w-10 items-center justify-center rounded-md bg-blue-600 text-white transition-colors shadow-sm hover:bg-blue-700"
                                    title="Add customer"
                                    aria-label="Add customer"
                                >
                                    <UserPlus size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-2.5 bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200 text-sm"
                    >
                        {PAGE_SIZES.map((size) => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                    <span className="text-sm text-gray-600 dark:text-gray-400">entries</span>

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
                            className="w-full min-w-[190px] border-0 bg-transparent px-3 py-2 text-sm text-gray-700 outline-none dark:text-gray-200"
                        />
                        <button type="button" className="inline-flex items-center justify-center bg-blue-600 px-4 text-white">
                            <Search size={14} />
                        </button>
                    </div>
                </div>

                <div className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden hide-scrollbar">
                    <table
                        className="w-full table-auto border-separate border-spacing-0 text-sm"
                    >
                        <thead>
                            <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                <th className={HEADER_CELL}>Actions</th>
                                <th className={HEADER_CELL}>Status</th>
                                <th className={HEADER_CELL}>First Name</th>
                                <th className={HEADER_CELL}>Last Name</th>
                                <th className={HEADER_CELL}>Mobile Number</th>
                                <th className={HEADER_CELL}>Nationality</th>
                                <th className={HEADER_CELL}>Gender</th>
                                <th className={HEADER_CELL}>Date of Birth</th>
                                <th className={HEADER_CELL}>Created Date</th>
                                <th className={HEADER_CELL}>District</th>
                                <th className={HEADER_CELL}>State</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {visibleRows.length === 0 ? (
                                <tr>
                                    <td colSpan={CUSTOMER_COLUMNS_COUNT} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No IME KYC customers found.
                                    </td>
                                </tr>
                            ) : (
                                visibleRows.map((row) => (
                                    <tr key={row.id} className="hover:bg-blue-50/30 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    type="button"
                                                    title="Refresh status"
                                                    onClick={() => handleRefreshStatus(row.id)}
                                                    className="p-1 text-green-600 hover:text-green-700 dark:hover:text-green-400 transition-colors"
                                                >
                                                    <RefreshCw size={15} className={refreshingCustomerId === row.id ? 'animate-spin' : ''} />
                                                </button>

                                                <button
                                                    type="button"
                                                    title="View customer"
                                                    onClick={() => handleViewCustomer(row)}
                                                    className="p-1 text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                                >
                                                    <User size={15} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center">
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${statusBadgeClass(row.status)}`}>{row.status}</span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-700 dark:text-gray-200">{row.firstName}</td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-700 dark:text-gray-200">{row.lastName}</td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-600 dark:text-gray-400">{row.mobileNumber}</td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-600 dark:text-gray-400">{row.nationality}</td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-600 dark:text-gray-400">{row.gender}</td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-600 dark:text-gray-400">{formatDate(row.dateOfBirth)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-600 dark:text-gray-400">{formatDate(row.createdDate)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-blue-600 dark:text-blue-400">{row.district}</td>
                                        <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-blue-600 dark:text-blue-400">{row.state}</td>
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
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    type="button"
                                    key={p}
                                    onClick={() => setCurrentPage(p)}
                                    className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                                        safePage === p
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3b3b3b]'
                                    }`}
                                >
                                    {p}
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
                                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Customer Details</h3>
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
                                    <p className="text-xs text-gray-500 dark:text-gray-400">First Name</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingCustomer.firstName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Last Name</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingCustomer.lastName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Mobile Number</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingCustomer.mobileNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Nationality</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingCustomer.nationality}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingCustomer.gender}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Date of Birth</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{formatDate(viewingCustomer.dateOfBirth)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Created Date</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{formatDate(viewingCustomer.createdDate)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingCustomer.status}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">District</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingCustomer.district}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">State</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingCustomer.state}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
