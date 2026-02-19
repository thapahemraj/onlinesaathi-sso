import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Camera, X, Loader2 } from 'lucide-react';
import axios from 'axios';

const EditModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#323130] dark:text-white">{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

const InfoRow = ({ label, value, onEdit, actionText }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-[#333] -mx-6 px-6 transition-colors">
        <div className="mb-2 sm:mb-0">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</div>
            <div className="text-[#323130] dark:text-white font-medium">{value || 'Not set'}</div>
        </div>
        <button onClick={onEdit} className="text-[#0067b8] dark:text-[#4f93ce] hover:underline text-sm font-semibold text-left sm:text-right">
            {actionText || 'Edit'}
        </button>
    </div>
);

const YourInfo = () => {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [editModal, setEditModal] = useState({ open: false, type: '' });
    const [formData, setFormData] = useState({});
    const [uploadLoading, setUploadLoading] = useState(false);

    const openEdit = (type) => {
        // Pre-fill form data based on type
        if (type === 'name') {
            setFormData({ firstName: user?.firstName || '', lastName: user?.lastName || '' });
        } else if (type === 'dob') {
            const dob = user?.dateOfBirth ? new Date(user.dateOfBirth) : null;
            setFormData({
                birthDay: dob ? dob.getDate() : '',
                birthMonth: dob ? dob.getMonth() + 1 : '',
                birthYear: dob ? dob.getFullYear() : ''
            });
        } else if (type === 'country') {
            setFormData({ country: user?.country || '' });
        } else if (type === 'language') {
            setFormData({ language: user?.language || '' });
        } else if (type === 'phone') {
            setFormData({ phoneNumber: user?.phoneNumber || '' });
        }
        setEditModal({ open: true, type });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            let payload = {};
            if (editModal.type === 'name') {
                payload = { firstName: formData.firstName, lastName: formData.lastName };
            } else if (editModal.type === 'dob') {
                payload = { dateOfBirth: new Date(formData.birthYear, formData.birthMonth - 1, formData.birthDay) };
            } else if (editModal.type === 'country') {
                payload = { country: formData.country };
            } else if (editModal.type === 'language') {
                payload = { language: formData.language };
            } else if (editModal.type === 'phone') {
                payload = { phoneNumber: formData.phoneNumber };
            }

            await axios.put('/profile', payload);
            await refreshUser();
            setEditModal({ open: false, type: '' });
        } catch (error) {
            console.error('Update failed:', error);
            alert(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadLoading(true);
        const fd = new FormData();
        fd.append('profilePicture', file);

        try {
            await axios.put('/profile/picture', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await refreshUser();
        } catch (error) {
            console.error('Upload failed:', error);
            alert(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploadLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Not set';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || 'Not set';

    const inputClass = "w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-[#323130] dark:text-white focus:border-[#0067b8] focus:outline-none text-sm";
    const btnClass = "w-full bg-[#0067b8] text-white py-2.5 rounded-md font-semibold hover:bg-[#005da6] transition-colors text-sm";

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-[#323130] dark:text-white mb-8">Your info</h1>

            {/* Profile Photo Section */}
            <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-8">
                <div className="relative group cursor-pointer">
                    {user?.profilePicture ? (
                        <img src={user.profilePicture.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}${user.profilePicture}` : user.profilePicture} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-[#0078D4] text-white flex items-center justify-center text-4xl font-bold">
                            {(user?.firstName || user?.username || '?').charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {uploadLoading ? <Loader2 className="text-white animate-spin" /> : <Camera className="text-white" />}
                    </div>
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-semibold dark:text-white mb-2">Profile photo</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 max-w-md">
                        Add a photo to personalize your account. It will appear on apps and devices that use your OnlineSaathi account.
                    </p>
                    <label className="border border-gray-400 dark:border-gray-600 px-6 py-2 rounded-md text-[15px] font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer inline-block dark:text-white">
                        {uploadLoading ? 'Uploading...' : 'Change photo'}
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadLoading} />
                    </label>
                </div>
            </div>

            {/* Profile Details */}
            <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-semibold dark:text-white mb-2">Profile info</h2>

                <InfoRow label="Full name" value={fullName} onEdit={() => openEdit('name')} actionText="Edit name" />
                <InfoRow label="Date of birth" value={formatDate(user?.dateOfBirth)} onEdit={() => openEdit('dob')} actionText="Edit date of birth" />
                <InfoRow label="Country or region" value={user?.country || 'Not set'} onEdit={() => openEdit('country')} actionText="Edit country" />
                <InfoRow label="Language" value={user?.language || 'Not set'} onEdit={() => openEdit('language')} actionText="Edit language" />
            </div>

            <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mt-6">
                <h2 className="text-xl font-semibold dark:text-white mb-2">Account info</h2>
                <InfoRow label="Email address" value={user?.email || 'Not set'} onEdit={() => { }} actionText="Manage" />
                <InfoRow label="Phone number" value={user?.phoneNumber || 'None'} onEdit={() => openEdit('phone')} actionText={user?.phoneNumber ? 'Edit' : 'Add phone number'} />
            </div>

            {/* Edit Modals */}
            <EditModal isOpen={editModal.open && editModal.type === 'name'} onClose={() => setEditModal({ open: false, type: '' })} title="Edit name">
                <div className="space-y-4">
                    <input className={inputClass} placeholder="First name" value={formData.firstName || ''} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                    <input className={inputClass} placeholder="Last name" value={formData.lastName || ''} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                    <button onClick={handleSave} disabled={loading} className={btnClass}>{loading ? 'Saving...' : 'Save'}</button>
                </div>
            </EditModal>

            <EditModal isOpen={editModal.open && editModal.type === 'dob'} onClose={() => setEditModal({ open: false, type: '' })} title="Edit date of birth">
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <select className={inputClass} value={formData.birthMonth || ''} onChange={e => setFormData({ ...formData, birthMonth: e.target.value })}>
                            <option value="">Month</option>
                            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (
                                <option key={m} value={i + 1}>{m}</option>
                            ))}
                        </select>
                        <select className={inputClass} value={formData.birthDay || ''} onChange={e => setFormData({ ...formData, birthDay: e.target.value })}>
                            <option value="">Day</option>
                            {[...Array(31)].map((_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
                        </select>
                        <select className={inputClass} value={formData.birthYear || ''} onChange={e => setFormData({ ...formData, birthYear: e.target.value })}>
                            <option value="">Year</option>
                            {[...Array(100)].map((_, i) => <option key={i} value={2024 - i}>{2024 - i}</option>)}
                        </select>
                    </div>
                    <button onClick={handleSave} disabled={loading} className={btnClass}>{loading ? 'Saving...' : 'Save'}</button>
                </div>
            </EditModal>

            <EditModal isOpen={editModal.open && editModal.type === 'country'} onClose={() => setEditModal({ open: false, type: '' })} title="Edit country">
                <div className="space-y-4">
                    <select className={inputClass} value={formData.country || ''} onChange={e => setFormData({ ...formData, country: e.target.value })}>
                        <option value="">Select country</option>
                        {["Nepal", "India", "United States", "United Kingdom", "Canada", "Australia", "Japan", "Germany", "France", "China"].map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <button onClick={handleSave} disabled={loading} className={btnClass}>{loading ? 'Saving...' : 'Save'}</button>
                </div>
            </EditModal>

            <EditModal isOpen={editModal.open && editModal.type === 'language'} onClose={() => setEditModal({ open: false, type: '' })} title="Edit language">
                <div className="space-y-4">
                    <select className={inputClass} value={formData.language || ''} onChange={e => setFormData({ ...formData, language: e.target.value })}>
                        {["English (United States)", "English (United Kingdom)", "Nepali", "Hindi", "Japanese", "French", "German", "Chinese (Simplified)"].map(l => (
                            <option key={l} value={l}>{l}</option>
                        ))}
                    </select>
                    <button onClick={handleSave} disabled={loading} className={btnClass}>{loading ? 'Saving...' : 'Save'}</button>
                </div>
            </EditModal>

            <EditModal isOpen={editModal.open && editModal.type === 'phone'} onClose={() => setEditModal({ open: false, type: '' })} title="Edit phone number">
                <div className="space-y-4">
                    <input className={inputClass} type="tel" placeholder="Phone number" value={formData.phoneNumber || ''} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
                    <button onClick={handleSave} disabled={loading} className={btnClass}>{loading ? 'Saving...' : 'Save'}</button>
                </div>
            </EditModal>
        </div>
    );
};

export default YourInfo;
