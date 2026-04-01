import { useQuery } from '@tanstack/react-query';
import type { User } from '../types';
import api from '../services/api';

export function useAuth() {
    const { data: user, isLoading } = useQuery<User>({
        queryKey: ['me'],
        queryFn: async () => {
            const { data } = await api.get('/auth/me');
            return data;
        },
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes — avoid refetching on every mount
    });

    const logout = () => {
        api.post('/auth/logout').catch(() => undefined);
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
    };

    return {
        user: user || null,
        loading: isLoading,
        isAuthenticated: !!user,
        logout
    };
}

