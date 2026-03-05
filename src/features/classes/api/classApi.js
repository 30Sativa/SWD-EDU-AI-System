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

export const removeStudentFromClass = (id, studentId) => {
    return axiosClient.delete(`/api/teacher/classes/${id}/students/${studentId}`);
};

export const importStudentsToClass = (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post(`/api/teacher/classes/${id}/students/import`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
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

export const getSubjectTeachers = (id) => {
    return axiosClient.get(`/api/manager/classes/${id}/subject-teachers`);
};

export const getTeacherAssignedClasses = (teacherId) => {
    return axiosClient.get(`/api/manager/classes/teacher/${teacherId}/class-subjects`);
};
