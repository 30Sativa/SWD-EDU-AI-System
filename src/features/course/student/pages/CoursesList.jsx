import React, { useState } from 'react';
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
    LayoutGrid,
    List
} from 'lucide-react';

export default function CoursesList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('All');
    const [sortBy, setSortBy] = useState('default');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    const courses = [
        {
            id: 'math-11',
            title: 'Toán Học 11 - 11A1',
            instructor: 'Nguyễn Văn Hùng',
            progress: 75,
            completedLessons: 24,
            totalLessons: 32,
            totalHours: 45,
            students: 40,
            rating: 4.8,
            nextLesson: 'Hai mặt phẳng vuông góc (Tiết 2)',
            color: 'bg-blue-100 text-blue-600',
            tag: 'BAN TỰ NHIÊN',
            tagColor: 'bg-blue-50 text-blue-600 border-blue-200'
        },
        {
            id: 'physics-12',
            title: 'Vật Lý 12 - Ôn Thi THPT',
            instructor: 'Trần Thị Mai',
            progress: 40,
            completedLessons: 12,
            totalLessons: 30,
            totalHours: 60,
            students: 120,
            rating: 4.9,
            nextLesson: 'Mạch dao động LC',
            color: 'bg-indigo-100 text-indigo-600',
            tag: 'ÔN THI ĐẠI HỌC',
            tagColor: 'bg-indigo-50 text-indigo-600 border-indigo-200'
        },
        {
            id: 'chem-10',
            title: 'Hóa Học 10 - Cơ bản',
            instructor: 'Lê Văn Lâm',
            progress: 90,
            completedLessons: 27,
            totalLessons: 30,
            totalHours: 45,
            students: 42,
            rating: 4.5,
            nextLesson: 'Tốc độ phản ứng hóa học',
            color: 'bg-emerald-100 text-emerald-600',
            tag: 'LỚP 10',
            tagColor: 'bg-emerald-50 text-emerald-600 border-emerald-200'
        },
        {
            id: 'literature-11',
            title: 'Ngữ Văn 11',
            instructor: 'Phạm Thị Lan',
            progress: 50,
            completedLessons: 15,
            totalLessons: 30,
            totalHours: 45,
            students: 40,
            rating: 4.7,
            nextLesson: 'Văn học hiện thực phê phán',
            color: 'bg-orange-100 text-orange-600',
            tag: 'BAN XÃ HỘI',
            tagColor: 'bg-orange-50 text-orange-600 border-orange-200'
        },
        {
            id: 'english-12',
            title: 'Tiếng Anh 12 (Hệ 10 năm)',
            instructor: 'David Nguyen',
            progress: 30,
            completedLessons: 10,
            totalLessons: 35,
            totalHours: 50,
            students: 40,
            rating: 4.6,
            nextLesson: 'Unit 5: Cultural Identity',
            color: 'bg-purple-100 text-purple-600',
            tag: 'NGOẠI NGỮ',
            tagColor: 'bg-purple-50 text-purple-600 border-purple-200'
        }
    ];

    const uniqueTags = ['All', ...new Set(courses.map(course => course.tag))];

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTag = selectedTag === 'All' || course.tag === selectedTag;
        return matchesSearch && matchesTag;
    }).sort((a, b) => {
        if (sortBy === 'name') return a.title.localeCompare(b.title);
        if (sortBy === 'progress') return b.progress - a.progress;
        return 0;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen animate-fade-in font-sans">

            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Lớp Học Của Tôi</h1>
                <p className="text-gray-500 font-medium text-lg">Quản lý và theo dõi tiến độ học tập các môn học.</p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col xl:flex-row gap-5 mb-8 justify-between">
                <div className="relative flex-1 max-w-2xl group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm kiếm môn học, giáo viên..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-sm hover:shadow-md"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                    <div className="relative min-w-[180px]">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        <select
                            className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer text-sm font-semibold shadow-sm hover:shadow-md transition-all"
                            value={selectedTag}
                            onChange={(e) => setSelectedTag(e.target.value)}
                        >
                            {uniqueTags.map(tag => (
                                <option key={tag} value={tag}>
                                    {tag === 'All' ? 'Tất cả Khoa/Ban' : tag}
                                </option>
                            ))}
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" size={16} />
                    </div>

                    <div className="relative min-w-[180px]">
                        <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        <select
                            className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer text-sm font-semibold shadow-sm hover:shadow-md transition-all"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="default">Sắp xếp: Mặc định</option>
                            <option value="name">Tên (A-Z)</option>
                            <option value="progress">Tiến độ cao nhất</option>
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            {/* Courses Grid */}
            {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <Link
                            key={course.id}
                            to={`/dashboard/student/courses/${course.id}`}
                            className="block group"
                        >
                            <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">

                                {/* Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${course.color} shadow-inner`}>
                                        <BookOpen size={30} />
                                    </div>
                                    <span className={`inline-block px-3 py-1 ${course.tagColor} border text-[10px] font-bold rounded-full uppercase tracking-wider`}>
                                        {course.tag}
                                    </span>
                                </div>

                                <div className="mb-6 flex-1">
                                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                                            <span className="text-[10px]">GV</span>
                                        </div>
                                        {course.instructor}
                                    </p>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 mb-6 p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                                    <div className="text-center">
                                        <div className="text-xs text-gray-400 font-semibold uppercase mb-1">Thời lượng</div>
                                        <div className="font-bold text-gray-900 text-sm flex items-center justify-center gap-1">
                                            <Clock size={14} className="text-gray-400" /> {course.totalHours}h
                                        </div>
                                    </div>
                                    <div className="text-center border-l border-gray-200">
                                        <div className="text-xs text-gray-400 font-semibold uppercase mb-1">Sĩ số</div>
                                        <div className="font-bold text-gray-900 text-sm flex items-center justify-center gap-1">
                                            <Users size={14} className="text-gray-400" /> {course.students}
                                        </div>
                                    </div>
                                    <div className="text-center border-l border-gray-200">
                                        <div className="text-xs text-gray-400 font-semibold uppercase mb-1">Đánh giá</div>
                                        <div className="font-bold text-gray-900 text-sm flex items-center justify-center gap-1">
                                            <Star size={14} className="text-yellow-500 fill-yellow-500" /> {course.rating}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer / Progress */}
                                <div className="mt-auto">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Tiến độ</span>
                                        <span className="text-sm font-bold text-blue-600">{course.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ease-out bg-current ${course.progress >= 75 ? 'text-green-500' : course.progress >= 40 ? 'text-blue-500' : 'text-amber-500'}`}
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between group/link">
                                        <p className="text-xs text-gray-400 font-medium">Tiếp: <span className="text-gray-600">{course.nextLesson.split(':')[0]}...</span></p>
                                        <span className="text-sm font-bold text-blue-600 flex items-center gap-1 group-hover/link:underline">
                                            Vào học <ChevronRight size={16} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="min-h-[400px] flex flex-col items-center justify-center bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <Search className="text-gray-300" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
                    <p className="text-gray-500 max-w-sm text-center mb-8">Chúng tôi không tìm thấy khóa học nào phù hợp với từ khóa tìm kiếm của bạn.</p>
                    <button
                        onClick={() => { setSearchTerm(''); setSelectedTag('All'); }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95"
                    >
                        Xóa bộ lọc tìm kiếm
                    </button>
                </div>
            )}
        </div>
    );
}
