import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

const UserAuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Dedicated axios instance for user API — uses user_token, never touches admin token
const userApi = axios.create({
    baseURL: `${API_URL}/api/v1/user`,
    headers: { Accept: 'application/json' },
});

userApi.interceptors.request.use(config => {
    const token = localStorage.getItem('user_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export function UserAuthProvider({ children }) {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('user_token');
        if (token) {
            userApi.get('/me')
                .then(res => setUser(res.data.user))
                .catch(() => localStorage.removeItem('user_token'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email, password) => {
        const res = await userApi.post('/login', { email, password });
        localStorage.setItem('user_token', res.data.token);
        setUser(res.data.user);
    }, []);

    const logout = useCallback(async () => {
        try { await userApi.post('/logout'); } catch (_) { /* ignore */ }
        localStorage.removeItem('user_token');
        setUser(null);
    }, []);

    const getConsumables = useCallback((params = {}) =>
        userApi.get('/consumables', { params: { per_page: 100, ...params } }), []);

    const value = useMemo(() => ({
        user, login, logout, loading, userApi, getConsumables
    }), [user, login, logout, loading, getConsumables]);

    return (
        <UserAuthContext.Provider value={value}>
            {children}
        </UserAuthContext.Provider>
    );
}

export const useUserAuth = () => useContext(UserAuthContext);
