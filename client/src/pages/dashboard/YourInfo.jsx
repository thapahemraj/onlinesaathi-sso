import { useAuth } from '../../context/AuthContext';
import { Camera } from 'lucide-react';

const InfoRow = ({ label, value, action }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-6 px-6 transition-colors">
        <div className="mb-2 sm:mb-0">
            <div className="text-sm text-gray-500 mb-1">{label}</div>
            <div className="text-[#323130] font-medium">{value}</div>
        </div>
        <button className="text-[#0067b8] hover:underline text-sm font-semibold text-left sm:text-right">
            {action}
        </button>
    </div>
);

const YourInfo = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-[#323130] mb-8">Your info</h1>

            {/* Profile Photo Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-8">
                <div className="relative group cursor-pointer">
                    {user?.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-[#0078D4] text-white flex items-center justify-center text-4xl font-bold">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" />
                    </div>
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">Profile photo</h2>
                    <p className="text-gray-600 text-sm mb-4 max-w-md">
                        Add a photo to personalize your account. It will appear on apps and devices that use your OnlineSaathi account.
                    </p>
                    <button className="border border-gray-400 px-6 py-2 rounded-md text-[15px] font-semibold hover:bg-gray-50 transition-colors">
                        Change photo
                    </button>
                </div>
            </div>

            {/* Profile Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">Profile info</h2>
                    <button className="text-[#0067b8] hover:underline text-sm font-semibold">Edit profile info</button>
                </div>

                <InfoRow
                    label="Full name"
                    value={user?.username}
                    action="Edit name"
                />
                <InfoRow
                    label="Date of birth"
                    value="January 1, 1990"
                    action="Edit date of birth"
                />
                <InfoRow
                    label="Country or region"
                    value="United States"
                    action="Edit country"
                />
                <InfoRow
                    label="Language"
                    value="English (United States)"
                    action="Edit language"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mt-6">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">Account info</h2>
                    <button className="text-[#0067b8] hover:underline text-sm font-semibold">Edit account info</button>
                </div>
                <InfoRow
                    label="Email address"
                    value={user?.email}
                    action="Manage communication preferences"
                />
                <InfoRow
                    label="Phone number"
                    value="None"
                    action="Add phone number"
                />
            </div>
        </div>
    );
};

export default YourInfo;
