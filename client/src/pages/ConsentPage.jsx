import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, CheckCircle, XCircle, Loader2, ExternalLink, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SCOPE_ICONS = {
    openid: '🔐',
    profile: '👤',
    email: '📧',
    phone: '📞',
    address: '📍'
};

const ConsentPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [appInfo, setAppInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Extract OAuth params from URL
    const client_id = searchParams.get('client_id');
    const redirect_uri = searchParams.get('redirect_uri');
    const scope = searchParams.get('scope') || 'openid';
    const state = searchParams.get('state') || '';
    const code_challenge = searchParams.get('code_challenge') || '';
    const code_challenge_method = searchParams.get('code_challenge_method') || '';

    useEffect(() => {
        if (!client_id) {
            setError('Missing client_id parameter.');
            setLoading(false);
            return;
        }
        fetchAppInfo();
    }, [client_id]);

    const fetchAppInfo = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/oauth/consent-info`, {
                params: { client_id, scope },
                withCredentials: true
            });
            setAppInfo(res.data);
        } catch (err) {
            setError(err.response?.data?.error_description || 'Failed to load application information.');
        } finally {
            setLoading(false);
        }
    };

    const handleConsent = async (approved) => {
        setSubmitting(true);
        setError('');
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/oauth/consent`, {
                client_id,
                redirect_uri,
                scope,
                state,
                code_challenge,
                code_challenge_method,
                approved
            }, { withCredentials: true });

            // Redirect to the client app
            if (res.data.redirectUrl) {
                window.location.href = res.data.redirectUrl;
            }
        } catch (err) {
            setError(err.response?.data?.error_description || 'Something went wrong.');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-[#1a1a2e] dark:to-[#16213e] flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-blue-600" />
            </div>
        );
    }

    if (error && !appInfo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-[#1a1a2e] dark:to-[#16213e] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-[#2c2c2c] rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <XCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Authorization Error</h2>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-[#1a1a2e] dark:to-[#16213e] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#2c2c2c] rounded-2xl shadow-xl max-w-md w-full overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3">
                        {appInfo?.appLogo ? (
                            <img src={appInfo.appLogo} alt={appInfo.appName} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                            <Globe size={32} className="text-white" />
                        )}
                    </div>
                    <h1 className="text-xl font-bold text-white">{appInfo?.appName || 'Application'}</h1>
                    {appInfo?.appDescription && (
                        <p className="text-blue-100 text-sm mt-1">{appInfo.appDescription}</p>
                    )}
                    {appInfo?.appHomepage && (
                        <a href={appInfo.appHomepage} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-200 hover:text-white mt-2 transition-colors">
                            <ExternalLink size={12} />
                            {new URL(appInfo.appHomepage).hostname}
                        </a>
                    )}
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Signed in as */}
                    <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 dark:bg-[#1b1b1b] rounded-xl">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                                {(user?.username || 'U').charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{user?.username}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        </div>
                        <Shield size={16} className="text-green-500 flex-shrink-0" />
                    </div>

                    {/* Permissions */}
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        This app will be able to:
                    </h3>

                    <div className="space-y-2 mb-6">
                        {appInfo?.scopes?.map((s, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#1b1b1b] rounded-lg">
                                <span className="text-lg">{SCOPE_ICONS[s.name] || '🔑'}</span>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{s.description}</span>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleConsent(false)}
                            disabled={submitting}
                            className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-[#3b3b3b] transition-colors disabled:opacity-50"
                        >
                            Deny
                        </button>
                        <button
                            onClick={() => handleConsent(true)}
                            disabled={submitting}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <CheckCircle size={18} />
                            )}
                            Allow
                        </button>
                    </div>

                    {/* Footer */}
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4 leading-relaxed">
                        By clicking Allow, you authorize <strong>{appInfo?.appName}</strong> to access the requested data.
                        You can revoke access at any time from your account settings.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ConsentPage;
