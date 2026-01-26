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
            title: 'Mathematics 10A',
            instructor: 'Teacher Nguyen',
            progress: 65,
            completedLessons: 8,
            totalLessons: 12,
            totalHours: 24,
            students: 45,
            rating: 4.8,
            nextLesson: 'Introduction to Functions',
            color: 'bg-blue-100 text-blue-600',
            tag: 'MATH TRACK',
            tagColor: 'bg-blue-50 text-blue-600'
        },
        {
            id: 'physics-11b',
            title: 'Physics 11B',
            instructor: 'Teacher Tran',
            progress: 40,
            completedLessons: 4,
            totalLessons: 10,
            totalHours: 20,
            students: 38,
            rating: 4.6,
            nextLesson: 'Wave Motion Fundamentals',
            color: 'bg-indigo-100 text-indigo-600',
            tag: 'SCIENCE TRACK',
            tagColor: 'bg-indigo-50 text-indigo-600'
        },
        {
            id: 'ui-design',
            title: 'Advanced UI Design Principles',
            instructor: 'Prof. Sarah Jenkins',
            progress: 26,
            completedLessons: 12,
            totalLessons: 45,
            totalHours: 32,
            students: 120,
            rating: 4.9,
            nextLesson: 'User Psychology (Lesson 15)',
            color: 'bg-orange-100 text-orange-600',
            tag: 'DESIGN TRACK',
            tagColor: 'bg-orange-50 text-orange-600'
        },
        {
            id: 'english-advanced',
            title: 'English Advanced',
            instructor: 'Mrs. Le Thi C',
            progress: 80,
            completedLessons: 12,
            totalLessons: 15,
            totalHours: 18,
            students: 52,
            rating: 4.7,
            nextLesson: 'Essay Writing Techniques',
            color: 'bg-green-100 text-green-600',
            tag: 'LANGUAGE TRACK',
            tagColor: 'bg-green-50 text-green-600'
        }
    ];

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
                    <p className="text-gray-600">Continue your learning journey</p>
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
                                        <p className="text-sm text-gray-500">by {course.instructor}</p>
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
                                        <div className="text-xs text-gray-500">Duration</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                            <Users size={16} />
                                        </div>
                                        <div className="text-sm font-semibold text-gray-900">{course.students}</div>
                                        <div className="text-xs text-gray-500">Students</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                            <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                        </div>
                                        <div className="text-sm font-semibold text-gray-900">{course.rating}</div>
                                        <div className="text-xs text-gray-500">Rating</div>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold text-gray-600 uppercase">Progress</span>
                                        <span className="text-sm font-bold text-gray-900">{course.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">{course.completedLessons}/{course.totalLessons} lessons</span>
                                        <span className="text-blue-600 font-medium group-hover:underline">Continue →</span>
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
                        <span className="font-medium">Browse More Courses</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
