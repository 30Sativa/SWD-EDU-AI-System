import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { loginAPI } from '../api/authApi';

const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to parse JWT:", e);
        return null;
    }
};

export default function Login() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const role = localStorage.getItem('userRole');

        if (token && role) {
            const lowerRole = String(role).toLowerCase();
            if (lowerRole.includes('admin')) navigate('/dashboard/admin');
            else if (lowerRole.includes('teacher')) navigate('/dashboard/teacher');
            else if (lowerRole.includes('manager')) navigate('/dashboard/manager');
            else if (lowerRole.includes('user') || lowerRole.includes('student')) navigate('/dashboard/student');
            else navigate('/');
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await loginAPI(formData);

            const token = response.accessToken || response.token || response.data?.accessToken || response.data?.token;

            if (token) {
                localStorage.setItem('accessToken', token);
                const decoded = parseJwt(token);
                const role = decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded?.role;

                if (role) {
                    localStorage.setItem('userRole', role);
                    // 1. Try to get userName directly from response
                    let name = response.userName || response.data?.userName || response.userInfo?.userName;

                    // 2. If not in response, try to get from Token
                    if (!name) {

                        name = decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
                            || decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/name'] // Try MS claim style
                            || decoded?.name
                            || decoded?.unique_name
                            || decoded?.preferred_username;

                        // 3. Fallback: Parse from email if name is still missing or looks like a UUID
                        const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
                        if (!name || isUUID(name)) {
                            const email = decoded?.email || decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
                            if (email && !isUUID(email)) {
                                name = email.split('@')[0];
                            }
                        }
                    }

                    // 4. Last resort
                    if (!name) name = 'User';

                    localStorage.setItem('userName', name);
                    message.success('Đăng nhập thành công!');

                    const lowerRole = String(role).toLowerCase();

                    if (lowerRole.includes('admin')) {
                        navigate('/dashboard/admin');
                    }
                    else if (lowerRole.includes('teacher')) {
                        navigate('/dashboard/teacher');
                    }
                    else if (lowerRole.includes('user') || lowerRole.includes('student')) {
                        navigate('/dashboard/student');
                    }
                    else if (lowerRole.includes('manager')) {
                        navigate('/dashboard/manager');
                    }
                    else {
                        navigate('/');
                    }
                } else {
                    console.error("Role not found in token");
                    throw new Error("Không tìm thấy thông tin vai trò trong token");
                }
            } else {
                console.error("Token missing in response");
                throw new Error("Không tìm thấy token trong phản hồi");
            }
        } catch (err) {
            console.error("Login failed:", err);
            const errorMsg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
            setError(errorMsg);
            message.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-8 z-10 mx-4 transition-all duration-300 hover:shadow-2xl hover:bg-white/90">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Chào mừng trở lại</h1>
                    <p className="text-gray-500 mt-2 text-sm">Vui lòng đăng nhập để tiếp tục</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 ml-1">Email</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-800 placeholder-gray-400"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-800 placeholder-gray-400"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                                Quên mật khẩu?
                            </a>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Đăng nhập</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>


            </div>
        </div>
    );
}
