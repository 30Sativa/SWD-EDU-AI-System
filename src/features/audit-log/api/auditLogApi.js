import axiosClient from '../../../lib/axiosClient';

/**
 * GET /api/admin/audit-logs
 * Lấy danh sách nhật ký hệ thống có phân trang và bộ lọc.
 * @param {object} params - { PageNumber, PageSize, Action, Entity, UserId }
 */
export const getAuditLogs = (params = {}) => {
    return axiosClient.get('/api/admin/audit-logs', { params });
};

/**
 * GET /api/admin/audit-logs/recent
 * Lấy top n nhật ký mới nhất (dùng cho Dashboard widget).
 * @param {number} count - số lượng bản ghi cần lấy (mặc định 5)
 */
export const getRecentAuditLogs = (count = 5) => {
    return axiosClient.get('/api/admin/audit-logs/recent', { params: { count } });
};
