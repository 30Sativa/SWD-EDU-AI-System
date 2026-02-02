import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Eye,
    Plus,
    Edit3,
    Trash2,
    ChevronDown,
    ChevronUp,
    Video,
    FileText,
    CheckSquare,
    GripVertical,
    MoreVertical,
    Clock,
    Users,
    BookOpen,
    BarChart,
    ArrowLeft
} from 'lucide-react';

export default function CourseDetail() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    // Mock data matching the screenshot structure
    const [course, setCourse] = useState({
        id: 1,
        title: 'Đại số Tuyến tính Nâng cao',
        description: 'Hướng dẫn toàn diện về Đại số tuyến tính, Giải tích đa biến và Phương trình vi phân.',
        status: 'Published',
        stats: {
            students: 128,
            lessons: 24,
            avgCompletion: '82%'
        },
        sessions: [
            {
                id: 1,
                title: 'Cơ bản về Đại số Tuyến tính',
                lessonCount: 6,
                duration: '2h 15m',
                isExpanded: true,
                lessons: [
                    { id: 101, title: 'Giới thiệu về Ma trận', type: 'video', duration: '15:00', icon: Video },
                    { id: 102, title: 'Không gian Vector', type: 'reading', duration: '10 mins', icon: FileText },
                ]
            },
            {
                id: 2,
                title: 'Giải tích Đa biến',
                lessonCount: 8,
                duration: '3h 45m',
                isExpanded: false,
                lessons: []
            },
            {
                id: 3,
                title: 'Phương trình Vi phân',
                lessonCount: 5,
                duration: '1h 50m',
                isExpanded: true,
                lessons: [
                    { id: 301, title: 'Phương trình bậc nhất', type: 'quiz', duration: '10 Câu hỏi', icon: CheckSquare },
                ]
            }
        ]
    });

    const toggleSession = (sessionId) => {
        setCourse(prev => ({
            ...prev,
            sessions: prev.sessions.map(session =>
                session.id === sessionId ? { ...session, isExpanded: !session.isExpanded } : session
            )
        }));
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans text-slate-900 animate-in fade-in duration-500">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Top Navigation & Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/dashboard/teacher/courses')}
                            className="h-10 w-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Quản lý Nội dung</h1>
                            <p className="text-slate-500 mt-1">Xây dựng chương trình học với các chương và bài học.</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm shadow-sm">
                            <Eye size={18} />
                            Xem trước
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm shadow-md shadow-indigo-200">
                            <Plus size={18} />
                            Tạo khóa học
                        </button>
                    </div>
                </div>

                {/* Course Info Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-200">
                                ∑
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-2xl font-bold text-slate-900">{course.title}</h2>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                            {course.status === 'Published' ? 'Đã xuất bản' : 'Bản nháp'}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 max-w-2xl leading-relaxed">{course.description}</p>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium text-sm transition-colors">
                                    <Edit3 size={16} />
                                    Sửa thông tin
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-6 pt-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Users size={18} className="text-indigo-500" />
                                    <span className="font-semibold text-slate-900">{course.stats.students}</span> học viên
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <BookOpen size={18} className="text-emerald-500" />
                                    <span className="font-semibold text-slate-900">{course.stats.lessons}</span> bài học
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <BarChart size={18} className="text-amber-500" />
                                    <span className="font-semibold text-slate-900">{course.stats.avgCompletion}</span> hoàn thành
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Curriculum Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            Chương trình học
                            <span className="text-slate-400 font-normal text-base">• {course.sessions.length} Chương</span>
                        </h3>
                        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm shadow-sm">
                            <Plus size={18} />
                            Thêm chương
                        </button>
                    </div>

                    <div className="space-y-4">
                        {course.sessions.map((session, index) => (
                            <div key={session.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md">
                                {/* Session Header */}
                                <div
                                    className="flex items-center justify-between p-4 bg-slate-50/50 cursor-pointer select-none"
                                    onClick={() => toggleSession(session.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-lg font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{session.title}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                                <span>{session.lessonCount} Bài học</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span>{session.duration}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                            <Edit3 size={16} />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-slate-600">
                                            {session.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Lessons List */}
                                {session.isExpanded && (
                                    <div className="p-4 space-y-3 bg-white border-t border-slate-100">
                                        {session.lessons.length > 0 ? (
                                            session.lessons.map((lesson) => (
                                                <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2 rounded-lg ${lesson.type === 'video' ? 'bg-blue-100 text-blue-600' :
                                                            lesson.type === 'quiz' ? 'bg-amber-100 text-amber-600' :
                                                                'bg-purple-100 text-purple-600'
                                                            }`}>
                                                            <lesson.icon size={18} />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-900">{lesson.title}</div>
                                                            <div className="text-xs text-slate-500 capitalize flex items-center gap-1.5 mt-0.5">
                                                                {lesson.type}
                                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                                {lesson.duration}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors">
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <button className="p-2 text-slate-300 hover:text-slate-500 cursor-move">
                                                            <GripVertical size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6 text-slate-400 text-sm italic">
                                                Chưa có bài học nào trong chương này.
                                            </div>
                                        )}

                                        <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 font-medium hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2 text-sm">
                                            <Plus size={18} />
                                            Thêm bài học mới
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>


            </div>
        </div>
    );
}
