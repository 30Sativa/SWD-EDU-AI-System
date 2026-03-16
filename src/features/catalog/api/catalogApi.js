import axiosClient from "../../../lib/axiosClient";

/**
 * Public Course Catalog APIs
 */

// Get all public categories
export const getCatalogCategories = () => {
    return axiosClient.get('/api/catalog/categories');
};

// Get all public courses
export const getCatalogCourses = (params) => {
    return axiosClient.get('/api/catalog/courses', { params });
};

// Get courses by category
export const getCoursesByCategory = (categoryId) => {
    return axiosClient.get(`/api/catalog/categories/${categoryId}/courses`);
};

// Get course details (Public)
export const getCatalogCourseDetail = (id) => {
    return axiosClient.get(`/api/catalog/courses/${id}`);
};
