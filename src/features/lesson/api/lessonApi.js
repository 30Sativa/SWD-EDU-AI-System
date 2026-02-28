import axiosClient from '../../../lib/axiosClient';

export const getLessonDetail = (id) => {
    return axiosClient.get(`/api/teacher/lessons/${id}`);
};

export const getLessons = (params) => {
    return axiosClient.get('/api/teacher/lessons', { params });
};

export const createLesson = (data) => {
    return axiosClient.post('/api/teacher/lessons', data);
};

export const updateLesson = (id, data) => {
    return axiosClient.put(`/api/teacher/lessons/${id}`, data);
};

export const deleteLesson = (id) => {
    return axiosClient.delete(`/api/teacher/lessons/${id}`);
};
