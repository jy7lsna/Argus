import api from './api';

export const authService = {
    login: async (email: string, password: string) => {
        const { data } = await api.post('/auth/login', { email, password });
        return data;
    },
    register: async (userData: any) => {
        const { data } = await api.post('/auth/register', userData);
        return data;
    },
    logout: async () => {
        await api.post('/auth/logout');
    },
};
