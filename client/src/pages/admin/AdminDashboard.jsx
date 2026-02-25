import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Building, ShieldAlert, Activity } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`, {
                    withCredentials: true
                });
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch admin stats", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white dark:bg-[#2c2c2c] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 flex items-start justify-between transition-colors">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-[#323130] dark:text-white">{value}</h3>
            </div>
            <div className={`p-3 rounded-md ${color} bg-opacity-10 dark:bg-opacity-20`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
        </div>
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#323130] dark:text-white">Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={Users}
                    color="bg-blue-600"
                />
                <StatCard
                    title="Active Users (30d)"
                    value={stats?.activeUsers || 0}
                    icon={Activity}
                    color="bg-green-600"
                />
                <StatCard
                    title="Total Applications"
                    value={stats?.totalApps || 0}
                    icon={Building}
                    color="bg-purple-600"
                />
                <StatCard
                    title="Security Alerts"
                    value={stats?.securityAlerts || 0}
                    icon={ShieldAlert}
                    color="bg-red-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-white dark:bg-[#2c2c2c] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                    <h3 className="text-lg font-semibold mb-4 text-[#323130] dark:text-white">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 text-sm border-b border-gray-50 dark:border-gray-800 last:border-0 pb-3 last:pb-0">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <div className="flex-1">
                                    <span className="font-medium text-[#323130] dark:text-gray-200">User Login</span>
                                    <span className="text-gray-500 dark:text-gray-400"> - admin@example.com logged in successfully.</span>
                                </div>
                                <span className="text-gray-400 text-xs">2m ago</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-[#2c2c2c] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                    <h3 className="text-lg font-semibold mb-4 text-[#323130] dark:text-white">System Health</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">API Status</span>
                            <span className="text-green-600 dark:text-green-400 font-medium px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded">Operational</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Database</span>
                            <span className="text-green-600 dark:text-green-400 font-medium px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded">Connected</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Auth Services</span>
                            <span className="text-green-600 dark:text-green-400 font-medium px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded">Running</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
