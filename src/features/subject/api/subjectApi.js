import axiosClient from '../../../lib/axiosClient';

export const getSubjects = () => {
    return axiosClient.get('/api/manager/subjects');
};

export const createSubject = (data) => {
    return axiosClient.post('/api/manager/subjects', data);
};

export const getSubjectById = (id) => {
    return axiosClient.get(`/api/manager/subjects/${id}`);
};

export const updateSubject = (id, data) => {
    return axiosClient.put(`/api/manager/subjects/${id}`, data);
};

