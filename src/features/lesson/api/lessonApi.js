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

export const getLessonsBySection = (sectionId) => {
    return axiosClient.get(`/api/teacher/lessons/by-section/${sectionId}`);
};

export const getLessonBlocks = (lessonId, params) => {
    return axiosClient.get(`/api/teacher/lessons/${lessonId}/blocks`, { params });
};

export const createLessonBlock = (lessonId, data) => {
    return axiosClient.post(`/api/teacher/lessons/${lessonId}/blocks`, data);
};

export const getLessonBlockDetail = (lessonId, id) => {
    return axiosClient.get(`/api/teacher/lessons/${lessonId}/blocks/${id}`);
};

export const updateLessonBlock = (lessonId, id, data) => {
    return axiosClient.put(`/api/teacher/lessons/${lessonId}/blocks/${id}`, data);
};

export const deleteLessonBlock = (lessonId, id) => {
    return axiosClient.delete(`/api/teacher/lessons/${lessonId}/blocks/${id}`);
};
