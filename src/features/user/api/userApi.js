import axiosClient from '../../../lib/axiosClient';

export const getUsers = (params) => {
    const url = '/api/admin/users';
    return axiosClient.get(url, { params });
};

// Mapping Role Enum based on Backend UserRoleDomain
export const ROLE_ENUM = {
    USER: 1,
    ADMIN: 2,
    MANAGER: 3,
};

// Đảo ngược để map từ số sang tên hiển thị
export const getRoleName = (roleId) => {
    switch (roleId) {
        case 1: return 'Học viên';
        case 2: return 'Quản trị viên';
        case 3: return 'Quản lý';
        default: return 'Khác';
    }
};

