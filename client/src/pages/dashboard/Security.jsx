import { useState } from 'react';
import { Shield, Key, Activity, Fingerprint, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BiometricSetup from '../../components/BiometricSetup';
import axios from 'axios';

const PasswordModal = ({ isOpen, onClose }) => {
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (form.newPassword !== form.confirmPassword) {
            return setError('Passwords do not match');
        }
        if (form.newPassword.length < 8) {
            return setError('Password must be at least 8 characters');
        }
        setLoading(true);
        try {
            await axios.put('/profile/password', {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword
            });
            setSuccess('Password changed successfully!');
            setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => { onClose(); setSuccess(''); }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-[#323130] dark:text-white focus:border-[#0067b8] focus:outline-none text-sm";

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#323130] dark:text-white">Change password</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} className="text-gray-500" /></button>
                </div>
                {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm mb-4">{error}</div>}
                {success && <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-md text-sm mb-4">{success}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className={inputClass} type="password" placeholder="Current password" value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} required />
                    <input className={inputClass} type="password" placeholder="New password (min 8 chars)" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} required />
                    <input className={inputClass} type="password" placeholder="Confirm new password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
                    <button type="submit" disabled={loading} className="w-full bg-[#0067b8] text-white py-2.5 rounded-md font-semibold hover:bg-[#005da6] transition-colors text-sm">
                        {loading ? 'Changing...' : 'Change password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const SecurityCard = ({ icon: Icon, title, description, actionText, onClick, status }) => (
    <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-4">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Icon size={24} className="text-[#0078D4] dark:text-[#4f93ce]" />
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-[#323130] dark:text-white mb-1">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{description}</p>
                {status && <span className="inline-block text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 mb-3">{status}</span>}
                <div>
                    <button onClick={onClick} className="text-[#0067b8] dark:text-[#4f93ce] hover:underline text-sm font-semibold">{actionText}</button>
                </div>
            </div>
        </div>
    </div>
);

const Security = () => {
    const { user } = useAuth();
    const [showPwModal, setShowPwModal] = useState(false);
    const [showBio, setShowBio] = useState(false);

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-[#323130] dark:text-white mb-4">Security</h1>
            <p className="text-[#323130] dark:text-gray-300 mb-8">Settings and recommendations to help you keep your account secure.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SecurityCard
                    icon={Key}
                    title="Password"
                    description="A strong password helps protect your account from unauthorized access."
                    actionText="Change password"
                    onClick={() => setShowPwModal(true)}
                    status="Active"
                />
                <SecurityCard
                    icon={Shield}
                    title="Two-step verification"
                    description="Add an extra layer of security to your account by requiring a second form of verification."
                    actionText="Manage"
                    onClick={() => { }}
                    status="Not set up"
                />
                <SecurityCard
                    icon={Fingerprint}
                    title="Biometric login"
                    description="Use your face, fingerprint, or security key to sign in quickly and securely."
                    actionText={showBio ? "Hide setup" : "Set up biometrics"}
                    onClick={() => setShowBio(!showBio)}
                />
                <SecurityCard
                    icon={Activity}
                    title="Sign-in activity"
                    description="Review recent activity on your account, such as sign-ins and security events."
                    actionText="View my activity"
                    onClick={() => window.location.href = '/dashboard/devices'}
                />
            </div>

            {showBio && (
                <div className="mt-6 bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold dark:text-white mb-4">Set up biometric login</h2>
                    <BiometricSetup />
                </div>
            )}

            <PasswordModal isOpen={showPwModal} onClose={() => setShowPwModal(false)} />
        </div>
    );
};

export default Security;
