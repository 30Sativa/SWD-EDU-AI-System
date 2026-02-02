import axios from 'axios';

const axiosClient = axios.create({
    baseURL: '', // Use Vite Proxy to avoid CORS
    headers: {
        'Content-Type': 'application/json',
    },
});

// 1. Interceptors Request: Tự động gắn Token vào mỗi API (nếu đã login)
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


axiosClient.interceptors.response.use(
    (response) => {
        if (response && response.data) {
            return response.data;
        }
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            console.log("Token hết hạn hoặc không hợp lệ");
        }
        throw error;
    }
);

export default axiosClient;