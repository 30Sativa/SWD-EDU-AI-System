import axiosClient from '../lib/axiosClient';



export const loginAPI = async (values) => {
    const payload = {
        email: values.email,
        password: values.password,
    };

    return axiosClient.post('/api/Auth/login', payload);
};