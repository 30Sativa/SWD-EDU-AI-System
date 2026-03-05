import axiosClient from '../../../../lib/axiosClient';

/**
 * Quiz APIs for Teachers
 * Based on Swagger specification
 */

// Create Formative Quiz (Linked to a Lesson)
export const createFormativeQuiz = (data) => {
    // Expected data: { lessonId, title, description, timeLimit, maxAttempts, passingScore, isPublished, isRequired, showAnswers, shuffleQuestions }
    return axiosClient.post('/api/teacher/quizzes/formative', data);
};

// Create Summative Quiz (Linked to a Course)
export const createSummativeQuiz = (data) => {
    // Expected data: { courseId, title, description, timeLimit, maxAttempts, passingScore... }
    return axiosClient.post('/api/teacher/quizzes/summative', data);
};

// Add Question to Quiz
export const addQuestionToQuiz = (quizId, data) => {
    // Expected data: { questionText, questionType, points, explanation, sortOrder, options: [...] }
    return axiosClient.post(`/api/teacher/quizzes/${quizId}/questions`, data);
};

// Update Quiz Metadata
export const updateQuiz = (quizId, data) => {
    return axiosClient.put(`/api/teacher/quizzes/${quizId}`, data);
};

// Delete Quiz
export const deleteQuiz = (quizId) => {
    return axiosClient.delete(`/api/teacher/quizzes/${quizId}`);
};

// Update Question
export const updateQuestionInQuiz = (quizId, questionId, data) => {
    return axiosClient.put(`/api/teacher/quizzes/${quizId}/questions/${questionId}`, data);
};

// Delete Question
export const deleteQuestionInQuiz = (quizId, questionId) => {
    return axiosClient.delete(`/api/teacher/quizzes/${quizId}/questions/${questionId}`);
};
