import axiosClient from '../lib/axiosClient';



export const loginAPI = async (values) => {
    const payload = {
        email: values.email,
        password: values.password,
    };

    return axiosClient.post('/api/auth/login', payload);
};

export const registerAPI = async (data) => {
    // Expected data: { email, password, firstName, lastName, roleId... }
    return axiosClient.post('/api/auth/register', data);
};