import { useAuth } from '../../context/AuthContext';
import { Laptop, Shield, Key, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const Card = ({ icon: Icon, colorClass, title, status, linkText, linkTo, description }) => (
    <div className="bg-white dark:bg-[#2c2c2c] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-md ${colorClass}`}>
                    <Icon size={24} className="text-current" />
                </div>
                {/* Optional Status Indicator */}
            </div>
            <h3 className="text-lg font-semibold text-[#323130] dark:text-white mb-1">{title}</h3>
            <div className="text-2xl font-bold text-[#323130] dark:text-white mb-2">{status}</div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 min-h-[40px]">{description}</p>
            <Link to={linkTo} className="text-[#0067b8] dark:text-[#4f93ce] text-[15px] font-semibold hover:underline flex items-center gap-1 group">
                {linkText}
                <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
        </div>
    </div>
);

const Overview = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-5xl">
            {/* Welcome Section */}
            <div className="flex items-center gap-6 mb-10 bg-white dark:bg-[#2c2c2c] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="relative">
                    {user?.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-[#0078D4] text-white flex items-center justify-center text-3xl font-bold">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-[#323130] dark:text-white mb-2">{user?.username}</h1>
                    <p className="text-[#605e5c] dark:text-gray-400 mb-4">{user?.email}</p>
                    <div className="flex gap-4">
                        <Link to="/dashboard/info" className="text-[#0067b8] dark:text-[#4f93ce] hover:underline text-[15px] font-semibold">Change password</Link>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <Link to="/dashboard/info" className="text-[#0067b8] dark:text-[#4f93ce] hover:underline text-[15px] font-semibold">Update info</Link>
                    </div>
                </div>
            </div>

            {/* Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card
                    icon={Laptop}
                    colorClass="text-[#0078D4] bg-blue-50 dark:bg-blue-900/20"
                    title="Devices"
                    status="4 devices"
                    description="Find, lock, or erase a lost or stolen device."
                    linkText="View all devices"
                    linkTo="/dashboard/devices"
                />
                <Card
                    icon={Shield}
                    colorClass="text-green-600 bg-green-50 dark:bg-green-900/20"
                    title="Security"
                    status="Good"
                    description="Your account is protected. Review recent activity."
                    linkText="Update security info"
                    linkTo="/dashboard/security"
                />
                <Card
                    icon={Eye}
                    colorClass="text-purple-600 bg-purple-50 dark:bg-purple-900/20"
                    title="Privacy"
                    status="On"
                    description="Manage your privacy settings and data."
                    linkText="Manage privacy"
                    linkTo="/dashboard/privacy"
                />
            </div>

            {/* Recent Activity or Banner */}
            <div className="mt-8 bg-[#fdfdfd] dark:bg-[#2c2c2c] border border-gray-200 dark:border-gray-700 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors">
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-[#323130] dark:text-white">Microsoft 365</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Premium Office apps, extra cloud storage, advanced security, and more.</p>
                </div>
                <button className="bg-[#0067b8] dark:bg-[#0078D4] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#005da6] dark:hover:bg-[#0067b8] transition-colors whitespace-nowrap">
                    Get Microsoft 365
                </button>
            </div>
        </div>
    );
};

export default Overview;
