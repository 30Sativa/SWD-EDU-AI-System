import axiosClient from "../../../lib/axiosClient";

/**
 * Notifications APIs
 */

// Get my notifications
export const getMyNotifications = () => {
    return axiosClient.get('/api/notifications/my');
};

// Get unread count
export const getUnreadNotificationsCount = () => {
    return axiosClient.get('/api/notifications/unread-count');
};

// Mark a notification as read
export const markNotificationAsRead = (id) => {
    return axiosClient.put(`/api/notifications/${id}/read`);
};

// Mark all notifications as read
export const markAllNotificationsAsRead = () => {
    return axiosClient.put('/api/notifications/mark-all-read');
};

/**
 * Admin Notifications APIs
 */

// Send mass notification (Admin)
export const sendMassNotification = (payload) => {
    return axiosClient.post('/api/admin/notifications', payload);
};

// Get sent notification history (Admin)
export const getAdminNotificationHistory = (params) => {
    return axiosClient.get('/api/admin/notifications', { params });
};
