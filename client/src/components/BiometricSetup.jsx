import React, { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import axios from 'axios';
import { Fingerprint, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import CustomAlert from './CustomAlert';

const BiometricSetup = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleRegister = async () => {
        setIsLoading(true);
        setStatus({ type: '', message: '' });

        try {
            // 1. Get options from server
            const resp = await axios.get(`${import.meta.env.VITE_API_URL}/auth/webauthn/register/options`, {
                withCredentials: true
            });

            const opts = resp.data;

            // 2. Start registration with browser/device
            let attResp;
            try {
                attResp = await startRegistration(opts);
            } catch (error) {
                if (error.name === 'InvalidStateError') {
                    throw new Error("This authenticator is already registered.");
                } else if (error.name === 'NotAllowedError') {
                    throw new Error("Registration cancelled or timed out.");
                }
                throw error;
            }

            // 3. Verify response with server
            const verificationResp = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/webauthn/register/verify`,
                attResp,
                { withCredentials: true }
            );

            if (verificationResp.data.verified) {
                setStatus({ type: 'success', message: 'Biometric authentication enabled successfully!' });
            } else {
                setStatus({ type: 'error', message: 'Verification failed. Please try again.' });
            }

        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: error.response?.data?.error || error.message || 'Failed to setup biometrics' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#2c2c2c] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full text-[#0067b8] dark:text-[#4f93ce]">
                    <Fingerprint size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[#1b1b1b] dark:text-white">Biometric Login</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Use FaceID, TouchID, or Windows Hello to sign in.</p>
                </div>
            </div>

            {status.message && (
                <div className={`mb-4 p-3 rounded-md flex items-center gap-2 text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                    {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {status.message}
                </div>
            )}

            <button
                onClick={handleRegister}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#0067b8] hover:bg-[#005da6] dark:bg-[#0067b8] dark:hover:bg-[#005da6] text-white rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Fingerprint size={16} />}
                {isLoading ? 'Registering...' : 'Setup Biometrics'}
            </button>
        </div>
    );
};

export default BiometricSetup;
