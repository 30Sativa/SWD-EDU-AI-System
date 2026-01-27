import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Lớp Học Của Tôi</h1>
                    <p className="text-gray-600 text-lg font-medium">Danh sách các môn học trong học kỳ này • {filteredCourses.length} môn học</p>
                </div>

                {/* Filter Bar */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Tìm kiếm môn học, giáo viên..."
                                className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all text-gray-900 font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3">
                            <div className="relative">
                                <select
                                    className="pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer min-w-[180px] text-gray-900 font-medium"
                                    value={selectedTag}
                                    onChange={(e) => setSelectedTag(e.target.value)}
                                >
                                    {uniqueTags.map(tag => (
                                        <option key={tag} value={tag}>
                                            {tag === 'All' ? 'Tất cả Khoa/Ban' : tag}
                                        </option>
                                    ))}
                                </select>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">▼</span>
                            </div>
                            <div className="relative">
                                <select
                                    className="pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer min-w-[180px] text-gray-900 font-medium"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="default">Mặc định</option>
                                    <option value="name">Tên (A-Z)</option>
                                    <option value="progress">Tiến độ cao nhất</option>
                                </select>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">▼</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                {filteredCourses.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                            <div className="text-2xl font-bold text-gray-900 mb-1">{filteredCourses.length}</div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tổng môn học</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                            <div className="text-2xl font-bold text-emerald-600 mb-1">
                                {Math.round(filteredCourses.reduce((sum, c) => sum + c.progress, 0) / filteredCourses.length)}%
                            </div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tiến độ TB</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                            <div className="text-2xl font-bold text-blue-600 mb-1">
                                {filteredCourses.reduce((sum, c) => sum + c.completedLessons, 0)}
                            </div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bài đã hoàn thành</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                            <div className="text-2xl font-bold text-indigo-600 mb-1">
                                {filteredCourses.reduce((sum, c) => sum + c.totalLessons, 0)}
                            </div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tổng bài học</div>
                        </div>
                    </div>
                )}

                {/* Courses Grid */}
                {filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => (
                            <Link
                                key={course.id}
                                to={`/dashboard/student/courses/${course.id}`}
                                className="block group"
                            >
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">

                                    {/* Course Header */}
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 ${course.color} font-bold text-2xl shadow-sm`}>
                                            {course.title.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className={`inline-block px-3 py-1.5 ${course.tagColor} text-xs font-bold rounded-lg mb-3 uppercase tracking-wider`}>
                                                {course.tag}
                                            </span>
                                            <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
                                                {course.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 font-medium">Giáo viên: <span className="font-semibold">{course.instructor}</span></p>
                                        </div>
                                    </div>

                                    {/* Next Lesson Info */}
                                    {course.nextLesson && (
                                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bài tiếp theo</p>
                                            <p className="text-sm font-bold text-gray-900">{course.nextLesson}</p>
                                        </div>
                                    )}

                                    {/* Course Stats */}
                                    <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-100">
                                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                                            <div className="text-2xl font-bold text-gray-900 mb-1">{course.totalHours}</div>
                                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tiết học</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                                            <div className="text-2xl font-bold text-gray-900 mb-1">{course.students}</div>
                                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Học sinh</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                                            <div className="text-2xl font-bold text-gray-900 mb-1">{course.rating}</div>
                                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Đánh giá</div>
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div className="mt-auto">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Tiến độ học kỳ</span>
                                            <span className="text-xl font-bold text-gray-900">{course.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-3.5 mb-4 overflow-hidden shadow-inner">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 shadow-sm ${
                                                    course.progress >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                                                    course.progress >= 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                                                    'bg-gradient-to-r from-amber-500 to-orange-600'
                                                }`}
                                                style={{ width: `${course.progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                            <span className="text-sm text-gray-600 font-medium">{course.completedLessons}/{course.totalLessons} bài đã hoàn thành</span>
                                            <span className="text-blue-600 font-bold text-sm group-hover:text-blue-700 transition-colors">Vào học →</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 border-dashed">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-2xl font-bold text-gray-400">
                            ?
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
                        <p className="text-gray-600 mb-6">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn</p>
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedTag('All'); }}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
