import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('userRole');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0) {

        const normalizedUserRole = userRole ? userRole.toLowerCase() : '';
        const hasPermission = allowedRoles.some(role => role.toLowerCase() === normalizedUserRole);

        if (!hasPermission) {
            if (normalizedUserRole === 'admin') return <Navigate to="/dashboard/admin" replace />;
            if (normalizedUserRole === 'teacher') return <Navigate to="/dashboard/teacher" replace />;
            if (normalizedUserRole === 'user') return <Navigate to="/dashboard/student" replace />;
            if (normalizedUserRole === 'manager') return <Navigate to="/dashboard/manager" replace />;

            return <Navigate to="/" replace />;
        }
    }
    return <Outlet />;
};

export default ProtectedRoute;
