import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
    MapPin
} from 'lucide-react';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const navItems = [
        { path: '/dashboard', label: 'Account', icon: Home, end: true },
        { path: '/dashboard/info', label: 'Your info', icon: User },
        { path: '/dashboard/privacy', label: 'Privacy', icon: Key },
        { path: '/dashboard/security', label: 'Security', icon: Shield },
        { path: '/dashboard/subscriptions', label: 'Subscriptions', icon: ShoppingBag },
        { path: '/dashboard/devices', label: 'Devices', icon: Smartphone },
        { path: '/dashboard/payment', label: 'Payment options', icon: CreditCard },
        { path: '/dashboard/orders', label: 'Order history', icon: History },
        { path: '/dashboard/addresses', label: 'Address book', icon: MapPin },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#f2f2f2] font-segoe">
            {/* Header */}
            <header className="bg-[#0078D4] text-white h-12 flex items-center justify-between px-4 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button
                        className="md:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <span className="font-semibold text-lg tracking-tight">Microsoft account</span>
                </div>

                <div className="flex items-center gap-4">
                    {/* User Profile Dropdown/Indicator */}
                    <div className="flex items-center gap-3 cursor-pointer hover:bg-[#005a9e] px-2 py-1 rounded transition-colors" title={user?.email}>
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
                <aside className="hidden md:block w-64 bg-[#f2f2f2] min-h-[calc(100vh-48px)] pt-8 pl-4 pr-6">
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 text-[15px] rounded-md transition-colors ${isActive
                                        ? 'bg-white shadow-sm font-semibold text-[#323130]'
                                        : 'text-[#323130] hover:bg-gray-200'
                                    }`
                                }
                            >
                                <item.icon size={20} strokeWidth={1.5} />
                                {item.label}
                            </NavLink>
                        ))}

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-[15px] text-[#323130] hover:bg-gray-200 rounded-md transition-colors mt-8 text-left"
                        >
                            <LogOut size={20} strokeWidth={1.5} />
                            Sign out
                        </button>
                    </nav>
                </aside>

                {/* Mobile Navigation Drawer */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-40 md:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
                        <div className="absolute left-0 top-12 bottom-0 w-64 bg-white shadow-xl py-4 overflow-y-auto">
                            <nav className="space-y-1 px-2">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        end={item.end}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-4 py-3 text-[15px] rounded-md transition-colors ${isActive
                                                ? 'bg-gray-100 font-semibold text-[#0078D4]'
                                                : 'text-[#323130] hover:bg-gray-50'
                                            }`
                                        }
                                    >
                                        <item.icon size={20} />
                                        {item.label}
                                    </NavLink>
                                ))}
                                <div className="border-t my-4"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-[15px] text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
