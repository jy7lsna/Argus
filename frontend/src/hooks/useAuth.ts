import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { User } from '../types';

export function useAuth() {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    const token = localStorage.getItem('authToken');

    const { data: user, isLoading } = useQuery<User>({
        queryKey: ['me'],
        queryFn: async () => {
            if (!token) throw new Error('No token');
            const { data } = await axios.get(`${apiBase}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        },
        enabled: !!token,
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes — avoid refetching on every mount
    });

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        window.location.href = '/login';
    };

    return {
        user: user || (localStorage.getItem('authUser') ? JSON.parse(localStorage.getItem('authUser')!) : null),
        loading: !!token && isLoading,
        isAuthenticated: !!token && (!isLoading || !!user),
        logout
    };
}

