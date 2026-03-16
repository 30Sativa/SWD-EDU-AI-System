import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'accessToken' && event.newValue === null) {
                navigate('/login');
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [navigate]);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0) {

        const normalizedUserRole = userRole ? userRole.toLowerCase() : '';
        const hasPermission = allowedRoles.some(role => role.toLowerCase() === normalizedUserRole);

        if (!hasPermission) {
            if (normalizedUserRole === 'admin') return <Navigate to="/dashboard/admin" replace />;
            if (normalizedUserRole === 'teacher') return <Navigate to="/dashboard/teacher" replace />;
            if (normalizedUserRole === 'user' || normalizedUserRole === 'student') return <Navigate to="/dashboard/student" replace />;
            if (normalizedUserRole === 'manager') return <Navigate to="/dashboard/manager" replace />;

            return <Navigate to="/" replace />;
        }
    }
    return <Outlet />;
};

export default ProtectedRoute;
