import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { verifyEmailAPI } from '../api/authApi';

export default function VerifyEmail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
    const [errorMessage, setErrorMessage] = useState('');
    const initialized = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMessage('Liên kết xác nhận không hợp lệ hoặc đã thiếu token.');
            return;
        }

        const verifyEmail = async () => {
            try {
                await verifyEmailAPI(token);
                setStatus('success');
                message.success('Xác nhận email thành công!');
            } catch (err) {
                console.error("Verify email failed:", err);
                setStatus('error');
                const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.';
                setErrorMessage(errorMsg);
                message.error(errorMsg);
            }
        };

        if (!initialized.current) {
            initialized.current = true;
            verifyEmail();
        }
    }, [token]);

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-400/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-8 z-10 mx-4 transition-all duration-300 hover:shadow-2xl hover:bg-white/90">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Xác nhận Email</h1>
                </div>

                {status === 'loading' && (
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                        </div>
                        <p className="text-gray-600">Đang xác nhận tài khoản của bạn, vui lòng đợi...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce" />
                        </div>
                        <p className="text-gray-600 font-medium">Tài khoản của bạn đã được kích hoạt thành công!</p>
                        <p className="text-gray-500 text-sm">Bây giờ bạn có thể đăng nhập vào hệ thống.</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                            Đăng nhập ngay
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <XCircle className="w-16 h-16 text-red-500" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-red-500 font-medium">Xác nhận email thất bại</p>
                            <p className="text-gray-600 text-sm">{errorMessage}</p>
                        </div>

                        <div className="flex flex-col gap-3 mt-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                                Về trang đăng nhập
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
