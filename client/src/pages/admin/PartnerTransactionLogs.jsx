import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, RefreshCw, Filter } from 'lucide-react';

const PartnerTransactionLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        user: '',
        service: '',
        endpoint: '',
        status: ''
    });

    const fetchLogs = async (nextPage = 1) => {
        setLoading(true);
        try {
            const { data } = await axios.get('/admin/partner-transactions', {
                params: { ...filters, page: nextPage, limit: 20 },
                withCredentials: true
            });
            setLogs(data.logs || []);
            setPage(data.currentPage || 1);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch partner transaction logs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(1);
    }, []);

    const onFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const applyFilters = (e) => {
        e.preventDefault();
        fetchLogs(1);
    };

    const clearFilters = () => {
        const reset = { user: '', service: '', endpoint: '', status: '' };
        setFilters(reset);
        setTimeout(() => fetchLogs(1), 0);
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#323130] dark:text-white">Partner Transaction Logs</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">All user IME/Prabhu/Remittance transaction logs with time and details</p>
                </div>
                <button
                    onClick={() => fetchLogs(page)}
                    className="px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center gap-2"
                >
                    <RefreshCw size={15} /> Refresh
                </button>
            </div>

            <form onSubmit={applyFilters} className="bg-white dark:bg-[#2c2c2c] rounded-xl p-4 border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="md:col-span-2 relative">
                    <Search size={15} className="absolute left-3 top-3 text-gray-400" />
                    <input
                        value={filters.user}
                        onChange={(e) => onFilterChange('user', e.target.value)}
                        placeholder="Search user (email/username/phone)"
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#3a3a3a]"
                    />
                </div>

                <select
                    value={filters.service}
                    onChange={(e) => onFilterChange('service', e.target.value)}
                    className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#3a3a3a]"
                >
                    <option value="">All Services</option>
                    <option value="ime">IME</option>
                    <option value="prabhu">Prabhu</option>
                    <option value="remittance">Remittance</option>
                </select>

                <input
                    value={filters.endpoint}
                    onChange={(e) => onFilterChange('endpoint', e.target.value)}
                    placeholder="Endpoint contains"
                    className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#3a3a3a]"
                />

                <select
                    value={filters.status}
                    onChange={(e) => onFilterChange('status', e.target.value)}
                    className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#3a3a3a]"
                >
                    <option value="">All Status</option>
                    <option value="Success">Success</option>
                    <option value="Failure">Failure</option>
                </select>

                <div className="md:col-span-5 flex gap-2">
                    <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm flex items-center gap-2">
                        <Filter size={14} /> Apply
                    </button>
                    <button type="button" onClick={clearFilters} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-sm">
                        Clear
                    </button>
                </div>
            </form>

            <div className="bg-white dark:bg-[#2c2c2c] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-[#333]">
                            <tr className="text-left">
                                <th className="px-4 py-3">Time</th>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Service</th>
                                <th className="px-4 py-3">Endpoint</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No logs found</td></tr>
                            ) : logs.map((log) => (
                                <tr key={log._id} className="border-t border-gray-100 dark:border-gray-700 align-top">
                                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{log.user?.username || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">{log.user?.email || '-'}</div>
                                    </td>
                                    <td className="px-4 py-3 uppercase font-semibold">{log.details?.service || '-'}</td>
                                    <td className="px-4 py-3 font-mono text-xs max-w-[260px] break-all">{log.details?.endpoint || '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs ${log.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <details className="text-xs text-blue-600 cursor-pointer">
                                            <summary>View</summary>
                                            <pre className="mt-2 p-2 rounded bg-gray-50 dark:bg-black/20 max-w-[360px] overflow-auto text-[11px]">
{JSON.stringify(log.details || {}, null, 2)}
                                            </pre>
                                        </details>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => fetchLogs(page - 1)}
                            className="px-3 py-1.5 text-sm rounded bg-gray-100 dark:bg-gray-700 disabled:opacity-50"
                        >Prev</button>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => fetchLogs(page + 1)}
                            className="px-3 py-1.5 text-sm rounded bg-gray-100 dark:bg-gray-700 disabled:opacity-50"
                        >Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerTransactionLogs;
