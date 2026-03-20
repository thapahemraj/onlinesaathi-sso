import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

    const normalizeUser = (userData) => {
        if (!userData) {
            return userData;
        }

        const profilePicture = typeof userData.profilePicture === 'string' && userData.profilePicture.startsWith('/')
            ? `${apiOrigin}${userData.profilePicture}`
            : userData.profilePicture || '';

        return {
            ...userData,
            profilePicture
        };
    };

    // Configure axios defaults
    axios.defaults.withCredentials = true;
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data } = await axios.get('/profile');
                setUser(normalizeUser(data));
            } catch (error) {
                console.log('Not logged in');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        const { data } = await axios.post('/auth/login', { email, password });

        // If 2FA is required, return the response without setting user
        if (data.requires2FA) {
            return data; // { requires2FA: true, userId: '...' }
        }

        // Normal login — fetch full profile
        const { data: profile } = await axios.get('/profile');
        const normalizedProfile = normalizeUser(profile);
        setUser(normalizedProfile);
        return normalizedProfile;
    };

    // Complete login after 2FA verification
    const verify2FA = async (userId, code, trustDevice = false) => {
        setLoading(true);
        try {
            await axios.post('/2fa/login-verify', { userId, code, trustDevice });
            const { data: profile } = await axios.get('/profile');
            const normalizedProfile = normalizeUser(profile);
            setUser(normalizedProfile);
            return normalizedProfile;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (registrationData) => {
        await axios.post('/auth/register', registrationData);
        // After register, fetch full profile
        const { data: profile } = await axios.get('/profile');
        const normalizedProfile = normalizeUser(profile);
        setUser(normalizedProfile);
        return normalizedProfile;
    };

    const logout = async () => {
        await axios.post('/auth/logout');
        setUser(null);
    };

    // Refresh user data after profile updates
    const refreshUser = async () => {
        try {
            const { data } = await axios.get('/profile');
            setUser(normalizeUser(data));
        } catch (error) {
            console.error('Failed to refresh user data');
        }
    };

    const loginWithGoogle = async () => {
        const { signInWithPopup } = await import('firebase/auth');
        const { auth, googleProvider, isFirebaseReady } = await import('../firebase');
        if (!isFirebaseReady || !auth || !googleProvider) {
            throw new Error('Google login is not configured. Please set valid Firebase env values.');
        }
        const result = await signInWithPopup(auth, googleProvider);

        const { user: firebaseUser } = result;

        const { data } = await axios.post('/auth/google-login', {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
        });

        const { data: profile } = await axios.get('/profile');
        const normalizedProfile = normalizeUser(profile);
        setUser(normalizedProfile);
        return normalizedProfile;
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, loginWithGoogle, verify2FA, register, logout, loading, refreshUser }}>

            {children}
        </AuthContext.Provider>
    );
};

