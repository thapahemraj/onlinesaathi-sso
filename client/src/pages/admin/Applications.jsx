import { useEffect, useState } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { Search, Plus, AppWindow, MoreHorizontal, ShieldAlert, CheckCircle } from 'lucide-react';

const Applications = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/applications`, { withCredentials: true });
            setApps(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredApps = apps.filter(app =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.clientId.includes(searchTerm)
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Loading applications...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#323130]">App registrations</h2>
                    <p className="text-gray-500 text-sm mt-1">Register and manage applications that can use your identity provider for authentication.</p>
                </div>
                <NavLink to="/dashboard/admin/apps/new" className="bg-[#0078D4] text-white px-4 py-2 rounded-[4px] hover:bg-[#005a9e] transition-colors flex items-center gap-2 text-sm font-semibold shadow-sm">
                    <Plus size={16} />
                    New registration
                </NavLink>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Search Toolbar */}
                <div className="p-4 border-b border-gray-200">
                    <div className="relative max-w-md">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or Client ID"
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#0067b8] focus:ring-1 focus:ring-[#0067b8]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-200 text-xs text-gray-600 font-semibold uppercase tracking-wider">
                                <th className="px-6 py-3 w-10"></th>
                                <th className="px-6 py-3">Display Name</th>
                                <th className="px-6 py-3">Client ID</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredApps.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No applications found. Create one to get started.
                                    </td>
                                </tr>
                            ) : (
                                filteredApps.map((app) => (
                                    <tr key={app._id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                                        <td className="px-6 py-4">
                                            <AppWindow size={20} className="text-gray-400" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <NavLink to={`/dashboard/admin/apps/${app._id}`} className="font-semibold text-[#0067b8] hover:underline">
                                                {app.name}
                                            </NavLink>
                                            {app.description && <div className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{app.description}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono select-all">
                                                {app.clientId}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            {app.isEnabled ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                                    <CheckCircle size={12} /> Enabled
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                    Disabled
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(app.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Applications;
