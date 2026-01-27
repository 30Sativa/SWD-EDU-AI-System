import React from 'react';
import {
    Book,
    Video,
    Users,
    GraduationCap,
    PlusCircle,
    FileUp,
    UserPlus,
    MoreHorizontal,
    Download,
    Search,
    CheckCircle2,
    Clock,
    FileText,
    Activity,
    ArrowRight
} from 'lucide-react';

const stats = [
    {
        label: 'Tổng Môn học',
        value: '124',
        change: '+5%',
        trend: 'up',
        icon: Book,
        color: 'bg-blue-50 text-blue-600'
    },
    {
        label: 'Tổng Khóa học',
        value: '86',
        change: '+2%',
        trend: 'up',
        icon: Video,
        color: 'bg-indigo-50 text-indigo-600'
    },
    {
        label: 'Tổng Giáo viên',
        value: '42',
        change: '-1%',
        trend: 'down',
        icon: Users,
        color: 'bg-orange-50 text-orange-600'
    },
    {
        label: 'Tổng Học sinh',
        value: '1,250',
        change: '+12%',
        trend: 'up',
        icon: GraduationCap,
        color: 'bg-emerald-50 text-emerald-600'
    }
];

const subjects = [
    {
        name: 'Toán học Cao cấp',
        category: 'Khoa học',
        status: 'Đã xuất bản',
        lastModified: '2 giờ trước',
        initial: 'AM',
        color: 'bg-blue-100 text-blue-700'
    },
    {
        name: 'Nhập môn Tâm lý học',
        category: 'Khoa học Xã hội',
        status: 'Bản nháp',
        lastModified: 'Hôm qua',
        initial: 'PY',
        color: 'bg-purple-100 text-purple-700'
    },
    {
        name: 'Khoa học Máy tính 101',
        category: 'Công nghệ',
        status: 'Đã xuất bản',
        lastModified: '3 ngày trước',
        initial: 'CS',
        color: 'bg-green-100 text-green-700'
    },
    {
        name: 'Lịch sử Thế giới',
        category: 'Nhân văn',
        status: 'Bản nháp',
        lastModified: '12/10/2023',
        initial: 'WH',
        color: 'bg-red-100 text-red-700'
    }
];

const activities = [
    {
        user: 'Tiến sĩ Smith',
        action: 'đã cập nhật',
        target: 'Giáo trình Toán 101',
        time: '14 phút trước',
        avatarColor: 'bg-blue-100 text-blue-600'
    },
    {
        user: 'Sarah Connor',
        action: 'đã xuất bản',
        target: 'Vật lý II',
        time: '1 giờ trước',
        avatarColor: 'bg-green-100 text-green-600'
    },
    {
        user: 'Admin',
        action: 'đã thêm giáo viên mới',
        target: 'Giáo sư Xavier',
        time: '4 giờ trước',
        avatarColor: 'bg-orange-100 text-orange-600'
    }
];

export default function ManagerDashboard() {
    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in font-sans">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Tổng quan Học tập</h1>
                    <p className="text-gray-500 font-medium">Chuẩn hóa chương trình giảng dạy và giám sát các chỉ số tiến độ của trường..</p>
                </div>

                <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all shadow-sm">
                    <Download size={18} />
                    Xuất Báo cáo
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3.5 rounded-2xl ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                {stat.change} ~
                            </span>
                        </div>
                        <h3 className="text-sm font-bold text-gray-500 mb-1">{stat.label}</h3>
                        <p className="text-4xl font-extrabold text-gray-900 tracking-tight">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Left Column: Subject Overview */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex flex-row justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Tổng quan Môn học</h2>
                            <button className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline">Xem Tất cả</button>
                        </div>

                        <div className="p-2">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tên Môn học</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Danh mục</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Chỉnh sửa lần cuối</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {subjects.map((subject, index) => (
                                        <tr key={index} className="group hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${subject.color}`}>
                                                        {subject.initial}
                                                    </div>
                                                    <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{subject.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-sm font-medium text-gray-500">{subject.category}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${subject.status === 'Đã xuất bản'
                                                    ? 'bg-green-50 text-green-700 border-green-100'
                                                    : 'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}>
                                                    {subject.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className="text-sm font-medium text-gray-400">{subject.lastModified}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Quick Actions & Activity */}
                <div className="space-y-8">

                    {/* Quick Actions */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Tác vụ nhanh</h2>
                        <div className="space-y-4">
                            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md border border-gray-100 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                                        <PlusCircle size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Tạo Môn học</p>
                                        <p className="text-xs text-gray-500 font-medium">Định nghĩa một đơn vị học thuật mới</p>
                                    </div>
                                </div>
                                <ArrowRight size={18} className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                            </button>

                            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md border border-gray-100 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 group-hover:scale-110 transition-transform">
                                        <FileUp size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Nhập Giáo trình</p>
                                        <p className="text-xs text-gray-500 font-medium">Tải lên tệp PDF hoặc DOCX</p>
                                    </div>
                                </div>
                                <ArrowRight size={18} className="text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                            </button>

                            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md border border-gray-100 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-orange-100 text-orange-600 group-hover:scale-110 transition-transform">
                                        <UserPlus size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">Phân công Giáo viên</p>
                                        <p className="text-xs text-gray-500 font-medium">Quản lý quyền sở hữu môn học</p>
                                    </div>
                                </div>
                                <ArrowRight size={18} className="text-gray-300 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                            </button>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Hoạt động gần đây</h2>
                            <button className="text-xs font-bold text-gray-400 hover:text-gray-600">Xóa tất cả</button>
                        </div>

                        <div className="space-y-6 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-gray-100"></div>

                            {activities.map((activity, index) => (
                                <div key={index} className="relative pl-12 group">
                                    <div className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white ${activity.avatarColor} shadow-sm z-10`}>
                                        <Activity size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-900 leading-snug">
                                            <span className="font-bold">{activity.user}</span> <span className="text-gray-600">{activity.action}</span> <span className="font-bold text-blue-600 cursor-pointer hover:underline">{activity.target}</span>
                                        </p>
                                        <p className="text-xs text-gray-400 font-medium mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
