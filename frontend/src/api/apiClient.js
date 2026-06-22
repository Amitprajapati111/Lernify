import axios from 'axios';

let envUrl = import.meta.env.VITE_API_BASE_URL;
let apiUrl = envUrl ? (envUrl.endsWith('/api') ? envUrl : envUrl.replace(/\/$/, '') + '/api') : 'https://api.lernify.tech/api';

const apiClient = axios.create({
    baseURL: apiUrl,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const userInfo = sessionStorage.getItem('userInfo');
        if (userInfo) {
            const { token } = JSON.parse(userInfo);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
