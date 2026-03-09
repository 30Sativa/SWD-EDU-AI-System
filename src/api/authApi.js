import axiosClient from '../lib/axiosClient';

export const registerAPI = async (values) => {
    const payload = {
        email: values.email,
        userName: values.username,
        passwordHash: values.password,
    };

    return axiosClient.post('/api/Auth/register', payload);
};

export const loginAPI = async (values) => {
    const payload = {
        email: values.email,
        password: values.password,
    };

    return axiosClient.post('/api/Auth/login', payload);
};