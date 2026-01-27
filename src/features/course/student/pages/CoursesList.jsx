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
    ArrowUpDown
} from 'lucide-react';

export default function CoursesList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('All');
    const [sortBy, setSortBy] = useState('default');

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
            tagColor: 'bg-blue-50 text-blue-600'
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
            tagColor: 'bg-indigo-50 text-indigo-600'
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
            color: 'bg-green-100 text-green-600',
            tag: 'LỚP 10',
            tagColor: 'bg-green-50 text-green-600'
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
            tagColor: 'bg-orange-50 text-orange-600'
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
            tagColor: 'bg-purple-50 text-purple-600'
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
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Lớp Học Của Tôi</h1>
                    <p className="text-gray-600">Danh sách các môn học trong học kỳ này</p>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm môn học, giáo viên..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                className="pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[180px]"
                                value={selectedTag}
                                onChange={(e) => setSelectedTag(e.target.value)}
                            >
                                {uniqueTags.map(tag => (
                                    <option key={tag} value={tag}>
                                        {tag === 'All' ? 'Tất cả Khoa/Ban' : tag}
                                    </option>
                                ))}
                            </select>
                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={16} />
                        </div>
                        <div className="relative">
                            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                className="pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[180px]"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="default">Mặc định</option>
                                <option value="name">Tên (A-Z)</option>
                                <option value="progress">Tiến độ cao nhất</option>
                            </select>
                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={16} />
                        </div>
                    </div>
                </div>

                {/* Courses Grid */}
                {filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredCourses.map((course) => (
                            <Link
                                key={course.id}
                                to={`/dashboard/student/courses/${course.id}`}
                                className="block group"
                            >
                                <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all">

                                    {/* Course Header */}
                                    <div className="flex items-start gap-4 mb-5">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${course.color}`}>
                                            <BookOpen size={28} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className={`inline-block px-2.5 py-1 ${course.tagColor} text-xs font-bold rounded-full mb-2 uppercase tracking-wide`}>
                                                {course.tag}
                                            </span>
                                            <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                                {course.title}
                                            </h3>
                                            <p className="text-sm text-gray-500">GV: {course.instructor}</p>
                                        </div>
                                        <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    </div>

                                    {/* Course Stats */}
                                    <div className="grid grid-cols-3 gap-4 mb-5 pb-5 border-b border-gray-100">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                                <Clock size={16} />
                                            </div>
                                            <div className="text-sm font-semibold text-gray-900">{course.totalHours} tiết</div>
                                            <div className="text-xs text-gray-500">Thời lượng</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                                <Users size={16} />
                                            </div>
                                            <div className="text-sm font-semibold text-gray-900">{course.students}</div>
                                            <div className="text-xs text-gray-500">Sĩ số</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                            </div>
                                            <div className="text-sm font-semibold text-gray-900">{course.rating}</div>
                                            <div className="text-xs text-gray-500">Đánh giá</div>
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-semibold text-gray-600 uppercase">Tiến độ học kỳ</span>
                                            <span className="text-sm font-bold text-gray-900">{course.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${course.progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">{course.completedLessons}/{course.totalLessons} bài</span>
                                            <span className="text-blue-600 font-medium group-hover:underline">Vào học →</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Search className="text-gray-400" size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy kết quả</h3>
                        <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn</p>
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedTag('All'); }}
                            className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
