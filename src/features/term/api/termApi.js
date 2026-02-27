import axiosClient from '../../../lib/axiosClient';

export const getTerms = (params) => {
    return axiosClient.get('/api/manager/terms', { params });
};

export const createTerm = (data) => {
    return axiosClient.post('/api/manager/terms', data);
};

export const getTermById = (id) => {
    return axiosClient.get(`/api/manager/terms/${id}`);
};

export const updateTerm = (id, data) => {
    return axiosClient.put(`/api/manager/terms/${id}`, data);
};

export const deleteTerm = (id) => {
    return axiosClient.delete(`/api/manager/terms/${id}`);
};

export const changeTermStatus = (id, data) => {
    return axiosClient.patch(`/api/manager/terms/${id}/status`, data);
};
