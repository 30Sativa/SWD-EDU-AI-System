import React from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    Clock,
    Users,
    TrendingUp,
    Star,
    ChevronRight
} from 'lucide-react';

export default function CoursesList() {
    const courses = [
        {
            id: 'math-10a',
            title: 'Toán Học 10A',
            instructor: 'Giảng viên Nguyễn',
            progress: 65,
            completedLessons: 8,
            totalLessons: 12,
            totalHours: 24,
            students: 45,
            rating: 4.8,
            nextLesson: 'Giới thiệu về Hàm số',
            color: 'bg-blue-100 text-blue-600',
            tag: 'LỘ TRÌNH TOÁN',
            tagColor: 'bg-blue-50 text-blue-600'
        },
        {
            id: 'physics-11b',
            title: 'Vật Lý 11B',
            instructor: 'Giảng viên Trần',
            progress: 40,
            completedLessons: 4,
            totalLessons: 10,
            totalHours: 20,
            students: 38,
            rating: 4.6,
            nextLesson: 'Cơ bản về Sóng',
            color: 'bg-indigo-100 text-indigo-600',
            tag: 'LỘ TRÌNH KHOA HỌC',
            tagColor: 'bg-indigo-50 text-indigo-600'
        },
        {
            id: 'ui-design',
            title: 'Nguyên Lý Thiết Kế UI Nâng Cao',
            instructor: 'GS. Sarah Jenkins',
            progress: 26,
            completedLessons: 12,
            totalLessons: 45,
            totalHours: 32,
            students: 120,
            rating: 4.9,
            nextLesson: 'Tâm lý Người dùng (Bài 15)',
            color: 'bg-orange-100 text-orange-600',
            tag: 'LỘ TRÌNH THIẾT KẾ',
            tagColor: 'bg-orange-50 text-orange-600'
        },
        {
            id: 'english-advanced',
            title: 'Tiếng Anh Chuyên Sâu',
            instructor: 'Cô Lê Thị C',
            progress: 80,
            completedLessons: 12,
            totalLessons: 15,
            totalHours: 18,
            students: 52,
            rating: 4.7,
            nextLesson: 'Kỹ thuật Viết Luận',
            color: 'bg-green-100 text-green-600',
            tag: 'LỘ TRÌNH NGÔN NGỮ',
            tagColor: 'bg-green-50 text-green-600'
        }
    ];

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Khóa Học Của Tôi</h1>
                    <p className="text-gray-600">Tiếp tục hành trình học tập của bạn</p>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.map((course) => (
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
                                        <p className="text-sm text-gray-500">Giảng viên: {course.instructor}</p>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                                </div>

                                {/* Course Stats */}
                                <div className="grid grid-cols-3 gap-4 mb-5 pb-5 border-b border-gray-100">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                            <Clock size={16} />
                                        </div>
                                        <div className="text-sm font-semibold text-gray-900">{course.totalHours}h</div>
                                        <div className="text-xs text-gray-500">Thời lượng</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                            <Users size={16} />
                                        </div>
                                        <div className="text-sm font-semibold text-gray-900">{course.students}</div>
                                        <div className="text-xs text-gray-500">Học viên</div>
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
                                        <span className="text-xs font-semibold text-gray-600 uppercase">Tiến độ</span>
                                        <span className="text-sm font-bold text-gray-900">{course.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">{course.completedLessons}/{course.totalLessons} bài học</span>
                                        <span className="text-blue-600 font-medium group-hover:underline">Tiếp tục →</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Empty State for more courses */}
                <div className="mt-8 text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors cursor-pointer">
                        <BookOpen size={20} />
                        <span className="font-medium">Tìm Thêm Khóa Học</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
