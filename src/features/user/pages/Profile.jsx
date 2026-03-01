import React, { useState, useEffect } from 'react';
import { message, Button, Divider } from 'antd';
import {
    User,
    Mail,
    Shield,
    Calendar,
    Edit2,
    MapPin,
    Phone,
    UserCircle,
    ExternalLink,
    Award,
    CheckCircle2,
    Camera
} from 'lucide-react';
import { getCurrentUser, getRoleName } from '../api/userApi';

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getCurrentUser();
                const userData = response?.data || response;
                setUser(userData);
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                message.error('Không thể tải thông tin cá nhân');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Đang tải hồ sơ...</p>
        </div>
    );

    if (!user) return (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-200 m-8">
            <UserCircle size={64} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-900">Không tìm thấy thông tin</h3>
            <p className="text-slate-500">Vui lòng thử đăng nhập lại.</p>
        </div>
    );

    const displayName = user.fullName || user.profile?.fullName || user.userName || 'Người dùng';

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U';
    };

    const getRoleBadge = (roleId) => {
        const roleName = getRoleName(roleId);
        return (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                {roleName}
            </span>
        );
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#0463ca]">Hồ sơ cá nhân</h1>
                    <p className="text-slate-500 text-sm mt-1">Quản lý thông tin tài khoản của bạn</p>
                </div>
                <Button
                    icon={<Edit2 size={16} />}
                    className="h-10 px-5 rounded-lg font-medium border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400"
                >
                    Chỉnh sửa hồ sơ
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Avatar & Quick Info */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        {/* Cover Area (Minimal) */}
                        <div className="h-24 bg-slate-50 border-b border-slate-100"></div>

                        {/* Profile Info */}
                        <div className="px-6 pb-6 relative">
                            {/* Avatar */}
                            <div className="flex justify-center -mt-12 mb-4">
                                <div className="relative">
                                    <div className="w-24 h-24 bg-white rounded-full p-1 shadow-sm border border-slate-200">
                                        <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-600">
                                            {getInitials(displayName)}
                                        </div>
                                    </div>
                                    <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-sm border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                                        <Camera size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="text-center">
                                <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
                                <p className="text-slate-400 text-sm mt-0.5 mb-4 font-medium">{user.userName}</p>
                                {getRoleBadge(user.role)}
                            </div>

                            <Divider className="my-6 border-slate-100" />

                            <div className="flex justify-around text-center">
                                <div className="flex-1">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Trạng thái</p>
                                    <p className="text-sm font-semibold text-slate-600 flex items-center justify-center gap-1">
                                        Hoạt động
                                    </p>
                                </div>
                                <div className="w-px bg-slate-100"></div>
                                <div className="flex-1">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Ngày tham gia</p>
                                    <p className="text-sm font-semibold text-slate-600">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '---'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-slate-400">
                            <Award size={18} />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Hoạt động gần đây</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Cập nhật hồ sơ</p>
                                    <p className="text-xs text-slate-400">2 giờ trước</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Đăng nhập</p>
                                    <p className="text-xs text-slate-400">Hôm qua</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Info */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm h-full">
                        <div className="flex items-center gap-2 mb-8 text-slate-400">
                            <UserCircle size={20} />
                            <h3 className="text-base font-bold text-slate-800">Thông tin tài khoản</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Họ và tên</label>
                                <p className="text-base font-semibold text-slate-700 border-b border-slate-50 pb-2">{displayName}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                                <p className="text-base font-semibold text-slate-700 border-b border-slate-50 pb-2">{user.email}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Số điện thoại</label>
                                <p className="text-base font-semibold text-slate-700 border-b border-slate-50 pb-2">
                                    {user.profile?.phoneNumber || user.phoneNumber || <span className="text-slate-300 font-normal italic">Chưa cập nhật</span>}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vai trò</label>
                                <p className="text-base font-semibold text-slate-700 border-b border-slate-50 pb-2">{getRoleName(user.role)}</p>
                            </div>

                            <div className="md:col-span-2 space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Địa chỉ</label>
                                <p className="text-base font-semibold text-slate-700 border-b border-slate-50 pb-2">
                                    {user.profile?.address || user.address || <span className="text-slate-300 font-normal italic">Chưa cập nhật</span>}
                                </p>
                            </div>
                        </div>

                        <div className="mt-12 p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-3">
                            <Shield className="text-slate-300 shrink-0" size={18} />
                            <p className="text-xs text-slate-400 leading-relaxed italic">
                                Thông tin của bạn được bảo mật theo tiêu chuẩn hệ thống.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
