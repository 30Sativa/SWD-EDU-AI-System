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
    ADMIN: 1,
    MANAGER: 2,
    TEACHER: 3,
    STUDENT: 4
};

export const updateUserProfile = (id, data) => {
    return axiosClient.put(`/api/admin/users/${id}/profile`, data);
};

// Đảo ngược để map từ số sang tên hiển thị
export const getRoleName = (roleId) => {
    switch (roleId) {
        case 1: return 'Quản trị viên';
        case 2: return 'Quản lý';
        case 3: return 'Giáo viên';
        case 4: return 'Học sinh';
        default: return 'Khác';
    }
};

export const getCurrentUser = () => {
    return axiosClient.get('/api/users/me');
};

export const importUsers = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post('/api/admin/users/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

