import { useAuth } from '../context/AuthContext';
import { LogOut, User, Settings, Shield } from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-ms-gray">
            {/* Navbar */}
            <nav className="bg-ms-blue text-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <span className="font-semibold text-xl tracking-tight">SSO Workspace</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm">{user?.email}</span>
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} alt="Profile" className="w-8 h-8 rounded-full border-2 border-white" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-ms-darkBlue flex items-center justify-center text-xs font-bold">
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 rounded-md hover:bg-ms-darkBlue transition-colors"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-6">Welcome, {user?.username}</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                                        <User className="h-6 w-6 text-ms-blue" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">User Profile</dt>
                                            <dd className="mt-1 text-3xl font-semibold text-gray-900">Active</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-5 py-3">
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-ms-blue hover:text-ms-darkBlue">View details</a>
                                </div>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                                        <Shield className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Security Status</dt>
                                            <dd className="mt-1 text-3xl font-semibold text-gray-900">Secure</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-5 py-3">
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-ms-blue hover:text-ms-darkBlue">Manage settings</a>
                                </div>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                                        <Settings className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Preferences</dt>
                                            <dd className="mt-1 text-3xl font-semibold text-gray-900">Default</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-5 py-3">
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-ms-blue hover:text-ms-darkBlue">Edit preferences</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
