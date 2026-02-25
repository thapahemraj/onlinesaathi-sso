import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, RefreshCw, Download, Calendar } from 'lucide-react';
import MsButton from '../../components/MsButton';
import { toast } from 'react-hot-toast';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        user: '',
        action: '',
        dateFrom: '',
        dateTo: ''
    });

    const fetchLogs = async (pageNum = 1) => {
        try {
            setLoading(true);
            const params = {
                page: pageNum,
                limit: 20,
                ...filters
            };
            const { data } = await axios.get('/admin/audit', { params });
            setLogs(data.logs);
            setTotalPages(data.totalPages);
            setPage(data.currentPage);
        } catch (error) {
            console.error('Failed to fetch audit logs', error);
            toast.error('Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(1);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchLogs(1);
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const clearFilters = () => {
        setFilters({ user: '', action: '', dateFrom: '', dateTo: '' });
        fetchLogs(1);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Audit Logs</h1>
                    <p className="text-gray-600 dark:text-gray-400">Track system activities and security events</p>
                </div>
                <div className="flex gap-2">
                    <MsButton variant="secondary" onClick={() => fetchLogs(page)} icon={RefreshCw}>
                        Refresh
                    </MsButton>
                    <MsButton variant="outline" icon={Download}>
                        Export
                    </MsButton>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#2c2c2c] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User (Email/Username)</label>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                name="user"
                                value={filters.user}
                                onChange={handleFilterChange}
                                placeholder="Search user..."
                                className="w-full pl-9 h-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-sm focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action Type</label>
                        <select
                            name="action"
                            value={filters.action}
                            onChange={handleFilterChange}
                            className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-sm px-3 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Actions</option>
                            <option value="Login">Login</option>
                            <option value="Logout">Logout</option>
                            <option value="Update Profile">Profile Update</option>
                            <option value="Password">Password Change</option>
                            <option value="2FA">2FA Actions</option>
                            <option value="Admin">Admin Actions</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                name="dateFrom"
                                value={filters.dateFrom}
                                onChange={handleFilterChange}
                                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-sm px-3"
                            />
                            <input
                                type="date"
                                name="dateTo"
                                value={filters.dateTo}
                                onChange={handleFilterChange}
                                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-sm px-3"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <MsButton type="submit" className="flex-1">Search</MsButton>
                        <MsButton type="button" variant="secondary" onClick={clearFilters}>Clear</MsButton>
                    </div>
                </form>
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-[#2c2c2c] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-black/10">
                            <tr>
                                <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-800">Timestamp</th>
                                <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-800">Action</th>
                                <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-800">User</th>
                                <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-800">IP / Device</th>
                                <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-800">Status</th>
                                <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-800">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">Loading records...</td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">No records found matching filters.</td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} className="bg-white dark:bg-[#2c2c2c] border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-black/10 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {log.action}
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.user ? (
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{log.user.username}</div>
                                                    <div className="text-xs text-gray-500">{log.user.email}</div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">Unknown/System</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <div className="text-xs font-mono">{log.ipAddress}</div>
                                            <div className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[150px]" title={log.deviceInfo}>
                                                {log.deviceInfo || 'Unknown Device'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${log.status === 'Success'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <details className="cursor-pointer text-xs text-blue-600 dark:text-blue-400">
                                                <summary>View</summary>
                                                <pre className="mt-1 p-2 bg-gray-50 dark:bg-black/20 rounded max-w-xs overflow-auto text-gray-600 dark:text-gray-300">
                                                    {JSON.stringify(log.details || {}, null, 2)}
                                                </pre>
                                            </details>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <MsButton
                            variant="secondary"
                            disabled={page === 1}
                            onClick={() => fetchLogs(page - 1)}
                            size="sm"
                        >
                            Previous
                        </MsButton>
                        <MsButton
                            variant="secondary"
                            disabled={page === totalPages}
                            onClick={() => fetchLogs(page + 1)}
                            size="sm"
                        >
                            Next
                        </MsButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
