import { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Monitor, MapPin, Clock, Shield, AlertTriangle } from 'lucide-react';
import MsButton from '../../components/MsButton';

const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLogs = async (pageNum = 1) => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/audit/my-activity?page=${pageNum}&limit=10`);
            setLogs(data.logs);
            setTotalPages(data.totalPages);
            setPage(data.currentPage);
        } catch (error) {
            console.error('Failed to fetch activity logs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getIcon = (action) => {
        if (action.includes('Login')) return <Monitor size={18} className="text-blue-600" />;
        if (action.includes('Password')) return <Shield size={18} className="text-green-600" />;
        if (action.includes('Update')) return <RefreshCw size={18} className="text-orange-600" />;
        return <Clock size={18} className="text-gray-600" />;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Activity Log</h1>
            <p className="text-gray-600 mb-6">Review the recent activity on your account.</p>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading activity...</div>
                ) : logs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No activity recorded yet.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {logs.map((log) => (
                            <div key={log._id} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4">
                                <div className="p-2 bg-gray-100 rounded-full mt-1">
                                    {getIcon(log.action)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-gray-900">{log.action}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${log.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {log.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                        <Clock size={14} /> {formatDate(log.createdAt)}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        {log.deviceInfo || log.userAgent}
                                    </p>
                                    {log.location && log.location !== 'Unknown' && (
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <MapPin size={12} /> {log.location}
                                        </p>
                                    )}
                                    {log.details && Object.keys(log.details).length > 0 && (
                                        <details className="mt-2 text-xs text-gray-500 cursor-pointer">
                                            <summary>Details</summary>
                                            <pre className="mt-1 bg-gray-50 p-2 rounded overflow-x-auto">
                                                {JSON.stringify(log.details, null, 2)}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                    <MsButton
                        variant="secondary"
                        disabled={page === 1}
                        onClick={() => fetchLogs(page - 1)}
                    >
                        Previous
                    </MsButton>
                    <span className="flex items-center text-sm text-gray-600">
                        Page {page} of {totalPages}
                    </span>
                    <MsButton
                        variant="secondary"
                        disabled={page === totalPages}
                        onClick={() => fetchLogs(page + 1)}
                    >
                        Next
                    </MsButton>
                </div>
            )}
        </div>
    );
};

export default ActivityLog;
