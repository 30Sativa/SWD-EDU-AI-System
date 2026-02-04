import axiosClient from '../../../lib/axiosClient';

export const getClasses = (params) => {
    return axiosClient.get('/api/manager/classes', { params });
};



export const createClass = (data) => {
    return axiosClient.post('/api/manager/classes', data);
};

export const getClassDetail = (id) => {
    return axiosClient.get(`/api/manager/classes/${id}`);
};

export const updateClass = (id, data) => {
    return axiosClient.put(`/api/manager/classes/${id}`, data);
};
