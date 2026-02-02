import axiosClient from '../lib/axiosClient';

const authApi = {
    login: (params) => {
        const url = '/api/Auth/login';
        return axiosClient.post(url, params);
    },


    register: (params) => {
        const url = '/api/Auth/register';
        return axiosClient.post(url, params);
    },
};

export default authApi;