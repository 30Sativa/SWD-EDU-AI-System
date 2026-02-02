import { Search, Plus, Filter, LayoutGrid, List, Users, Calendar, MoreVertical, BookOpen, Clock, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClassManagement = () => {
    const navigate = useNavigate();
    const classes = [
        {
            id: 1,
            title: 'Toán học 101',
            subtitle: 'Đại số căn bản',
            students: 24,
            teacher: 'TS. Jane Smith',
            startDate: '01/09/2024',
            status: 'Hoạt động',
            color: 'blue'
        },
        {
            id: 2,
            title: 'Vật lý 201',
            subtitle: 'Cơ học & Nhiệt động lực học',
            students: 18,
            teacher: 'GS. Robert Chen',
            startDate: '05/09/2024',
            status: 'Hoạt động',
            color: 'indigo'
        },
        {
            id: 3,
            title: 'Hóa học 150',
            subtitle: 'Hóa hữu cơ cơ bản',
            students: 21,
            teacher: 'TS. Emily Davis',
            startDate: '28/08/2024',
            status: 'Hoạt động',
            color: 'emerald'
        },
        {
            id: 4,
            title: 'Sinh học 301',
            subtitle: 'Sinh học tế bào & Di truyền',
            students: 27,
            teacher: 'TS. Michael Brown',
            startDate: '15/01/2024',
            status: 'Đã lưu trữ',
            color: 'gray'
        },
    ];

    return (
        <div className="flex-1 bg-gray-50 min-h-screen font-sans text-gray-900 animate-fade-in">
            <div className="max-w-7xl mx-auto p-8">

                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Quản Lý Lớp Học</h1>
                        <p className="text-gray-500 font-medium text-lg">Quản lý các lớp học và theo dõi tình hình giảng dạy.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95">
                        <Plus size={20} />
                        Thêm lớp học
                    </button>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm lớp học, giảng viên..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-sm hover:shadow-md"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                            <Filter size={18} />
                            Bộ lọc
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {classes.map((cls) => (
                        <div
                            key={cls.id}
                            className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col group"
                        >
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cls.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                    cls.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                                        cls.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                                            'bg-gray-100 text-gray-600'
                                    }`}>
                                    <BookOpen size={24} />
                                </div>
                                <StatusBadge status={cls.status} />
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">{cls.title}</h3>
                                <p className="text-gray-500 text-sm font-medium">{cls.subtitle}</p>
                            </div>

                            {/* Card Stats */}
                            <div className="space-y-3 mb-6 flex-1 bg-gray-50/50 rounded-xl p-4 border border-gray-100/50">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Users size={16} />
                                        <span className="font-medium">Học viên</span>
                                    </div>
                                    <span className="font-bold text-gray-900">{cls.students}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Users size={16} />
                                        <span className="font-medium">Giảng viên</span>
                                    </div>
                                    <span className="font-bold text-gray-900 truncate max-w-[120px]">{cls.teacher}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Calendar size={16} />
                                        <span className="font-medium">Bắt đầu</span>
                                    </div>
                                    <span className="font-bold text-gray-900">{cls.startDate}</span>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="flex items-center gap-3 mt-auto pt-2">
                                <button
                                    onClick={() => navigate(`/dashboard/teacher/classes/${cls.id}/students`)}
                                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 ${cls.status === 'Hoạt động'
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/30'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                >
                                    Quản lý
                                </button>



                                <button className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95">
                                    Chi tiết
                                </button>

                                <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center shadow-sm">
                    <p className="text-sm text-gray-500 font-medium mb-4 sm:mb-0">
                        Hiển thị <span className="font-bold text-gray-900">1-6</span> trên <span className="font-bold text-gray-900">12</span> kết quả
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
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isActive
                ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20'
                : 'bg-gray-100 text-gray-500 ring-1 ring-gray-500/10'
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
            className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${active
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                } ${disabled ? 'opacity-40 cursor-not-allowed hover:bg-transparent' : 'active:scale-95'}`}
        >
            {children}
        </button>
    );
};

export default ClassManagement;