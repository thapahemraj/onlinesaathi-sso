import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, MapPin, History, Globe, Check, X, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PrivacyToggle = ({ title, description, icon: Icon, enabled, onToggle, loading }) => (
    <div className="bg-white dark:bg-[#2c2c2c] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-4">
            <div className="mb-4 text-[#0078D4] dark:text-[#4f93ce] mt-1">
                <Icon size={32} />
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#323130] dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{description}</p>
                <button
                    onClick={onToggle}
                    disabled={loading}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${enabled ? 'bg-[#0078D4]' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className={`ml-3 text-sm font-medium ${enabled ? 'text-[#0078D4] dark:text-[#4f93ce]' : 'text-gray-500 dark:text-gray-400'}`}>
                    {enabled ? 'On' : 'Off'}
                </span>
            </div>
        </div>
    </div>
);

const Privacy = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        locationActivity: true,
        browsingHistory: true,
        searchHistory: true,
        appActivity: true
    });
    const [loading, setLoading] = useState('');

    // Delete account state
    const [showDelete, setShowDelete] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        if (user?.privacySettings) {
            setSettings(user.privacySettings);
        }
    }, [user]);

    const handleToggle = async (key) => {
        setLoading(key);
        const newVal = !settings[key];
        try {
            await axios.put('/profile/privacy', { [key]: newVal });
            setSettings(prev => ({ ...prev, [key]: newVal }));
            await refreshUser();
        } catch (error) {
            console.error('Failed to update privacy:', error);
        } finally {
            setLoading('');
        }
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        setDeleteLoading(true);
        setDeleteError('');
        try {
            await axios.delete('/profile/delete-account', { data: { password: deletePassword } });
            navigate('/login');
        } catch (err) {
            setDeleteError(err.response?.data?.message || 'Failed to delete account.');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="max-w-5xl">
            <h1 className="text-3xl font-bold text-[#323130] dark:text-white mb-4">Privacy</h1>
            <p className="text-[#323130] dark:text-gray-300 mb-8 max-w-3xl">
                You should be in control of your data. We have tools that let you handle your privacy in a way that's right for you.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PrivacyToggle
                    title="Location activity"
                    description="Manage the location data we've collected from your devices."
                    icon={MapPin}
                    enabled={settings.locationActivity}
                    onToggle={() => handleToggle('locationActivity')}
                    loading={loading === 'locationActivity'}
                />
                <PrivacyToggle
                    title="Browsing history"
                    description="See and clear your browsing history from OnlineSaathi."
                    icon={Globe}
                    enabled={settings.browsingHistory}
                    onToggle={() => handleToggle('browsingHistory')}
                    loading={loading === 'browsingHistory'}
                />
                <PrivacyToggle
                    title="Search history"
                    description="View and clear the searches you've made on OnlineSaathi."
                    icon={History}
                    enabled={settings.searchHistory}
                    onToggle={() => handleToggle('searchHistory')}
                    loading={loading === 'searchHistory'}
                />
                <PrivacyToggle
                    title="App and service activity"
                    description="See data from apps and services you use related to your OnlineSaathi account."
                    icon={Eye}
                    enabled={settings.appActivity}
                    onToggle={() => handleToggle('appActivity')}
                    loading={loading === 'appActivity'}
                />
            </div>

            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-[#0078D4] dark:text-[#4f93ce]">
                    <strong>Note:</strong> Changes to your privacy settings take effect immediately. Your data is handled in accordance with our privacy policy.
                </p>
            </div>

            {/* Danger Zone: Delete Account */}
            <div className="mt-10 bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm border border-red-200 dark:border-red-800 p-6">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <AlertTriangle size={24} className="text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Delete account</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Permanently delete your OnlineSaathi account and all associated data. This action cannot be undone.
                        </p>
                    </div>
                </div>

                {!showDelete ? (
                    <button
                        onClick={() => setShowDelete(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-semibold"
                    >
                        <Trash2 size={16} />
                        Close my account
                    </button>
                ) : (
                    <form onSubmit={handleDeleteAccount} className="space-y-3 max-w-md">
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                            This will permanently delete your account, devices, sessions, addresses, and payment methods.
                        </p>
                        {deleteError && (
                            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">{deleteError}</div>
                        )}
                        <input
                            type="password"
                            placeholder="Enter your password to confirm"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1b1b1b] text-[#323130] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button type="button" onClick={() => { setShowDelete(false); setDeletePassword(''); setDeleteError(''); }} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#3b3b3b] transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={deleteLoading || !deletePassword} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                {deleteLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                Delete permanently
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Privacy;

