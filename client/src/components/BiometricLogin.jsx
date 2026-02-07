import React, { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import axios from 'axios';
import { Fingerprint, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BiometricLogin = ({ email, onSuccess, onError }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth(); // We might need a custom login function in context for JWT injection
    const navigate = useNavigate();

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            // 1. Get options from server
            // Note: Server expects email to find user. If no email provided, maybe ask user?
            // For now, assume email is passed or we prompt (but this component is usually embedded)
            // If email is empty, we handle error
            if (!email) {
                throw new Error("Please enter your email first to use biometrics.");
            }

            const resp = await axios.post(`${import.meta.env.VITE_API_URL}/auth/webauthn/login/options`, { email });

            const opts = resp.data;

            // 2. Start authentication with browser/device
            let asseResp;
            try {
                asseResp = await startAuthentication(opts);
            } catch (error) {
                if (error.name === 'NotAllowedError') {
                    throw new Error("Authentication cancelled.");
                }
                throw error;
            }

            // 3. Verify response with server
            const verificationResp = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/webauthn/login/verify`,
                {
                    email,
                    body: asseResp
                }
            );

            const { verified } = verificationResp.data;

            if (verified) {
                // Login successful!
                // We need to store the token manually since context's login() usually takes email/pass
                // IMPORTANT: Ideally update AuthContext to support "loginWithToken" or similar.
                // For now, we'll likely need to reload or manually set state if AuthContext doesn't support generic login.
                // Let's assume we can reload window to trigger the token check in AuthContext or use a method if available.

                // Assuming standard token flow:
                // Server should have set cookie (if configured) OR returned token.
                // Our webauthnController returns { token, user }.

                // Check if we need to redirect
                if (onSuccess) onSuccess(verificationResp.data);
            } else {
                throw new Error("Verification failed.");
            }

        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.error || error.message || 'Biometric login failed';
            if (onError) onError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-4 shadow-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] hover:bg-gray-50 dark:hover:bg-[#4b4b4b] text-[#1b1b1b] dark:text-white text-sm font-medium transition-colors"
        >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Fingerprint size={18} className="text-[#0067b8] dark:text-[#4f93ce]" />}
            {isLoading ? 'Verifying...' : 'Sign in with Face / Fingerprint'}
        </button>
    );
};

export default BiometricLogin;
