import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, message, Button } from 'antd';
import { User, Edit2, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';
import { getCurrentUser, updateMyProfile } from '../../features/user/api/userApi';

const CheckProfileWrapper = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const checkUserProfile = async () => {
            try {
                const response = await getCurrentUser();
                const user = response?.data || response;
                setUserData(user);

                const profile = user.profile || {};
                const fullName = user.fullName || profile.fullName;
                const phoneNumber = user.phoneNumber || profile.phoneNumber;

                // Check if mission critical information is missing
                if (!fullName || !phoneNumber) {
                    setIsModalOpen(true);
                    form.setFieldsValue({
                        fullName: fullName || '',
                        phoneNumber: phoneNumber || '',
                        gender: profile.gender || 'Other',
                        dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : null
                    });
                }
            } catch (error) {
                console.error('Failed to check profile:', error);
            }
        };

        checkUserProfile();
    }, [form]);

    const handleUpdate = async (values) => {
        try {
            setSubmitting(true);
            const payload = {
                ...values,
                dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null
            };
            await updateMyProfile(payload);
            message.success('Cập nhật thông tin thành công! Bạn hiện có thể tiếp tục.');
            setIsModalOpen(false);
        } catch (error) {
            console.error('Update profile error:', error);
            message.error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {children}

            <Modal
                title={
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Hoàn thiện hồ sơ</h3>
                            <p className="text-xs text-slate-400 font-medium">Bạn cần cung cấp thông tin để tiếp tục sử dụng hệ thống</p>
                        </div>
                    </div>
                }
                open={isModalOpen}
                footer={null}
                closable={false}
                maskClosable={false}
                centered
                width={500}
                className="mandatory-profile-modal"
            >
                <div className="py-4">
                    <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                        Chào <span className="font-bold text-slate-900">{userData?.userName}</span>, để đảm bảo quyền lợi và hỗ trợ tốt nhất, vui lòng cập nhật các thông tin cơ bản dưới đây.
                    </p>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleUpdate}
                        className="space-y-4"
                    >
                        <Form.Item
                            label={<span className="font-semibold text-slate-700">Họ và tên</span>}
                            name="fullName"
                            rules={[{ required: true, message: 'Vui lòng nhập họ và tên đầy đủ' }]}
                        >
                            <Input placeholder="Ví dụ: Nguyễn Văn A" className="h-11 rounded-lg" />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-semibold text-slate-700">Số điện thoại</span>}
                            name="phoneNumber"
                            rules={[
                                { required: true, message: 'Vui lòng nhập số điện thoại' },
                                { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ (10 số)' }
                            ]}
                        >
                            <Input placeholder="0987654321" className="h-11 rounded-lg" />
                        </Form.Item>

                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item
                                label={<span className="font-semibold text-slate-700">Ngày sinh</span>}
                                name="dateOfBirth"
                            >
                                <DatePicker className="w-full h-11 rounded-lg" format="DD/MM/YYYY" placeholder="DD/MM/YYYY" />
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
                        </div>

                        <div className="pt-4">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={submitting}
                                block
                                className="h-12 rounded-xl font-bold bg-[#0487e2] border-none shadow-lg shadow-blue-200"
                            >
                                Lưu thông tin & Tiếp tục
                            </Button>
                        </div>
                    </Form>
                </div>
            </Modal>
        </>
    );
};

export default CheckProfileWrapper;
