import { useState, useEffect } from 'react';
import { Shield, Key, RefreshCw, Smartphone, Plus, Trash2, Fingerprint } from 'lucide-react';
import { startRegistration } from '@simplewebauthn/browser';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const SecurityOption = ({ title, description, action, onAction, icon: Icon, children }) => (
    <div className="flex flex-col p-6 border-b border-gray-100 last:border-0 gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
                <div className="mt-1">
                    <Icon size={24} className="text-[#0078D4]" />
                </div>
                <div>
                    <h3 className="font-semibold text-[#323130] text-lg">{title}</h3>
                    <p className="text-sm text-gray-500 max-w-xl">{description}</p>
                </div>
            </div>
            {action && (
                <button
                    onClick={onAction}
                    className="text-[#0067b8] hover:underline text-[15px] font-semibold whitespace-nowrap"
                >
                    {action}
                </button>
            )}
        </div>
        {children && <div className="pl-10 mt-2">{children}</div>}
    </div>
);

const Security = () => {
    const { user } = useAuth();
    const [passkeys, setPasskeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Fetch user's passkeys (Mock for now as backend endpoint for listing keys isn't strictly defined yet, 
    // but we can infer from user profile if we updated the profile endpoint to return them)
    // For this implementation, we will assume we can't list them yet without a specific endpoint.
    // We will just show the "Add" button and handle success.

    const handleCreatePasskey = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            // 1. Get options from server
            const resp = await axios.get(`${import.meta.env.VITE_API_URL}/auth/webauthn/register/options`, {
                withCredentials: true
            });

            // 2. Pass options to browser authenticator
            let attResp;
            try {
                attResp = await startRegistration(resp.data);
            } catch (error) {
                if (error.name === 'InvalidStateError') {
                    throw new Error('Authenticator already registered.');
                }
                throw error;
            }

            // 3. Send response to server
            const verificationResp = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/webauthn/register/verify`,
                attResp,
                { withCredentials: true }
            );

            if (verificationResp.data.verified) {
                setMessage({ type: 'success', text: 'Passkey registered successfully!' });
            } else {
                setMessage({ type: 'error', text: 'Verification failed.' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: error.response?.data?.message || error.message || 'Failed to create passkey.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-[#323130] dark:text-white mb-8">Security</h1>

            {message.text && (
                <div className={`p-4 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white dark:bg-[#1b1b1b] rounded-xl shadow-sm border border-gray-200 dark:border-[#323130] overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-[#323130] bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-full">
                            <Shield className="text-green-600 dark:text-green-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-green-800 dark:text-green-400">Everything looks good</h2>
                            <p className="text-sm text-green-700 dark:text-green-500">You are using recommended security settings.</p>
                        </div>
                    </div>
                </div>

                <SecurityOption
                    title="Passkeys"
                    description="Sign in securely without a password using your face, fingerprint, or a PIN. Passkeys are safer and easier to use than passwords."
                    action={loading ? "Creating..." : "Create a passkey"}
                    onAction={handleCreatePasskey}
                    icon={Fingerprint}
                >
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        <p>Passkeys enable a faster, passwordless sign-in experience.</p>
                    </div>
                </SecurityOption>

                <SecurityOption
                    title="Password security"
                    description="Change your password to keep your account secure. We recommend using a strong password that you don't use elsewhere."
                    action="Change password"
                    icon={Key}
                />

                <SecurityOption
                    title="Two-step verification"
                    description="Add an extra layer of security to your account. We'll ask for a code when you sign in from a new device."
                    action="Manage"
                    icon={Smartphone}
                />

                <SecurityOption
                    title="Sign-in activity"
                    description="See when and where you've signed in to your account. Review successful sign-ins and unsuccessful attempts."
                    action="View my activity"
                    onAction={() => window.location.href = '/dashboard/activity'} // Using simple navigation for now, or use useNavigate
                    icon={RefreshCw}
                />
            </div>
        </div>
    );
};

export default Security;
