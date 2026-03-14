import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ArrowRightLeft, RefreshCw, Shuffle, Info } from 'lucide-react';

const DEMO_REQUESTS = [
    {
        _id: 'pmr-1',
        requestedAt: '12 Mar 2026, 10:25 AM',
        userName: 'Aarav Sharma',
        currentParentName: 'Ramesh Sharma',
        newParentName: 'Suresh Sharma'
    },
    {
        _id: 'pmr-2',
        requestedAt: '11 Mar 2026, 04:10 PM',
        userName: 'Priya Singh',
        currentParentName: 'Anil Singh',
        newParentName: 'Sunita Singh'
    },
    {
        _id: 'pmr-3',
        requestedAt: '10 Mar 2026, 09:42 AM',
        userName: 'Rohan Verma',
        currentParentName: 'Mahesh Verma',
        newParentName: 'Neha Verma'
    }
];

export default function ParentMappingRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const loadRequests = async () => {
        try {
            const res = await axios.get('/admin/parent-mapping-requests');
            const data = Array.isArray(res.data)
                ? res.data
                : (Array.isArray(res.data?.requests) ? res.data.requests : []);
            setRequests(data.length > 0 ? data : DEMO_REQUESTS);
        } catch {
            setRequests(DEMO_REQUESTS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadRequests();
        setRefreshing(false);
    };

    const filteredRequests = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return requests;

        return requests.filter((item) => {
            const userName = String(item?.userName || item?.username || '').toLowerCase();
            const parentName = String(item?.parentName || item?.newParentName || '').toLowerCase();
            return userName.includes(q) || parentName.includes(q);
        });
    }, [requests, search]);

    const handleChangeParent = () => {
        window.alert('No pending requests found.');
    };

    return (
        <div className="h-full min-h-0">
            <div className="bg-white dark:bg-[#2c2c2c] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 h-full min-h-0">
                <div className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="inline-flex items-center gap-2 text-[#4f7ad9] font-semibold text-[28px] leading-none tracking-wide">
                            <ArrowRightLeft size={16} />
                            <span className="text-[30px] leading-none">Parent Change Requests</span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by user or parent name..."
                                    className="w-[250px] max-w-full pl-3 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-gray-700 dark:text-gray-200"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleChangeParent}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#4f67d8] hover:bg-[#4358ba] text-white text-sm font-medium transition-colors"
                            >
                                <Shuffle size={14} /> Change Parent
                            </button>

                            <button
                                type="button"
                                onClick={handleRefresh}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-[#4f67d8] text-[#4f67d8] hover:bg-[#eef2ff] dark:hover:bg-[#2d3355] text-sm font-medium transition-colors"
                            >
                                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 rounded-md border border-gray-100 dark:border-gray-700 bg-[#f6f7f9] dark:bg-[#303030] min-h-[340px] flex items-center justify-center">
                        {loading ? (
                            <div className="text-center text-gray-500 dark:text-gray-400">
                                <RefreshCw size={22} className="mx-auto animate-spin" />
                                <p className="mt-3 text-sm">Loading requests...</p>
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="text-center text-[#6e7f99] dark:text-gray-400">
                                <Info size={28} className="mx-auto" />
                                <p className="mt-2 text-[24px] leading-none">No pending requests found.</p>
                            </div>
                        ) : (
                            <div className="w-full overflow-x-auto p-4">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                            <th className="px-3 py-2 font-semibold">Requested At</th>
                                            <th className="px-3 py-2 font-semibold">User</th>
                                            <th className="px-3 py-2 font-semibold">Current Parent</th>
                                            <th className="px-3 py-2 font-semibold">Requested Parent</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRequests.map((item, idx) => (
                                            <tr key={item?._id || idx} className="border-b border-gray-100 dark:border-gray-800">
                                                <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{item?.requestedAt || '-'}</td>
                                                <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{item?.userName || item?.username || '-'}</td>
                                                <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{item?.currentParentName || '-'}</td>
                                                <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{item?.newParentName || item?.parentName || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
