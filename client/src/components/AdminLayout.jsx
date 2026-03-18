import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    UserCog,
    Settings,
    Shield,
    LogOut,
    Menu,
    X,
    Building,
    AppWindow, // Replaced Grid with AppWindow for applications
    Activity,
    Wallet,
    History,
    Sun,
    Moon,
    ChevronDown
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ROLE_LEVELS = {
    user: 10,
    member: 15,
    saathi: 20,
    agent: 30,
    supportTeam: 40,
    subAdmin: 70,
    superAdmin: 100,
    admin: 100,
};

const EXTRA_UI_SECTIONS = [
    { id: 'account', label: 'Account', icon: Users },
    { id: 'reports', label: 'Reports', icon: Activity },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'indo-nepal-bus', label: 'Indo Nepal Bus Services', icon: Building, highlighted: true },
    { id: 'service-management', label: 'Service Management', icon: Shield },
    { id: 'jobs', label: 'Jobs', icon: AppWindow },
    { id: 'government-schemes', label: 'Government Schemes', icon: Building },
    { id: 'marketing-and-promotion', label: 'Marketing and Promotion', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'services-and-section', label: 'Services and Section', icon: AppWindow },
    { id: 'role-management-ui', label: 'Role Management', icon: UserCog },
    { id: 'complaint', label: 'Complaint', icon: Activity },
    { id: 'survey-management', label: 'Survey Management', icon: AppWindow },
];

const UI_SECTION_ITEMS = {
    account: [
        { id: 'admin-ledger', path: '/dashboard/admin/account/admin-ledger', label: 'Admin Ledger' },
        { id: 'add-money-request', path: '/dashboard/admin/account/add-money-request', label: 'Add Money Request' },
    ],
    'service-management': [
        { id: 'ime-agent-onboarding', path: '/dashboard/admin/service-management/ime-agent-onboarding', label: 'IME Agent Onboarding' },
        { id: 'ime-kyc-customer', path: '/dashboard/admin/service-management/ime-kyc-customer', label: 'IME KYC Customer' },
        { id: 'prabhu-agent-onboarding', path: '/dashboard/admin/service-management/prabhu-agent-onboarding', label: 'Prabhu Agent Onboarding' },
        { id: 'prabhu-customer-list', path: '/dashboard/admin/service-management/prabhu-customer-list', label: 'Prabhu Customer List' },
        { id: 'remitter-list', path: '/dashboard/admin/service-management/remitter-list', label: 'Remitter List' },
    ],
};

const AdminLayout = ({ children }) => {
    const { user, logout } = useAuth(); // Assuming 'user' has 'role'
    const { theme, toggleTheme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const location = useLocation();
    const navigate = useNavigate();

    const userManagementItems = [
        { id: 'users', path: '/dashboard/admin/users', label: 'Users' },
        { id: 'member', path: '/dashboard/admin/members', label: 'Member' },
        { id: 'saathi', path: '/dashboard/admin/saathi', label: 'Saathi' },
        { id: 'district-partner', path: '/dashboard/admin/district-partner', label: 'District Partner' },
        { id: 'state-partner', path: '/dashboard/admin/state-partner', label: 'State Partner' },
        { id: 'parent-mapping-requests', path: '/dashboard/admin/parent-mapping-requests', label: 'Parent Mapping Requests' },
    ];
    const isUserManagementActive = userManagementItems.some(item =>
        item.path && (location.pathname === item.path || location.pathname.startsWith(`${item.path}/`))
    );
    const walletManagementItems = [
        { id: 'wallet-balance', path: '/dashboard/admin/wallet-balance', label: 'Wallet Balance', icon: Wallet },
        { id: 'wallet-history', path: '/dashboard/admin/wallet-history', label: 'Wallet History', icon: History },
    ];
    const isWalletManagementActive = walletManagementItems.some(item =>
        location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
    );
    const [isUserManagementOpen, setIsUserManagementOpen] = useState(isUserManagementActive);
    const [isWalletManagementOpen, setIsWalletManagementOpen] = useState(isWalletManagementActive);
    const [openUiSections, setOpenUiSections] = useState(
        () => Object.fromEntries(EXTRA_UI_SECTIONS.map(section => [section.id, false]))
    );

    useEffect(() => {
        if (isUserManagementActive) {
            setIsUserManagementOpen(true);
        }
    }, [isUserManagementActive]);

    useEffect(() => {
        if (isWalletManagementActive) {
            setIsWalletManagementOpen(true);
        }
    }, [isWalletManagementActive]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleUiSection = (id) => {
        setOpenUiSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const navItems = [
        { path: '/dashboard/admin/orgs', label: 'Organizations', icon: Building },
        { path: '/dashboard/admin/apps', label: 'Applications (OAuth)', icon: AppWindow },
        { path: '/dashboard/admin/security', label: 'Security & Auth', icon: Shield },
        { path: '/dashboard/admin/transactions', label: 'Wallet Approvals', icon: Wallet },
        { path: '/dashboard/admin/partner-transactions', label: 'Partner Transactions', icon: Activity },
        { path: '/dashboard/admin/audit', label: 'Audit Logs', icon: Activity },
        { path: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="h-screen overflow-hidden bg-[#f3f2f1] dark:bg-[#1b1b1b] font-segoe flex transition-colors duration-300">
            {/* Sidebar */}
            <aside
                className={`bg-white dark:bg-[#2c2c2c] shadow-md fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:h-screen border-r border-gray-100 dark:border-gray-800`}
            >
                <div className="h-14 flex-shrink-0 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
                    <img src={import.meta.env.VITE_LOGO_URL} alt="Online Saathi" className="h-8" />
                    <button
                        className="ml-auto md:hidden text-gray-500 dark:text-gray-400"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden hide-scrollbar p-4 space-y-1">
                    <NavLink
                        to="/dashboard/admin"
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 text-[14px] rounded-md transition-colors ${isActive
                                ? 'bg-[#eff6fc] dark:bg-[#3b3b3b] text-[#0078D4] dark:text-[#4f93ce] font-semibold'
                                : 'text-[#323130] dark:text-gray-300 hover:bg-[#f3f2f1] dark:hover:bg-[#3b3b3b]'
                            }`
                        }
                    >
                        <LayoutDashboard size={18} strokeWidth={1.5} />
                        Overview
                    </NavLink>

                    <button
                        type="button"
                        onClick={() => setIsUserManagementOpen(prev => !prev)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-[14px] rounded-md transition-colors ${isUserManagementActive
                            ? 'bg-[#eff6fc] dark:bg-[#3b3b3b] text-[#0078D4] dark:text-[#4f93ce] font-semibold'
                            : 'text-[#323130] dark:text-gray-300 hover:bg-[#f3f2f1] dark:hover:bg-[#3b3b3b]'
                        }`}
                    >
                        <Users size={18} strokeWidth={1.5} />
                        <span className="flex-1 text-left">User Management</span>
                        <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${isUserManagementOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {isUserManagementOpen && (
                        <div className="ml-6 pl-3 border-l border-gray-200 dark:border-gray-700 space-y-1">
                            {userManagementItems.map((item) => (
                                item.path ? (
                                    <NavLink
                                        key={item.id}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `block px-3 py-2 text-[13px] rounded-md transition-colors ${isActive
                                                ? 'bg-[#eff6fc] dark:bg-[#3b3b3b] text-[#0078D4] dark:text-[#4f93ce] font-semibold'
                                                : 'text-[#5a5958] dark:text-gray-400 hover:bg-[#f3f2f1] dark:hover:bg-[#3b3b3b]'
                                            }`
                                        }
                                    >
                                        {item.label}
                                    </NavLink>
                                ) : (
                                    <div
                                        key={item.id}
                                        className="block px-3 py-2 text-[13px] rounded-md text-[#5a5958] dark:text-gray-400"
                                    >
                                        {item.label}
                                    </div>
                                )
                            ))}
                        </div>
                    )}

                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 text-[14px] rounded-md transition-colors ${isActive
                                    ? 'bg-[#eff6fc] dark:bg-[#3b3b3b] text-[#0078D4] dark:text-[#4f93ce] font-semibold'
                                    : 'text-[#323130] dark:text-gray-300 hover:bg-[#f3f2f1] dark:hover:bg-[#3b3b3b]'
                                }`
                            }
                        >
                            <item.icon size={18} strokeWidth={1.5} />
                            {item.label}
                        </NavLink>
                    ))}

                    <button
                        type="button"
                        onClick={() => setIsWalletManagementOpen(prev => !prev)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-[14px] rounded-md transition-colors ${isWalletManagementActive
                            ? 'bg-[#eff6fc] dark:bg-[#3b3b3b] text-[#0078D4] dark:text-[#4f93ce] font-semibold'
                            : 'text-[#323130] dark:text-gray-300 hover:bg-[#f3f2f1] dark:hover:bg-[#3b3b3b]'
                        }`}
                    >
                        <Wallet size={18} strokeWidth={1.5} className="text-[#d49a2a]" />
                        <span className="flex-1 text-left">Wallet Management</span>
                        <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${isWalletManagementOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {isWalletManagementOpen && (
                        <div className="ml-6 pl-3 border-l border-gray-200 dark:border-gray-700 space-y-1">
                            {walletManagementItems.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <NavLink
                                        key={item.id}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center gap-2 px-3 py-2 text-[13px] rounded-md transition-colors ${isActive
                                                ? 'bg-[#1f4e79] text-white font-semibold'
                                                : 'text-[#5a5958] dark:text-gray-400 hover:bg-[#f3f2f1] dark:hover:bg-[#3b3b3b]'
                                            }`
                                        }
                                    >
                                        <Icon size={14} strokeWidth={1.7} />
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                        </div>
                    )}

                    <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
                        {EXTRA_UI_SECTIONS.map((section) => {
                            const Icon = section.icon;
                            const isOpen = openUiSections[section.id];
                            const sectionItems = UI_SECTION_ITEMS[section.id] || [];

                            return (
                                <div key={section.id} className="space-y-1">
                                    <button
                                        type="button"
                                        onClick={() => toggleUiSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-[14px] rounded-md transition-colors ${section.highlighted
                                            ? 'bg-[#e8f1fb] dark:bg-[#3b3b3b] text-[#1f3a52] dark:text-[#d9e6f2] font-semibold'
                                            : 'text-[#323130] dark:text-gray-300 hover:bg-[#f3f2f1] dark:hover:bg-[#3b3b3b]'
                                            }`}
                                    >
                                        <Icon size={16} strokeWidth={1.5} />
                                        <span className="flex-1 text-left">{section.label}</span>
                                        <ChevronDown
                                            size={14}
                                            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {isOpen && sectionItems.length > 0 && (
                                        <div className="ml-6 pl-3 border-l border-gray-200 dark:border-gray-700 space-y-1">
                                            {sectionItems.map((item) => (
                                                <NavLink
                                                    key={item.id}
                                                    to={item.path}
                                                    className={({ isActive }) =>
                                                        `block px-3 py-2 text-[13px] rounded-md transition-colors ${isActive
                                                            ? 'bg-[#1f4e79] text-white font-semibold'
                                                            : 'text-[#5a5958] dark:text-gray-400 hover:bg-[#f3f2f1] dark:hover:bg-[#3b3b3b]'
                                                        }`
                                                    }
                                                >
                                                    {item.label}
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-[14px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors text-left"
                        >
                            <LogOut size={18} />
                            Sign out
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
                {/* Header */}
                <header className="bg-white dark:bg-[#2c2c2c] h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shadow-sm z-10 transition-colors">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden text-gray-500 dark:text-gray-400"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            OnlineSaathi Email id
                        </h1>

                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#3b3b3b] text-gray-600 dark:text-gray-300 transition-colors"
                            title="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <div className="text-right">

                            <div className="text-sm font-semibold text-[#323130] dark:text-white">{user?.username}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">{user?.role}</div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#0078D4] dark:bg-[#4f93ce] text-white flex items-center justify-center text-xs font-bold">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain hide-scrollbar p-4 sm:p-6 md:p-8">
                    <Outlet />
                </main>

            </div>
        </div>
    );
};

export default AdminLayout;
