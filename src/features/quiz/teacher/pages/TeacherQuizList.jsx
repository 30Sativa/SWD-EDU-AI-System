import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Search,
    Plus,
    Trash2,
    ArrowLeft,
    Clock,
    LayoutGrid,
    Settings,
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
                await updateQuiz(editingQuiz.id || editingQuiz.quizId, payload);
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
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Spin size="large" />
                <p className="mt-4 text-slate-500 font-medium">Đang đồng bộ hóa dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800 pb-20">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header & Breadcrumb */}
                <div className="flex flex-col gap-4">
                    <Breadcrumb
                        className="text-xs font-medium"
                        items={[
                            { title: <a onClick={() => navigate('/dashboard/teacher/courses')} className="text-slate-400 hover:text-[#0487e2]">Khóa học</a> },
                            { title: <span className="text-slate-400 cursor-pointer hover:text-[#0487e2]" onClick={() => navigate(`/dashboard/teacher/courses/${courseId}`)}>{course?.title || 'Chi tiết khóa học'}</span> },
                            { title: <span className="text-slate-600 font-bold">Quản lý Quizzes</span> },
                        ]}
                    />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Button
                                type="text"
                                icon={<ArrowLeft size={18} />}
                                onClick={() => navigate(`/dashboard/teacher/courses/${courseId}`)}
                                className="h-8 w-8 !p-0 flex items-center justify-center text-slate-400 hover:text-[#0487e2] hover:bg-blue-50 -ml-2"
                            />
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0463ca] m-0">
                                Quản lý Bài kiểm tra
                            </h1>
                        </div>
                        <Button
                            type="primary"
                            icon={<Plus size={18} />}
                            onClick={() => handleOpenModal()}
                            className="bg-[#0487e2] hover:bg-[#0374c4] h-10 px-5 rounded-lg font-bold shadow-md border-none flex items-center"
                        >
                            Tạo bài kiểm tra
                        </Button>
                    </div>
                </div>

                {/* Course Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2 text-slate-500">
                            <Bookmark size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Mã khóa học</span>
                        </div>
                        <div className="text-xl font-bold text-slate-800">{course?.code || "N/A"}</div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2 text-blue-600">
                            <FileText size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Tổng bài Quiz</span>
                        </div>
                        <div className="text-xl font-bold text-slate-800">{quizzes.length} <span className="text-sm text-slate-400 font-medium normal-case">bài thi</span></div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2 text-emerald-600">
                            <Target size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Đang hoạt động</span>
                        </div>
                        <div className="text-xl font-bold text-slate-800">{quizzes.filter(q => q.isPublished).length} <span className="text-sm text-slate-400 font-medium normal-case">bài thi</span></div>
                    </div>
                    <div className="bg-[#0487e2]/5 p-5 rounded-xl border border-[#0487e2]/20 flex flex-col justify-center relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2 text-[#0487e2] z-10">
                            <Trophy size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Tỉ lệ tham gia</span>
                        </div>
                        <div className="text-xl font-bold text-slate-800 z-10">82%</div>
                        <Progress percent={82} size="small" showInfo={false} strokeColor="#0487e2" railColor="rgba(4, 135, 226, 0.1)" className="mt-1 z-10" />
                    </div>
                </div>

                {/* Toolbar */}
                <div className="px-5 py-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="text-sm font-medium text-slate-500">
                        Hiển thị {filteredQuizzes.length} bài kiểm tra
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <Input
                            placeholder="Tìm kiếm bài kiểm tra..."
                            prefix={<Search size={16} className="text-slate-400" />}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="h-10 w-full md:w-64 rounded-lg border-slate-200 bg-white hover:border-[#0487e2] focus:border-[#0487e2]"
                            allowClear
                        />

                        <Select
                            defaultValue="all"
                            className="w-40 h-10 [&>.ant-select-selector]:!rounded-lg [&>.ant-select-selector]:!border-slate-200 [&>.ant-select-selector]:!h-10 [&>.ant-select-selector]:!flex [&>.ant-select-selector]:!items-center"
                        >
                            <Select.Option value="all">Tất cả trạng thái</Select.Option>
                            <Select.Option value="published">Hoạt động</Select.Option>
                            <Select.Option value="draft">Bản nháp</Select.Option>
                        </Select>

                        <div className="flex bg-slate-50 rounded-lg border border-slate-200 p-1">
                            <Button type="text" className="h-8 w-8 !p-0 flex items-center justify-center rounded text-[#0487e2] bg-blue-50"><LayoutGrid size={16} /></Button>
                        </div>
                    </div>
                </div>

                {/* Grid List */}
                {filteredQuizzes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuizzes.map((quiz, idx) => (
                            <div
                                key={quiz.id || quiz.quizId || idx}
                                className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full hover:border-blue-200"
                            >
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                            <FileText size={20} className="text-[#0487e2]" />
                                        </div>
                                        <Tag className={`m-0 rounded border-none px-2 py-0.5 text-[10px] font-bold uppercase flex items-center gap-1.5 ${quiz.isPublished ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                                            <div className={`h-1.5 w-1.5 rounded-full ${quiz.isPublished ? "bg-emerald-500" : "bg-slate-400"}`}></div>
                                            {quiz.isPublished ? "Hoạt động" : "Bản nháp"}
                                        </Tag>
                                    </div>

                                    <h3 className="text-base font-bold text-slate-800 leading-tight mb-2 group-hover:text-[#0487e2] transition-colors line-clamp-2">
                                        {quiz.title}
                                    </h3>

                                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-5 flex-1">
                                        {quiz.description || "Không có nội dung mô tả chi tiết."}
                                    </p>

                                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Thời gian</div>
                                            <div className="flex items-center gap-1 text-slate-700">
                                                <Clock size={14} className="text-[#0487e2]" />
                                                <span className="text-sm font-bold">{quiz.timeLimit || 0}p</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Câu hỏi</div>
                                            <div className="flex items-center gap-1 text-slate-700">
                                                <Target size={14} className="text-emerald-500" />
                                                <span className="text-sm font-bold">{quiz.questions?.length || 0}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Điểm đạt</div>
                                            <div className="flex items-center gap-1 text-slate-700">
                                                <TrendingUp size={14} className="text-amber-500" />
                                                <span className="text-sm font-bold">{quiz.passingScore}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                    <Button
                                        type="primary"
                                        onClick={() => navigate(`/dashboard/teacher/courses/${courseId}/quizzes/${quiz.id || quiz.quizId}`)}
                                        className="rounded-lg h-9 px-4 font-semibold bg-[#0487e2] hover:bg-[#0374c4] border-none shadow-sm flex items-center gap-1.5"
                                    >
                                        Thiết kế <ChevronRight size={14} />
                                    </Button>
                                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Tooltip title="Cài đặt">
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<Settings size={14} />}
                                                onClick={() => handleOpenModal(quiz)}
                                                className="h-8 w-8 flex items-center justify-center rounded-md bg-white text-slate-400 border border-slate-200 hover:text-[#0487e2] hover:bg-blue-50"
                                            />
                                        </Tooltip>
                                        <Tooltip title="Xóa bỏ">
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<Trash2 size={14} />}
                                                onClick={() => handleDeleteQuiz(quiz.id || quiz.quizId)}
                                                className="h-8 w-8 flex items-center justify-center rounded-md bg-white text-slate-400 border border-slate-200 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200"
                                            />
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 bg-white rounded-xl border border-dashed border-slate-300 text-center">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div className="space-y-3">
                                    <p className="text-slate-500 font-medium">Chưa có bài kiểm tra nào trong khóa học này.</p>
                                    <Button
                                        type="primary"
                                        icon={<Plus size={16} />}
                                        onClick={() => handleOpenModal()}
                                        className="h-10 px-5 rounded-lg bg-[#0487e2] hover:bg-[#0374c4] font-bold border-none"
                                    >
                                        Tạo bài đầu tiên
                                    </Button>
                                </div>
                            }
                        />
                    </div>
                )}

                {/* Question Bank CTA */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-start gap-4 text-center md:text-left">
                        <div className="h-12 w-12 rounded-xl bg-white border border-blue-200 flex items-center justify-center shrink-0 mx-auto md:mx-0">
                            <LayoutGrid size={24} className="text-[#0487e2]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Ngân hàng câu hỏi trung tâm</h3>
                            <p className="text-slate-600 font-medium text-sm max-w-xl">
                                Quản lý tập trung toàn bộ câu hỏi của bạn. Tạo một lần, tái sử dụng cho nhiều bài kiểm tra và khóa học khác nhau giúp tiết kiệm thời gian thiết kế.
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => navigate('/dashboard/teacher/question-bank')}
                        className="h-10 px-6 rounded-lg font-bold border-blue-200 text-[#0487e2] hover:bg-white shrink-0"
                    >
                        Tới Ngân hàng câu hỏi
                    </Button>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0487e2]">
                            {editingQuiz ? <Settings size={18} /> : <Plus size={18} />}
                        </div>
                        <span className="text-lg font-bold text-slate-800">
                            {editingQuiz ? "Cấu hình bài kiểm tra" : "Khởi tạo bài kiểm tra"}
                        </span>
                    </div>
                }
                open={isQuizModalOpen}
                onCancel={() => setIsQuizModalOpen(false)}
                footer={null}
                width={650}
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleQuizSubmit}
                    className="mt-4 space-y-5"
                >
                    <Form.Item
                        label={<span className="font-semibold text-slate-700">Tiêu đề bài kiểm tra</span>}
                        name="title"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                        className="mb-0"
                    >
                        <Input placeholder="Ví dụ: Kiểm tra cuối kỳ" className="h-11 rounded-lg font-medium" />
                    </Form.Item>

                    <Form.Item
                        label={<span className="font-semibold text-slate-700">Mô tả & Yêu cầu</span>}
                        name="description"
                        className="mb-0"
                    >
                        <Input.TextArea rows={3} placeholder="Mô tả nội dung bài kiểm tra..." className="rounded-lg p-3 font-medium text-sm" />
                    </Form.Item>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="font-bold text-slate-700 text-sm mb-4">Thông số kỹ thuật</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Form.Item
                                label={<span className="font-semibold text-slate-600 text-xs">Thời gian (phút)</span>}
                                name="timeLimit"
                                rules={[{ required: true, message: 'Bắt buộc' }]}
                                className="mb-0"
                            >
                                <InputNumber min={0} className="w-full h-10 rounded-lg flex items-center" />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-semibold text-slate-600 text-xs">Số lượt làm</span>}
                                name="maxAttempts"
                                rules={[{ required: true, message: 'Bắt buộc' }]}
                                className="mb-0"
                            >
                                <InputNumber min={1} className="w-full h-10 rounded-lg flex items-center" />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-semibold text-slate-600 text-xs">Điểm đạt (%)</span>}
                                name="passingScore"
                                rules={[{ required: true, message: 'Bắt buộc' }]}
                                className="mb-0"
                            >
                                <InputNumber min={0} max={100} className="w-full h-10 rounded-lg flex items-center" />
                            </Form.Item>
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <div>
                            <div className="font-bold text-slate-800 text-sm">Công bố bài kiểm tra</div>
                            <div className="text-xs text-slate-500 mt-0.5">Học sinh có thể nhìn thấy và làm bài ngay.</div>
                        </div>
                        <Form.Item
                            name="isPublished"
                            valuePropName="checked"
                            noStyle
                        >
                            <Switch className="custom-switch-emerald" />
                        </Form.Item>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <Button
                            className="flex-1 h-11 rounded-lg font-semibold border-slate-200 text-slate-600 hover:bg-slate-50"
                            onClick={() => setIsQuizModalOpen(false)}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            className="flex-1 h-11 rounded-lg font-bold bg-[#0487e2] border-none shadow-md"
                        >
                            {editingQuiz ? "Cập nhật thay đổi" : "Lưu bài kiểm tra"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}