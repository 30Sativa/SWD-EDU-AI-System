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

// Update Quiz Attempt Settings
export const updateAttemptSettings = (quizId, maxAttempts) => {
    return axiosClient.put(`/api/teacher/quizzes/${quizId}/attempt-settings`, { maxAttempts });
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

// --- Question Option APIs ---

// Get Question Options
export const getQuestionOptions = (questionId) => {
    return axiosClient.get(`/api/teacher/quizzes/questions/${questionId}/options`);
};

// Update Question Option
export const updateQuestionOption = (questionId, optionId, data) => {
    // Expected data: { optionText, isCorrect, sortOrder }
    return axiosClient.put(`/api/teacher/quizzes/questions/${questionId}/options/${optionId}`, data);
};

// Delete Question Option
export const deleteQuestionOption = (questionId, optionId) => {
    return axiosClient.delete(`/api/teacher/quizzes/questions/${questionId}/options/${optionId}`);
};

// Get Quiz Detail (Student)
export const getQuizDetail = (quizId) => {
    return axiosClient.get(`/api/student/quizzes/${quizId}`);
};

// Get Quiz Detail (Teacher) - Includes isCorrect for options
export const getTeacherQuizDetail = (quizId) => {
    return axiosClient.get(`/api/teacher/quizzes/${quizId}`);
};

// Get Course Quizzes
export const getCourseQuizzes = (courseId) => {
    return axiosClient.get(`/api/student/quizzes/course/${courseId}`);
};

// Get Lesson Quizzes
export const getLessonQuizzes = (lessonId) => {
    return axiosClient.get(`/api/student/quizzes/lesson/${lessonId}`);
};

/**
 * Student Quiz Attempt APIs
 */

// Start Attempt
export const startQuizAttempt = (quizId) => {
    console.log(`Starting quiz attempt for: ${quizId}`);
    return axiosClient.post(`/api/student/quizzes/${quizId}/attempts/start`, {});
};

// Submit Attempt
export const submitQuizAttempt = (attemptId, data) => {
    // Expected data: { answers: [{ questionId, selectedOptionIds: [], textAnswer: "" }] }
    return axiosClient.post(`/api/student/quizzes/attempts/${attemptId}/submit`, data);
};

// Get Attempt Result
export const getQuizAttemptResult = (attemptId) => {
    return axiosClient.get(`/api/student/quizzes/attempts/${attemptId}/result`);
};
