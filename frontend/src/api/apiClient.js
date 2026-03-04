import axios from 'axios';

const apiClient = axios.create({
    // baseURL: 'http://localhost:5000/api',
    baseURL: "https://learnify-backend-1jkh.onrender.com/api",
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
