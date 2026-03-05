import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Edit3,
    PlusCircle,
    CheckCircle2,
    BrainCircuit,
    Eye,
    ChevronRight,
    Check,
    FileText,
    Target,
    Settings,
    Layout,
    Clock,
    TrendingUp
} from 'lucide-react';
import {
    Spin,
    message,
    Button,
    Card,
    Input,
    Modal,
    Form,
    Radio,
    Checkbox,
    Tooltip,
    Empty,
    Tag,
    Space,
    Breadcrumb,
    Progress
} from 'antd';
import {
    getQuizDetail,
    addQuestionToQuiz,
    updateQuestionInQuiz,
    deleteQuestionInQuiz
} from '../api/quizApi';

export default function TeacherQuizEditor() {
    const { courseId, quizId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);

    // Question Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const [questionType, setQuestionType] = useState('MultipleChoice');

    const fetchQuizDetail = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getQuizDetail(quizId);
            const data = res.data || res;
            setQuiz(data);
            setQuestions(data.questions || []);
        } catch (error) {
            console.error("Lỗi khi tải thông tin Quiz:", error);
            message.error("Không thể tải thông tin bài kiểm tra");
        } finally {
            setLoading(false);
        }
    }, [quizId]);

    useEffect(() => {
        if (quizId) fetchQuizDetail();
    }, [quizId, fetchQuizDetail]);

    const handleOpenModal = (question = null) => {
        setEditingQuestion(question);
        if (question) {
            setQuestionType(question.type || 'MultipleChoice');
            form.setFieldsValue({
                text: question.text,
                explanation: question.explanation,
                point: question.point || 1,
                options: question.options || [
                    { text: '', isCorrect: true },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false }
                ]
            });
        } else {
            setQuestionType('MultipleChoice');
            form.resetFields();
            form.setFieldsValue({
                point: 1,
                options: [
                    { text: '', isCorrect: true },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false }
                ]
            });
        }
        setIsModalOpen(true);
    };

    const handleQuestionSubmit = async (values) => {
        try {
            setSubmitting(true);
            const payload = {
                text: values.text,
                type: questionType,
                point: parseFloat(values.point) || 1,
                explanation: values.explanation || "",
                options: values.options.map(opt => ({
                    text: opt.text,
                    isCorrect: opt.isCorrect ?? false
                }))
            };

            if (editingQuestion) {
                await updateQuestionInQuiz(quizId, editingQuestion.id, payload);
                message.success('Cập nhật câu hỏi thành công!');
            } else {
                await addQuestionToQuiz(quizId, payload);
                message.success('Thêm câu hỏi mới thành công!');
            }

            setIsModalOpen(false);
            fetchQuizDetail();
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi lưu câu hỏi');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteQuestion = (questionId) => {
        Modal.confirm({
            title: 'Xác nhận xóa câu hỏi?',
            content: 'Dữ liệu câu hỏi sẽ bị gỡ bỏ khỏi bài thi này.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await deleteQuestionInQuiz(quizId, questionId);
                    message.success('Đã xóa câu hỏi');
                    fetchQuizDetail();
                } catch (error) {
                    message.error('Lỗi khi xóa câu hỏi');
                }
            }
        });
    };

    const totalPoints = questions.reduce((sum, q) => sum + (parseFloat(q.point) || 0), 0);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
                <div className="flex flex-col items-center">
                    <Spin size="large" />
                    <p className="mt-6 text-slate-400 font-bold animate-pulse text-xs tracking-widest uppercase">Đang xây dựng giao diện bài thi...</p>
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
                                onClick={() => navigate(`/dashboard/teacher/courses/${courseId}/quizzes`)}
                                className="flex items-center justify-center h-10 w-10 p-0 rounded-full border-slate-200 text-slate-500 hover:bg-[#0463ca] hover:text-white transition-all shadow-sm"
                            />
                            <div className="h-10 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>
                            <div>
                                <Breadcrumb
                                    separator={<span className="text-slate-300">/</span>}
                                    items={[
                                        { title: <span className="text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] inline-block">Summative Quizzes</span> },
                                        { title: <span className="text-[#0463ca] font-bold">{quiz?.title}</span> }
                                    ]}
                                    className="text-xs mb-0.5"
                                />
                                <h1 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    Thiết kế nội dung câu hỏi
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden lg:flex flex-col items-end mr-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-right">Tổng điểm / Câu hỏi</span>
                                <span className="text-lg font-black text-[#0463ca]">
                                    {totalPoints}đ <span className="text-slate-300 mx-1">|</span> {questions.length} câu
                                </span>
                            </div>
                            <Button
                                type="primary"
                                icon={<PlusCircle size={20} />}
                                onClick={() => handleOpenModal()}
                                className="h-11 px-6 rounded-xl bg-[#0463ca] hover:!bg-[#0352a8] font-bold border-none shadow-xl shadow-blue-100/50"
                            >
                                Thêm câu hỏi
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 mt-8 space-y-8">
                {/* Stats Dashboard for Editor */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2 text-blue-600">
                            <FileText size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kiểu câu hỏi</span>
                        </div>
                        <div className="text-xl font-black text-slate-800">Trắc nghiệm</div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2 text-emerald-600">
                            <Target size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Độ bao quát</span>
                        </div>
                        <div className="text-xl font-black text-slate-800">{questions.length > 5 ? "Tốt" : "Cần thêm"}</div>
                    </div>
                    <div className="md:col-span-2 bg-gradient-to-r from-indigo-50 to-blue-50 p-5 rounded-3xl border border-indigo-100/50 relative overflow-hidden">
                        <div className="relative z-10 flex justify-between items-center h-full">
                            <div className="space-y-1">
                                <div className="text-[10px] font-black uppercase tracking-widest text-[#0463ca]">AI Assistant</div>
                                <div className="text-sm font-bold text-slate-700">Tự động gợi ý giải thích & Phản hồi cho học sinh.</div>
                            </div>
                            <Button icon={<BrainCircuit className="text-[#0463ca]" />} className="bg-white border-indigo-200 rounded-xl h-10 w-10 flex items-center justify-center p-0" />
                        </div>
                    </div>
                </div>

                {/* List Group Title */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-3">
                        <Layout size={20} className="text-[#0463ca]" />
                        Cấu trúc bài thi hiện tại
                    </h2>
                    <Tag className="rounded-full bg-slate-200 text-slate-600 border-none font-black px-3 py-1">#{quiz?.title}</Tag>
                </div>

                {/* Questions List */}
                <div className="space-y-6">
                    {questions.length > 0 ? (
                        questions.map((q, index) => (
                            <div key={q.id || index} className="group relative">
                                <div className="absolute inset-0 bg-blue-100/10 rounded-[30px] -m-1 blur-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none"></div>
                                <Card
                                    className="rounded-[28px] border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 relative bg-white/70 backdrop-blur-xl overflow-hidden"
                                    bodyStyle={{ padding: '24px 28px' }}
                                    variant="borderless"
                                >
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Question Number & Points */}
                                        <div className="flex md:flex-col items-center md:items-start justify-between md:w-32 shrink-0 gap-4 pt-1">
                                            <div className="h-10 w-10 bg-[#0463ca] text-white flex items-center justify-center rounded-2xl font-black text-lg shadow-lg shadow-blue-100">
                                                {index + 1}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Điểm số</div>
                                                <div className="px-3 py-1 bg-blue-50 text-[#0463ca] rounded-full text-xs font-black inline-block">
                                                    {q.point || 0} Points
                                                </div>
                                            </div>
                                        </div>

                                        {/* Question Content */}
                                        <div className="flex-1 space-y-6">
                                            <div className="space-y-3">
                                                <div className="inline-flex items-center gap-2 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-black text-slate-500">
                                                    {q.type === 'MultipleChoice' ? 'TRẮC NGHIỆM' : 'NHIỀU ĐÁP ÁN'}
                                                </div>
                                                <div className="text-lg font-bold text-slate-800 leading-relaxed pr-8">
                                                    {q.text}
                                                </div>
                                            </div>

                                            {/* Options Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {q.options?.map((opt, oIdx) => (
                                                    <div
                                                        key={oIdx}
                                                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${opt.isCorrect
                                                                ? "bg-emerald-50 border-emerald-100 text-emerald-800 ring-1 ring-emerald-200/50"
                                                                : "bg-slate-50 border-slate-200 text-slate-600 opacity-80"
                                                            }`}
                                                    >
                                                        <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${opt.isCorrect ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                                                            }`}>
                                                            {opt.isCorrect ? <Check size={14} /> : String.fromCharCode(65 + oIdx)}
                                                        </div>
                                                        <span className="text-sm font-bold flex-1">{opt.text}</span>
                                                        {opt.isCorrect && <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-600">Đúng</span>}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Explanation Area */}
                                            {q.explanation && (
                                                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex gap-3">
                                                    <BrainCircuit size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Gợi ý & Giải thích của AI</div>
                                                        <p className="text-sm text-indigo-700 font-medium leading-relaxed italic">{q.explanation}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Floating Actions */}
                                        <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                            <Tooltip title="Chỉnh sửa câu hỏi">
                                                <Button
                                                    icon={<Edit3 size={18} />}
                                                    onClick={() => handleOpenModal(q)}
                                                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-slate-500 border-slate-200 shadow-sm hover:text-[#0463ca] hover:border-[#0463ca] transition-all"
                                                />
                                            </Tooltip>
                                            <Tooltip title="Xóa bỏ">
                                                <Button
                                                    icon={<Trash2 size={18} />}
                                                    onClick={() => handleDeleteQuestion(q.id)}
                                                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-rose-400 border-slate-200 shadow-sm hover:text-white hover:bg-rose-500 hover:border-rose-500 transition-all"
                                                />
                                            </Tooltip>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200 text-center">
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <div className="max-w-xs mx-auto space-y-4">
                                        <h3 className="text-lg font-black text-slate-800">Chưa có câu hỏi nào</h3>
                                        <p className="text-slate-400 text-sm font-medium">Bắt đầu xây dựng bộ câu hỏi cho bài thi bằng cách thêm câu hỏi thủ công.</p>
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<Plus size={18} />}
                                            onClick={() => handleOpenModal()}
                                            className="h-12 px-8 rounded-2xl bg-[#0463ca] font-black border-none shadow-xl shadow-blue-100"
                                        >
                                            Thêm ngay
                                        </Button>
                                    </div>
                                }
                            />
                        </div>
                    )}
                </div>

                {/* Quick Add Area at Bottom */}
                <div className="pt-10 flex justify-center">
                    <Button
                        type="dashed"
                        size="large"
                        icon={<Plus size={24} />}
                        onClick={() => handleOpenModal()}
                        className="h-20 w-full rounded-[30px] border-2 border-slate-200 text-slate-400 font-bold hover:text-[#0463ca] hover:border-[#0463ca] transition-all group flex items-center justify-center gap-4 bg-white/50"
                    >
                        <span className="text-lg font-black tracking-tight group-hover:scale-105 transition-transform">Thêm câu hỏi tiếp theo</span>
                    </Button>
                </div>
            </main>

            {/* Premium Question Edit Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-3 py-1">
                        <div className="h-10 w-10 rounded-xl bg-[#0463ca]/10 flex items-center justify-center text-[#0463ca]">
                            {editingQuestion ? <Edit3 size={20} /> : <PlusCircle size={20} />}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black text-slate-800">{editingQuestion ? "Chỉnh sửa câu hỏi" : "Khởi tạo câu hỏi mới"}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{quiz?.title}</span>
                        </div>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={750}
                centered
                className="premium-modal"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleQuestionSubmit}
                    className="mt-6 space-y-6"
                >
                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <Form.Item label={<span className="text-xs font-black uppercase tracking-widest text-slate-500">Loại câu hỏi</span>}>
                                <Radio.Group
                                    value={questionType}
                                    onChange={e => setQuestionType(e.target.value)}
                                    className="custom-radio-premium w-full"
                                >
                                    <Space direction="vertical" className="w-full">
                                        <Radio.Button value="MultipleChoice" className="w-full h-11 rounded-xl flex items-center justify-center font-bold">Trắc nghiệm (1 đáp án)</Radio.Button>
                                        <Radio.Button value="MultipleResponse" className="w-full h-11 rounded-xl flex items-center justify-center font-bold">Nhiều đáp án (Checkboxes)</Radio.Button>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>

                            <Form.Item
                                label={<span className="text-xs font-black uppercase tracking-widest text-slate-500">Điểm số cho câu này</span>}
                                name="point"
                                rules={[{ required: true, message: 'Nhập điểm!' }]}
                            >
                                <Input type="number" step="0.5" placeholder="Ví dụ: 1.0" className="h-11 rounded-xl bg-white border-slate-100 font-black text-center text-lg text-[#0463ca]" />
                            </Form.Item>
                        </div>

                        <Form.Item
                            label={<span className="text-xs font-black uppercase tracking-widest text-slate-500">Nội dung câu hỏi</span>}
                            name="text"
                            rules={[{ required: true, message: 'Câu hỏi không được để trống' }]}
                        >
                            <Input.TextArea placeholder="Nhập câu hỏi tại đây..." rows={4} className="rounded-2xl bg-white border-slate-100 p-4 text-base font-bold transition-all focus:shadow-md" />
                        </Form.Item>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <div className="text-xs font-black uppercase tracking-widest text-slate-400">Danh sách các phương án trả lời</div>
                            <div className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Tích vào ô đúng</div>
                        </div>

                        <Form.List name="options">
                            {(fields) => (
                                <div className="space-y-3">
                                    {fields.map(({ key, name, ...restField }, index) => (
                                        <div key={key} className="flex gap-3 items-center group/opt">
                                            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-focus-within/opt:bg-blue-600 group-focus-within/opt:text-white transition-all shadow-inner">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'text']}
                                                rules={[{ required: true, message: 'Vui lòng nhập phương án' }]}
                                                className="mb-0 flex-1"
                                            >
                                                <Input placeholder={`Phương án ${index + 1}...`} className="h-12 rounded-2xl bg-white border-slate-100 font-bold" />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'isCorrect']}
                                                valuePropName="checked"
                                                className="mb-0"
                                            >
                                                <Checkbox className="scale-150 custom-checkbox-premium" />
                                            </Form.Item>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Form.List>
                    </div>

                    <Form.Item
                        label={
                            <div className="flex items-center gap-2 text-[#0463ca]">
                                <BrainCircuit size={16} />
                                <span className="text-xs font-black uppercase tracking-widest">Giải thích & Gợi ý (Cho AI)</span>
                            </div>
                        }
                        name="explanation"
                    >
                        <Input.TextArea rows={3} placeholder="Giải thích đáp án đúng để hệ thống AI có thể hỗ trợ học sinh học tập tốt hơn..." className="rounded-2xl p-4 bg-blue-50/30 border-blue-100 text-sm font-medium" />
                    </Form.Item>

                    <div className="flex gap-4 pt-6">
                        <Button
                            className="h-14 px-10 rounded-2xl font-black border-slate-200 text-slate-400 hover:text-slate-600 transition-all flex-1"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            className="h-14 px-10 rounded-2xl font-black bg-[#0463ca] border-none shadow-xl shadow-blue-200 flex-1"
                        >
                            {editingQuestion ? "Cập nhật câu hỏi" : "Lưu vào bài thi"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
