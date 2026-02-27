import axiosClient from "../../../lib/axiosClient";

export const getCourseTemplates = async (params) => {
    const response = await axiosClient.get("/api/manager/courses/templates", { params });
    return response;
};

export const getMyCourses = async (params) => {
    const response = await axiosClient.get("/api/teacher/courses/my", { params });
    return response;
};

export const createSection = async (courseId, data) => {
    const response = await axiosClient.post(`/api/courses/${courseId}/sections`, data);
    return response;
};

export const createCourseTemplate = async (data) => {
    return await axiosClient.post("/api/manager/courses/template", data);
};

export const scanCourseTemplate = async (id, formData) => {
    return await axiosClient.post(`/api/manager/courses/${id}/scan`, formData);
};

export const saveCourseStructure = async (id, data) => {
    return await axiosClient.post(`/api/manager/courses/${id}/save-structure`, data);
};
