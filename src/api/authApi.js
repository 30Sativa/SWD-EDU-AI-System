import axiosClient from '../lib/axiosClient';



export const loginAPI = async (values) => {
    const payload = {
        email: values.email,
        password: values.password,
    };

    return axiosClient.post('/api/Auth/login', payload);
};

export const googleLoginAPI = async (idToken, defaultRole = 0) => {
    return axiosClient.post('/api/auth/google-login', { idToken, defaultRole });
};

export const forgotPasswordAPI = async (email) => {
    return axiosClient.post('/api/Auth/forgot-password', { email });
};

export const resetPasswordAPI = async (values) => {
    return axiosClient.post('/api/Auth/reset-password', values);
};

export const verifyEmailAPI = async (token) => {
    return axiosClient.post('/api/Auth/verify-email', { token });
};

export const refreshTokenAPI = async (refreshToken) => {
    return axiosClient.post('/api/auth/refresh-token', { token: refreshToken });
};