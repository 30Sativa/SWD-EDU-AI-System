import axiosClient from '../../../lib/axiosClient';

export const getLessonDetail = (id) => {
    return axiosClient.get(`/api/teacher/lessons/${id}`);
};

export const getStudentLessonDetail = (id) => {
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

export const getStudentLessonBlocks = (lessonId, params) => {
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

export const generateAIBlocks = (lessonId, data) => {
    // data: { inputSourceType, inputContent, lessonTitle, saveToDB }
    // inputSourceType: 'Text' | 'PDF' | 'File'
    return axiosClient.post(`/api/teacher/lessons/${lessonId}/blocks/generate-ai`, data);
};

export const getAIPreviewBlocks = (lessonId) => {
    return axiosClient.get(`/api/teacher/lessons/${lessonId}/blocks/preview`);
};

export const saveAIPreviewBlocks = (lessonId, data) => {
    // data: { blocks } - danh sách blocks đã chỉnh sửa từ preview
    return axiosClient.post(`/api/teacher/lessons/${lessonId}/blocks/save-preview`, data);
};

export const generateStudentAIBlocks = (lessonId, data) => {
    return axiosClient.post(`/api/teacher/lessons/${lessonId}/blocks/generate-ai`, data);
};

export const getStudentAIPreviewBlocks = (lessonId) => {
    return axiosClient.get(`/api/teacher/lessons/${lessonId}/blocks/preview`);
};

export const saveStudentAIPreviewBlocks = (lessonId, data) => {
    return axiosClient.post(`/api/teacher/lessons/${lessonId}/blocks/save-preview`, data);
};

export const generateAIBlocksStream = (lessonId, data) => {
    // Đối với streaming, thường dùng fetch trực tiếp hoặc cấu hình axios responseType: 'stream'
    // Tuy nhiên ở frontend (Browser), axios.post với responseType 'stream' không hoạt động như Node.js
    // Ở đây định nghĩa endpoint, việc stream sẽ xử lý ở component sử dụng fetch/EventSource
    return axiosClient.post(`/api/teacher/lessons/${lessonId}/blocks/generate-ai-stream`, data);
};

export const generateStudentAIBlocksStream = (lessonId, data) => {
    return axiosClient.post(`/api/teacher/lessons/${lessonId}/blocks/generate-ai-stream`, data);
};

/**
 * Lesson FAQs APIs
 */

export const getLessonFaqs = (lessonId) => {
    return axiosClient.get(`/api/teacher/lessons/${lessonId}/faqs`);
};

export const getStudentLessonFaqs = (lessonId) => {
    return axiosClient.get(`/api/teacher/lessons/${lessonId}/faqs`);
};

export const createLessonFaq = (lessonId, data) => {
    return axiosClient.post(`/api/teacher/lessons/${lessonId}/faqs`, data);
};

export const getLessonFaqDetail = (lessonId, id) => {
    return axiosClient.get(`/api/teacher/lessons/${lessonId}/faqs/${id}`);
};

export const updateLessonFaq = (lessonId, id, data) => {
    return axiosClient.put(`/api/teacher/lessons/${lessonId}/faqs/${id}`, data);
};

export const deleteLessonFaq = (lessonId, id) => {
    return axiosClient.delete(`/api/teacher/lessons/${lessonId}/faqs/${id}`);
};

/**
 * Lesson Material APIs
 */

export const uploadLessonMaterial = (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post(`/api/teacher/lessons/${id}/upload-material`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
export const chatWithAI = (lessonId, data) => {
    // data: { message: string, history: Array<{role: string, content: string}> }
    return axiosClient.post(`/api/student/lessons/${lessonId}/chat`, data);
};

export const updateLessonProgress = (lessonId, data) => {
    // data: { watchedDuration: number, isCompleted: boolean }
    return axiosClient.post(`/api/student/lessons/${lessonId}/progress`, data);
};
