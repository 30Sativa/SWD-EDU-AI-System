import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    Clock,
    User,
    BookOpen,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    LayoutGrid,
    CheckCircle2,
    Clock3,
    Circle,
    ClipboardList,
} from 'lucide-react';
import { getCourseQuizzes } from '../api/quizApi';
import { getStudentMyCourses } from '../../../course/api/courseApi';
import { Spin, message } from 'antd';

export default function QuizList() {
    const [courses, setCourses] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [quizType, setQuizType] = useState('trac-nghiem');

    // Fetch enrolled courses on mount
    React.useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await getStudentMyCourses();
                const data = res.data || res;
                setCourses(Array.isArray(data) ? data : []);

                // Fetch quizzes for all courses initially or just wait for selection
                // For simplicity, let's fetch for the first course if exists or all
                if (data && data.length > 0) {
                    fetchAllQuizzes(data);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Lỗi khi tải khóa học:", error);
                message.error("Không thể tải danh sách khóa học");
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const fetchAllQuizzes = async (courseList) => {
        setLoading(true);
        try {
            const quizPromises = courseList.map(course => getCourseQuizzes(course.id).catch(() => ({ data: [] })));
            const results = await Promise.all(quizPromises);

            const allQuizzes = results.flatMap((res, index) => {
                const quizData = res.data || res;
                return (Array.isArray(quizData) ? quizData : []).map(q => ({
                    ...q,
                    courseName: courseList[index].title || courseList[index].name
                }));
            });

            setQuizzes(allQuizzes);
        } catch (error) {
            console.error("Lỗi khi tải quiz:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchQuizzesByCourse = async (courseId) => {
        if (courseId === 'all') {
            fetchAllQuizzes(courses);
            return;
        }
        setLoading(true);
        try {
            const res = await getCourseQuizzes(courseId);
            const data = res.data || res;
            const course = courses.find(c => c.id === courseId);
            setQuizzes((Array.isArray(data) ? data : []).map(q => ({
                ...q,
                courseName: course.title || course.name
            })));
        } catch (error) {
            console.error("Lỗi khi tải quiz:", error);
            message.error("Không thể tải danh sách bài tập");
        } finally {
            setLoading(false);
        }
    };

    const handleCourseChange = (e) => {
        const val = e.target.value;
        setSelectedCourse(val);
        fetchQuizzesByCourse(val);
    };

    const filteredQuizzes = quizzes.filter(quiz =>
        (quiz.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (quiz.courseName || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 bg-slate-50 pb-12 font-sans">
            <div className="max-w-7xl mx-auto">

                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">
                            Bài kiểm tra <span className="text-[#0463ca]">& Đánh giá</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">
                            Tổng hợp các bài kiểm tra định kỳ, 1 tiết và học kỳ để đánh giá năng lực của bạn.
                        </p>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
                        <button
                            onClick={() => setQuizType('trac-nghiem')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${quizType === 'trac-nghiem'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Trắc nghiệm
                        </button>
                        <button
                            onClick={() => setQuizType('tu-luan')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${quizType === 'tu-luan'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Tự luận
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Bộ lọc
                                </h2>
                                <button
                                    onClick={() => {
                                        setSelectedCourse('all');
                                        setSearchTerm('');
                                        fetchQuizzesByCourse('all');
                                    }}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                                >
                                    Xóa hết
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Khóa học */}
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
                                        <LayoutGrid size={16} className="text-blue-500" />
                                        KHÓA HỌC
                                    </div>
                                    <div className="relative group">
                                        <select
                                            value={selectedCourse}
                                            onChange={handleCourseChange}
                                            className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
                                        >
                                            <option value="all">Tất cả khóa học</option>
                                            {courses.map(course => (
                                                <option key={course.id} value={course.id}>{course.title || course.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100" />

                                {/* Trạng thái */}
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
                                        <Clock3 size={16} className="text-blue-500" />
                                        TRẠNG THÁI
                                    </div>
                                    <div className="space-y-2">
                                        {['Tất cả', 'Chưa bắt đầu', 'Đã hoàn thành'].map((status) => (
                                            <label key={status} className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="radio"
                                                        name="status"
                                                        className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-full checked:border-blue-500 transition-all"
                                                        defaultChecked={status === 'Tất cả'}
                                                    />
                                                    <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                                                </div>
                                                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{status}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <main className="flex-1">
                        {/* Search & Sort Bar */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-5 mb-8">
                            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                                <div className="relative flex-1 max-w-xl group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm bài kiểm tra, khóa học..."
                                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 text-sm shadow-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm hover:shadow-md transition-all">
                                        <Calendar size={16} className="text-blue-500" />
                                        Gần đây nhất
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {loading ? (
                                <div className="col-span-full py-20 flex flex-col items-center gap-4">
                                    <Spin size="large" />
                                    <p className="text-slate-500 font-medium">Đang tải danh sách bài tập...</p>
                                </div>
                            ) : filteredQuizzes.length > 0 ? (
                                filteredQuizzes.map((quiz) => (
                                    <div key={quiz.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm group">
                                        <div className="p-6 flex-1">
                                            {/* Quiz Tag */}
                                            <div className="mb-4">
                                                <span className={`text-[10px] font-semibold px-3 py-1 rounded-full ${quiz.type === 'summative' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'} uppercase tracking-wider`}>
                                                    {quiz.type === 'summative' ? 'Tổng hợp' : 'Định kỳ'}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-lg font-bold text-slate-900 mb-5 group-hover:text-blue-600 transition-colors">
                                                {quiz.title}
                                            </h3>

                                            {/* Info Rows */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-8">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Clock size={16} className="text-slate-400" />
                                                        <span className="text-sm font-medium">{quiz.duration || 0} phút</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <ClipboardList size={16} className="text-slate-400" />
                                                        <span className="text-sm font-medium">{quiz.totalQuestions || 0} câu</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <BookOpen size={16} className="text-slate-400" />
                                                        <span className="text-sm font-medium">{quiz.courseName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${quiz.isCompleted ? 'bg-emerald-400' : 'bg-gray-300'} shadow-sm`}></div>
                                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                                    {quiz.isCompleted ? 'Đã hoàn thành' : 'Chưa bắt đầu'}
                                                </span>
                                            </div>

                                            {quiz.isCompleted ? (
                                                <Link
                                                    to={`/dashboard/student/quizzes/${quiz.id}`}
                                                    className="px-5 py-2.5 bg-slate-200 text-slate-600 font-semibold rounded-xl text-sm hover:bg-slate-300 transition-all"
                                                >
                                                    Kết quả
                                                </Link>
                                            ) : (
                                                <Link
                                                    to={`/dashboard/student/quizzes/${quiz.id}`}
                                                    className="px-6 py-2.5 bg-[#0487e2] hover:bg-[#0463ca] text-white font-semibold rounded-lg transition-all"
                                                >
                                                    Làm bài
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-slate-500 font-medium">Không tìm thấy bài kiểm tra nào phù hợp</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-center gap-2 mt-12">
                            <button
                                type="button"
                                className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                disabled={true}
                            >
                                Trước
                            </button>
                            {[1].map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    className="w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center bg-blue-600 text-white shadow-sm"
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                type="button"
                                className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                disabled={true}
                            >
                                Sau
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
