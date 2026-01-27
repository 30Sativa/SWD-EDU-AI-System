import React from 'react';

const ClassManagement = () => {
    const classes = [
        {
            id: 1,
            title: 'Toán học 101',
            subtitle: 'Đại số căn bản',
            students: 24,
            teacher: 'TS. Jane Smith',
            startDate: '01/09/2024',
            status: 'Hoạt động',
        },
        {
            id: 2,
            title: 'Vật lý 201',
            subtitle: 'Cơ học & Nhiệt động lực học',
            students: 18,
            teacher: 'GS. Robert Chen',
            startDate: '05/09/2024',
            status: 'Hoạt động',
        },
        {
            id: 3,
            title: 'Hóa học 150',
            subtitle: 'Hóa hữu cơ cơ bản',
            students: 21,
            teacher: 'TS. Emily Davis',
            startDate: '28/08/2024',
            status: 'Hoạt động',
        },
        {
            id: 4,
            title: 'Sinh học 301',
            subtitle: 'Sinh học tế bào & Di truyền',
            students: 27,
            teacher: 'TS. Michael Brown',
            startDate: '15/01/2024',
            status: 'Đã lưu trữ',
        },
    ];

    return (
        <div className="flex-1 bg-gray-50 min-h-screen font-sans text-slate-800">
            <div className="max-w-7xl mx-auto p-8">

                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Quản lý lớp học</h1>
                        <p className="text-slate-500 mt-1">Chào mừng trở lại! Dưới đây là tình hình hôm nay.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {classes.map((cls) => (
                        <div
                            key={cls.id}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-slate-900">{cls.title}</h3>
                                <StatusBadge status={cls.status} />
                            </div>
                            <p className="text-slate-500 text-sm mb-6">{cls.subtitle}</p>

                            <div className="space-y-3 mb-6 flex-1">
                                <div className="flex justify-between text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                    <span className="text-slate-500">Học viên:</span>
                                    <span className="font-semibold text-slate-700">{cls.students}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                    <span className="text-slate-500">Giảng viên:</span>
                                    <span className="font-semibold text-slate-700">{cls.teacher}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                    <span className="text-slate-500">Ngày bắt đầu:</span>
                                    <span className="font-semibold text-slate-700">{cls.startDate}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-50">
                                <button
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${cls.status === 'Hoạt động'
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                                            : 'bg-white border border-gray-200 text-slate-600 hover:bg-gray-50'
                                        }`}
                                >
                                    Quản lý
                                </button>

                                <button className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-gray-50 transition-colors">
                                    Chi tiết
                                </button>

                                <button className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-gray-100 rounded-lg text-xl leading-none pb-2 transition-colors">
                                    &#8942;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center shadow-sm">
                    <p className="text-sm text-slate-500 mb-4 sm:mb-0">
                        Hiển thị <span className="font-semibold text-slate-700">1-6</span> trên <span className="font-semibold text-slate-700">12</span> kết quả
                    </p>

                    <div className="flex items-center gap-2">
                        <PaginationButton disabled>&lt;</PaginationButton>
                        <PaginationButton active>1</PaginationButton>
                        <PaginationButton>2</PaginationButton>
                        <PaginationButton>3</PaginationButton>
                        <PaginationButton>&gt;</PaginationButton>
                    </div>
                </div>

            </div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const isActive = status === 'Hoạt động';
    return (
        <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${isActive
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}
        >
            {status}
        </span>
    );
};

const PaginationButton = ({ children, active, disabled }) => {
    return (
        <button
            disabled={disabled}
            className={`min-w-[36px] h-9 flex items-center justify-center rounded-md text-sm transition-all ${active
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                } ${disabled ? 'opacity-40 cursor-not-allowed hover:bg-transparent' : ''}`}
        >
            {children}
        </button>
    );
};

export default ClassManagement;