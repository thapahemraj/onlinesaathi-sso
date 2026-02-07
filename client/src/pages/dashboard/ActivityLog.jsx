import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { theme } = useTheme();

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/activity-logs`, {
                withCredentials: true
            });
            setLogs(res.data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to load activity logs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getIcon = (action) => {
        if (action.includes('LOGIN')) return <CheckCircle size={18} className="text-green-600 dark:text-green-400" />;
        if (action.includes('REGISTER')) return <Shield size={18} className="text-blue-600 dark:text-blue-400" />;
        if (action.includes('UPDATE')) return <RefreshCw size={18} className="text-orange-600 dark:text-orange-400" />;
        return <Clock size={18} className="text-gray-600 dark:text-gray-400" />;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-[#323130] dark:text-white">Recent Activity</h1>
                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 text-[#0067b8] dark:text-[#4f9cdd] hover:underline"
                >
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {error && (
                <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md flex items-center gap-2">
                    <AlertTriangle size={20} />
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-[#1b1b1b] rounded-xl shadow-sm border border-gray-200 dark:border-[#323130] overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading activity...</div>
                ) : logs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">No recent activity found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-[#252525] border-b border-gray-200 dark:border-[#323130]">
                                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log._id} className="border-b border-gray-100 dark:border-[#323130] last:border-0 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {getIcon(log.action)}
                                                <span className="font-medium text-[#323130] dark:text-white">{log.action}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                                            {JSON.stringify(log.details || {})}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {formatDate(log.timestamp)}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                    log.status === 'FAILURE' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLog;
