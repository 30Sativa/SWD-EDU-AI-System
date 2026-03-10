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

/**
 * Retrieve real-time infrastructure metrics for the admin dashboard.
 * No parameters required.
 * Response shape:
 * {
 *   success: true,
 *   message: string,
 *   data: {
 *     os: { platform: string, isLinux: boolean },
 *     hardware: { logicalCores: number },
 *     uptime: { app: string, server: string },
 *     memory: { totalMb: number, appUsedMb: number, serverUsedMb: number, serverUsedPercentage: number },
 *     cpu: { appUsedPercentage: number, serverLoadAvg: string },
 *     disk: { rootTotalGb: number, rootUsedGb: number, rootUsedPercentage: number }
 *   }
 * }
 */
export const getInfrastructureMetrics = () => {
    return axiosClient.get('/api/admin/infrastructure');
};
