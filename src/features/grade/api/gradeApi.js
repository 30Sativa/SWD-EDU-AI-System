import axiosClient from '../../../lib/axiosClient';

export const getGradeLevels = () => {
    return axiosClient.get('/api/manager/grade-levels');
};

export const createGradeLevel = (data) => {
    return axiosClient.post('/api/manager/grade-levels', data);
};
