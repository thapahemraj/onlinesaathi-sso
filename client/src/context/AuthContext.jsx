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
        // After login, fetch full profile
        const { data: profile } = await axios.get('/profile');
        setUser(profile);
        return profile;
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

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};
