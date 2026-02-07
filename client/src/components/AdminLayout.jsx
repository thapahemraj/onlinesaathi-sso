import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Settings,
    Shield,
    LogOut,
    Menu,
    X,
    Building,
    AppWindow, // Replaced Grid with AppWindow for applications
    Activity
} from 'lucide-react';

const AdminLayout = () => {
    const { user, logout } = useAuth(); // Assuming 'user' has 'role'
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard, end: true },
        { path: '/dashboard/admin/users', label: 'Users & Identity', icon: Users },
        { path: '/dashboard/admin/orgs', label: 'Organizations', icon: Building },
        { path: '/dashboard/admin/apps', label: 'Applications (OAuth)', icon: AppWindow },
        { path: '/dashboard/admin/security', label: 'Security & Auth', icon: Shield },
        { path: '/dashboard/admin/audit', label: 'Audit Logs', icon: Activity },
        { path: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#f3f2f1] font-segoe flex">
            {/* Sidebar */}
            <aside
                className={`bg-white shadow-md fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}
            >
                <div className="h-14 flex items-center px-6 border-b border-gray-100">
                    <span className="font-bold text-lg text-[#0078D4] flex items-center gap-2">
                        <Shield size={20} />
                        Admin Center
                    </span>
                    <button
                        className="ml-auto md:hidden text-gray-500"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 text-[14px] rounded-md transition-colors ${isActive
                                    ? 'bg-[#eff6fc] text-[#0078D4] font-semibold'
                                    : 'text-[#323130] hover:bg-[#f3f2f1]'
                                }`
                            }
                        >
                            <item.icon size={18} strokeWidth={1.5} />
                            {item.label}
                        </NavLink>
                    ))}

                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-[14px] text-red-600 hover:bg-red-50 rounded-md transition-colors text-left"
                        >
                            <LogOut size={18} />
                            Sign out
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="bg-white h-14 border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden text-gray-500"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                            Microsoft Entra ID
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-sm font-semibold text-[#323130]">{user?.username}</div>
                            <div className="text-xs text-gray-500 uppercase">{user?.role}</div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#0078D4] text-white flex items-center justify-center text-xs font-bold">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
