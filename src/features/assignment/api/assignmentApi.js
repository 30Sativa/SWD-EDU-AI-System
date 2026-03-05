import axiosClient from "../../../lib/axiosClient";

export const createAssignment = (data) => {
    return axiosClient.post(`/api/teacher/assignments`, data);
};

export const updateAssignment = (assignmentId, data) => {
    return axiosClient.put(`/api/teacher/assignments/${assignmentId}`, data);
};

export const deleteAssignment = (assignmentId) => {
    return axiosClient.delete(`/api/teacher/assignments/${assignmentId}`);
};

export const publishAssignment = (assignmentId) => {
    return axiosClient.post(`/api/teacher/assignments/${assignmentId}/publish`);
};

export const unpublishAssignment = (assignmentId) => {
    return axiosClient.post(`/api/teacher/assignments/${assignmentId}/unpublish`);
};

export const getAssignmentsByCourse = (courseId) => {
    return axiosClient.get(`/api/teacher/assignments/course/${courseId}`);
};
