import React, { useState } from 'react';
import {
    User,
    Lock,
    Bell,
    Globe,
    Moon,
    Shield,
    LogOut,
    ChevronRight,
    Camera,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';
import {
    Switch,
    Button,
    Input,
    Select,
    Avatar,
    Divider,
    Tabs,
    Badge,
    Card,
    Tooltip,
    message
} from 'antd';

const { Option } = Select;
const { TabPane } = Tabs;

export default function GeneralSettings() {
    const [theme, setTheme] = useState('light');
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        marketing: false,
        security: true
    });

    // Mock User Data
    const [user, setUser] = useState({
        name: 'Nguyễn Văn A',
        email: 'nguyen.van.a@example.com',
        phone: '0912 345 678',
        role: 'Giảng viên',
        avatar: null, // null will show initials
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh'
    });

    const handleSaveProfile = () => {
        message.loading({ content: 'Đang lưu thay đổi...', key: 'save' });
        setTimeout(() => {
            message.success({ content: 'Cập nhật hồ sơ thành công!', key: 'save' });
        }, 1000);
    };

    const handlePasswordChange = () => {
        message.loading({ content: 'Đang xử lý...', key: 'pwd' });
        setTimeout(() => {
            message.success({ content: 'Đổi mật khẩu thành công!', key: 'pwd' });
        }, 1000);
    }

    const ProfileSettings = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="relative group mx-auto md:mx-0">
                    <Avatar
                        size={100}
                        src={user.avatar}
                        className="bg-blue-100 text-blue-600 text-3xl font-bold border-4 border-white shadow-lg"
                    >
                        {user.name.charAt(0)}
                    </Avatar>
                    <button className="absolute bottom-0 right-0 p-2 bg-white text-gray-600 rounded-full shadow-md border border-gray-100 hover:text-blue-600 transition-colors">
                        <Camera size={16} />
                    </button>
                </div>
                <div className="flex-1 space-y-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                    <p className="text-gray-500 font-medium">{user.role}</p>
                    <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                        <Tag className="m-0 bg-blue-50 text-blue-600 border-blue-100 px-3 py-1 rounded-full text-xs font-bold uppercase">
                            Premium Plan
                        </Tag>
                        <Tag className="m-0 bg-green-50 text-green-600 border-green-100 px-3 py-1 rounded-full text-xs font-bold uppercase">
                            Verified
                        </Tag>
                    </div>
                </div>
            </div>

            <Divider />

            {/* Form Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700">Họ và tên</label>
                    <Input
                        prefix={<User size={18} className="text-gray-400" />}
                        value={user.name}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                        className="h-10 rounded-lg bg-gray-50 border-gray-200"
                    />
                </div>
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700">Email</label>
                    <Input
                        prefix={<Mail size={18} className="text-gray-400" />}
                        value={user.email}
                        disabled
                        className="h-10 rounded-lg bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                    />
                </div>
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700">Số điện thoại</label>
                    <Input
                        prefix={<Phone size={18} className="text-gray-400" />}
                        value={user.phone}
                        onChange={(e) => setUser({ ...user, phone: e.target.value })}
                        className="h-10 rounded-lg bg-gray-50 border-gray-200"
                    />
                </div>
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700">Khu vực / Múi giờ</label>
                    <Select
                        defaultValue={user.timezone}
                        className="w-full h-10 [&>.ant-select-selector]:!rounded-lg [&>.ant-select-selector]:!bg-gray-50 [&>.ant-select-selector]:!border-gray-200"
                    >
                        <Option value="Asia/Ho_Chi_Minh">Vietnam (GMT+7)</Option>
                        <Option value="Asia/Bangkok">Bangkok (GMT+7)</Option>
                        <Option value="Asia/Singapore">Singapore (GMT+8)</Option>
                    </Select>
                </div>
            </div>

            <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">Giới thiệu bản thân</label>
                <Input.TextArea
                    rows={4}
                    placeholder="Viết đôi điều về bạn..."
                    className="rounded-lg bg-gray-50 border-gray-200 p-3"
                />
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    type="primary"
                    size="large"
                    onClick={handleSaveProfile}
                    className="bg-[#0487e2] hover:bg-[#0374c4] border-none font-bold shadow-md h-11 px-8 rounded-lg"
                >
                    Lưu thay đổi
                </Button>
            </div>
        </div>
    );

    const SecuritySettings = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start gap-4">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <Shield size={24} />
                </div>
                <div>
                    <h3 className="text-orange-900 font-bold text-sm">Bảo mật tài khoản</h3>
                    <p className="text-orange-700 text-xs mt-1">
                        Chúng tôi khuyến nghị bạn sử dụng mật khẩu mạnh và bật xác thực 2 lớp để bảo vệ tài khoản.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Đổi mật khẩu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Mật khẩu hiện tại</label>
                        <Input.Password className="h-10 rounded-lg" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Mật khẩu mới</label>
                        <Input.Password className="h-10 rounded-lg" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Nhập lại mật khẩu mới</label>
                        <Input.Password className="h-10 rounded-lg" />
                    </div>
                </div>
                <div className="flex justify-end pt-2">
                    <Button onClick={handlePasswordChange} className="h-10 rounded-lg font-medium">Cập nhật mật khẩu</Button>
                </div>
            </div>

            <Divider />

            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Xác thực hai lớp (2FA)</h3>
                <div className="flex items-center justify-between py-2">
                    <div>
                        <p className="font-bold text-gray-700 text-sm">Tin nhắn văn bản (SMS)</p>
                        <p className="text-xs text-gray-500 mt-1">Sử dụng số điện thoại của bạn để nhận mã xác thực.</p>
                    </div>
                    <Switch />
                </div>
                <div className="flex items-center justify-between py-2">
                    <div>
                        <p className="font-bold text-gray-700 text-sm">Ứng dụng xác thực</p>
                        <p className="text-xs text-gray-500 mt-1">Sử dụng Google Authenticator hoặc ứng dụng tương tự.</p>
                    </div>
                    <Switch />
                </div>
            </div>
        </div>
    );

    const NotificationSettings = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Thông báo qua Email</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-sm text-gray-700">Tin tức & Cập nhật</p>
                            <p className="text-xs text-gray-500">Nhận thông tin về các tính năng mới và cập nhật hệ thống.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Divider className="my-2" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-sm text-gray-700">Hoạt động tài khoản</p>
                            <p className="text-xs text-gray-500">Thông báo khi có đăng nhập lạ hoặc thay đổi bảo mật.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Divider className="my-2" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-sm text-gray-700">Nhắc nhở học tập</p>
                            <p className="text-xs text-gray-500">Thông báo về bài tập, lịch học và hạn chót.</p>
                        </div>
                        <Switch defaultChecked={false} />
                    </div>
                </div>
            </div>
        </div>
    );

    const items = [
        {
            key: '1',
            label: (
                <span className="flex items-center gap-2 px-2 py-1">
                    <User size={18} />
                    Hồ sơ cá nhân
                </span>
            ),
            children: <ProfileSettings />,
        },
        {
            key: '2',
            label: (
                <span className="flex items-center gap-2 px-2 py-1">
                    <Lock size={18} />
                    Bảo mật
                </span>
            ),
            children: <SecuritySettings />,
        },
        {
            key: '3',
            label: (
                <span className="flex items-center gap-2 px-2 py-1">
                    <Bell size={18} />
                    Thông báo
                </span>
            ),
            children: <NotificationSettings />,
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
            <div className="max-w-5xl mx-auto space-y-6">
                <header>
                    <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Cài đặt tài khoản</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Quản lý thông tin cá nhân và tùy chọn hệ thống.</p>
                </header>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 min-h-[600px]">
                    <Tabs
                        defaultActiveKey="1"
                        items={items}
                        tabPosition="left"
                        className="custom-tabs h-full"
                        style={{ minHeight: 500 }}
                    />
                </div>
            </div>
            <style jsx>{`
                .custom-tabs .ant-tabs-tab {
                    padding: 12px 24px !important;
                    margin: 4px 0 !important;
                    border-radius: 8px !important;
                    transition: all 0.3s !important;
                }
                .custom-tabs .ant-tabs-tab-active {
                    background-color: #f0f9ff !important;
                }
                .custom-tabs .ant-tabs-tab-active .anticon {
                    color: #0487e2 !important;
                }
                 .custom-tabs .ant-tabs-ink-bar {
                    background-color: #0487e2 !important;
                    width: 3px !important;
                    border-radius: 0 4px 4px 0 !important;
                }
            `}</style>
        </div>
    );
}
// Helper component for styled tags (since 'Tag' is from antd)
const Tag = ({ className, children }) => (
    <span className={`inline-flex items-center justify-center ${className}`}>
        {children}
    </span>
);
