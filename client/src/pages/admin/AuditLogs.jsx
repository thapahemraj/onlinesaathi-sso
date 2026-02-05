import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Shield, User, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { user } = useAuth();

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/audit?page=${page}&limit=20`, {
                withCredentials: true
            });
            setLogs(res.data.logs);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-[#323130] flex items-center gap-2">
                    <Activity className="text-[#0078D4]" />
                    Audit Logs
                </h1>
                <p className="text-gray-500 text-sm">Track user activities and security events.</p>
            </div>

            {/* List */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8f9fa] border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider sticky top-0">
                        <tr>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Action</th>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Resource</th>
                            <th className="px-6 py-3">IP Address</th>
                            <th className="px-6 py-3">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">Loading logs...</td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">No activity recorded yet.</td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log._id} className="hover:bg-gray-50 transition-colors text-sm">
                                    <td className="px-6 py-4">
                                        {log.status === 'Success' ? (
                                            <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-2.5 py-1 rounded-full w-fit text-xs font-medium">
                                                <CheckCircle size={14} />
                                                Success
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-red-700 bg-red-50 px-2.5 py-1 rounded-full w-fit text-xs font-medium">
                                                <AlertCircle size={14} />
                                                Failure
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-[#323130]">
                                        {log.action}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs">
                                                <User size={12} />
                                            </div>
                                            <span className="text-gray-700">{log.user?.username || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-600">
                                            {log.resource}
                                            <span className="text-gray-400 text-xs ml-1">({log.resourceId?.substring(0, 6)}...)</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                        {log.ipAddress}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            {formatDate(log.createdAt)}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                <div>Page {page} of {totalPages}</div>
                <div className="flex gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
