import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Edit3,
    Check,
    FileText,
    Target,
    BrainCircuit,
    Layout
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
    Select
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
    const [questionType, setQuestionType] = useState('MCQ');

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
            const currentType = question.questionType || question.type || question.QuestionType || 'MCQ';
            setQuestionType(currentType);

            form.setFieldsValue({
                text: question.questionText || question.text || question.QuestionText,
                explanation: question.explanation || question.Explanation,
                point: question.points || question.point || question.Point || 1,
                options: (question.options || question.Options || []).map(opt => ({
                    text: opt.optionText || opt.text || opt.OptionText,
                    isCorrect: opt.isCorrect ?? opt.IsCorrect ?? false
                }))
            });
        } else {
            setQuestionType('MCQ');
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
                questionText: values.text,
                questionType: questionType,
                points: parseFloat(values.point) || 1,
                explanation: values.explanation || "",
                sortOrder: questions.length + 1,
                options: values.options.map((opt, idx) => ({
                    optionText: opt.text,
                    isCorrect: opt.isCorrect ?? false,
                    sortOrder: idx + 1
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
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Spin size="large" />
                <p className="mt-4 text-slate-500 font-medium">Đang tải cấu trúc bài thi...</p>
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
                            { title: <span className="text-slate-400 cursor-pointer hover:text-[#0487e2]" onClick={() => navigate(`/dashboard/teacher/courses/${courseId}/quizzes`)}>Danh sách Quiz</span> },
                            { title: <span className="text-slate-600 font-bold">{quiz?.title}</span> },
                        ]}
                    />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Button
                                type="text"
                                icon={<ArrowLeft size={18} />}
                                onClick={() => navigate(`/dashboard/teacher/courses/${courseId}/quizzes`)}
                                className="h-8 w-8 !p-0 flex items-center justify-center text-slate-400 hover:text-[#0487e2] hover:bg-blue-50 -ml-2"
                            />
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0463ca] m-0">
                                Thiết kế nội dung
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end border-r border-slate-200 pr-4">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Tổng điểm / Câu hỏi</span>
                                <span className="text-lg font-bold text-[#0487e2]">
                                    {totalPoints}đ <span className="text-slate-300 mx-1">|</span> {questions.length} câu
                                </span>
                            </div>
                            <Button
                                type="primary"
                                icon={<Plus size={18} />}
                                onClick={() => handleOpenModal()}
                                className="bg-[#0487e2] hover:bg-[#0374c4] h-10 px-5 rounded-lg font-bold shadow-md border-none flex items-center"
                            >
                                Thêm câu hỏi
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1.5 text-blue-600">
                            <FileText size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Kiểu bài thi</span>
                        </div>
                        <div className="text-lg font-bold text-slate-800">Trắc nghiệm</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1.5 text-emerald-600">
                            <Target size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Độ bao quát</span>
                        </div>
                        <div className="text-lg font-bold text-slate-800">{questions.length > 5 ? "Tốt" : "Cần thêm"}</div>
                    </div>
                    <div className="md:col-span-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between relative overflow-hidden">
                        <div className="space-y-1 z-10">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-[#0487e2]">AI Assistant</div>
                            <div className="text-sm font-semibold text-slate-700">Tự động gợi ý giải thích & Phản hồi cho học sinh.</div>
                        </div>
                        <div className="h-10 w-10 bg-white border border-blue-100 rounded-lg flex items-center justify-center text-[#0487e2] shadow-sm z-10">
                            <BrainCircuit size={20} />
                        </div>
                    </div>
                </div>

                {/* List Group Title */}
                <div className="flex items-center justify-between pt-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Layout size={18} className="text-[#0487e2]" />
                        Cấu trúc bài thi hiện tại
                    </h2>
                    <Tag className="rounded-md bg-slate-100 text-slate-500 border-slate-200 font-bold px-2 py-0.5 m-0">#{quiz?.title}</Tag>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                    {questions.length > 0 ? (
                        questions.map((q, index) => (
                            <div key={q.id || q.questionId || index} className="group relative">
                                <Card
                                    className="rounded-xl border-slate-200 shadow-sm hover:border-blue-200 hover:shadow transition-all duration-300 bg-white overflow-hidden"
                                    bodyStyle={{ padding: '20px 24px' }}
                                >
                                    <div className="flex flex-col md:flex-row gap-5">
                                        {/* Question Number & Points */}
                                        <div className="flex md:flex-col items-center md:items-start justify-between md:w-24 shrink-0 gap-3">
                                            <div className="h-9 w-9 bg-blue-50 text-[#0487e2] flex items-center justify-center rounded-lg font-bold text-base border border-blue-100">
                                                {index + 1}
                                            </div>
                                            <div className="flex flex-col items-end md:items-start">
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Điểm số</div>
                                                <div className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-600 rounded text-xs font-bold">
                                                    {q.point || 0} đ
                                                </div>
                                            </div>
                                        </div>

                                        {/* Question Content */}
                                        <div className="flex-1 space-y-4 min-w-0">
                                            <div className="inline-flex items-center gap-1.5 mb-2 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500">
                                                {(() => {
                                                    const type = q.questionType || q.type || q.QuestionType;
                                                    if (type === 'MCQ') return 'TRẮC NGHIỆM (1 ĐÁP ÁN)';
                                                    if (type === 'MultipleChoice') return 'CHỌN NHIỀU ĐÁP ÁN';
                                                    if (type === 'TrueFalse') return 'ĐÚNG/SAI';
                                                    if (type === 'ShortAnswer') return 'TRẢ LỜI NGẮN';
                                                    return type;
                                                })()}
                                            </div>
                                            <div className="text-base font-bold text-slate-800 pr-12">
                                                {q.questionText || q.text || q.QuestionText}
                                            </div>

                                            {/* Options Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {q.options?.map((opt, oIdx) => (
                                                    <div
                                                        key={oIdx}
                                                        className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${opt.isCorrect
                                                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                                            : "bg-slate-50/50 border-slate-200 text-slate-600"
                                                            }`}
                                                    >
                                                        <div className={`h-5 w-5 rounded flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${opt.isCorrect ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                                                            }`}>
                                                            {opt.isCorrect ? <Check size={12} /> : String.fromCharCode(65 + oIdx)}
                                                        </div>
                                                        <span className="text-sm font-medium flex-1 pt-0.5 leading-snug">{opt.optionText || opt.text || opt.OptionText}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Explanation Area */}
                                            {q.explanation && (
                                                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex gap-2">
                                                    <BrainCircuit size={16} className="text-[#0487e2] shrink-0 mt-0.5" />
                                                    <div className="space-y-0.5">
                                                        <div className="text-[10px] font-bold uppercase tracking-widest text-[#0487e2]">Giải thích & Gợi ý</div>
                                                        <p className="text-xs text-slate-600 font-medium italic">{q.explanation}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Floating Actions */}
                                        <div className="absolute top-4 right-4 flex gap-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Tooltip title="Chỉnh sửa">
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    icon={<Edit3 size={14} />}
                                                    onClick={() => handleOpenModal(q)}
                                                    className="h-8 w-8 flex items-center justify-center rounded-md bg-white text-slate-400 border border-slate-200 shadow-sm hover:text-[#0487e2] hover:bg-blue-50"
                                                />
                                            </Tooltip>
                                            <Tooltip title="Xóa bỏ">
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    icon={<Trash2 size={14} />}
                                                    onClick={() => handleDeleteQuestion(q.id || q.questionId)}
                                                    className="h-8 w-8 flex items-center justify-center rounded-md bg-white text-slate-400 border border-slate-200 shadow-sm hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200"
                                                />
                                            </Tooltip>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))
                    ) : (
                        <div className="py-16 bg-white rounded-xl border border-dashed border-slate-300 text-center">
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <div className="space-y-3">
                                        <p className="text-slate-500 font-medium">Chưa có câu hỏi nào trong bài thi này.</p>
                                        <Button
                                            type="primary"
                                            icon={<Plus size={16} />}
                                            onClick={() => handleOpenModal()}
                                            className="h-10 px-5 rounded-lg bg-[#0487e2] hover:bg-[#0374c4] font-bold border-none"
                                        >
                                            Thêm câu hỏi ngay
                                        </Button>
                                    </div>
                                }
                            />
                        </div>
                    )}
                </div>

                {/* Quick Add Area at Bottom */}
                {questions.length > 0 && (
                    <div className="pt-6 flex justify-center">
                        <Button
                            type="dashed"
                            icon={<Plus size={18} />}
                            onClick={() => handleOpenModal()}
                            className="h-12 w-full rounded-xl border-slate-300 text-slate-500 font-semibold hover:text-[#0487e2] hover:border-[#0487e2] hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
                        >
                            Thêm câu hỏi tiếp theo
                        </Button>
                    </div>
                )}
            </div>

            {/* Question Edit Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0487e2]">
                            {editingQuestion ? <Edit3 size={18} /> : <Plus size={18} />}
                        </div>
                        <span className="text-lg font-bold text-slate-800">
                            {editingQuestion ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
                        </span>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={700}
                centered
                className="custom-modal"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleQuestionSubmit}
                    className="mt-4 space-y-5"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item label={<span className="font-semibold text-slate-700">Loại câu hỏi</span>} className="mb-0">
                            <Select
                                value={questionType}
                                onChange={val => {
                                    setQuestionType(val);
                                    if (val === 'TrueFalse') {
                                        form.setFieldsValue({
                                            options: [
                                                { text: 'Đúng', isCorrect: true },
                                                { text: 'Sai', isCorrect: false }
                                            ]
                                        });
                                    } else if (val === 'ShortAnswer') {
                                        form.setFieldsValue({
                                            options: [{ text: '', isCorrect: true }]
                                        });
                                    }
                                }}
                                className="h-10 w-full"
                            >
                                <Select.Option value="MCQ">Chọn 1 đáp án (MCQ)</Select.Option>
                                <Select.Option value="MultipleChoice">Chọn nhiều đáp án</Select.Option>
                                <Select.Option value="TrueFalse">Đúng / Sai</Select.Option>
                                <Select.Option value="ShortAnswer">Trả lời ngắn</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-semibold text-slate-700">Điểm số</span>}
                            name="point"
                            rules={[{ required: true, message: 'Nhập điểm!' }]}
                            className="mb-0"
                        >
                            <Input type="number" step="0.5" placeholder="Ví dụ: 1.0" className="h-10 rounded-lg bg-white" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        label={<span className="font-semibold text-slate-700">Nội dung câu hỏi</span>}
                        name="text"
                        rules={[{ required: true, message: 'Câu hỏi không được để trống' }]}
                        className="mb-0"
                    >
                        <Input.TextArea placeholder="Nhập câu hỏi tại đây..." rows={3} className="rounded-lg bg-white p-3 font-medium" />
                    </Form.Item>

                    {questionType !== 'ShortAnswer' ? (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-700 text-sm">Các phương án trả lời</span>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                    {questionType === 'MultipleChoice' ? 'Chọn các đáp án đúng' : 'Chọn 1 đáp án đúng'}
                                </span>
                            </div>

                            <Form.List name="options">
                                {(fields) => (
                                    <div className="space-y-3">
                                        {fields.map(({ key, name, ...restField }, index) => (
                                            <div key={key} className="flex gap-3 items-center">
                                                <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-500 shadow-sm">
                                                    {String.fromCharCode(65 + index)}
                                                </div>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'text']}
                                                    rules={[{ required: true, message: 'Nhập phương án' }]}
                                                    className="mb-0 flex-1"
                                                >
                                                    <Input
                                                        placeholder={`Phương án ${index + 1}`}
                                                        className="h-10 rounded-lg"
                                                        disabled={questionType === 'TrueFalse'}
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'isCorrect']}
                                                    valuePropName="checked"
                                                    className="mb-0 pt-1"
                                                >
                                                    {questionType === 'MultipleChoice' ? (
                                                        <Checkbox className="scale-125" />
                                                    ) : (
                                                        <Radio
                                                            className="scale-125"
                                                            checked={form.getFieldValue(['options', name, 'isCorrect'])}
                                                            onChange={(e) => {
                                                                const options = form.getFieldValue('options').map((opt, i) => ({
                                                                    ...opt,
                                                                    isCorrect: i === index
                                                                }));
                                                                form.setFieldsValue({ options });
                                                            }}
                                                        />
                                                    )}
                                                </Form.Item>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Form.List>
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                            <span className="font-semibold text-slate-700 text-sm">Đáp án chính xác</span>
                            <Form.List name="options">
                                {(fields) => (
                                    fields.slice(0, 1).map(({ key, name, ...restField }) => (
                                        <Form.Item
                                            key={key}
                                            {...restField}
                                            name={[name, 'text']}
                                            rules={[{ required: true, message: 'Nhập đáp án đúng' }]}
                                            className="mb-0"
                                        >
                                            <Input placeholder="Nhập đáp án đúng tại đây..." className="h-11 rounded-lg bg-white" />
                                        </Form.Item>
                                    ))
                                )}
                            </Form.List>
                        </div>
                    )}

                    <Form.Item
                        label={
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-700">Giải thích / Gợi ý</span>
                                <Tag className="m-0 text-[10px] bg-blue-50 text-[#0487e2] border-blue-100 font-bold">Cho AI Assistant</Tag>
                            </div>
                        }
                        name="explanation"
                        className="mb-0"
                    >
                        <Input.TextArea rows={2} placeholder="Giải thích đáp án để AI có thể hỗ trợ học sinh học tập tốt hơn..." className="rounded-lg p-3 text-sm" />
                    </Form.Item>

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <Button
                            className="flex-1 h-11 rounded-lg font-semibold border-slate-200 text-slate-600 hover:bg-slate-50"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            className="flex-1 h-11 rounded-lg font-bold bg-[#0487e2] border-none shadow-md"
                        >
                            {editingQuestion ? "Cập nhật" : "Lưu câu hỏi"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}