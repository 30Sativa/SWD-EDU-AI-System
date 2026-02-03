import axiosClient from '../../../lib/axiosClient';

export const getUsers = (params) => {
    const url = '/api/admin/users';
    return axiosClient.get(url, { params });
};


export const createUser = (data) => {
    return axiosClient.post('/api/admin/users', data);
};

export const createStudent = (data) => {
    return axiosClient.post('/api/admin/users/students', data);
};

export const createTeacher = (data) => {
    return axiosClient.post('/api/admin/users/teachers', data);
};

export const createAdmin = (data) => {
    return axiosClient.post('/api/admin/users/admins', data);
};

export const createManager = (data) => {
    return axiosClient.post('/api/admin/users/managers', data);
};

export const getUserById = (id) => {
    const url = `/api/admin/users/${id}`;
    return axiosClient.get(url);
};

export const deleteUser = (id) => {
    const url = `/api/admin/users/${id}`;
    return axiosClient.delete(url);
};


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

