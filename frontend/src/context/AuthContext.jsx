import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            // Set API key for all requests from env
            const apiKey = import.meta.env.VITE_API_KEY;
            if (apiKey) {
                axios.defaults.headers.common['x-api-key'] = apiKey;
            }

            // Enable sending cookies with requests
            axios.defaults.withCredentials = true;

            // Check if user has a valid session
            await checkSession();
        };
        initAuth();
    }, []);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const checkSession = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/auth/me`);
            if (res.data.success && res.data.data.authenticated) {
                setUser(res.data.data.user);
            }
        } catch (error) {
            // No valid session
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
            const { user } = res.data.data;

            setUser(user);
            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (name, email, password, username) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
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

    const logout = async () => {
        try {
            await axios.post(`${API_BASE_URL}/api/auth/logout`);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
            // Clear user anyway
            setUser(null);
        }
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const forgotPassword = async (email) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
            return { success: true, data: res.data.data };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || 'Failed to send reset email' };
        }
    };

    const resetPassword = async (email, otp, newPassword) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
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
