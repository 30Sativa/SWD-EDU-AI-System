import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Filter,
    MoreHorizontal,
    Eye,
    FileText,
    Trash2,
    Mail,
    ArrowUpRight,
    Users,
    Clock,
    CheckCircle2,
    ArrowLeft
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getClassDetail } from '../../api/classApi';
import { Spin } from 'antd';

// Lấy danh sách học sinh từ chi tiết lớp (BE có thể trả students / enrollments / members)
function extractStudents(classDetail) {
    if (!classDetail) return [];
    const raw = classDetail.students ?? classDetail.enrollments ?? classDetail.members ?? classDetail.studentList ?? [];
    return Array.isArray(raw) ? raw : [];
}

// Avatar initials + màu nhất quán theo id
function getAvatarStyle(id) {
    const palettes = [
        'bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-700',
        'bg-gradient-to-tr from-emerald-200 to-emerald-100 text-emerald-700',
        'bg-gradient-to-tr from-violet-200 to-violet-100 text-violet-700',
        'bg-gradient-to-tr from-amber-200 to-amber-100 text-amber-700',
        'bg-gradient-to-tr from-rose-200 to-rose-100 text-rose-700',
    ];
    return palettes[Math.abs(String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % palettes.length];
}

export default function ClassStudentList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('All Classes');
    const [classDetail, setClassDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { classId } = useParams();

    // Flow 26: GET /api/manager/classes/{id} — chi tiết lớp (có thể kèm danh sách HS)
    useEffect(() => {
        if (!classId) {
            setLoading(false);
            return;
        }
        const fetchClass = async () => {
            try {
                setLoading(true);
                const res = await getClassDetail(classId);
                const data = res?.data ?? res;
                setClassDetail(data);
            } catch (err) {
                console.error('Lỗi tải chi tiết lớp:', err);
                setClassDetail(null);
            } finally {
                setLoading(false);
            }
        };
        fetchClass();
    }, [classId]);

    const rawStudents = extractStudents(classDetail);
    const students = rawStudents.map(s => ({
        id: s.id ?? s.userId ?? s.studentId,
        name: s.fullName ?? s.name ?? s.userName ?? s.email ?? '—',
        email: s.email ?? '',
        avatar: (s.fullName ?? s.name ?? s.userName ?? s.email ?? '?').slice(0, 2).toUpperCase(),
        avatarBg: getAvatarStyle(s.id ?? s.userId ?? s.studentId ?? 0),
        class: s.className ?? classDetail?.name ?? '—',
        progress: s.progress ?? s.completionRate ?? 0,
        lastActive: s.lastActiveAt ?? s.lastActive ?? '—',
        status: (s.isActive !== false && s.status !== 'Inactive') ? 'Active' : 'Inactive',
    })).filter(s => s.id);
    const filteredStudents = searchTerm.trim()
        ? students.filter(s => [s.name, s.email].some(v => String(v).toLowerCase().includes(searchTerm.toLowerCase())))
        : students;

    // Hàm lấy style cho progress bar (màu + hiệu ứng glow)
    const getProgressStyles = (value) => {
        if (value >= 90) return { bg: 'bg-emerald-500', shadow: 'shadow-[0_0_10px_rgba(16,185,129,0.5)]' };
        if (value >= 70) return { bg: 'bg-indigo-500', shadow: 'shadow-[0_0_10px_rgba(99,102,241,0.5)]' };
        if (value >= 50) return { bg: 'bg-violet-500', shadow: 'shadow-[0_0_10px_rgba(139,92,246,0.5)]' };
        return { bg: 'bg-amber-500', shadow: 'shadow-[0_0_10px_rgba(245,158,11,0.5)]' };
    };

    const getStatusStyle = (status) => {
        if (status === 'Active') return 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-emerald-500/20';
        return 'bg-slate-50 text-slate-500 border-slate-200/60 ring-slate-500/20';
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-8 font-sans text-slate-900">
            {/* Background trang trí nhẹ */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent pointer-events-none" />

            <div className="relative max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate('/dashboard/teacher/classes')}
                            className="group p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all shadow-sm active:scale-95"
                        >
                            <ArrowLeft size={20} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Học sinh</h1>
                            <div className="flex items-center gap-2 mt-1.5 text-sm font-medium text-slate-500">
                                <span>Quản lý lớp học</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-md border border-indigo-100">
                                    {classDetail?.name ?? classDetail?.title ?? `Lớp #${classId || '—'}`}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold text-sm shadow-sm active:scale-95">
                            <FileText size={18} />
                            <span>Xuất báo cáo</span>
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-semibold text-sm shadow-md active:scale-95 hover:-translate-y-0.5">
                            <Plus size={20} />
                            <span>Thêm học sinh</span>
                        </button>
                    </div>
                </div>

                {/* Quick Stats - từ GET /api/manager/classes/{id} */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                        { label: 'Tổng học sinh', value: String(students.length), change: '—', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                        { label: 'Đang hoạt động', value: String(students.filter(s => s.status === 'Active').length), change: '—', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                        { label: 'Tiến độ TB', value: students.length ? `${Math.round(students.reduce((a, s) => a + s.progress, 0) / students.length)}%` : '—', change: '—', icon: Clock, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
                    ].map((stat, index) => (
                        <div key={index} className={`bg-white p-6 rounded-2xl border ${stat.border} shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_25px_-4px_rgba(0,0,0,0.1)] transition-all group`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide text-[11px]">{stat.label}</p>
                                    <h3 className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                            {stat.change !== '—' && (
                                <div className="mt-4 flex items-center text-sm font-medium">
                                    <span className={`flex items-center ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'} bg-slate-50 px-2 py-0.5 rounded-full`}>
                                        {stat.change} <ArrowUpRight size={14} className={`ml-0.5 ${stat.change.startsWith('-') ? 'rotate-90' : ''}`} />
                                    </span>
                                    <span className="text-slate-400 ml-2">so với tháng trước</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Spin size="large" />
                    </div>
                ) : (
                <div className="space-y-4">
                    {/* Toolbar / Filters */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-sm p-2 rounded-2xl border border-white/20">
                        <div className="relative flex-1 max-w-md group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Search className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, email..."
                                className="block w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl leading-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3">
                            <div className="relative">
                                <select
                                    className="pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-sm appearance-none hover:bg-slate-50 transition-colors"
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                >
                                    <option>Tất cả các lớp</option>
                                    <option>Morning Session</option>
                                    <option>Afternoon Session</option>
                                </select>
                                <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>

                            <button className="px-3.5 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Table View - Style Card Row */}
                    <div className="overflow-x-auto pb-4">
                        <table className="w-full border-separate border-spacing-y-3">
                            <thead>
                                <tr className="text-left">
                                    <th className="py-2 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Học sinh</th>
                                    <th className="py-2 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Lớp</th>
                                    <th className="py-2 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/4">Tiến độ</th>
                                    <th className="py-2 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                                    <th className="py-2 px-6 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student) => {
                                    const progressStyle = getProgressStyles(student.progress);
                                    return (
                                        <tr
                                            key={student.id}
                                            className="group bg-white rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] hover:translate-y-[-2px] transition-all duration-300"
                                        >
                                            <td className="py-4 px-6 rounded-l-2xl border-l border-y border-transparent group-hover:border-indigo-50">
                                                <div className="flex items-center gap-4">
                                                    <div className={`relative w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${student.avatarBg}`}>
                                                        {student.avatar}
                                                        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full ${student.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{student.name}</div>
                                                        <div className="text-xs font-medium text-slate-500">{student.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 border-y border-transparent group-hover:border-indigo-50">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-600 border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                    {student.class}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 border-y border-transparent group-hover:border-indigo-50">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="font-bold text-slate-700">{student.progress}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${progressStyle.bg} ${progressStyle.shadow}`}
                                                            style={{ width: `${student.progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 border-y border-transparent group-hover:border-indigo-50">
                                                <div className="flex flex-col items-start gap-1">
                                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ring-1 ring-inset ${getStatusStyle(student.status)}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                        {student.status === 'Active' ? 'Đang hoạt động' : 'Ngoại tuyến'}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 pl-1 font-medium flex items-center gap-1">
                                                        <Clock size={10} /> {student.lastActive}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 rounded-r-2xl text-right border-r border-y border-transparent group-hover:border-indigo-50">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                                                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Xem chi tiết">
                                                        <Eye size={18} strokeWidth={2} />
                                                    </button>
                                                    <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Gửi email">
                                                        <Mail size={18} strokeWidth={2} />
                                                    </button>
                                                    <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                                    <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Xóa">
                                                        <Trash2 size={18} strokeWidth={2} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {filteredStudents.length === 0 && (
                        <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
                            {students.length === 0
                                ? (classDetail ? 'Lớp chưa có học sinh. Dùng "Thêm học sinh" khi BE hỗ trợ API.' : 'Không tải được thông tin lớp.')
                                : 'Không có kết quả tìm kiếm.'}
                        </div>
                    )}
                    {/* Pagination */}
                    <div className="flex items-center justify-between px-2 pt-2">
                        <p className="text-sm text-slate-500">
                            Hiển thị <span className="font-bold text-slate-900">{filteredStudents.length}</span> / <span className="font-bold text-slate-900">{students.length}</span> kết quả
                        </p>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
}