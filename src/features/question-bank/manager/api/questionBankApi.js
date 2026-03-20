import axiosClient from "../../../../lib/axiosClient";

/**
 * Manager - Question Bank APIs
 * Focused on Global Management
 */

// Get list of existing questions from the platform (Global Question Bank)
export const getManagerQuestionsBank = (params = {}) => {
    // Expected params: { courseId, lessonId, teacherId, subjectId, gradeLevelId, searchTerm }
    return axiosClient.get('/api/manager/quizzes/questions-bank', { params });
};

// Get Global Question Bank Summary (grouped by Topics/Courses)
export const getManagerQuestionBankSummary = () => {
    return axiosClient.get('/api/manager/quizzes/questions-bank/summary');
};

// Batch update or manage questions could be added here later
