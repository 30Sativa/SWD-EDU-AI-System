import axiosClient from '../../../lib/axiosClient';

export const getGradeLevels = () => {
    return axiosClient.get('/api/manager/grade-levels');
};

export const createGradeLevel = (data) => {
    return axiosClient.post('/api/manager/grade-levels', data);
};

export const getGradeLevelById = (id) => {
    return axiosClient.get(`/api/manager/grade-levels/${id}`);
};

export const updateGradeLevel = (id, data) => {
    return axiosClient.put(`/api/manager/grade-levels/${id}`, data);
};

export const changeGradeLevelStatus = (id) => {
    return axiosClient.patch(`/api/manager/grade-levels/${id}/status`, {});
};


