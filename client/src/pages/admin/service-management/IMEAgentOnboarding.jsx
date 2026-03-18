import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, UserPlus, User, ThumbsDown, X } from 'lucide-react';

const PAGE_SIZES = [10, 25, 50, 100];
const STATUS_OPTIONS = ['All', 'Active', 'Inactive', 'Pending'];

// Demo data for IME Agents
const DEMO_AGENTS = [
    {
        id: 1,
        cspName: 'IME Express Services',
        partnerCspCode: 'IMEXP001',
        panNumber: 'AAAPA1234A',
        businessType: 'Remittance',
        registrationNo: 'REG-2024-001',
        contactPerson: 'Rajesh Kumar',
        mobileNumber: '9876543210',
        email: 'rajesh@imeexpress.com',
        registeredDate: '2024-01-15T10:30:00',
        createdBy: 'Admin',
        district: 'Kathmandu',
        status: 'Active',
        verificationStatus: 'Verified',
    },
    {
        id: 2,
        cspName: 'Global Money Transfer',
        partnerCspCode: 'GMT002',
        panNumber: 'BBBPB5678B',
        businessType: 'Money Transfer',
        registrationNo: 'REG-2024-002',
        contactPerson: 'Priya Singh',
        mobileNumber: '9876543211',
        email: 'priya@globalmoney.com',
        registeredDate: '2024-02-20T14:45:00',
        createdBy: 'Admin',
        district: 'Bhaktapur',
        status: 'Active',
        verificationStatus: 'Verified',
    },
    {
        id: 3,
        cspName: 'Nepal Remit Center',
        partnerCspCode: 'NRC003',
        panNumber: 'CCCPC9012C',
        businessType: 'Remittance Center',
        registrationNo: 'REG-2024-003',
        contactPerson: 'Anita Sharma',
        mobileNumber: '9876543212',
        email: 'anita@nepalremit.com',
        registeredDate: '2024-03-10T09:15:00',
        createdBy: 'Admin',
        district: 'Lalitpur',
        status: 'Pending',
        verificationStatus: 'Under Review',
    },
    {
        id: 4,
        cspName: 'Quick Cash Services',
        partnerCspCode: 'QCS004',
        panNumber: 'DDDD3456D',
        businessType: 'Money Transfer',
        registrationNo: 'REG-2024-004',
        contactPerson: 'Vikram Patel',
        mobileNumber: '9876543213',
        email: 'vikram@quickcash.com',
        registeredDate: '2024-01-25T16:20:00',
        createdBy: 'Admin',
        district: 'Pokhara',
        status: 'Active',
        verificationStatus: 'Verified',
    },
    {
        id: 5,
        cspName: 'Himalayan Exchange Ltd',
        partnerCspCode: 'HEL005',
        panNumber: 'EEEE7890E',
        businessType: 'Remittance',
        registrationNo: 'REG-2024-005',
        contactPerson: 'Deepak Singh',
        mobileNumber: '9876543214',
        email: 'deepak@himalayanex.com',
        registeredDate: '2024-02-14T11:00:00',
        createdBy: 'Admin',
        district: 'Biratnagar',
        status: 'Inactive',
        verificationStatus: 'Verified',
    },
];

const formatDateTime = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
};

const statusBadgeColor = (status) => {
    const map = {
        'Active': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'Pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        'Inactive': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    };
    return map[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
};

const verificationBadgeColor = (status) => {
    const map = {
        'Verified': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'Under Review': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        'Rejected': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
};

const IME_COLUMN_WIDTHS = [
    '110px',  // actions
    '100px',  // status
    '130px',  // verification status
    '160px',  // registered date
    '180px',  // csp name
    '130px',  // partner csp code
    '120px',  // pan number
    '130px',  // business type
    '130px',  // registration no
    '150px',  // contact person
    '130px',  // mobile number
    '160px',  // email
    '100px',  // created by
    '110px',  // district
];

const IME_TABLE_MIN_WIDTH = IME_COLUMN_WIDTHS.reduce(
    (total, w) => total + Number.parseInt(w, 10),
    0
);

const IME_HEADER_CELL = 'border-b border-gray-200 bg-gray-50 px-4 py-3 text-center font-semibold whitespace-nowrap dark:border-gray-700 dark:bg-[#232323]';

export default function IMEAgentOnboarding() {
    const [filtersCollapsed, setFiltersCollapsed] = useState(false);
    const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false);
    const [addAgentSearch, setAddAgentSearch] = useState('');
    const [agents, setAgents] = useState(DEMO_AGENTS);
    const [viewingAgent, setViewingAgent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [status, setStatus] = useState('All');
    const [dateRange, setDateRange] = useState('Select date range');
    const [pageSize, setPageSize] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredAgents = useMemo(() => {
        return agents.filter((agent) => {
            const matchesSearch = searchTerm === '' || 
                agent.cspName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                agent.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                agent.email.includes(searchTerm) ||
                agent.mobileNumber.includes(searchTerm);
            
            const matchesStatus = status === 'All' || agent.status === status;

            return matchesSearch && matchesStatus;
        });
    }, [agents, searchTerm, status]);

    const totalPages = Math.ceil(filteredAgents.length / pageSize);
    const startIdx = (currentPage - 1) * pageSize;
    const visibleAgents = filteredAgents.slice(startIdx, startIdx + pageSize);

    const handleViewAgent = (agent) => {
        setViewingAgent(agent);
    };

    const handleDeactivateAgent = (agentId) => {
        setAgents((prev) => prev.map((agent) => (
            agent.id === agentId ? { ...agent, status: 'Inactive' } : agent
        )));
    };

    return (
        <div className="h-full min-h-0">
            <div className="bg-white dark:bg-[#2c2c2c] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 h-full min-h-0 flex flex-col">
                <div className="bg-white dark:bg-[#2c2c2c]">
                    <div
                        className="flex items-center gap-1 px-5 py-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer select-none"
                        onClick={() => setFiltersCollapsed((current) => !current)}
                    >
                        <span className="text-lg font-bold uppercase tracking-wide text-[#586fe5]">IME AGENT LIST</span>
                        {filtersCollapsed
                            ? <ChevronDown size={16} className="text-gray-600 dark:text-gray-300" />
                            : <ChevronUp size={16} className="text-gray-600 dark:text-gray-300" />}
                    </div>

                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex flex-wrap items-end justify-end gap-3">
                            <div className="flex flex-col gap-1 w-full sm:w-[240px]">
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

                            <div className="flex flex-col gap-1 w-full sm:w-[220px]">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
                                    className="w-full py-2 pl-3 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200"
                                >
                                    {STATUS_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsAddAgentModalOpen(true)}
                                className="inline-flex h-9 w-10 items-center justify-center rounded-md bg-blue-600 text-white transition-colors shadow-sm hover:bg-blue-700"
                                title="Add agent"
                                aria-label="Add agent"
                            >
                                <UserPlus size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Controls */}
                <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
                <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    className="border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-2.5 bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200 text-sm"
                >
                    {PAGE_SIZES.map((n) => <option key={n}>{n}</option>)}
                </select>
                <span className="text-sm text-gray-600 dark:text-gray-400">entries</span>

                <div className="flex-1" />

                <div className="flex overflow-hidden rounded-md border border-gray-300 bg-white dark:border-gray-600 dark:bg-[#3b3b3b]">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full min-w-[190px] border-0 bg-transparent px-3 py-2 text-sm text-gray-700 outline-none dark:text-gray-200"
                    />
                    <button type="button" className="inline-flex items-center justify-center bg-blue-600 px-4 text-white">
                        <Search size={14} />
                    </button>
                </div>
            </div>

                        {/* Table */}
                    <div className="relative flex-1 min-h-0 overflow-auto hide-scrollbar overscroll-x-contain">
                        <table
                            className="table-fixed border-separate border-spacing-0 text-sm text-left [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap"
                            style={{ width: IME_TABLE_MIN_WIDTH, minWidth: IME_TABLE_MIN_WIDTH }}
                        >
                            <colgroup>
                                {IME_COLUMN_WIDTHS.map((w, i) => (
                                    <col key={`${w}-${i}`} style={{ width: w }} />
                                ))}
                            </colgroup>
                            <thead>
                                   <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    <th className={IME_HEADER_CELL}>Actions</th>
                                    <th className={IME_HEADER_CELL}>Status</th>
                                       <th className={IME_HEADER_CELL}>Verification</th>
                                    <th className={IME_HEADER_CELL}>Registered Date</th>
                                    <th className={IME_HEADER_CELL}>CSP Name</th>
                                    <th className={IME_HEADER_CELL}>Partner CSP Code</th>
                                    <th className={IME_HEADER_CELL}>Pan Number</th>
                                    <th className={IME_HEADER_CELL}>Business Type</th>
                                       <th className={IME_HEADER_CELL}>Reg. No</th>
                                    <th className={IME_HEADER_CELL}>Contact Person</th>
                                    <th className={IME_HEADER_CELL}>Mobile Number</th>
                                    <th className={IME_HEADER_CELL}>Email</th>
                                       <th className={IME_HEADER_CELL}>Created By</th>
                                    <th className={IME_HEADER_CELL}>District</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {visibleAgents.length === 0 ? (
                                    <tr>
                                        <td colSpan={IME_COLUMN_WIDTHS.length} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                            No agents found.
                                        </td>
                                    </tr>
                                ) : (
                                    visibleAgents.map((agent) => (
                                        <tr key={agent.id} className="hover:bg-blue-50/30 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap align-middle text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        type="button"
                                                        title="View agent"
                                                        onClick={() => handleViewAgent(agent)}
                                                        className="p-1 text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                                    >
                                                        <User size={16} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title={agent.status === 'Inactive' ? 'Agent already deactivated' : 'Deactivate agent'}
                                                        onClick={() => handleDeactivateAgent(agent.id)}
                                                        disabled={agent.status === 'Inactive'}
                                                        className={`p-1 transition-colors ${
                                                            agent.status === 'Inactive'
                                                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                                                : 'text-green-600 hover:text-green-700 dark:hover:text-green-400'
                                                        }`}
                                                    >
                                                        <ThumbsDown size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap align-middle text-center">
                                                <span className={`px-2 py-1 text-xs font-medium rounded ${statusBadgeColor(agent.status)}`}>
                                                    {agent.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap align-middle text-center">
                                                <span className={`px-2 py-1 text-xs font-medium rounded ${verificationBadgeColor(agent.verificationStatus)}`}>
                                                    {agent.verificationStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-xs text-gray-500 dark:text-gray-400">{formatDateTime(agent.registeredDate)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-700 dark:text-gray-300">{agent.cspName}</td>
                                            <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-600 dark:text-gray-400">{agent.partnerCspCode}</td>
                                            <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-600 dark:text-gray-400">{agent.panNumber}</td>
                                            <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-600 dark:text-gray-400">{agent.businessType}</td>
                                            <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-600 dark:text-gray-400">{agent.registrationNo}</td>
                                            <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-700 dark:text-gray-300 font-semibold text-sm">{agent.contactPerson}</td>
                                            <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-600 dark:text-gray-400">{agent.mobileNumber}</td>
                                            <td className="px-4 py-3 whitespace-nowrap align-middle text-center">
                                                <span className="inline-block text-gray-600 dark:text-gray-400 truncate max-w-[160px]">{agent.email}</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-gray-600 dark:text-gray-400">{agent.createdBy}</td>
                                            <td className="px-4 py-3 whitespace-nowrap align-middle text-center text-blue-600 dark:text-blue-400 font-medium">{agent.district}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-black/10">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{visibleAgents.length === 0 ? 0 : startIdx + 1}</span>
                    -<span className="font-semibold text-gray-700 dark:text-gray-300">{Math.min(startIdx + pageSize, filteredAgents.length)}</span>
                    {' '}of <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredAgents.length}</span> agents
                </p>

                <div className="flex items-center gap-1">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                                    currentPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3b3b3b]'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {isAddAgentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
                    <div className="w-full max-w-[540px] rounded-lg bg-white border border-gray-200 shadow-xl overflow-hidden dark:bg-[#2c2c2c] dark:border-gray-700">
                        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-[#d9ead7] dark:bg-[#3a4a3f] dark:border-gray-700">
                            <h3 className="text-[32px] leading-none font-semibold text-gray-700 dark:text-gray-100">Add Agent</h3>
                            <button
                                type="button"
                                onClick={() => setIsAddAgentModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                                aria-label="Close add agent modal"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="px-4 py-10 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex overflow-hidden rounded-md border border-gray-300 bg-white dark:border-gray-600 dark:bg-[#3b3b3b]">
                                <input
                                    type="text"
                                    value={addAgentSearch}
                                    onChange={(e) => setAddAgentSearch(e.target.value)}
                                    placeholder="Search by mobile, name or email"
                                    className="w-full border-0 bg-transparent px-4 py-2.5 text-sm text-gray-700 outline-none dark:text-gray-200"
                                />
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center bg-blue-600 px-4 text-white"
                                >
                                    <Search size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="px-4 py-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsAddAgentModalOpen(false)}
                                className="inline-flex items-center justify-center rounded-md bg-[#6b6f86] hover:bg-[#5b5f76] px-4 py-2 text-sm font-semibold text-white transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {viewingAgent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
                    <div className="w-full max-w-xl rounded-lg bg-white dark:bg-[#2c2c2c] border border-gray-200 dark:border-gray-700 shadow-lg">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Agent Details</h3>
                            <button
                                type="button"
                                onClick={() => setViewingAgent(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                aria-label="Close agent details"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">CSP Name</p>
                                <p className="font-medium text-gray-800 dark:text-gray-100">{viewingAgent.cspName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Partner CSP Code</p>
                                <p className="font-medium text-gray-800 dark:text-gray-100">{viewingAgent.partnerCspCode}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Contact Person</p>
                                <p className="font-medium text-gray-800 dark:text-gray-100">{viewingAgent.contactPerson}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Mobile Number</p>
                                <p className="font-medium text-gray-800 dark:text-gray-100">{viewingAgent.mobileNumber}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                <p className="font-medium text-gray-800 dark:text-gray-100 break-all">{viewingAgent.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                                <p className="font-medium text-gray-800 dark:text-gray-100">{viewingAgent.status}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
