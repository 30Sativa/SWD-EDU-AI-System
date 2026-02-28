import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Avatar, Tag, Spin, message, Button, Divider } from 'antd';
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
    CheckCircle2
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
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">Đang tải hồ sơ của bạn...</p>
        </div>
    );

    if (!user) return (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 m-8">
            <UserCircle size={64} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-900">Không tìm thấy thông tin</h3>
            <p className="text-slate-500">Vui lòng thử đăng nhập lại hoặc liên hệ quản trị viên.</p>
        </div>
    );

    const displayName = user.fullName || user.profile?.fullName || user.userName || 'Người dùng';

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U';
    };

    const getRoleBadge = (roleId) => {
        const roleName = getRoleName(roleId);
        const styles = {
            1: 'bg-purple-50 text-purple-700 border-purple-100', // Admin
            2: 'bg-blue-50 text-blue-700 border-blue-100',     // Manager
            3: 'bg-emerald-50 text-emerald-700 border-emerald-100', // Teacher
            4: 'bg-amber-50 text-amber-700 border-amber-100',     // Student
        };

        return (
            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${styles[roleId] || 'bg-slate-50 text-slate-700 border-slate-100'}`}>
                {roleName}
            </span>
        );
    };

    return (
        <div className="max-w-6xl mx-auto py-12 px-6 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-slate-100 pb-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hồ sơ cá nhân</h1>
                    <p className="text-slate-500 font-medium">Thông tin tài khoản và cài đặt cá nhân của bạn</p>
                </div>
                <Button
                    type="primary"
                    icon={<Edit2 size={16} />}
                    className="bg-[#0463ca] hover:bg-[#0352a8] h-11 px-6 rounded-xl font-bold shadow-lg shadow-blue-100 border-none transition-all hover:scale-105"
                >
                    Chỉnh sửa hồ sơ
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Avatar & Quick Info */}
                <div className="space-y-8">
                    <Card className="text-center shadow-xl shadow-slate-100/50 border-none rounded-[2.5rem] overflow-hidden group">
                        <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700 -mx-6 -mt-6 mb-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                        </div>

                        <div className="flex justify-center -mt-24 mb-6 relative">
                            <div className="relative group">
                                <Avatar
                                    size={140}
                                    className="bg-white p-1.5 shadow-2xl ring-4 ring-white"
                                >
                                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-black text-white">
                                        {getInitials(displayName)}
                                    </div>
                                </Avatar>
                                <button className="absolute bottom-2 right-2 bg-white p-2.5 rounded-2xl shadow-xl border border-slate-50 text-blue-600 hover:scale-110 active:scale-95 transition-all">
                                    <Edit2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="px-2 pb-6">
                            <h2 className="text-2xl font-black text-slate-900 mb-1 leading-tight">{displayName}</h2>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6">{user.userName}</p>

                            <div className="flex justify-center mb-8">
                                {getRoleBadge(user.role)}
                            </div>

                            <Divider className="border-slate-50 my-6" />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trạng thái</p>
                                    <p className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-1">
                                        <CheckCircle2 size={14} /> Hoạt động
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thành viên</p>
                                    <p className="text-sm font-bold text-slate-700">
                                        {user.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="shadow-xl shadow-slate-100/50 border-none rounded-[2rem]" title={<span className="font-bold text-slate-900 flex items-center gap-2"><Award size={18} className="text-blue-500" /> Bản tin hoạt động</span>}>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Cập nhật hồ sơ</p>
                                    <p className="text-[11px] text-slate-400 font-medium italic">2 giờ trước</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-2 h-2 rounded-full bg-slate-200 mt-2"></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-600">Đăng nhập từ trình duyệt mới</p>
                                    <p className="text-[11px] text-slate-400 font-medium italic">Hôm qua</p>
                                </div>
                            </div>
                        </div>
                        <Button type="link" className="w-full mt-6 text-blue-600 font-bold text-xs flex items-center justify-center gap-1 group">
                            Xem tất cả hoạt động <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Button>
                    </Card>
                </div>

                {/* Right Column: Detailed Info */}
                <div className="lg:col-span-2 space-y-8">
                    <Card
                        className="shadow-xl shadow-slate-100/50 border-none rounded-[2.5rem] overflow-hidden"
                        title={<span className="text-xl font-black text-slate-900 flex items-center gap-3 py-2"><UserCircle size={24} className="text-blue-600" /> Chi tiết tài khoản</span>}
                    >
                        <Descriptions
                            column={1}
                            bordered
                            size="large"
                            className="description-premium"
                            labelStyle={{
                                fontWeight: 800,
                                width: '180px',
                                background: '#f8fafc',
                                color: '#64748b',
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                paddingLeft: '24px'
                            }}
                            contentStyle={{
                                paddingLeft: '24px',
                                background: '#ffffff',
                                color: '#0f172a',
                                fontWeight: 600,
                                fontSize: '14px'
                            }}
                        >
                            <Descriptions.Item label="Họ và tên">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <User size={16} strokeWidth={2.5} />
                                    </div>
                                    {displayName}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <Mail size={16} strokeWidth={2.5} />
                                    </div>
                                    {user.email}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <Phone size={16} strokeWidth={2.5} />
                                    </div>
                                    {user.profile?.phoneNumber || user.phoneNumber || 'Chưa cập nhật'}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                        <MapPin size={16} strokeWidth={2.5} />
                                    </div>
                                    {user.profile?.address || user.address || 'Chưa cập nhật'}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Vai trò">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                        <Shield size={16} strokeWidth={2.5} />
                                    </div>
                                    {getRoleName(user.role)}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tham gia">
                                <div className="flex items-center gap-3 text-slate-500 font-medium">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center">
                                        <Calendar size={16} strokeWidth={2.5} />
                                    </div>
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }) : '---'}
                                </div>
                            </Descriptions.Item>
                        </Descriptions>

                        <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 italic">
                            <p className="text-xs text-slate-500 leading-relaxed">
                                <strong>Ghi chú:</strong> Thông tin này được sử dụng để định danh bạn trong hệ thống EDU-AI Classroom. Nếu có bất kỳ sai sót nào về Email hoặc Vai trò, vui lòng liên hệ Bộ phận CNTT để được hỗ trợ.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
