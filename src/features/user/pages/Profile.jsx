import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Avatar, Tag, Spin, message, Button } from 'antd';
import { User, Mail, Shield, Calendar, Edit2, MapPin, Phone } from 'lucide-react';
import { getCurrentUser } from '../api/userApi';

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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Spin size="large" tip="Đang tải hồ sơ..." />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500 text-lg">Không tìm thấy thông tin người dùng.</p>
            </div>
        );
    }

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    };

    const getRoleTag = (roleId) => {
        switch (roleId) {
            case 1: return <Tag color="blue">Học viên</Tag>;
            case 2: return <Tag color="gold">Quản trị viên</Tag>;
            case 3: return <Tag color="purple">Quản lý chuyên môn</Tag>;
            default: return <Tag color="default">Người dùng</Tag>;
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
                <p className="text-gray-500">Quản lý thông tin cá nhân của bạn</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Quick Info */}
                <div className="space-y-6">
                    <Card className="text-center shadow-sm border-gray-100 rounded-xl">
                        <div className="flex justify-center mb-4">
                            <div className="relative">
                                <Avatar
                                    size={120}
                                    className="bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-lg text-3xl font-bold border-4 border-white"
                                >
                                    {getInitials(user.userName)}
                                </Avatar>
                                <div className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-md border border-gray-100">
                                    <Edit2 size={14} className="text-blue-600" />
                                </div>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-1">{user.userName}</h2>
                        <p className="text-gray-500 text-sm mb-4">{user.email}</p>
                        <div className="flex justify-center">
                            {getRoleTag(user.roleId)}
                        </div>
                    </Card>

                    <Card className="shadow-sm border-gray-100 rounded-xl" title="Thông tin nhanh">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Shield size={16} className="text-blue-500" />
                                <span>Trạng thái: <span className="text-green-600 font-medium">Hoạt động</span></span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Calendar size={16} className="text-blue-500" />
                                <span>Tham gia: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Detailed Info */}
                <div className="md:col-span-2">
                    <Card
                        className="shadow-sm border-gray-100 rounded-xl h-full"
                        extra={<Button type="text" icon={<Edit2 size={16} />} className="text-blue-600">Chỉnh sửa</Button>}
                        title="Chi tiết tài khoản"
                    >
                        <Descriptions column={1} bordered size="middle" labelStyle={{ fontWeight: 600, width: '150px', background: '#f9fafb' }}>
                            <Descriptions.Item label="Họ và tên">
                                <div className="flex items-center gap-2">
                                    <User size={16} className="text-gray-400" />
                                    {user.fullName || user.userName}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-gray-400" />
                                    {user.email}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-gray-400" />
                                    {user.phoneNumber || 'Chưa cập nhật'}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ">
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-gray-400" />
                                    {user.address || 'Chưa cập nhật'}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Vai trò">
                                {getRoleTag(user.roleId)}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </div>
            </div>
        </div>
    );
}
