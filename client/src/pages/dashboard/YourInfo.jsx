import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Camera, Loader2 } from 'lucide-react';
import axios from 'axios';
import CustomAlert from '../../components/CustomAlert';

const InfoRow = ({ label, value, action, onClick }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-6 px-6 transition-colors">
        <div className="mb-2 sm:mb-0">
            <div className="text-sm text-gray-500 mb-1">{label}</div>
            <div className="text-[#323130] font-medium">{value}</div>
        </div>
        <button
            onClick={onClick}
            className="text-[#0067b8] hover:underline text-sm font-semibold text-left sm:text-right"
        >
            {action}
        </button>
    </div>
);

const YourInfo = () => {
    const { user, login } = useAuth(); // Assuming login or a similar method can update local user state
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [alert, setAlert] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePicture', file);

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/profile-picture`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            // Update user context with new profile picture
            // We might need to refresh user data or manually update the user object
            // For now, let's assume we can trigger a reload or update state if AuthContext supports it
            // Or just update local UI for immediate feedback if we had a local user state

            // Reload page to fetch fresh user data (Simple approach for now)
            window.location.reload();

        } catch (error) {
            console.error(error);
            setAlert({ type: 'error', message: 'Failed to upload photo.' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-[#323130] mb-8">Your info</h1>

            {alert && (
                <div className="mb-4">
                    <CustomAlert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                </div>
            )}

            {/* Profile Photo Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-8">
                <div
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current.click()}
                >
                    {user?.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" className="w-32 h-32 rounded-full object-cover border border-gray-200" />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-[#0078D4] text-white flex items-center justify-center text-4xl font-bold">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" />
                    </div>
                    {uploading && (
                        <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                            <Loader2 className="animate-spin text-[#0078D4]" />
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">Profile photo</h2>
                    <p className="text-gray-600 text-sm mb-4 max-w-md">
                        Add a photo to personalize your account. It will appear on apps and devices that use your OnlineSaathi account.
                    </p>
                    <button
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                        className="border border-gray-400 px-6 py-2 rounded-md text-[15px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        {uploading ? 'Uploading...' : 'Change photo'}
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
                    value={user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "Add date of birth"}
                    action="Edit date of birth"
                />
                <InfoRow
                    label="Country or region"
                    value={user?.country || "Add country"}
                    action="Edit country"
                />
                <InfoRow
                    label="Language"
                    value={user?.language || "English (United States)"}
                    action="Edit language"
                />
                <InfoRow
                    label="Regional formats"
                    value={user?.regionalFormat || "English (United States)"}
                    action="Edit formats"
                />

                <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-gray-500 text-sm mr-2">Related</span>
                    <button className="text-[#0067b8] hover:underline text-sm">Billing & shipping addresses</button>
                </div>
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
                    value={user?.phoneNumber || "None"}
                    action="Add phone number"
                />
            </div>
        </div>
    );
};

export default YourInfo;
