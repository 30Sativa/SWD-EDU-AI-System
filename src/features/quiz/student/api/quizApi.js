import axiosClient from '../../../../lib/axiosClient';

export const getLessonQuiz = (lessonId) => {
    return axiosClient.get(`/api/student/quizzes/lesson/${lessonId}`);
};

export const getCourseQuizzes = (courseId) => {
    return axiosClient.get(`/api/student/quizzes/course/${courseId}`);
};

export const getQuizDetail = (quizId) => {
    return axiosClient.get(`/api/student/quizzes/${quizId}`);
};

export const startQuizAttempt = (quizId) => {
    return axiosClient.post(`/api/student/quizzes/${quizId}/attempts/start`);
};

export const submitQuizAttempt = (attemptId, data) => {
    return axiosClient.post(`/api/student/quizzes/attempts/${attemptId}/submit`, data);
};

export const getQuizResult = (attemptId) => {
    return axiosClient.get(`/api/student/quizzes/attempts/${attemptId}/result`);
};
