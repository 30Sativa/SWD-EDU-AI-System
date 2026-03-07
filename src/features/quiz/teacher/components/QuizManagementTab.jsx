import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Plus,
    Trash2,
    Clock,
    LayoutGrid,
    Settings,
    FileText,
    TrendingUp,
    BookOpen,
    ChevronRight,
    Target,
    Trophy
} from 'lucide-react';
import {
    Spin,
    message,
    Button,
    Tag,
    Input,
    Modal,
    Form,
    Select,
    Tooltip,
    Empty,
    Switch,
    InputNumber,
    Progress
} from 'antd';
import {
    getCourseQuizzes,
    getLessonQuizzes,
    createSummativeQuiz,
    updateQuiz,
    deleteQuiz
} from '../api/quizApi';

const QuizCard = ({ quiz, navigate, courseId, handleOpenModal, handleDeleteQuiz }) => (
    <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:border-blue-200">
        <div className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <FileText size={20} className="text-[#0487e2]" />
                    </div>
                    <Tag color={quiz.quizType === 'Summative' ? 'gold' : 'blue'} className="m-0 h-6 flex items-center text-[10px] font-bold uppercase rounded-md border-none px-2">
                        {quiz.quizType === 'Summative' ? 'Tổng kết' : 'Luyện tập'}
                    </Tag>
                </div>
                <Tag className={`m-0 rounded-full border-none px-3 py-0.5 text-[10px] font-black uppercase flex items-center gap-1.5 ${quiz.isPublished ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${quiz.isPublished ? "bg-emerald-500" : "bg-slate-400"}`}></div>
                    {quiz.isPublished ? "Hoạt động" : "Bản nháp"}
                </Tag>
            </div>

            <h3 className="text-base font-bold text-slate-800 leading-tight mb-2 group-hover:text-[#0487e2] transition-colors line-clamp-2 min-h-[40px]">
                {quiz.title}
            </h3>

            {quiz.quizType === 'Formative' && quiz.lessonName && (
                <div className="flex items-center gap-1.5 mb-3">
                    <BookOpen size={12} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 truncate max-w-[200px]">
                        Bài: {quiz.lessonName}
                    </span>
                </div>
            )}

            <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-5 flex-1 opacity-70">
                {quiz.description || "Không có nội dung mô tả chi tiết cho bài kiểm tra này."}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-5 border-t border-slate-100">
                <div className="space-y-1">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Thời gian</div>
                    <div className="flex items-center gap-1 text-slate-700">
                        <Clock size={12} className="text-blue-500" />
                        <span className="text-sm font-bold">{quiz.timeLimit || 0}p</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Câu hỏi</div>
                    <div className="flex items-center gap-1 text-slate-700">
                        <Target size={12} className="text-emerald-500" />
                        <span className="text-sm font-bold">{quiz.questionCount || quiz.questions?.length || 0}</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Điểm đạt</div>
                    <div className="flex items-center gap-1 text-slate-700">
                        <TrendingUp size={12} className="text-amber-500" />
                        <span className="text-sm font-bold">{quiz.passingScore}%</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <Button
                type="primary"
                onClick={() => navigate(`/dashboard/teacher/courses/${courseId}/quizzes/${quiz.id}`)}
                className="rounded-xl h-9 px-4 font-bold bg-[#0487e2] hover:bg-[#0374c4] border-none shadow-sm flex items-center gap-1.5 text-xs"
            >
                Thiết kế <ChevronRight size={14} />
            </Button>
            <div className="flex items-center gap-1">
                <Tooltip title="Cấu hình">
                    <Button
                        type="text"
                        size="small"
                        icon={<Settings size={14} />}
                        onClick={() => handleOpenModal(quiz)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-white text-slate-400 border border-slate-200 hover:text-[#0487e2] hover:bg-blue-50"
                    />
                </Tooltip>
                <Tooltip title="Xóa bỏ">
                    <Button
                        type="text"
                        size="small"
                        icon={<Trash2 size={14} />}
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-white text-slate-400 border border-slate-200 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200"
                    />
                </Tooltip>
            </div>
        </div>
    </div>
);

export default function QuizManagementTab({ courseId, courseDetail, sections = [] }) {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [quizzes, setQuizzes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [form] = Form.useForm();

    const fetchQuizzes = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch Summative quizzes
            const summativeRes = await getCourseQuizzes(courseId);
            const summativeList = (summativeRes?.data || summativeRes || []).map(q => ({
                ...q,
                quizType: 'Summative',
                id: q.id || q.quizId
            }));

            // Fetch Formative quizzes from all lessons in the course
            let formativeList = [];
            const allSections = sections && sections.length > 0
                ? sections
                : (courseDetail?.sections || courseDetail?.Sections || courseDetail?.items || []);

            if (allSections.length > 0) {
                // Map to store lesson names for lookup
                const lessonMap = {};
                const lessonIds = allSections.flatMap(s => {
                    const lessons = s.lessons || s.Lessons || s.items || [];
                    lessons.forEach(l => {
                        const lId = l.id || l.lessonId;
                        lessonMap[lId] = l.title || l.Title || l.name || "Bài học";
                    });
                    return lessons.map(l => l.id || l.lessonId);
                });

                // Fetch in parallel
                const formativePromises = lessonIds.map(id => getLessonQuizzes(id).catch(() => null));
                const formativeResults = await Promise.all(formativePromises);

                formativeResults.forEach((res, index) => {
                    const list = res?.data || res || [];
                    const lessonId = lessonIds[index];
                    if (Array.isArray(list)) {
                        formativeList = [...formativeList, ...list.map(q => ({
                            ...q,
                            quizType: 'Formative',
                            id: q.id || q.quizId,
                            lessonName: lessonMap[lessonId]
                        }))];
                    }
                });
            }

            // Merge and remove duplicates (if any)
            const allQuizzes = [...summativeList, ...formativeList];
            const uniqueQuizzes = Array.from(new Map(allQuizzes.map(q => [q.id, q])).values());

            setQuizzes(uniqueQuizzes);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
            message.error("Không thể tải danh sách bài kiểm tra");
        } finally {
            setLoading(false);
        }
    }, [courseId, courseDetail, sections]);

    useEffect(() => {
        if (courseId) fetchQuizzes();
    }, [courseId, fetchQuizzes]);

    const handleOpenModal = (quiz = null) => {
        setEditingQuiz(quiz);
        if (quiz) {
            form.setFieldsValue({
                title: quiz.title,
                description: quiz.description,
                timeLimit: quiz.timeLimit,
                maxAttempts: quiz.maxAttempts,
                passingScore: quiz.passingScore,
                isPublished: quiz.isPublished
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                timeLimit: 45,
                maxAttempts: 1,
                passingScore: 50,
                isPublished: false
            });
        }
        setIsQuizModalOpen(true);
    };

    const handleQuizSubmit = async (values) => {
        try {
            setSubmitting(true);
            const payload = {
                courseId: courseId,
                title: values.title,
                description: values.description || "",
                timeLimit: values.timeLimit || 0,
                maxAttempts: values.maxAttempts || 1,
                passingScore: values.passingScore || 50,
                isPublished: values.isPublished ?? false,
                isRequired: true,
                showAnswers: false,
                shuffleQuestions: true
            };

            if (editingQuiz) {
                await updateQuiz(editingQuiz.id, payload);
                message.success('Cập nhật bài kiểm tra thành công!');
            } else {
                await createSummativeQuiz(payload);
                message.success('Tạo bài kiểm tra cuối khóa thành công!');
            }

            setIsQuizModalOpen(false);
            fetchQuizzes();
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi lưu bài kiểm tra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteQuiz = (quizId) => {
        Modal.confirm({
            title: 'Xác nhận xóa bài kiểm tra?',
            content: 'Toàn bộ câu hỏi và dữ liệu liên quan sẽ bị xóa vĩnh viễn.',
            okText: 'Xóa ngay',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await deleteQuiz(quizId);
                    message.success('Đã xóa bài kiểm tra thành công!');
                    fetchQuizzes();
                } catch (error) {
                    message.error('Lỗi khi xóa bài kiểm tra');
                }
            }
        });
    };

    const filteredQuizzes = quizzes.filter(q =>
        (q.title || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center">
                <Spin size="large" />
                <p className="mt-4 text-slate-500 font-medium">Đang đồng bộ hóa dữ liệu quizz...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2 text-slate-400">
                        <FileText size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Tổng bài Quiz</span>
                    </div>
                    <div className="text-xl font-bold text-slate-800">{quizzes.length} <span className="text-sm text-slate-400 font-medium normal-case">bài thi</span></div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2 text-emerald-500">
                        <Target size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Đang hoạt động</span>
                    </div>
                    <div className="text-xl font-bold text-slate-800">{quizzes.filter(q => q.isPublished).length} <span className="text-sm text-slate-400 font-medium normal-case">bài thi</span></div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2 text-blue-500">
                        <Trophy size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trung bình điểm</span>
                    </div>
                    <div className="text-xl font-bold text-slate-800">76.5%</div>
                </div>
                <div className="bg-[#0487e2]/5 p-5 rounded-2xl border border-[#0487e2]/20 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2 text-[#0487e2]">
                        <TrendingUp size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Tỉ lệ tham gia</span>
                    </div>
                    <div className="text-xl font-bold text-slate-800">82%</div>
                    <Progress percent={82} size="small" showInfo={false} strokeColor="#0487e2" railColor="rgba(4, 135, 226, 0.1)" className="mt-1" />
                </div>
            </div>

            {/* Toolbar */}
            <div className="px-5 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="text-sm font-bold text-slate-800">
                        Quản lý nội dung Quiz
                    </div>
                    <Tag className="m-0 bg-slate-100 border-none text-slate-500 font-bold px-2 rounded-full">
                        {filteredQuizzes.length} bài thi
                    </Tag>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <Input
                        placeholder="Tìm kiếm bài kiểm tra..."
                        prefix={<Search size={16} className="text-slate-400" />}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="h-10 w-full md:w-64 rounded-xl border-slate-200 bg-slate-50 hover:bg-white focus:bg-white"
                        allowClear
                    />

                    <Button
                        type="primary"
                        icon={<Plus size={18} />}
                        onClick={() => handleOpenModal()}
                        className="bg-[#0487e2] hover:bg-[#0374c4] h-10 px-5 rounded-xl font-bold shadow-md border-none flex items-center"
                    >
                        Tạo Summative Quiz
                    </Button>
                </div>
            </div>

            {/* Grid List - Separated Sections */}
            <div className="space-y-12">
                {/* Summative Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 border-l-4 border-amber-400 pl-4">
                        <Trophy size={20} className="text-amber-500" />
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Bài kiểm tra tổng kết (Summative)</h2>
                            <p className="text-xs text-slate-400 font-medium">Các bài thi chính được gán cho toàn bộ khóa học</p>
                        </div>
                    </div>

                    {filteredQuizzes.filter(q => q.quizType === 'Summative').length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredQuizzes.filter(q => q.quizType === 'Summative').map((quiz, idx) => (
                                <QuizCard key={quiz.id || `summative-${idx}`} quiz={quiz} navigate={navigate} courseId={courseId} handleOpenModal={handleOpenModal} handleDeleteQuiz={handleDeleteQuiz} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-10 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có bài kiểm tra tổng kết nào." />
                        </div>
                    )}
                </div>

                {/* Formative Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 border-l-4 border-blue-400 pl-4">
                        <BookOpen size={20} className="text-blue-500" />
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Bài luyện tập (Formative)</h2>
                            <p className="text-xs text-slate-400 font-medium">Các bài quiz ngắn đi kèm theo từng bài học cụ thể</p>
                        </div>
                    </div>

                    {filteredQuizzes.filter(q => q.quizType === 'Formative').length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredQuizzes.filter(q => q.quizType === 'Formative').map((quiz, idx) => (
                                <QuizCard key={quiz.id || `formative-${idx}`} quiz={quiz} navigate={navigate} courseId={courseId} handleOpenModal={handleOpenModal} handleDeleteQuiz={handleDeleteQuiz} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-10 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có bài luyện tập nào được thêm vào các bài học." />
                        </div>
                    )}
                </div>
            </div>

            {/* Editor Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0487e2]">
                            {editingQuiz ? <Settings size={18} /> : <Plus size={18} />}
                        </div>
                        <span className="text-lg font-bold text-slate-800">
                            {editingQuiz ? "Cấu hình bài kiểm tra" : "Khởi tạo bài kiểm tra mới"}
                        </span>
                    </div>
                }
                open={isQuizModalOpen}
                onCancel={() => setIsQuizModalOpen(false)}
                footer={null}
                width={600}
                centered
                className="rounded-3xl"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleQuizSubmit}
                    className="mt-4 space-y-4"
                >
                    <Form.Item
                        label={<span className="font-bold text-slate-700">Tiêu đề bài kiểm tra</span>}
                        name="title"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                    >
                        <Input placeholder="Ví dụ: Kiểm tra cuối chương 1" className="h-11 rounded-xl bg-slate-50 border-none font-medium" />
                    </Form.Item>

                    <Form.Item
                        label={<span className="font-bold text-slate-700">Mô tả chi tiết</span>}
                        name="description"
                    >
                        <Input.TextArea rows={3} placeholder="Mô tả mục tiêu và nội dung của bài kiểm tra..." className="rounded-xl bg-slate-50 border-none p-3 font-medium text-sm" />
                    </Form.Item>

                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <div className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">Cấu hình bài thi</div>
                        <div className="grid grid-cols-3 gap-4">
                            <Form.Item
                                label={<span className="font-bold text-slate-600 text-xs text-center block w-full">Thời gian (p)</span>}
                                name="timeLimit"
                                rules={[{ required: true, message: 'Thiếu' }]}
                            >
                                <InputNumber min={0} className="w-full h-10 rounded-xl flex items-center bg-white border-none shadow-sm" />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-bold text-slate-600 text-xs text-center block w-full">Số lượt (lần)</span>}
                                name="maxAttempts"
                                rules={[{ required: true, message: 'Thiếu' }]}
                            >
                                <InputNumber min={1} className="w-full h-10 rounded-xl flex items-center bg-white border-none shadow-sm" />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-bold text-slate-600 text-xs text-center block w-full">Điểm đạt (%)</span>}
                                name="passingScore"
                                rules={[{ required: true, message: 'Thiếu' }]}
                            >
                                <InputNumber min={0} max={100} className="w-full h-10 rounded-xl flex items-center bg-white border-none shadow-sm" />
                            </Form.Item>
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                        <div>
                            <div className="font-bold text-slate-800 text-sm">Công bố ngay</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Học sinh có thể làm bài sau khi tạo</div>
                        </div>
                        <Form.Item
                            name="isPublished"
                            valuePropName="checked"
                            noStyle
                        >
                            <Switch className="bg-slate-200" />
                        </Form.Item>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            className="flex-1 h-11 rounded-xl font-bold border-slate-200 text-slate-500 hover:bg-slate-50"
                            onClick={() => setIsQuizModalOpen(false)}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            className="flex-1 h-11 rounded-xl font-bold bg-[#0487e2] border-none shadow-lg shadow-blue-200"
                        >
                            {editingQuiz ? "Cập nhật" : "Lưu Quiz"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
