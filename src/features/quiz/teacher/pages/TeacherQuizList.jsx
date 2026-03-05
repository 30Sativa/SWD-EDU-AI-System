import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Search,
    Plus,
    Edit3,
    Trash2,
    ArrowLeft,
    HelpCircle,
    Clock,
    CheckCircle2,
    AlertCircle,
    LayoutGrid,
    Settings,
    Eye,
    FileText,
    TrendingUp,
    Bookmark,
    ChevronRight,
    Trophy,
    Target
} from 'lucide-react';
import {
    Spin,
    message,
    Button,
    Tag,
    Card,
    Input,
    Modal,
    Form,
    Select,
    Tooltip,
    Empty,
    Switch,
    InputNumber,
    Breadcrumb,
    Progress
} from 'antd';
import {
    getCourseQuizzes,
    createSummativeQuiz,
    updateQuiz,
    deleteQuiz
} from '../api/quizApi';
import { getTeacherCourseDetail } from '../../../course/api/courseApi';

export default function TeacherQuizList() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [course, setCourse] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [form] = Form.useForm();

    const fetchQuizzes = useCallback(async () => {
        try {
            setLoading(true);
            const [courseRes, quizzesRes] = await Promise.all([
                getTeacherCourseDetail(courseId),
                getCourseQuizzes(courseId)
            ]);

            setCourse(courseRes?.data || courseRes);
            const quizList = quizzesRes?.data || quizzesRes || [];
            setQuizzes(Array.isArray(quizList) ? quizList : []);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
            message.error("Không thể tải danh sách bài kiểm tra");
        } finally {
            setLoading(false);
        }
    }, [courseId]);

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
                message.success('Tạo bài kiểm tra mới thành công!');
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
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
                <div className="flex flex-col items-center">
                    <Spin size="large" />
                    <p className="mt-6 text-slate-400 font-bold animate-pulse text-xs tracking-widest uppercase">Đang đồng bộ hóa bài kiểm tra...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans text-slate-800">
            {/* Glossy Header Area */}
            <div className="bg-white border-b border-slate-100/60 sticky top-0 z-40 backdrop-blur-md bg-white/80">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                icon={<ArrowLeft size={18} />}
                                onClick={() => navigate(`/dashboard/teacher/courses/${courseId}`)}
                                className="flex items-center justify-center h-10 w-10 p-0 rounded-full border-slate-200 text-slate-500 hover:bg-[#0463ca] hover:text-white transition-all shadow-sm"
                            />
                            <div className="h-10 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>
                            <div>
                                <Breadcrumb
                                    separator={<span className="text-slate-300">/</span>}
                                    items={[
                                        { title: <span className="text-slate-400 font-medium">Khóa học</span> },
                                        { title: <span className="text-slate-800 font-bold">{course?.title}</span> },
                                        { title: <span className="text-[#0463ca] font-bold">Summative Quizzes</span> }
                                    ]}
                                    className="text-xs mb-1"
                                />
                                <h1 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    Danh sách bài kiểm tra lớn
                                </h1>
                            </div>
                        </div>
                        <Button
                            type="primary"
                            icon={<Plus size={20} />}
                            onClick={() => handleOpenModal()}
                            className="h-11 px-6 rounded-xl bg-[#0463ca] hover:!bg-[#0352a8] font-bold border-none shadow-xl shadow-blue-100/50"
                        >
                            Tạo bài kiểm tra
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
                {/* Course Banner Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c4a6e] to-[#075985] p-8 text-white shadow-2xl shadow-blue-900/10">
                    <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                        <FileText size={200} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 px-3 py-1 rounded-full">
                                <Bookmark size={14} className="text-blue-200" />
                                <span className="text-[10px] font-black uppercase tracking-[2px] text-blue-100">Khóa học hiện tại</span>
                            </div>
                            <h2 className="text-4xl font-black max-w-2xl leading-[1.1]">{course?.title}</h2>
                            <div className="flex flex-wrap gap-6 mt-6">
                                <div className="flex flex-col">
                                    <span className="text-blue-200/60 text-[10px] font-black uppercase tracking-wider mb-1">Tổng bài quiz</span>
                                    <span className="text-2xl font-black">{quizzes.length} <span className="text-xs text-blue-300/60 font-medium">bài thi</span></span>
                                </div>
                                <div className="h-10 w-[1px] bg-blue-400/30 hidden md:block self-center"></div>
                                <div className="flex flex-col">
                                    <span className="text-blue-200/60 text-[10px] font-black uppercase tracking-wider mb-1">Công bố</span>
                                    <span className="text-2xl font-black">{quizzes.filter(q => q.isPublished).length} <span className="text-xs text-blue-300/60 font-medium">hoạt động</span></span>
                                </div>
                                <div className="h-10 w-[1px] bg-blue-400/30 hidden md:block self-center"></div>
                                <div className="flex flex-col">
                                    <span className="text-blue-200/60 text-[10px] font-black uppercase tracking-wider mb-1">Mã khóa học</span>
                                    <span className="text-2xl font-black">{course?.code || "CS101"}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[140px]">
                                <Trophy size={20} className="text-amber-400 mb-2" />
                                <div className="text-[10px] text-blue-100/60 font-bold uppercase tracking-wider">Tỉ lệ hoàn thành</div>
                                <div className="text-lg font-black mt-1">82%</div>
                                <Progress percent={82} size="small" showInfo={false} strokeColor="#fbbf24" trailColor="rgba(255,255,255,0.1)" className="mt-2" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toolbar Group */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="relative flex-1 max-w-xl group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search size={18} className="text-slate-400 group-focus-within:text-[#0463ca] transition-colors" />
                        </div>
                        <Input
                            placeholder="Tìm kiếm tiêu đề bài kiểm tra..."
                            variant="borderless"
                            className="w-full pl-11 pr-4 py-3 text-sm font-medium focus:ring-0"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Select defaultValue="all" className="w-full md:w-40 h-10 custom-select-premium" dropdownClassName="rounded-xl shadow-xl">
                            <Select.Option value="all">Tất cả trạng thái</Select.Option>
                            <Select.Option value="published">Đã công bố</Select.Option>
                            <Select.Option value="draft">Bản nháp</Select.Option>
                        </Select>
                        <Button icon={<Settings size={18} />} className="h-10 w-10 p-0 rounded-xl flex items-center justify-center border-slate-200 text-slate-500" />
                    </div>
                </div>

                {/* Grid List */}
                {filteredQuizzes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredQuizzes.map((quiz) => (
                            <div key={quiz.id} className="group relative">
                                {/* Glass background decorative element */}
                                <div className="absolute inset-0 bg-blue-600/5 rounded-[32px] blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-105 pointer-events-none"></div>

                                <Card
                                    className="h-full rounded-[28px] border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 overflow-hidden bg-white/70 backdrop-blur-xl"
                                    bodyStyle={{ padding: 0 }}
                                    variant="borderless"
                                >
                                    <div className="p-7">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex -space-x-1">
                                                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center border-2 border-white ring-1 ring-slate-100">
                                                    <FileText size={18} className="text-blue-600" />
                                                </div>
                                            </div>
                                            <Tag className={`rounded-full border-0 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${quiz.isPublished ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                                                <div className={`h-1.5 w-1.5 rounded-full ${quiz.isPublished ? "bg-emerald-500" : "bg-slate-400"} shadow-sm`}></div>
                                                {quiz.isPublished ? "Đã công bố" : "Bản nháp"}
                                            </Tag>
                                        </div>

                                        <h3 className="text-lg font-black text-slate-800 leading-tight mb-3 group-hover:text-[#0463ca] transition-colors line-clamp-2">
                                            {quiz.title}
                                        </h3>
                                        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-6 h-10">
                                            {quiz.description || "Không có nội dung mô tả chi tiết cho bài kiểm tra này."}
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thời lượng</div>
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <Clock size={16} className="text-blue-500" />
                                                    <span className="text-sm font-black">{quiz.timeLimit || 0}m</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Câu hỏi</div>
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <Target size={16} className="text-emerald-500" />
                                                    <span className="text-sm font-black">{quiz.questions?.length || 0}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1 mt-2">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Điểm đạt</div>
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <TrendingUp size={16} className="text-amber-500" />
                                                    <span className="text-sm font-black">{quiz.passingScore}%</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1 mt-2">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lượt làm</div>
                                                <div className="text-sm font-black text-slate-700">{quiz.maxAttempts === 0 ? "Unlimited" : `${quiz.maxAttempts} lần`}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-7 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                                        <Button
                                            type="primary"
                                            onClick={() => navigate(`/dashboard/teacher/courses/${courseId}/quizzes/${quiz.id}`)}
                                            className="rounded-2xl h-11 px-6 font-black bg-[#0463ca] border-none shadow-lg shadow-blue-100 flex items-center gap-2"
                                        >
                                            Thiết kế <ChevronRight size={16} />
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            <Tooltip title="Chỉnh sửa cài đặt">
                                                <Button
                                                    icon={<Settings size={18} />}
                                                    onClick={() => handleOpenModal(quiz)}
                                                    className="h-11 w-11 rounded-2xl flex items-center justify-center border-none text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                />
                                            </Tooltip>
                                            <Tooltip title="Vứt vào thùng rác">
                                                <Button
                                                    icon={<Trash2 size={18} />}
                                                    onClick={() => handleDeleteQuiz(quiz.id)}
                                                    className="h-11 w-11 rounded-2xl flex items-center justify-center border-none text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                                />
                                            </Tooltip>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div className="space-y-4 max-w-sm mx-auto">
                                    <h3 className="text-xl font-black text-slate-800">Khám phá sức mạnh của Quiz</h3>
                                    <p className="text-slate-400 text-sm font-medium">Bạn chưa tạo bài kiểm tra tổng kết nào cho khóa học này. Hãy khởi tạo để đánh giá năng lực học sinh tốt hơn.</p>
                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={() => handleOpenModal()}
                                        className="h-12 px-10 rounded-2xl bg-[#0463ca] font-black border-none shadow-xl shadow-blue-100"
                                    >
                                        Tạo bài đầu tiên
                                    </Button>
                                </div>
                            }
                        />
                    </div>
                )}

                {/* Enhanced Call-to-action Section */}
                <div className="relative group overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[32px] p-10 text-white shadow-2xl">
                    <div className="absolute right-0 top-0 mt-[-40px] mr-[-40px] h-64 w-64 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-all duration-700"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 text-center md:text-left">
                            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center mx-auto md:mx-0">
                                <FileText size={32} className="text-white" />
                            </div>
                            <h3 className="text-3xl font-black tracking-tight">Xây dựng ngân hàng câu hỏi</h3>
                            <p className="text-blue-100/80 max-w-lg font-medium leading-relaxed">
                                Đừng tốn thời gian soạn lại từng bài. Nhập hàng loạt câu hỏi vào kho lưu trữ trung tâm và tái sử dụng chúng cho bất kỳ khóa học nào.
                            </p>
                        </div>
                        <Button
                            size="large"
                            className="h-14 px-10 rounded-2xl bg-white text-blue-700 border-none font-black hover:!bg-blue-50 hover:!text-blue-800 shadow-2xl transition-all"
                            onClick={() => navigate('/dashboard/teacher/question-bank')}
                        >
                            Đến Ngân hàng câu hỏi
                        </Button>
                    </div>
                </div>
            </div>

            {/* Premium Create/Edit Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-3 py-1">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            {editingQuiz ? <Settings size={20} /> : <Plus size={20} />}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black text-slate-800">{editingQuiz ? "Cấu hình bài kiểm tra" : "Khởi tạo bài kiểm tra mới"}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{course?.title}</span>
                        </div>
                    </div>
                }
                open={isQuizModalOpen}
                onCancel={() => setIsQuizModalOpen(false)}
                footer={null}
                className="premium-modal"
                width={650}
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleQuizSubmit}
                    className="mt-6 space-y-6"
                >
                    <Form.Item
                        label={<span className="text-xs font-black uppercase tracking-widest text-slate-400">Tiêu đề Quiz mẫu</span>}
                        name="title"
                        rules={[{ required: true, message: 'Nội dung này là bắt buộc' }]}
                    >
                        <Input placeholder="Ví dụ: Final Exam - Computer Science 101" className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all text-base font-bold" />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-xs font-black uppercase tracking-widest text-slate-400">Yêu cầu & Mô tả</span>}
                        name="description"
                    >
                        <Input.TextArea rows={3} placeholder="Mô tả các chủ đề kiến thức bao quát trong bài thi này..." className="rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all text-sm font-medium" />
                    </Form.Item>

                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50">
                        <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                            <Settings size={14} className="text-blue-500" /> Cài đặt thông số kỹ thuật
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Form.Item
                                label={<span className="text-[11px] font-bold text-slate-500">Thời gian (phút)</span>}
                                name="timeLimit"
                                rules={[{ required: true, message: '!' }]}
                            >
                                <InputNumber min={0} className="w-full h-12 rounded-xl bg-white border-slate-100 flex items-center font-black" />
                            </Form.Item>

                            <Form.Item
                                label={<span className="text-[11px] font-bold text-slate-500">Số lượt thử</span>}
                                name="maxAttempts"
                                rules={[{ required: true, message: '!' }]}
                            >
                                <InputNumber min={1} className="w-full h-12 rounded-xl bg-white border-slate-100 flex items-center font-black" />
                            </Form.Item>

                            <Form.Item
                                label={<span className="text-[11px] font-bold text-slate-500">Điểm đạt (%)</span>}
                                name="passingScore"
                                rules={[{ required: true, message: '!' }]}
                            >
                                <InputNumber min={0} max={100} className="w-full h-12 rounded-xl bg-white border-slate-100 flex items-center font-black" />
                            </Form.Item>
                        </div>
                    </div>

                    <Form.Item
                        name="isPublished"
                        valuePropName="checked"
                    >
                        <div className="flex justify-between items-center bg-[#0463ca]/10 p-5 rounded-3xl border border-[#0463ca]/20 transition-all hover:bg-[#0463ca]/15">
                            <div className="flex gap-4 items-center">
                                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-[#0463ca] shadow-sm">
                                    <Eye size={20} />
                                </div>
                                <div>
                                    <div className="font-black text-[#0463ca] text-sm">Công bố ra cộng đồng</div>
                                    <div className="text-[11px] text-[#0463ca]/60 font-bold tracking-tight">Học sinh có thể nhìn thấy và bắt đầu làm bài ngay khi được bật.</div>
                                </div>
                            </div>
                            <Switch className="custom-switch-premium" />
                        </div>
                    </Form.Item>

                    <div className="flex gap-4 pt-4">
                        <Button
                            block
                            className="h-14 rounded-2xl font-black border-slate-200 text-slate-500 hover:text-slate-700 transition-all"
                            onClick={() => setIsQuizModalOpen(false)}
                        >
                            Trở lại
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={submitting}
                            className="h-14 rounded-2xl font-black bg-[#0463ca] border-none shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all"
                        >
                            {editingQuiz ? "Cập nhật thay đổi" : "Khởi tạo Quiz"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
