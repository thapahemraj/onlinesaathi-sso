import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Smartphone, Shield, Eye, User, CreditCard, MapPin, ShoppingBag, Package } from 'lucide-react';
import ProfileCompletion from '../../components/ProfileCompletion';
import axios from 'axios';

const QuickCard = ({ icon: Icon, title, subtitle, onClick, color }) => (
    <div onClick={onClick} className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-[#0078D4] dark:hover:border-[#4f93ce] transition-all cursor-pointer group">
        <div className={`p-3 rounded-lg mb-4 w-fit ${color}`}>
            <Icon size={24} className="text-white" />
        </div>
        <h3 className="font-semibold text-[#323130] dark:text-white mb-1 group-hover:text-[#0078D4] dark:group-hover:text-[#4f93ce] transition-colors">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
    </div>
);

const Overview = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [deviceCount, setDeviceCount] = useState(0);

    useEffect(() => {
        axios.get('/devices').then(res => setDeviceCount(res.data.length)).catch(() => { });
    }, []);

    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || 'User';

    return (
        <div className="max-w-5xl">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-[#0078D4] to-[#005da6] rounded-2xl p-8 mb-8 text-white">
                <div className="flex items-center gap-5">
                    {user?.profilePicture ? (
                        <img src={user.profilePicture.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}${user.profilePicture}` : user.profilePicture} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-white/30" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold border-4 border-white/30">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold">Hi, {displayName}!</h1>
                        <p className="text-white/80 mt-1">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Quick Links Grid */}
            <h1 className="text-3xl font-bold text-[#323130] dark:text-white mb-2">Welcome, {user?.firstName || user?.username}!</h1>
            <p className="text-[#323130] dark:text-gray-300 mb-8">Manage your info, privacy, and security to make Microsoft work better for you.</p>

            <ProfileCompletion user={user} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <QuickCard icon={User} title="Your info" subtitle="Profile details, photo" onClick={() => navigate('/dashboard/info')} color="bg-[#0078D4]" />
                <QuickCard icon={Shield} title="Security" subtitle="Password, biometrics" onClick={() => navigate('/dashboard/security')} color="bg-emerald-500" />
                <QuickCard icon={Eye} title="Privacy" subtitle="Activity controls" onClick={() => navigate('/dashboard/privacy')} color="bg-violet-500" />
                <QuickCard icon={Smartphone} title="Devices" subtitle={`${deviceCount} device${deviceCount !== 1 ? 's' : ''} connected`} onClick={() => navigate('/dashboard/devices')} color="bg-amber-500" />
                <QuickCard icon={CreditCard} title="Payment" subtitle="Payment methods" onClick={() => navigate('/dashboard/payment')} color="bg-rose-500" />
                <QuickCard icon={MapPin} title="Addresses" subtitle="Billing & shipping" onClick={() => navigate('/dashboard/addresses')} color="bg-teal-500" />
                <QuickCard icon={ShoppingBag} title="Orders" subtitle="Order history" onClick={() => navigate('/dashboard/orders')} color="bg-orange-500" />
                <QuickCard icon={Package} title="Subscriptions" subtitle="Active plans" onClick={() => navigate('/dashboard/subscriptions')} color="bg-indigo-500" />
            </div>
        </div>
    );
};

export default Overview;
