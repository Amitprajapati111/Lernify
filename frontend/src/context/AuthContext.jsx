import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const userInfo = sessionStorage.getItem('userInfo');
            if (userInfo) {
                try {
                    const { data } = await apiClient.get('/auth/me');
                    setUser(data);
                } catch (error) {
                    console.error('Failed to fetch user:', error);
                    sessionStorage.removeItem('userInfo');
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const login = async (email, password) => {
        const { data } = await apiClient.post('/auth/login', { email, password });
        sessionStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const logout = () => {
        sessionStorage.removeItem('userInfo');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
