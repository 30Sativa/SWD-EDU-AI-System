import axiosClient from '../../../lib/axiosClient';

export const getClasses = (params) => {
    return axiosClient.get('/api/manager/classes', { params });
};


export const createClass = (data) => {
    return axiosClient.post('/api/manager/classes', data);
};
