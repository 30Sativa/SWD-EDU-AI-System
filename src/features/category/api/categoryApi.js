import axiosClient from "../../../lib/axiosClient";

export const getCourseCategories = async (params) => {
    return await axiosClient.get("/api/manager/course-categories", { params });
};

export const createCourseCategory = async (data) => {
    return await axiosClient.post("/api/manager/course-categories", data);
};

export const getCourseCategoryById = async (id) => {
    return await axiosClient.get(`/api/manager/course-categories/${id}`);
};

export const updateCourseCategory = async (id, data) => {
    return await axiosClient.put(`/api/manager/course-categories/${id}`, data);
};

export const changeCourseCategoryStatus = async (id, statusData) => {
    return await axiosClient.patch(`/api/manager/course-categories/${id}/status`, statusData);
};
