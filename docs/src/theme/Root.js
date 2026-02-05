import React, { useState, useEffect } from 'react';
import { Redirect } from '@docusaurus/router';
import BrowserOnly from '@docusaurus/BrowserOnly';

// This wrapper protects the documentation.
// If the user doesn't have the cookie 'token', we redirect them to the main SSO login.
// We pass ?returnUrl=... so they can come back here after login.

function AuthGuard({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading

    useEffect(() => {
        // Check for cookie
        // Note: HttpOnly cookies can't be read by JS, so real verification involves an API call.
        // For this demo (Samesite), we might need an API endpoint to "check session" from the docs.
        // However, since docs is on port 3001 and API on 5000, we need CORS.
        // For simplicity sake in this "Visual" task, let's assume if we are logged in on localhost:5173,
        // we want to protect this.

        // BETTER APPROACH FOR DEMO:
        // Let's redirect to the main app to "verify" and it will redirect back with a token or just let us in.
        // But since they are different ports, sharing state is tricky without a domain.
        // FOR NOW: Let's assume we just check if we have been redirected back with a flag or just simplistic check.

        // Actually, simpler: The user asked "Register an application... user garera login huna paro"
        // (User must login to see this).

        // We will do a simple check:
        // 1. Is there a simple marker in localStorage? (Shared if same domain.. oh wait different port = same domain for localStorage? NO).
        // Different port = different origin. LocalStorage is NOT shared.
        // Cookies: Cookies CAN be shared if Path=/ and Domain is localhost.

        // Let's try to fetch an API endpoint to verify user.

        const checkAuth = async () => {
            try {
                // We assume the API server (port 5000) allows credentials from port 3001
                // We'll try to fetch the profile.
                const res = await fetch('http://localhost:5000/api/auth/profile', {
                    credentials: 'include' // Send cookies
                });

                if (res.ok) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (e) {
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return (
            <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
                <h2>Loading...</h2>
            </div>
        );
    }

    if (isAuthenticated === false) {
        // Redirect to Main App Login
        // Return URL is this documentation page
        const returnUrl = window.location.href;
        window.location.href = `http://localhost:5173/login?returnUrl=${encodeURIComponent(returnUrl)}`;
        return null;
    }

    return <>{children}</>;
}

export default function Root({ children }) {
    return (
        <BrowserOnly>
            {() => <AuthGuard>{children}</AuthGuard>}
        </BrowserOnly>
    );
}
