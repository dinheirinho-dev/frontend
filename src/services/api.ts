import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// O "Interceptor" que coloca o token em cada chamada
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('dinheirinho_token') : null;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;