import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, message, Button, Divider } from 'antd';
import dayjs from 'dayjs';
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
    Camera,
    Info
} from 'lucide-react';
import { getCurrentUser, getRoleName, updateMyProfile } from '../api/userApi';

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const fetchProfile = async () => {
        try {
            setLoading(true);
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

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleOpenEditModal = () => {
        const profile = user.profile || {};
        form.setFieldsValue({
            fullName: user.fullName || profile.fullName,
            phoneNumber: user.phoneNumber || profile.phoneNumber,
            dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
            gender: profile.gender || 'Other',
            address: user.address || profile.address,
            bio: profile.bio || ''
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateProfile = async (values) => {
        try {
            setSubmitting(true);
            const payload = {
                ...values,
                dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null
            };
            await updateMyProfile(payload);
            message.success('Cập nhật hồ sơ thành công!');
            setIsEditModalOpen(false);
            fetchProfile(); // Refresh data
        } catch (error) {
            console.error('Update profile error:', error);
            message.error(error.response?.data?.message || 'Lỗi khi cập nhật hồ sơ');
        } finally {
            setSubmitting(false);
        }
    };

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
                    onClick={handleOpenEditModal}
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
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ngày sinh</label>
                                <p className="text-base font-semibold text-slate-700 border-b border-slate-50 pb-2">
                                    {user.profile?.dateOfBirth ? dayjs(user.profile.dateOfBirth).format('DD/MM/YYYY') : <span className="text-slate-300 font-normal italic">Chưa cập nhật</span>}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giới tính</label>
                                <p className="text-base font-semibold text-slate-700 border-b border-slate-50 pb-2">
                                    {user.profile?.gender === 'Male' ? 'Nam' : user.profile?.gender === 'Female' ? 'Nữ' : user.profile?.gender === 'Other' ? 'Khác' : <span className="text-slate-300 font-normal italic">Chưa cập nhật</span>}
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

                            <div className="md:col-span-2 space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giới thiệu (Bio)</label>
                                <p className="text-base font-semibold text-slate-700 border-b border-slate-50 pb-2 whitespace-pre-line">
                                    {user.profile?.bio || <span className="text-slate-300 font-normal italic">Chưa có thông tin giới thiệu bản thân</span>}
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

            {/* Edit Profile Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0487e2]">
                            <Edit2 size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Chỉnh sửa hồ sơ</h3>
                            <p className="text-xs text-slate-400 font-medium">Cập nhật thông tin cá nhân của bạn</p>
                        </div>
                    </div>
                }
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                footer={null}
                width={650}
                centered
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateProfile}
                    className="mt-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                        <Form.Item
                            label={<span className="font-semibold text-slate-700">Họ và tên</span>}
                            name="fullName"
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                        >
                            <Input placeholder="Nguyễn Văn A" className="h-11 rounded-lg" />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-semibold text-slate-700">Số điện thoại</span>}
                            name="phoneNumber"
                        >
                            <Input placeholder="0987xxxxxx" className="h-11 rounded-lg" />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-semibold text-slate-700">Ngày sinh</span>}
                            name="dateOfBirth"
                        >
                            <DatePicker
                                className="w-full h-11 rounded-lg"
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày sinh"
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-semibold text-slate-700">Giới tính</span>}
                            name="gender"
                        >
                            <Select className="h-11 [&>.ant-select-selector]:!rounded-lg [&>.ant-select-selector]:!h-11 [&>.ant-select-selector]:!flex [&>.ant-select-selector]:!items-center">
                                <Select.Option value="Male">Nam</Select.Option>
                                <Select.Option value="Female">Nữ</Select.Option>
                                <Select.Option value="Other">Khác</Select.Option>
                            </Select>
                        </Form.Item>

                        <div className="md:col-span-2">
                            <Form.Item
                                label={<span className="font-semibold text-slate-700">Địa chỉ</span>}
                                name="address"
                            >
                                <Input.TextArea placeholder="Nhập địa chỉ của bạn" rows={2} className="rounded-lg p-3" />
                            </Form.Item>
                        </div>

                        <div className="md:col-span-2">
                            <Form.Item
                                label={<span className="font-semibold text-slate-700">Giới thiệu bản thân (Bio)</span>}
                                name="bio"
                            >
                                <Input.TextArea placeholder="Chia sẻ một chút về bản thân bạn..." rows={3} className="rounded-lg p-3" />
                            </Form.Item>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-slate-100 mt-4">
                        <Button
                            className="flex-1 h-11 rounded-lg font-semibold border-slate-200 text-slate-600 hover:bg-slate-50"
                            onClick={() => setIsEditModalOpen(false)}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            className="flex-1 h-11 rounded-lg font-bold bg-[#0487e2] border-none shadow-md"
                        >
                            Lưu thay đổi
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
