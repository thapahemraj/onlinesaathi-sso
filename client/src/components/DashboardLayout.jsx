import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    User,
    Shield,
    Key,
    Smartphone,
    CreditCard,
    Settings,
    Menu,
    X,
    LogOut,
    Home,
    ShoppingBag,
    History,
    MapPin,
    Monitor,
    Moon,
    Sun,
    FileText,
    Briefcase,
    Star,
    UserCheck,
    HeartHandshake,
    Users,
    Wallet
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ROLE_LEVELS = {
    user: 10, member: 15, saathi: 20, agent: 30, supportTeam: 40, subAdmin: 70, superAdmin: 100, admin: 100
};

const hasMinRole = (userRole, minRole) => (ROLE_LEVELS[userRole] || 0) >= (ROLE_LEVELS[minRole] || 0);

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Base nav items for all users
    const baseNavItems = [
        { path: '/dashboard', label: 'Account', icon: Home, end: true },
        { path: '/dashboard/info', label: 'Your info', icon: User },
        { path: '/dashboard/privacy', label: 'Privacy', icon: Key },
        { path: '/dashboard/security', label: 'Security', icon: Shield },
        { path: '/dashboard/devices', label: 'Devices', icon: Smartphone },
        { path: '/dashboard/sessions', label: 'Sessions', icon: Monitor },
        { path: '/dashboard/wallet', label: 'My Wallet', icon: Wallet },
        { path: '/dashboard/payment', label: 'Payment options', icon: CreditCard },
        { path: '/dashboard/orders', label: 'Order history', icon: History },
        { path: '/dashboard/addresses', label: 'Address book', icon: MapPin },
    ];

    // Role-specific additional nav items
    const roleNavItems = [];

    // All users: Documents, KYC Status, Schemes, Jobs
    roleNavItems.push({ path: '/dashboard/documents', label: 'My Documents', icon: FileText });
    roleNavItems.push({ path: '/dashboard/kyc-status', label: 'KYC Status', icon: UserCheck });
    roleNavItems.push({ path: '/dashboard/schemes', label: 'Gov. Schemes', icon: Star });
    roleNavItems.push({ path: '/dashboard/jobs', label: 'Jobs', icon: Briefcase });

    const navItems = [...baseNavItems, ...roleNavItems];

    // Admin-tier links shown at bottom of sidebar
    const adminLinks = [];
    if (user?.role === 'agent') {
        adminLinks.push({ path: '/agent', label: 'KYC Management', icon: UserCheck });
    }
    if (user?.role === 'saathi') {
        adminLinks.push({ path: '/saathi', label: 'Saathi Centre', icon: HeartHandshake });
    }
    if (hasMinRole(user?.role, 'supportTeam')) {
        adminLinks.push({ path: '/dashboard/admin', label: 'Admin Centre', icon: Users });
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const SidebarNav = ({ onClickItem }) => (
        <nav className="space-y-1">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={onClickItem}
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 text-[15px] rounded-md transition-colors ${isActive
                            ? 'bg-white dark:bg-[#2c2c2c] shadow-sm font-semibold text-[#323130] dark:text-white'
                            : 'text-[#323130] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c2c]'
                        }`
                    }
                >
                    <item.icon size={20} strokeWidth={1.5} />
                    {item.label}
                </NavLink>
            ))}

            <button
                onClick={() => { handleLogout(); onClickItem?.(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[15px] text-[#323130] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c2c] rounded-md transition-colors mt-4 text-left"
            >
                <LogOut size={20} strokeWidth={1.5} />
                Sign out
            </button>

            {adminLinks.length > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4 space-y-1">
                    {adminLinks.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClickItem}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 text-[15px] rounded-md transition-colors ${isActive
                                    ? 'bg-white dark:bg-[#2c2c2c] shadow-sm font-semibold text-[#0078D4] dark:text-[#4f93ce]'
                                    : 'text-[#0078D4] dark:text-[#4f93ce] hover:bg-gray-200 dark:hover:bg-[#2c2c2c]'
                                }`
                            }
                        >
                            <item.icon size={20} strokeWidth={1.5} />
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            )}
        </nav>
    );

    return (
        <div className="h-screen bg-[#f2f2f2] dark:bg-[#1b1b1b] font-segoe transition-colors duration-300 overflow-hidden">
            {/* Header */}
            <header className="bg-[#0078D4] dark:bg-[#2b2b2b] text-white h-12 flex items-center justify-between px-4 sticky top-0 z-50 transition-colors">
                <div className="flex items-center gap-4">
                    <button
                        className="md:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <span className="font-semibold text-lg tracking-tight">OnlineSaathi account</span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        title="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <div className="flex items-center gap-3 cursor-pointer hover:bg-[#005a9e] dark:hover:bg-[#3b3b3b] px-2 py-1 rounded transition-colors" title={user?.email}>
                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-semibold">{user?.username}</div>
                            <div className="text-[10px] opacity-80 capitalize">{user?.role}</div>
                        </div>
                        {user?.profilePicture ? (
                            <img src={user.profilePicture} alt="Profile" className="w-8 h-8 rounded-full border-2 border-white/50" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold border-2 border-white/50">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex w-full h-[calc(100vh-48px)] overflow-hidden">
                {/* Sidebar - Desktop */}
                <aside className="hidden md:block w-64 bg-[#f2f2f2] dark:bg-[#1b1b1b] h-full pt-3 pl-4 pr-6 transition-colors overflow-y-auto overscroll-contain hide-scrollbar">
                    <SidebarNav />
                </aside>

                {/* Mobile Navigation Drawer */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-40 md:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
                        <div className="absolute left-0 top-12 bottom-0 w-64 bg-white dark:bg-[#2c2c2c] shadow-xl py-4 overflow-y-auto hide-scrollbar transition-colors">
                            <div className="px-2">
                                <SidebarNav onClickItem={() => setIsMobileMenuOpen(false)} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 h-full px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 pt-3 overflow-y-auto overflow-x-hidden overscroll-contain hide-scrollbar min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
