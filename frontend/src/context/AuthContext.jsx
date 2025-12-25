import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            // Set API key for all requests
            const apiKey = import.meta.env.VITE_API_KEY || 'saturn-dashboard-key-2024';
            axios.defaults.headers.common['x-api-key'] = apiKey;

            if (token && storedUser) {
                setUser(JSON.parse(storedUser));
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            const { token, refreshToken, user } = res.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (name, email, password, username) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', {
                email,
                username,
                password,
                site_name: 'Saturn Dashboard',
                role: 'admin' // Self-registering as admin for this dashboard
            });
            // Auto login after register? Or redirect to login. Let's redirect data back.
            return { success: true, data: res.data.data };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const forgotPassword = async (email) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            return { success: true, data: res.data.data };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || 'Failed to send reset email' };
        }
    };

    const resetPassword = async (email, otp, newPassword) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/reset-password', {
                email,
                otp,
                newPassword
            });
            return { success: true, data: res.data.data };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || 'Failed to reset password' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, forgotPassword, resetPassword, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
