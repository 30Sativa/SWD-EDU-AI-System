import axiosClient from '../../../lib/axiosClient';

export const getClasses = (params) => {
    return axiosClient.get('/api/manager/classes', { params });
};

export const getTeacherHomeroomClasses = (params) => {
    return axiosClient.get('/api/teacher/classes/homeroom', { params });
};


export const createClass = (data) => {
    return axiosClient.post('/api/manager/classes', data);
};

export const getTeacherClassStudents = (id) => {
    return axiosClient.get(`/api/teacher/classes/${id}/students`);
};

export const addStudentsToClass = (id, studentIds) => {
    return axiosClient.post(`/api/teacher/classes/${id}/students`, studentIds);
};

export const getClassDetail = (id) => {
    return axiosClient.get(`/api/manager/classes/${id}`);
};

export const updateClass = (id, data) => {
    return axiosClient.put(`/api/manager/classes/${id}`, data);
};

export const changeClassStatus = (id, status) => {
    return axiosClient.patch(`/api/manager/classes/${id}/status`, status !== undefined ? { isActive: status } : {});
};

export const deleteClass = (id) => {
    return axiosClient.delete(`/api/manager/classes/${id}`);
};

export const assignSubjectTeacher = (id, data) => {
    return axiosClient.post(`/api/manager/classes/${id}/subject-teachers`, data);
};
