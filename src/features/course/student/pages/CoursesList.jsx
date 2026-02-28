import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    Clock,
    Users,
    Star,
    ChevronRight,
    Search,
    Filter,
    ArrowUpDown,
} from 'lucide-react';
import { getStudentMyCourses, enrollCourse } from '../../api/courseApi';
import { getSubjects } from '../../../subject/api/subjectApi';
import { getGradeLevels } from '../../../grade/api/gradeApi';
import axiosClient from '../../../../lib/axiosClient';
import { Spin, message } from 'antd';

const PAGE_SIZE = 6;

export default function CoursesList() {
    const [activeTab, setActiveTab] = useState('my'); // 'my' hoặc 'discover'
    const [allClasses, setAllClasses] = useState([]);
    const [enrollingId, setEnrollingId] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [selectedGrade, setSelectedGrade] = useState('Tất cả');
    const [selectedSubject, setSelectedSubject] = useState('Tất cả');
    const [selectedStatus, setSelectedStatus] = useState('Tất cả');
    const [selectedType, setSelectedType] = useState('Tất cả');
    const [currentPage, setCurrentPage] = useState(1);

    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState(['Tất cả']);
    const [grades, setGrades] = useState(['Tất cả']);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);

    const statuses = ['Tất cả', 'Đang học', 'Chưa bắt đầu', 'Đã hoàn thành'];
    const types = ['Tất cả', 'Chính khóa', 'Trải nghiệm'];

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [subjRes, gradeRes] = await Promise.all([
                    getSubjects(),
                    getGradeLevels()
                ]);

                const subjData = subjRes?.data || subjRes;
                const gradeData = gradeRes?.data || gradeRes;

                if (Array.isArray(subjData)) {
                    setSubjects(['Tất cả', ...subjData.map(s => s.name)]);
                }
                if (Array.isArray(gradeData)) {
                    setGrades(['Tất cả', ...gradeData.map(g => g.name)]);
                }
            } catch (error) {
                console.error("Lỗi khi tải bộ lọc:", error);
            }
        };
        fetchFilters();
    }, []);

    const fetchMyCourses = async () => {
        setLoading(true);
        try {
            const res = await getStudentMyCourses({
                page: currentPage,
                limit: 100
            });
            const data = res?.data || res;
            const items = data.items || data || [];

            const mappedItems = items.map(c => ({
                id: c.id,
                title: c.title || c.name || 'Khóa học',
                instructor: c.teacherName || c.instructor || 'Giảng viên',
                grade: c.level || c.gradeLevelName || 'Lớp 11',
                subject: c.subjectName || 'Môn học',
                status: c.status || (c.progress === 100 ? 'Đã hoàn thành' : c.progress > 0 ? 'Đang học' : 'Chưa bắt đầu'),
                type: c.type || 'Chính khóa',
                progress: c.progress || 0,
                lessons: c.totalLessons || 0,
                totalHours: c.totalDuration ? Math.floor(c.totalDuration / 60) : 0,
                students: c.totalStudents || 0,
                rating: c.rating || 4.5,
                nextLesson: c.nextLessonName || 'Bài giảng tiếp theo',
                image: c.thumbnail || c.thumbnailUrl || 'https://images.unsplash.com/photo-1516031190212-da133013de50?auto=format&fit=crop&q=80&w=900',
                badge: c.progress === 100 ? 'Đã hoàn thành' : c.progress > 80 ? 'HOT' : null
            }));

            setCourses(mappedItems);
            setTotalItems(data.totalItems || mappedItems.length);
        } catch (error) {
            console.error("Lỗi khi tải danh sách khóa học của tôi:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllClasses = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/api/manager/classes');
            const data = res?.data || res;
            const items = data.items || data || [];

            const mappedItems = items.map(c => ({
                id: c.id,
                title: c.title || c.name || 'Khóa học',
                instructor: c.teacherName || 'Giảng viên',
                grade: c.gradeLevelName || 'Lớp 11',
                subject: c.subjectName || 'Môn học',
                status: 'Có sẵn',
                type: 'Chính khóa',
                progress: 0,
                lessons: 20,
                totalHours: 40,
                students: c.currentStudents || 0,
                rating: 4.8,
                nextLesson: 'Vào học để bắt đầu',
                image: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&q=80&w=900',
                badge: 'KHÁM PHÁ',
                isAvailable: true
            }));

            setAllClasses(mappedItems);
        } catch (error) {
            console.error("Lỗi khi tải danh sách khám phá:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'my') {
            fetchMyCourses();
        } else {
            fetchAllClasses();
        }
    }, [currentPage, activeTab]);

    const handleEnroll = async (e, courseId) => {
        e.preventDefault();
        e.stopPropagation();
        setEnrollingId(courseId);
        try {
            await enrollCourse(courseId);
            message.success("Đăng ký khóa học thành công!");
            setActiveTab('my');
        } catch (error) {
            console.error("Lỗi đăng ký:", error);
            message.error("Đăng ký thất bại. Vui lòng thử lại.");
        } finally {
            setEnrollingId(null);
        }
    };

    const displayCourses = activeTab === 'my' ? courses : allClasses;

    const filteredCourses = useMemo(() => {
        return displayCourses
            .filter((course) => {
                const matchesSearch =
                    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesGrade = selectedGrade === 'Tất cả' || course.grade === selectedGrade;
                const matchesSubject = selectedSubject === 'Tất cả' || course.subject === selectedSubject;

                // My tab filters
                const matchesStatus = selectedStatus === 'Tất cả' || course.status === selectedStatus;
                const matchesType = selectedType === 'Tất cả' || course.type === selectedType;

                if (activeTab === 'my') {
                    return matchesSearch && matchesGrade && matchesSubject && matchesStatus && matchesType;
                }
                return matchesSearch && matchesGrade && matchesSubject;
            })
            .sort((a, b) => {
                if (sortBy === 'name') return a.title.localeCompare(b.title);
                if (sortBy === 'progress') return b.progress - a.progress;
                return 0;
            });
    }, [displayCourses, searchTerm, selectedGrade, selectedSubject, selectedStatus, selectedType, sortBy, activeTab]);

    const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedCourses = filteredCourses.slice(
        (safeCurrentPage - 1) * PAGE_SIZE,
        safeCurrentPage * PAGE_SIZE
    );

    const handleChangePage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedGrade('Tất cả');
        setSelectedSubject('Tất cả');
        setSelectedStatus('Tất cả');
        setSelectedType('Tất cả');
        setSortBy('default');
        setCurrentPage(1);
    };

    const handleFilterChange = (setter) => (value) => {
        setter(value);
        setCurrentPage(1);
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">
                            Học tập <span className="text-[#0463ca]">& Khám phá</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">
                            Khám phá lộ trình học tập tối ưu được thiết kế riêng cho chương trình THPT.
                        </p>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
                        <button
                            onClick={() => setActiveTab('my')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'my'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Khóa học của tôi
                        </button>
                        <button
                            onClick={() => setActiveTab('discover')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'discover'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Khám phá mới
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar filter */}
                    <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0">
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Bộ lọc
                                </h2>
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                                >
                                    Xóa hết
                                </button>
                            </div>

                            <div className="space-y-5 text-sm">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Khối lớp</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {grades.map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => handleFilterChange(setSelectedGrade)(item)}
                                                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${selectedGrade === item
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                                                    }`}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100" />

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-slate-900">Môn học</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {subjects.map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => handleFilterChange(setSelectedSubject)(item)}
                                                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${selectedSubject === item
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                                                    }`}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100" />

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-slate-900">Trạng thái</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {statuses.map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => handleFilterChange(setSelectedStatus)(item)}
                                                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${selectedStatus === item
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                                                    }`}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100" />

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-slate-900">Hình thức</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {types.map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => handleFilterChange(setSelectedType)(item)}
                                                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${selectedType === item
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                                                    }`}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main content */}
                    <main className="flex-1">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-5 mb-6">
                            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                                <div className="relative flex-1 max-w-xl group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm khóa học, môn học, giáo viên..."
                                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 text-sm shadow-sm"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="relative min-w-[200px]">
                                        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                        <select
                                            className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer text-xs font-semibold text-slate-700"
                                            value={sortBy}
                                            onChange={(e) => {
                                                setSortBy(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <option value="default">Sắp xếp: Phù hợp chương trình</option>
                                            <option value="name">Tên (A-Z)</option>
                                            <option value="progress">Tiến độ cao nhất</option>
                                        </select>
                                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Courses grid */}
                        {paginatedCourses.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {paginatedCourses.map((course) => (
                                        <Link
                                            key={course.id}
                                            to={`/dashboard/student/courses/${course.id}`}
                                            className="group"
                                        >
                                            <article className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm h-full flex flex-col">
                                                <div className="relative h-40 md:h-44 lg:h-48 overflow-hidden">
                                                    <img
                                                        src={course.image}
                                                        alt={course.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute top-3 left-3 flex items-center gap-2">
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-blue-600 text-white shadow-sm">
                                                            {course.grade}
                                                        </span>
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/95 text-blue-700 shadow-sm">
                                                            {course.subject}
                                                        </span>
                                                    </div>
                                                    {course.badge && (
                                                        <div className="absolute top-3 right-3">
                                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-orange-500 text-white shadow-sm">
                                                                {course.badge}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 flex flex-col p-4 md:p-5 gap-3">
                                                    <div className="space-y-1">
                                                        <h3 className="text-sm md:text-base font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                            {course.title}
                                                        </h3>
                                                        <p className="text-xs text-slate-500 flex items-center gap-2">
                                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">
                                                                GV
                                                            </span>
                                                            <span>{course.instructor}</span>
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50/80 border border-slate-100 px-3 py-3 text-[11px]">
                                                        <div>
                                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">
                                                                Thời lượng
                                                            </p>
                                                            <p className="font-semibold text-slate-900 flex items-center gap-1">
                                                                <Clock size={13} className="text-slate-400" /> {course.totalHours}h
                                                            </p>
                                                        </div>
                                                        <div className="border-l border-slate-200 pl-2">
                                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">
                                                                Sĩ số
                                                            </p>
                                                            <p className="font-semibold text-slate-900 flex items-center gap-1">
                                                                <Users size={13} className="text-slate-400" /> {course.students}
                                                            </p>
                                                        </div>
                                                        <div className="border-l border-slate-200 pl-2">
                                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">
                                                                Đánh giá
                                                            </p>
                                                            <p className="font-semibold text-slate-900 flex items-center gap-1">
                                                                <Star size={12} className="text-amber-400 fill-amber-400" />{' '}
                                                                {course.rating}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between text-[11px]">
                                                            <span className="uppercase tracking-wider text-slate-400 font-semibold">
                                                                Tiến độ
                                                            </span>
                                                            <span className="font-semibold text-blue-600">
                                                                {course.progress}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-700 ease-out ${course.progress >= 80
                                                                    ? 'bg-emerald-500'
                                                                    : course.progress >= 40
                                                                        ? 'bg-blue-500'
                                                                        : 'bg-amber-500'
                                                                    }`}
                                                                style={{ width: `${course.progress}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="pt-2 mt-auto flex items-center justify-between border-t border-slate-100">
                                                        <p className="text-[11px] text-slate-500">
                                                            {course.isAvailable ? 'Sẵn sàng bắt đầu' : `Tiếp theo: ${course.nextLesson}`}
                                                        </p>
                                                        {course.isAvailable ? (
                                                            <button
                                                                onClick={(e) => handleEnroll(e, course.id)}
                                                                disabled={enrollingId === course.id}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                                                            >
                                                                {enrollingId === course.id ? <Spin size="small" /> : 'Đăng ký ngay'}
                                                            </button>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:underline">
                                                                Vào học
                                                                <ChevronRight size={14} />
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </article>
                                        </Link>
                                    ))}
                                </div>

                                {/* Pagination */}
                                <div className="flex items-center justify-center gap-2 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => handleChangePage(safeCurrentPage - 1)}
                                        disabled={safeCurrentPage === 1}
                                        className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                                    >
                                        Trước
                                    </button>
                                    {Array.from({ length: totalPages }).map((_, index) => {
                                        const pageNumber = index + 1;
                                        const isActive = pageNumber === safeCurrentPage;
                                        return (
                                            <button
                                                key={pageNumber}
                                                type="button"
                                                onClick={() => handleChangePage(pageNumber)}
                                                className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${isActive
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}
                                    <button
                                        type="button"
                                        onClick={() => handleChangePage(safeCurrentPage + 1)}
                                        disabled={safeCurrentPage === totalPages}
                                        className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="min-h-[360px] flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <Search className="text-slate-300" size={32} />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">Không tìm thấy khóa học</h3>
                                <p className="text-sm text-slate-500 max-w-sm text-center mb-5">
                                    Hãy thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh lại bộ lọc để tìm được khóa học phù hợp
                                    với bạn.
                                </p>
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="px-5 py-2.5 bg-[#0487e2] text-white font-semibold rounded-lg hover:bg-[#0463ca] transition-all"
                                >
                                    Xóa tất cả bộ lọc
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
