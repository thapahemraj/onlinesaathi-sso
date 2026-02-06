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

    console.log("AuthContext: Using API URL:", axios.defaults.baseURL);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data } = await axios.get('/auth/profile');
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
        setUser(data);
        return data;
    };

    const register = async (username, email, password, phoneNumber, firebaseUid) => {
        const { data } = await axios.post('/auth/register', { username, email, password, phoneNumber, firebaseUid });
        setUser(data);
        return data;
    };

    const logout = async () => {
        await axios.post('/auth/logout');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
