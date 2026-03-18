import { useMemo, useState } from 'react';
import {
    Search,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    UserPlus,
    User,
    ThumbsDown,
    X,
    ArrowUp,
} from 'lucide-react';

const PAGE_SIZES = [10, 25, 50, 100];
const STATUS_OPTIONS = ['All', 'Active', 'Inactive', 'Pending'];
const STATE_OPTIONS = ['All', 'Bagmati', 'Madhesh', 'Gandaki', 'Koshi', 'Lumbini'];

const DEMO_PRABHU_AGENTS = [
    {
        id: 1,
        createdDateTime: '2026-03-17T09:12:00',
        partnerIdCode: 'PRB001',
        name: 'Rohit Sharma',
        gender: 'Male',
        companyName: 'Prabhu Trade Link',
        mobileNumber: '9841001100',
        panCard: 'AAAPR1234F',
        address: 'Putalisadak',
        city: 'Kathmandu',
        district: 'Kathmandu',
        state: 'Bagmati',
        status: 'Active',
    },
    {
        id: 2,
        createdDateTime: '2026-03-16T14:25:00',
        partnerIdCode: 'PRB002',
        name: 'Suman Karki',
        gender: 'Male',
        companyName: 'Karki Money Services',
        mobileNumber: '9856002200',
        panCard: 'BBBPK5678L',
        address: 'Bharatpur-10',
        city: 'Chitwan',
        district: 'Chitwan',
        state: 'Bagmati',
        status: 'Pending',
    },
    {
        id: 3,
        createdDateTime: '2026-03-15T11:05:00',
        partnerIdCode: 'PRB003',
        name: 'Anjali Gurung',
        gender: 'Female',
        companyName: 'Gurung Enterprises',
        mobileNumber: '9813003300',
        panCard: 'CCCPG8899P',
        address: 'Lakeside',
        city: 'Pokhara',
        district: 'Kaski',
        state: 'Gandaki',
        status: 'Active',
    },
    {
        id: 4,
        createdDateTime: '2026-03-14T17:40:00',
        partnerIdCode: 'PRB004',
        name: 'Bikash Yadav',
        gender: 'Male',
        companyName: 'Yadav Finserve',
        mobileNumber: '9804004400',
        panCard: 'DDDPY4545Q',
        address: 'Janakpur-4',
        city: 'Janakpur',
        district: 'Dhanusha',
        state: 'Madhesh',
        status: 'Inactive',
    },
    {
        id: 5,
        createdDateTime: '2026-03-13T08:55:00',
        partnerIdCode: 'PRB005',
        name: 'Nisha Rai',
        gender: 'Female',
        companyName: 'Rai Transfer Point',
        mobileNumber: '9867005500',
        panCard: 'EEENR3344R',
        address: 'Birat Chowk',
        city: 'Morang',
        district: 'Morang',
        state: 'Koshi',
        status: 'Active',
    },
];

const COLUMN_COUNT = 12;
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

export default function PrabhuAgentOnboarding() {
    const [filtersCollapsed, setFiltersCollapsed] = useState(false);
    const [agents, setAgents] = useState(DEMO_PRABHU_AGENTS);
    const [viewingAgent, setViewingAgent] = useState(null);
    const [dateRange, setDateRange] = useState('17/03/26 - 17/03/26');
    const [selectedState, setSelectedState] = useState('All');
    const [status, setStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [pageSize, setPageSize] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredAgents = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return agents.filter((agent) => {
            const matchesState = selectedState === 'All' || agent.state === selectedState;
            const matchesStatus = status === 'All' || agent.status === status;
            const matchesSearch =
                !query ||
                agent.partnerIdCode.toLowerCase().includes(query) ||
                agent.name.toLowerCase().includes(query) ||
                agent.companyName.toLowerCase().includes(query) ||
                agent.mobileNumber.includes(query) ||
                agent.district.toLowerCase().includes(query);

            return matchesState && matchesStatus && matchesSearch;
        });
    }, [agents, searchTerm, selectedState, status]);

    const totalPages = Math.max(1, Math.ceil(filteredAgents.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const startIdx = (safePage - 1) * pageSize;
    const visibleAgents = filteredAgents.slice(startIdx, startIdx + pageSize);

    const handleDeactivateAgent = (agentId) => {
        setAgents((prev) => prev.map((agent) => (
            agent.id === agentId ? { ...agent, status: 'Inactive' } : agent
        )));
    };

    return (
        <div className="h-full min-h-0">
            <div className="bg-white dark:bg-[#2c2c2c] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 h-full min-h-0 flex flex-col overflow-hidden">
                <div>
                    <div
                        className="flex items-center gap-1 px-4 py-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer select-none"
                        onClick={() => setFiltersCollapsed((current) => !current)}
                    >
                        <span className="text-lg font-bold uppercase tracking-wide text-[#586fe5]">PRABHU CSP LIST</span>
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
                                    Add CSP
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
                                <th className={HEADER_CELL}>Partner ID Code</th>
                                <th className={HEADER_CELL}>Name</th>
                                <th className={HEADER_CELL}>Gender</th>
                                <th className={HEADER_CELL}>Company Name</th>
                                <th className={HEADER_CELL}>Mobile Number</th>
                                <th className={HEADER_CELL}>PAN Card</th>
                                <th className={HEADER_CELL}>Address</th>
                                <th className={HEADER_CELL}>City</th>
                                <th className={HEADER_CELL}>District</th>
                                <th className={HEADER_CELL}>State</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {visibleAgents.length === 0 ? (
                                <tr>
                                    <td colSpan={COLUMN_COUNT} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No Prabhu agents found.
                                    </td>
                                </tr>
                            ) : (
                                visibleAgents.map((agent) => (
                                    <tr key={agent.id} className="hover:bg-blue-50/30 dark:hover:bg-white/5 transition-colors">
                                        <td className="border-r border-gray-100 px-4 py-3 text-center dark:border-gray-800">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    type="button"
                                                    title="View agent"
                                                    onClick={() => setViewingAgent(agent)}
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
                                        <td className="border-r border-gray-100 px-4 py-3 text-center text-gray-700 dark:text-gray-300 dark:border-gray-800">{formatDateTime(agent.createdDateTime)}</td>
                                        <td className="border-r border-gray-100 px-4 py-3 text-center text-gray-700 dark:text-gray-300 dark:border-gray-800">{agent.partnerIdCode}</td>
                                        <td className="border-r border-gray-100 px-4 py-3 text-center text-gray-700 dark:text-gray-300 dark:border-gray-800">{agent.name}</td>
                                        <td className="border-r border-gray-100 px-4 py-3 text-center text-gray-600 dark:text-gray-400 dark:border-gray-800">{agent.gender}</td>
                                        <td className="border-r border-gray-100 px-4 py-3 text-center text-gray-700 dark:text-gray-300 dark:border-gray-800">{agent.companyName}</td>
                                        <td className="border-r border-gray-100 px-4 py-3 text-center text-gray-600 dark:text-gray-400 dark:border-gray-800">{agent.mobileNumber}</td>
                                        <td className="border-r border-gray-100 px-4 py-3 text-center text-gray-600 dark:text-gray-400 dark:border-gray-800">{agent.panCard}</td>
                                        <td className="border-r border-gray-100 px-4 py-3 text-center text-gray-600 dark:text-gray-400 dark:border-gray-800">{agent.address}</td>
                                        <td className="border-r border-gray-100 px-4 py-3 text-center text-gray-600 dark:text-gray-400 dark:border-gray-800">{agent.city}</td>
                                        <td className="border-r border-gray-100 px-4 py-3 text-center text-gray-600 dark:text-gray-400 dark:border-gray-800">{agent.district}</td>
                                        <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{agent.state}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-black/10">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredAgents.length === 0 ? 0 : startIdx + 1}</span>
                        -<span className="font-semibold text-gray-700 dark:text-gray-300">{Math.min(startIdx + pageSize, filteredAgents.length)}</span>
                        {' '}of <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredAgents.length}</span> agents
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
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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

                {viewingAgent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
                        <div className="w-full max-w-xl rounded-lg bg-white dark:bg-[#2c2c2c] border border-gray-200 dark:border-gray-700 shadow-lg">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Prabhu Agent Details</h3>
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
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Partner ID Code</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingAgent.partnerIdCode}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingAgent.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Company Name</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingAgent.companyName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Mobile Number</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingAgent.mobileNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">PAN Card</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingAgent.panCard}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingAgent.status}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingAgent.address}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">City</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingAgent.city}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">District</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingAgent.district}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">State</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{viewingAgent.state}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}