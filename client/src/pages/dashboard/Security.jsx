import { useState } from 'react';
import { Shield, Key, Activity, Fingerprint, X, Loader2, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BiometricSetup from '../../components/BiometricSetup';
import TwoFactorSetup from '../../components/TwoFactorSetup';
import axios from 'axios';
import { toast } from 'react-hot-toast'; // Assuming react-hot-toast is used for toasts

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
    const { user, refreshUser } = useAuth();
    const [showPwModal, setShowPwModal] = useState(false);
    const [showBio, setShowBio] = useState(false);
    const [show2FAModal, setShow2FAModal] = useState(false); // State for 2FA modal
    const [twoFactorStatus, setTwoFactorStatus] = useState({ enabled: false, backupCodesRemaining: 0 });
    const [loginNotifications, setLoginNotifications] = useState(true);

    // Recovery email state
    const [recoveryEmail, setRecoveryEmail] = useState(user?.recoveryEmail || '');
    const [recoveryLoading, setRecoveryLoading] = useState(false);
    const [recoveryMsg, setRecoveryMsg] = useState('');
    const [showRecoveryEdit, setShowRecoveryEdit] = useState(false);

    useEffect(() => {
        fetch2FAStatus();
        fetchNotificationSettings();
    }, []);

    const fetchNotificationSettings = async () => {
        try {
            const { data } = await axios.get('/profile');
            if (data.privacySettings && data.privacySettings.loginNotifications !== undefined) {
                setLoginNotifications(data.privacySettings.loginNotifications);
            }
        } catch (error) {
            console.error('Failed to fetch notification settings:', error);
            toast.error('Failed to fetch notification settings');
        }
    };

    const handleNotificationToggle = async () => {
        try {
            const newValue = !loginNotifications;
            setLoginNotifications(newValue);
            await axios.put('/profile/privacy', { loginNotifications: newValue });
            toast.success('Notification settings updated');
        } catch (error) {
            setLoginNotifications(!loginNotifications); // Revert
            console.error('Failed to update notification settings:', error);
            toast.error('Failed to update settings');
        }
    };

    const fetch2FAStatus = async () => {
        try {
            // Assuming /profile endpoint returns 2FA status
            const { data } = await axios.get('/profile');
            if (data.twoFactorEnabled !== undefined) {
                setTwoFactorStatus({
                    enabled: data.twoFactorEnabled,
                    backupCodesRemaining: data.backupCodesRemaining || 0 // Assuming this field exists
                });
            }
        } catch (error) {
            console.error('Failed to fetch 2FA status:', error);
            toast.error('Failed to fetch 2FA status');
        }
    };

    const handleSaveRecovery = async () => {
        setRecoveryLoading(true);
        setRecoveryMsg('');
        try {
            await axios.put('/profile/recovery-email', { recoveryEmail });
            await refreshUser();
            setRecoveryMsg('Recovery email saved!');
            setShowRecoveryEdit(false);
            setTimeout(() => setRecoveryMsg(''), 3000);
        } catch (err) {
            setRecoveryMsg(err.response?.data?.message || 'Failed to save.');
        } finally {
            setRecoveryLoading(false);
        }
    };

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-[#323130] dark:text-white mb-4">Security</h1>
            <p className="text-[#323130] dark:text-gray-300 mb-8">Settings and recommendations to help you keep your account secure.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <SecurityCard
                    icon={Key}
                    title="Password"
                    description="A strong password helps protect your account from unauthorized access."
                    actionText="Change password"
                    onClick={() => setShowPwModal(true)}
                    status="Active"
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

            {/* Two-Factor Authentication */}
            <div className="mt-6 bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400">
                            <Shield size={20} />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication (2FA)</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={twoFactorStatus.enabled}
                            onChange={() => setShow2FAModal(true)}
                            disabled={twoFactorStatus.enabled} // Use modal to disable/enable
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                {/* Login Notifications */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mt-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-full text-yellow-600 dark:text-yellow-400">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Login Notifications</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Receive an email when a new device signs in</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={loginNotifications}
                            onChange={handleNotificationToggle}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                </div>
            </div>

            {showBio && (
                <div className="mt-6 bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold dark:text-white mb-4">Set up biometric login</h2>
                    <BiometricSetup />
                </div>
            )}

            {/* Recovery Email */}
            <div className="mt-6 bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <Mail size={24} className="text-[#0078D4] dark:text-[#4f93ce]" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-[#323130] dark:text-white mb-1">Recovery email</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Add a recovery email so you can recover your account if you lose access.
                        </p>
                        {recoveryMsg && (
                            <div className={`text-sm mb-3 p-2 rounded ${recoveryMsg.includes('saved') ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'}`}>
                                {recoveryMsg}
                            </div>
                        )}
                        {!showRecoveryEdit ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-[#323130] dark:text-gray-300">
                                    {user?.recoveryEmail || 'Not set'}
                                </span>
                                <button
                                    onClick={() => { setShowRecoveryEdit(true); setRecoveryEmail(user?.recoveryEmail || ''); }}
                                    className="text-[#0067b8] dark:text-[#4f93ce] hover:underline text-sm font-semibold"
                                >
                                    {user?.recoveryEmail ? 'Edit' : 'Add recovery email'}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 max-w-md">
                                <input
                                    type="email"
                                    value={recoveryEmail}
                                    onChange={(e) => setRecoveryEmail(e.target.value)}
                                    placeholder="recovery@example.com"
                                    className="flex-1 h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-[#323130] dark:text-white focus:border-[#0067b8] focus:outline-none text-sm"
                                />
                                <button
                                    onClick={handleSaveRecovery}
                                    disabled={recoveryLoading || !recoveryEmail}
                                    className="px-4 h-10 bg-[#0067b8] text-white rounded-md font-semibold hover:bg-[#005da6] transition-colors text-sm disabled:opacity-50"
                                >
                                    {recoveryLoading ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={() => setShowRecoveryEdit(false)}
                                    className="px-3 h-10 border border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#3b3b3b] transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <PasswordModal isOpen={showPwModal} onClose={() => setShowPwModal(false)} />
        </div>
    );
};

export default Security;

