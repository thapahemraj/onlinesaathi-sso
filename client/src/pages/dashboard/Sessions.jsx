import { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, Loader2, LogOut, Shield, Globe } from 'lucide-react';
import axios from 'axios';

const getDeviceIcon = (type) => {
    switch (type) {
        case 'mobile': return Smartphone;
        case 'tablet': return Tablet;
        default: return Monitor;
    }
};

const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 2) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const SessionItem = ({ session, onRevoke, revoking }) => {
    const Icon = getDeviceIcon(session.deviceInfo?.deviceType);
    return (
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${session.isCurrent ? 'bg-[#0078D4]/10' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <Icon size={28} className={session.isCurrent ? 'text-[#0078D4]' : 'text-[#323130] dark:text-gray-300'} />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#323130] dark:text-white">
                            {session.deviceInfo?.deviceName || 'Unknown Device'}
                        </span>
                        {session.isCurrent && (
                            <span className="text-xs bg-[#0078D4] text-white px-2 py-0.5 rounded-full">This device</span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                            <Globe size={12} />
                            {session.location || 'Unknown'}
                        </span>
                        <span>•</span>
                        <span>{session.ipAddress || 'Unknown IP'}</span>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        Active: {formatDate(session.lastActive)}
                    </div>
                </div>
            </div>
            {!session.isCurrent && (
                <button
                    onClick={() => onRevoke(session._id)}
                    disabled={revoking === session._id}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-semibold flex items-center gap-1 transition-colors"
                >
                    {revoking === session._id ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                    Sign out
                </button>
            )}
        </div>
    );
};

const Sessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [revoking, setRevoking] = useState(null);
    const [revokingAll, setRevokingAll] = useState(false);
    const [msg, setMsg] = useState('');

    const fetchSessions = async () => {
        try {
            const { data } = await axios.get('/sessions');
            setSessions(data);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSessions(); }, []);

    const handleRevoke = async (id) => {
        setRevoking(id);
        try {
            await axios.delete(`/sessions/${id}`);
            setSessions(prev => prev.filter(s => s._id !== id));
        } catch (error) {
            console.error('Failed to revoke session:', error);
        } finally {
            setRevoking(null);
        }
    };

    const handleRevokeAll = async () => {
        setRevokingAll(true);
        try {
            await axios.delete('/sessions/revoke-all');
            setSessions(prev => prev.filter(s => s.isCurrent));
            setMsg('All other sessions have been signed out.');
            setTimeout(() => setMsg(''), 3000);
        } catch (error) {
            console.error('Failed to revoke all sessions:', error);
        } finally {
            setRevokingAll(false);
        }
    };

    const otherSessions = sessions.filter(s => !s.isCurrent);

    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-[#323130] dark:text-white">Active Sessions</h1>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6 flex items-start gap-3">
                <Shield className="text-[#0078D4] dark:text-[#4f93ce] mt-0.5 shrink-0" size={20} />
                <p className="text-sm text-[#0078D4] dark:text-[#4f93ce]">
                    These are the sessions where your account is currently signed in. If you see a session you don't recognize, sign out of it immediately and change your password.
                </p>
            </div>

            {msg && (
                <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-400 text-sm">
                    {msg}
                </div>
            )}

            {otherSessions.length > 0 && (
                <div className="mb-6">
                    <button
                        onClick={handleRevokeAll}
                        disabled={revokingAll}
                        className="w-full py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
                    >
                        {revokingAll ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
                        Sign out of all other sessions ({otherSessions.length})
                    </button>
                </div>
            )}

            <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-[#333]">
                    <h2 className="text-lg font-semibold dark:text-white">Where you're signed in</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="animate-spin text-[#0078D4]" size={32} />
                    </div>
                ) : sessions.length > 0 ? (
                    sessions.map(session => (
                        <SessionItem key={session._id} session={session} onRevoke={handleRevoke} revoking={revoking} />
                    ))
                ) : (
                    <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                        No active sessions found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sessions;
