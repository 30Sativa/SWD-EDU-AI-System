import axiosClient from '../../../lib/axiosClient';

/**
 * Retrieve aggregated statistics for the admin/manager dashboard.
 * No parameters required according to the swagger spec.
 * Response shape:
 * {
 *   success: true,
 *   message: string,
 *   data: {
 *     totalUsers: number,
 *     totalStudents: number,
 *     totalTeachers: number,
 *     totalCourses: number,
 *     totalClasses: number,
 *     totalEnrollments: number
 *   }
 * }
 */
export const getAdminDashboard = () => {
    return axiosClient.get('/api/admin/dashboard');
};
