import axiosClient from '../../../lib/axiosClient';

/**
 * GET /api/admin/settings/status
 * Get the current status of system notifications and audit logs.
 */
export const getSystemSettingsStatus = () => {
    return axiosClient.get('/api/admin/settings/status');
};

/**
 * PUT /api/admin/settings/system-notifications
 * Toggle system notifications.
 * @param {boolean} enabled 
 */
export const toggleSystemNotifications = (enabled) => {
    return axiosClient.put(`/api/admin/settings/system-notifications?enabled=${enabled}`);
};

/**
 * PUT /api/admin/settings/audit-logs
 * Toggle audit logs.
 * @param {boolean} enabled 
 */
export const toggleAuditLogs = (enabled) => {
    return axiosClient.put(`/api/admin/settings/audit-logs?enabled=${enabled}`);
};
