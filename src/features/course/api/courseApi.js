import axiosClient from "../../../lib/axiosClient";

export const getCourses = async (params) => {
    const response = await axiosClient.get("/api/courses", { params });
    return response;
};

export const createCourse = async (data) => {
    const response = await axiosClient.post("/api/courses", data);
    return response;
};

export const getMyCourses = async (params) => {
    const response = await axiosClient.get("/api/courses/my", { params });
    return response;
};

export const createSection = async (courseId, data) => {
    const response = await axiosClient.post(`/api/courses/${courseId}/sections`, data);
    return response;
};

export const getCourseById = (id) => axiosClient.get(`/api/courses/${id}`);

export const publishCourse = (id) => axiosClient.post(`/api/courses/${id}/publish`);

export const deleteCourse = (id) => axiosClient.delete(`/api/courses/${id}`);
