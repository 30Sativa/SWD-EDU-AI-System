import axiosClient from "../../../lib/axiosClient";

export const getCourseTemplates = async (params) => {
    const response = await axiosClient.get("/api/manager/courses/templates", { params });
    return response;
};

export const getMyCourses = async (params) => {
    const response = await axiosClient.get("/api/teacher/courses/my", { params });
    return response;
};

export const getStudentMyCourses = async (studentId, params) => {
    if (!studentId) {
        // Fallback to the generic endpoint if studentId is not provided
        return await axiosClient.get("/api/student/courses/my", { params });
    }
    const response = await axiosClient.get(`/api/student/students/${studentId}/courses`, { params });
    return response;
};

export const createSection = async (courseId, data) => {
    const response = await axiosClient.post(`/api/courses/${courseId}/sections`, data);
    return response;
};

export const updateSection = async (courseId, sectionId, data) => {
    const response = await axiosClient.put(`/api/courses/${courseId}/sections/${sectionId}`, data);
    return response;
};

export const deleteSection = async (courseId, sectionId) => {
    const response = await axiosClient.delete(`/api/courses/${courseId}/sections/${sectionId}`);
    return response;
};

export const createCourseTemplate = async (data) => {
    return await axiosClient.post("/api/manager/courses/template", data);
};

export const updateCourseTemplate = async (id, data) => {
    return await axiosClient.put(`/api/manager/courses/template/${id}`, data);
};

export const scanCourseTemplate = async (id, formData) => {
    return await axiosClient.post(`/api/manager/courses/${id}/scan`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const saveCourseStructure = async (id, data) => {
    return await axiosClient.post(`/api/manager/courses/${id}/save-structure`, data);
};

export const enrollCourse = async (courseId) => {
    return await axiosClient.post(`/api/student/courses/${courseId}/enroll`);
};

export const createTeacherCourse = async (data) => {
    return await axiosClient.post("/api/teacher/courses", data);
};

export const publishTeacherCourse = async (id) => {
    if (!id) return;
    const url = `/api/teacher/courses/${id}/publish`;
    return await axiosClient.post(url);
};

export const cloneTeacherCourse = async (data) => {
    return await axiosClient.post("/api/teacher/courses/clone", data);
};

export const getTeacherCourseDetail = async (id) => {
    return await axiosClient.get(`/api/teacher/courses/${id}?t=${Date.now()}`);
};

export const getStudentCourseDetail = async (id) => {
    return await axiosClient.get(`/api/teacher/courses/${id}?t=${Date.now()}`);
};

export const updateTeacherCourse = async (id, data) => {
    return await axiosClient.put(`/api/teacher/courses/${id}`, data);
};

export const getCourseSections = async (courseId) => {
    return await axiosClient.get(`/api/courses/${courseId}/sections?t=${Date.now()}`);
};

export const getSectionDetail = async (courseId, sectionId) => {
    return await axiosClient.get(`/api/courses/${courseId}/sections/${sectionId}`);
};

export const assignClassToCourse = async (courseId, classId) => {
    return await axiosClient.post(`/api/teacher/courses/${courseId}/classes/${classId}`);
};

export const createTeacherSection = async (courseId, data) => {
    return await axiosClient.post(`/api/courses/${courseId}/sections`, data);
};

export const updateTeacherSection = async (courseId, sectionId, data) => {
    return await axiosClient.put(`/api/courses/${courseId}/sections/${sectionId}`, data);
};

export const deleteTeacherSection = async (courseId, sectionId) => {
    return await axiosClient.delete(`/api/courses/${courseId}/sections/${sectionId}`);
};

export const createTeacherSectionLesson = async (sectionId, data) => {
    return await axiosClient.post(`/api/teacher/sections/${sectionId}/lessons`, data);
};

export const reorderTeacherSections = async (data) => {
    return await axiosClient.put('/api/teacher/sections/reorder', data);
};

export const updateTeacherSectionStatus = async (sectionId, statusData) => {
    return await axiosClient.put(`/api/teacher/sections/${sectionId}/status`, statusData);
};

export const deleteSectionDirect = async (sectionId) => {
    return await axiosClient.delete(`/api/teacher/sections/${sectionId}`);
};