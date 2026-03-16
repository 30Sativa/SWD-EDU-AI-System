import axiosClient from "../../../../lib/axiosClient";

/**
 * Question Bank Folder/Topic APIs
 */

export const getQuestionFolders = (params) => {
    return axiosClient.get('/api/teacher/question-bank/folders', { params });
};

export const createQuestionFolder = (data) => {
    return axiosClient.post('/api/teacher/question-bank/folders', data);
};

export const getQuestionFolderDetail = (folderId) => {
    return axiosClient.get(`/api/teacher/question-bank/folders/${folderId}`);
};

export const updateQuestionFolder = (folderId, data) => {
    return axiosClient.put(`/api/teacher/question-bank/folders/${folderId}`, data);
};

export const deleteQuestionFolder = (folderId) => {
    return axiosClient.delete(`/api/teacher/question-bank/folders/${folderId}`);
};

/**
 * Question Management in Bank
 */

export const getQuestionsByFolder = (folderId, params) => {
    return axiosClient.get(`/api/teacher/question-bank/folders/${folderId}/questions`, { params });
};

export const createQuestionInBank = (folderId, data) => {
    return axiosClient.post(`/api/teacher/question-bank/folders/${folderId}/questions`, data);
};

export const updateQuestionInBank = (folderId, questionId, data) => {
    return axiosClient.put(`/api/teacher/question-bank/folders/${folderId}/questions/${questionId}`, data);
};

export const deleteQuestionInBank = (folderId, questionId) => {
    return axiosClient.delete(`/api/teacher/question-bank/folders/${folderId}/questions/${questionId}`);
};

/**
 * AI Question Generation
 */
export const generateAiQuestions = (data) => {
    // Expected data: { lessonId, topic, context, numberOfQuestions, difficulty }
    return axiosClient.post('/api/teacher/ai/generate-questions', data);
};
