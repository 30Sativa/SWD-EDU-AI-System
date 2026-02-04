import axiosClient from '../../../lib/axiosClient';

export const getTerms = (params) => {
    return axiosClient.get('/api/manager/terms', { params });
};

export const createTerm = (data) => {
    return axiosClient.post('/api/manager/terms', data);
};
