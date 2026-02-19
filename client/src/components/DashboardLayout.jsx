import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    User,
    Shield,
    Key,
    Smartphone,
    CreditCard,
    Menu,
    X,
    LogOut,
    Home,
    ShoppingBag,
    History,
    MapPin,
    Monitor,
    Moon,
    Sun
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const navItems = [
        { path: '/dashboard', label: 'Account', icon: Home, end: true },
        { path: '/dashboard/info', label: 'Your info', icon: User },
        { path: '/dashboard/privacy', label: 'Privacy', icon: Key },
        { path: '/dashboard/security', label: 'Security', icon: Shield },
        { path: '/dashboard/subscriptions', label: 'Subscriptions', icon: ShoppingBag },
        { path: '/dashboard/devices', label: 'Devices', icon: Smartphone },
        { path: '/dashboard/sessions', label: 'Sessions', icon: Monitor },
        { path: '/dashboard/payment', label: 'Payment options', icon: CreditCard },
        { path: '/dashboard/orders', label: 'Order history', icon: History },
        { path: '/dashboard/addresses', label: 'Address book', icon: MapPin },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#f2f2f2] dark:bg-[#1b1b1b] font-segoe transition-colors duration-300">
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
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        title="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* User Profile Dropdown/Indicator */}
                    <div className="flex items-center gap-3 cursor-pointer hover:bg-[#005a9e] dark:hover:bg-[#3b3b3b] px-2 py-1 rounded transition-colors" title={user?.email}>
                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-semibold">{user?.username}</div>
                            <div className="text-[10px] opacity-80">{user?.email}</div>
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

            <div className="flex max-w-[1600px] mx-auto">
                {/* Sidebar - Desktop */}
                <aside className="hidden md:block w-64 bg-[#f2f2f2] dark:bg-[#1b1b1b] min-h-[calc(100vh-48px)] pt-8 pl-4 pr-6 transition-colors">
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
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
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-[15px] text-[#323130] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c2c] rounded-md transition-colors mt-8 text-left"
                        >
                            Sign out
                        </button>

                        {user?.role === 'admin' && (
                            <NavLink
                                to="/dashboard/admin"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 text-[15px] rounded-md transition-colors mt-4 border-t border-gray-200 dark:border-gray-700 ${isActive
                                        ? 'bg-white dark:bg-[#2c2c2c] shadow-sm font-semibold text-[#0078D4] dark:text-[#4f93ce]'
                                        : 'text-[#0078D4] dark:text-[#4f93ce] hover:bg-gray-200 dark:hover:bg-[#2c2c2c]'
                                    }`
                                }
                            >
                                <Shield size={20} strokeWidth={1.5} />
                                Admin Center
                            </NavLink>
                        )}
                    </nav>
                </aside>

                {/* Mobile Navigation Drawer */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-40 md:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
                        <div className="absolute left-0 top-12 bottom-0 w-64 bg-white dark:bg-[#2c2c2c] shadow-xl py-4 overflow-y-auto transition-colors">
                            <nav className="space-y-1 px-2">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        end={item.end}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-4 py-3 text-[15px] rounded-md transition-colors ${isActive
                                                ? 'bg-gray-100 dark:bg-[#3b3b3b] font-semibold text-[#0078D4] dark:text-[#4f93ce]'
                                                : 'text-[#323130] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#3b3b3b]'
                                            }`
                                        }
                                    >
                                        <item.icon size={20} />
                                        {item.label}
                                    </NavLink>
                                ))}
                                <div className="border-t dark:border-gray-700 my-4"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-[15px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                >
                                    <LogOut size={20} />
                                    Sign out
                                </button>
                            </nav>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 md:pt-14 overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
