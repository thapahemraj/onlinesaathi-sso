import { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldOff, Loader2, Copy, Check, X } from 'lucide-react';
import axios from 'axios';

const TwoFactorSetup = () => {
    const [status, setStatus] = useState({ enabled: false, backupCodesRemaining: 0 });
    const [loading, setLoading] = useState(true);
    const [setupData, setSetupData] = useState(null); // { qrCode, secret }
    const [verifyCode, setVerifyCode] = useState('');
    const [backupCodes, setBackupCodes] = useState([]);
    const [showDisable, setShowDisable] = useState(false);
    const [disablePassword, setDisablePassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const { data } = await axios.get('/2fa/status');
            setStatus(data);
        } catch (err) {
            console.error('Failed to fetch 2FA status');
        } finally {
            setLoading(false);
        }
    };

    const handleSetup = async () => {
        setActionLoading(true);
        setError('');
        try {
            const { data } = await axios.post('/2fa/setup');
            setSetupData(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to setup 2FA');
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (verifyCode.length < 6) {
            setError('Enter a 6-digit code from your authenticator app.');
            return;
        }
        setActionLoading(true);
        setError('');
        try {
            const { data } = await axios.post('/2fa/verify', { code: verifyCode });
            setBackupCodes(data.backupCodes);
            setStatus({ enabled: true, backupCodesRemaining: data.backupCodes.length });
            setSetupData(null);
            setSuccess('2FA enabled successfully! Save your backup codes.');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid code');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDisable = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setError('');
        try {
            await axios.delete('/2fa/disable', { data: { password: disablePassword } });
            setStatus({ enabled: false, backupCodesRemaining: 0 });
            setShowDisable(false);
            setDisablePassword('');
            setSuccess('2FA disabled.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to disable 2FA');
        } finally {
            setActionLoading(false);
        }
    };

    const copyBackupCodes = () => {
        navigator.clipboard.writeText(backupCodes.join('\n'));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin text-[#0078D4]" size={20} />
                    <span className="text-gray-500 dark:text-gray-400">Loading 2FA status...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    {status.enabled ? (
                        <ShieldCheck className="text-emerald-500" size={28} />
                    ) : (
                        <Shield className="text-gray-400" size={28} />
                    )}
                    <div>
                        <h3 className="font-semibold text-[#323130] dark:text-white">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {status.enabled
                                ? `Enabled • ${status.backupCodesRemaining} backup codes remaining`
                                : 'Add an extra layer of security to your account'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-400 text-sm">
                    {success}
                </div>
            )}
            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Backup Codes Display */}
            {backupCodes.length > 0 && (
                <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-amber-800 dark:text-amber-400">⚠️ Save your backup codes</h4>
                        <button onClick={copyBackupCodes} className="flex items-center gap-1 text-sm text-amber-700 dark:text-amber-400 hover:underline">
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Copied!' : 'Copy all'}
                        </button>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">You won't see these again. Store them safely.</p>
                    <div className="grid grid-cols-2 gap-2">
                        {backupCodes.map((code, i) => (
                            <code key={i} className="block bg-white dark:bg-[#1b1b1b] px-3 py-1.5 rounded text-sm font-mono text-center border border-amber-200 dark:border-amber-800">
                                {code}
                            </code>
                        ))}
                    </div>
                </div>
            )}

            {/* Setup Flow */}
            {!status.enabled && !setupData && (
                <button
                    onClick={handleSetup}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-[#0078D4] hover:bg-[#005da6] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                    Enable Two-Factor Authentication
                </button>
            )}

            {/* QR Code + Verify */}
            {setupData && (
                <div className="space-y-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Scan this QR code with Google Authenticator, Authy, or any TOTP app:</p>
                        <img src={setupData.qrCode} alt="2FA QR Code" className="mx-auto w-48 h-48 rounded-lg border border-gray-200 dark:border-gray-600" />
                        <p className="text-xs text-gray-400 mt-2 font-mono">Manual key: {setupData.secret}</p>
                    </div>
                    <form onSubmit={handleVerify} className="space-y-3">
                        <input
                            type="text"
                            maxLength={6}
                            placeholder="Enter 6-digit code"
                            value={verifyCode}
                            onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1b1b1b] text-center text-2xl font-mono tracking-[0.5em] text-[#323130] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button type="button" onClick={() => { setSetupData(null); setError(''); }} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#3b3b3b] transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={actionLoading} className="flex-1 py-2 bg-[#0078D4] hover:bg-[#005da6] text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                                Verify & Enable
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Disable */}
            {status.enabled && !showDisable && (
                <button
                    onClick={() => { setShowDisable(true); setError(''); setSuccess(''); }}
                    className="w-full py-2.5 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                >
                    <ShieldOff size={18} />
                    Disable Two-Factor Authentication
                </button>
            )}

            {/* Disable Confirm */}
            {showDisable && (
                <form onSubmit={handleDisable} className="space-y-3">
                    <p className="text-sm text-red-600 dark:text-red-400">Enter your password to disable 2FA:</p>
                    <input
                        type="password"
                        placeholder="Current password"
                        value={disablePassword}
                        onChange={(e) => setDisablePassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1b1b1b] text-[#323130] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        autoFocus
                    />
                    <div className="flex gap-3">
                        <button type="button" onClick={() => { setShowDisable(false); setDisablePassword(''); setError(''); }} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#3b3b3b] transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={actionLoading} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                            Disable 2FA
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default TwoFactorSetup;
