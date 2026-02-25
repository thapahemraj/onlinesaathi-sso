import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configure axios defaults
    axios.defaults.withCredentials = true;
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data } = await axios.get('/profile');
                setUser(data);
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
        setUser(profile);
        return profile;
    };

    // Complete login after 2FA verification
    const verify2FA = async (userId, code, trustDevice = false) => {
        setLoading(true);
        try {
            const res = await axios.post('/2fa/login-verify', { userId, code, trustDevice });
            setUser(res.data);
            return res.data;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (username, email, password, phoneNumber, firebaseUid) => {
        const { data } = await axios.post('/auth/register', { username, email, password, phoneNumber, firebaseUid });
        // After register, fetch full profile
        const { data: profile } = await axios.get('/profile');
        setUser(profile);
        return profile;
    };

    const logout = async () => {
        await axios.post('/auth/logout');
        setUser(null);
    };

    // Refresh user data after profile updates
    const refreshUser = async () => {
        try {
            const { data } = await axios.get('/profile');
            setUser(data);
        } catch (error) {
            console.error('Failed to refresh user data');
        }
    };

    const loginWithGoogle = async () => {
        const { signInWithPopup } = await import('firebase/auth');
        const { auth, googleProvider } = await import('../firebase');
        const result = await signInWithPopup(auth, googleProvider);

        const { user: firebaseUser } = result;

        const { data } = await axios.post('/auth/google-login', {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
        });

        const { data: profile } = await axios.get('/profile');
        setUser(profile);
        return profile;
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, loginWithGoogle, verify2FA, register, logout, loading, refreshUser }}>

            {children}
        </AuthContext.Provider>
    );
};

