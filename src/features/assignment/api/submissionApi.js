import axiosClient from "../../../lib/axiosClient";

// Teacher: Get submissions for an assignment
export const getSubmissionsByAssignment = (assignmentId) => {
    return axiosClient.get(`/api/teacher/submissions/assignment/${assignmentId}`);
};

// Teacher: Grade a submission
export const gradeSubmission = (submissionId, data) => {
    // Expected data: { score, feedback, status }
    return axiosClient.post(`/api/teacher/submissions/${submissionId}/grade`, data);
};

// Student: Submit an assignment
export const submitAssignment = (assignmentId, formData) => {
    // Expected formData (Multipart): { content, file }
    return axiosClient.post(`/api/student/submissions/assignment/${assignmentId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

// Student: Get my submission for an assignment
export const getMySubmission = (assignmentId) => {
    return axiosClient.get(`/api/student/submissions/assignment/${assignmentId}/me`);
};

// Student: Get specific submission detail
export const getSubmissionDetail = (submissionId) => {
    return axiosClient.get(`/api/student/submissions/${submissionId}`);
};

// Teacher: Get single submission detail
export const getTeacherSubmissionDetail = (submissionId) => {
    return axiosClient.get(`/api/teacher/submissions/${submissionId}`);
};
