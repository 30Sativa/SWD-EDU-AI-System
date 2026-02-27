import React, { useMemo, useState } from 'react';
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

const PAGE_SIZE = 6;

export default function CoursesList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [selectedGrade, setSelectedGrade] = useState('Tất cả');
    const [selectedSubject, setSelectedSubject] = useState('Tất cả');
    const [selectedStatus, setSelectedStatus] = useState('Tất cả');
    const [selectedType, setSelectedType] = useState('Tất cả');
    const [currentPage, setCurrentPage] = useState(1);

    const courses = useMemo(
        () => [
            {
                id: 'math-11-advanced',
                title: 'Toán 11 - Hàm số bậc hai và ứng dụng thực tế',
                instructor: 'Nguyễn Văn Hùng',
                grade: 'Lớp 11',
                subject: 'Toán',
                status: 'Đang học',
                type: 'Chính khóa',
                progress: 75,
                lessons: 32,
                totalHours: 45,
                students: 40,
                rating: 4.8,
                nextLesson: 'Ứng dụng hàm số vào bài toán thực tế',
                image:
                    'https://images.unsplash.com/photo-1516031190212-da133013de50?auto=format&fit=crop&q=80&w=900',
                badge: 'HOT',
            },
            {
                id: 'vietnamese-11',
                title: 'Ngữ văn 11 - Văn học Việt Nam hiện đại',
                instructor: 'Phạm Thị Lan',
                grade: 'Lớp 11',
                subject: 'Ngữ văn',
                status: 'Đang học',
                type: 'Chính khóa',
                progress: 60,
                lessons: 28,
                totalHours: 40,
                students: 36,
                rating: 4.7,
                nextLesson: 'Văn bản nghị luận hiện đại',
                image:
                    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=900',
                badge: 'MỚI',
            },
            {
                id: 'physics-11',
                title: 'Vật lý 11 - Điện học & Quang học',
                instructor: 'Trần Thị Mai',
                grade: 'Lớp 11',
                subject: 'Vật lý',
                status: 'Chưa bắt đầu',
                type: 'Trải nghiệm',
                progress: 0,
                lessons: 26,
                totalHours: 38,
                students: 28,
                rating: 4.6,
                nextLesson: 'Điện trường & Cường độ điện trường',
                image:
                    'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&q=80&w=900',
                badge: 'TRẢI NGHIỆM',
            },
            {
                id: 'chem-11',
                title: 'Hóa học 11 - Hidrocacbon & Dẫn xuất',
                instructor: 'Lê Văn Lâm',
                grade: 'Lớp 11',
                subject: 'Hóa học',
                status: 'Đang học',
                type: 'Chính khóa',
                progress: 45,
                lessons: 30,
                totalHours: 42,
                students: 34,
                rating: 4.5,
                nextLesson: 'Ankan & Đồng đẳng',
                image:
                    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=900',
                badge: 'PHÙ HỢP CHƯƠNG TRÌNH',
            },
            {
                id: 'it-python-11',
                title: 'Tin học 11 - Lập trình Python cơ bản',
                instructor: 'Nguyễn Minh Đức',
                grade: 'Lớp 11',
                subject: 'Tin học',
                status: 'Đang học',
                type: 'Trải nghiệm',
                progress: 30,
                lessons: 24,
                totalHours: 35,
                students: 52,
                rating: 4.9,
                nextLesson: 'Cấu trúc rẽ nhánh & vòng lặp',
                image:
                    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=900',
                badge: 'HOT',
            },
            {
                id: 'english-11',
                title: 'Tiếng Anh 11 - Ngữ pháp trọng tâm & Từ vựng',
                instructor: 'David Nguyen',
                grade: 'Lớp 11',
                subject: 'Tiếng Anh',
                status: 'Đã hoàn thành',
                type: 'Chính khóa',
                progress: 100,
                lessons: 36,
                totalHours: 48,
                students: 40,
                rating: 4.9,
                nextLesson: 'Ôn tập tổng hợp',
                image:
                    'https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&q=80&w=900',
                badge: 'ĐÃ HOÀN THÀNH',
            },
        ],
        []
    );

    const grades = ['Tất cả', 'Lớp 10', 'Lớp 11', 'Lớp 12'];
    const subjects = ['Tất cả', 'Toán', 'Ngữ văn', 'Vật lý', 'Hóa học', 'Tin học', 'Tiếng Anh'];
    const statuses = ['Tất cả', 'Đang học', 'Chưa bắt đầu', 'Đã hoàn thành'];
    const types = ['Tất cả', 'Chính khóa', 'Trải nghiệm'];

    const filteredCourses = useMemo(() => {
        const base = courses
            .filter((course) => {
                const matchesSearch =
                    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesGrade = selectedGrade === 'Tất cả' || course.grade === selectedGrade;
                const matchesSubject = selectedSubject === 'Tất cả' || course.subject === selectedSubject;
                const matchesStatus = selectedStatus === 'Tất cả' || course.status === selectedStatus;
                const matchesType = selectedType === 'Tất cả' || course.type === selectedType;

                return matchesSearch && matchesGrade && matchesSubject && matchesStatus && matchesType;
            })
            .sort((a, b) => {
                if (sortBy === 'name') return a.title.localeCompare(b.title);
                if (sortBy === 'progress') return b.progress - a.progress;
                return 0;
            });

        return base;
    }, [courses, searchTerm, selectedGrade, selectedSubject, selectedStatus, selectedType, sortBy]);

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
        <div className="px-6 py-6 md:px-8 md:py-8 max-w-7xl mx-auto min-h-screen font-sans">
            <div className="mb-6 md:mb-8 flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Khóa học của bạn
                </h1>
                <p className="text-sm md:text-base text-gray-500">
                    Tìm thấy các khóa học phù hợp nhất với bạn, sắp xếp theo chương trình THPT.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar filter */}
                <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-[0.18em]">
                                Bộ lọc
                            </h2>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="text-xs font-medium text-blue-600 hover:text-blue-700"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>

                        <div className="space-y-5 text-sm">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-gray-900">Khối lớp</span>
                                    <span className="text-[11px] text-gray-400">Chọn 1</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {grades.map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => handleFilterChange(setSelectedGrade)(item)}
                                            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                                                selectedGrade === item
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-gray-100" />

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-gray-900">Môn học</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {subjects.map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => handleFilterChange(setSelectedSubject)(item)}
                                            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                                                selectedSubject === item
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-gray-100" />

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-gray-900">Trạng thái</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {statuses.map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => handleFilterChange(setSelectedStatus)(item)}
                                            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                                                selectedStatus === item
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-gray-100" />

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-gray-900">Hình thức</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {types.map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => handleFilterChange(setSelectedType)(item)}
                                            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                                                selectedType === item
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600'
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
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 mb-4">
                        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                            <div className="relative flex-1 max-w-xl group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm khóa học, môn học, giáo viên..."
                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 text-sm shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="relative min-w-[190px]">
                                    <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    <select
                                        className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer text-xs md:text-sm font-medium"
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
                                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" size={14} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Courses grid */}
                    {paginatedCourses.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                                {paginatedCourses.map((course) => (
                                    <Link
                                        key={course.id}
                                        to={`/dashboard/student/courses/${course.id}`}
                                        className="group"
                                    >
                                        <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-[0_18px_50px_rgba(15,23,42,0.14)] hover:border-blue-200 transition-all duration-300 flex flex-col h-full">
                                            <div className="relative h-40 md:h-44 lg:h-48 overflow-hidden">
                                                <img
                                                    src={course.image}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                                <div className="absolute top-3 left-3 flex items-center gap-2">
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.14em] bg-blue-600 text-white shadow-sm">
                                                        {course.grade}
                                                    </span>
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.14em] bg-white/95 text-blue-700 shadow-sm">
                                                        {course.subject}
                                                    </span>
                                                </div>
                                                {course.badge && (
                                                    <div className="absolute top-3 right-3">
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.15em] bg-orange-500 text-white shadow-sm">
                                                            {course.badge}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 flex flex-col p-4 md:p-5 gap-3">
                                                <div className="space-y-1">
                                                    <h3 className="text-sm md:text-base font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                        {course.title}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 flex items-center gap-2">
                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-[10px] font-semibold text-gray-600">
                                                            GV
                                                        </span>
                                                        <span>{course.instructor}</span>
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 rounded-xl bg-gray-50/80 border border-gray-100 px-3 py-3 text-[11px]">
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 mb-0.5">
                                                            Thời lượng
                                                        </p>
                                                        <p className="font-semibold text-gray-900 flex items-center gap-1">
                                                            <Clock size={13} className="text-gray-400" /> {course.totalHours}h
                                                        </p>
                                                    </div>
                                                    <div className="border-l border-gray-200 pl-2">
                                                        <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 mb-0.5">
                                                            Sĩ số
                                                        </p>
                                                        <p className="font-semibold text-gray-900 flex items-center gap-1">
                                                            <Users size={13} className="text-gray-400" /> {course.students}
                                                        </p>
                                                    </div>
                                                    <div className="border-l border-gray-200 pl-2">
                                                        <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 mb-0.5">
                                                            Đánh giá
                                                        </p>
                                                        <p className="font-semibold text-gray-900 flex items-center gap-1">
                                                            <Star size={13} className="text-yellow-500 fill-yellow-500" />{' '}
                                                            {course.rating}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-[11px]">
                                                        <span className="uppercase tracking-[0.16em] text-gray-400 font-semibold">
                                                            Tiến độ
                                                        </span>
                                                        <span className="font-semibold text-blue-600">
                                                            {course.progress}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-700 ease-out ${
                                                                course.progress >= 80
                                                                    ? 'bg-emerald-500'
                                                                    : course.progress >= 40
                                                                    ? 'bg-blue-500'
                                                                    : 'bg-amber-500'
                                                            }`}
                                                            style={{ width: `${course.progress}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-2 mt-auto flex items-center justify-between border-t border-gray-100">
                                                    <p className="text-[11px] text-gray-500">
                                                        Tiếp theo:{' '}
                                                        <span className="font-medium text-gray-800">
                                                            {course.nextLesson}
                                                        </span>
                                                    </p>
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:underline">
                                                        Vào học
                                                        <ChevronRight size={14} />
                                                    </span>
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => handleChangePage(safeCurrentPage - 1)}
                                    disabled={safeCurrentPage === 1}
                                    className="px-3 py-2 rounded-full border border-gray-200 text-xs font-medium text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
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
                                            className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                                                isActive
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
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
                                    className="px-3 py-2 rounded-full border border-gray-200 text-xs font-medium text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Sau
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="min-h-[360px] flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Search className="text-gray-300" size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Không tìm thấy khóa học</h3>
                            <p className="text-sm text-gray-500 max-w-sm text-center mb-5">
                                Hãy thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh lại bộ lọc để tìm được khóa học phù hợp
                                với bạn.
                            </p>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs md:text-sm font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all active:scale-95"
                            >
                                Xóa tất cả bộ lọc
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
