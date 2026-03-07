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
    Layout,
    FileUp,
    Zap,
    BookOpen,
    ChevronRight,
    Settings,
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
    Select
} from 'antd';
import {
    getQuizDetail,
    getTeacherQuizDetail,
    getQuestionOptions,
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

    // Bulk Modal state
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkText, setBulkText] = useState('');
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    const fetchQuizDetail = useCallback(async () => {
        try {
            setLoading(true);

            // Try Teacher API first (Ideally returns everything)
            let data;
            try {
                const teacherRes = await getTeacherQuizDetail(quizId);
                data = teacherRes.data || teacherRes;
            } catch (err) {
                console.warn("Teacher Quiz Detail API not available, falling back to Student API");
                const res = await getQuizDetail(quizId);
                data = res.data || res;
            }

            setQuiz(data);

            const rawQuestions = data.questions || [];

            // If the API already returned options with isCorrect, we don't need DEEP FETCH
            const hasOptions = rawQuestions.length > 0 &&
                (rawQuestions[0].options || rawQuestions[0].Options) &&
                (rawQuestions[0].options?.[0]?.isCorrect !== undefined || rawQuestions[0].Options?.[0]?.IsCorrect !== undefined);

            if (hasOptions) {
                setQuestions(rawQuestions);
            } else {
                // DEEP FETCH: For each question, get options via Teacher API to see isCorrect
                const fullQuestions = await Promise.all(
                    rawQuestions.map(async (q) => {
                        try {
                            const qId = q.id || q.Id || q.questionId || q.QuestionId;
                            const optRes = await getQuestionOptions(qId);
                            const optData = optRes.data || optRes;

                            // Map properly based on the provided schema: data might be [ { options: [...] } ]
                            let options = [];
                            if (Array.isArray(optData)) {
                                // If it's the schema: [ { questionId: ..., options: [...] } ]
                                if (optData[0]?.options) {
                                    options = optData[0].options;
                                } else {
                                    options = optData;
                                }
                            } else if (optData?.options) {
                                options = optData.options;
                            } else {
                                options = optData;
                            }

                            return { ...q, options };
                        } catch (err) {
                            return q;
                        }
                    })
                );
                setQuestions(fullQuestions);
            }
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
                    id: opt.id || opt.optionId || opt.OptionId,
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
        // Validation: Must have at least one correct answer
        const hasCorrect = values.options?.some(opt => opt.isCorrect);
        if (!hasCorrect && questionType !== 'ShortAnswer') {
            message.warning('Vui lòng chọn ít nhất một đáp án đúng!');
            return;
        }

        try {
            setSubmitting(true);
            const correctIdx = values.options.findIndex(opt => opt.isCorrect);
            const payload = {
                questionText: values.text,
                questionType: questionType,
                points: parseFloat(values.point) || 1,
                explanation: values.explanation || "",
                sortOrder: editingQuestion ? (editingQuestion.sortOrder || editingQuestion.SortOrder) : (questions.length + 1),
                // Add fields as per backend swagger description
                correctOptionIndex: correctIdx >= 0 ? correctIdx : 0,
                correctAnswer: (questionType === 'ShortAnswer' || questionType === 'TrueFalse')
                    ? values.options.find(opt => opt.isCorrect)?.text
                    : null,
                options: values.options.map((opt, idx) => ({
                    optionId: opt.id || opt.optionId || opt.OptionId || null,
                    optionText: opt.text,
                    isCorrect: questionType === 'ShortAnswer' ? true : (opt.isCorrect ?? false),
                    sortOrder: idx + 1
                }))
            };

            if (editingQuestion) {
                const questionIdToUpdate = editingQuestion.id || editingQuestion.Id || editingQuestion.questionId || editingQuestion.QuestionId;
                await updateQuestionInQuiz(quizId, questionIdToUpdate, payload);
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

    const handleBulkImport = async () => {
        if (!bulkText.trim()) {
            message.warning('Vui lòng nhập nội dung câu hỏi!');
            return;
        }

        setIsBulkProcessing(true);
        try {
            const lines = bulkText.split('\n');
            const newQuestions = [];
            let currentQ = null;

            lines.forEach(line => {
                const trimmed = line.trim();
                if (!trimmed) return;

                // Detect Question (Starts with number. or Q:)
                if (trimmed.match(/^\d+[\.\)]/) || trimmed.startsWith('Q:')) {
                    if (currentQ) newQuestions.push(currentQ);
                    currentQ = {
                        questionText: trimmed.replace(/^\d+[\.\)]\s*/, '').replace(/^Q:\s*/, ''),
                        questionType: 'MCQ',
                        points: 1,
                        options: []
                    };
                }
                // Detect Option (Starts with A,B,C,D or - or *)
                else if (currentQ && (trimmed.match(/^[A-Da-d][\.\)]/) || trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('+'))) {
                    const isCorrect = trimmed.includes('(*)') || trimmed.startsWith('*');
                    const optText = trimmed
                        .replace(/^[A-Da-d][\.\)]\s*/, '')
                        .replace(/^[\-\*\+]\s*/, '')
                        .replace(/\(\*\)/, '')
                        .trim();

                    currentQ.options.push({
                        optionText: optText,
                        isCorrect: isCorrect,
                        sortOrder: currentQ.options.length + 1
                    });
                }
            });

            if (currentQ) newQuestions.push(currentQ);

            if (newQuestions.length === 0) {
                message.error('Không tìm thấy cấu trúc câu hỏi hợp lệ. Vui lòng kiểm tra định dạng.');
                return;
            }

            // Sync sequential calls to avoid overwhelming backend
            message.loading({ content: `Đang xử lý ${newQuestions.length} câu hỏi...`, key: 'bulk_import' });

            for (const q of newQuestions) {
                // Ensure at least one correct answer if not marked
                if (!q.options.some(o => o.isCorrect) && q.options.length > 0) {
                    q.options[0].isCorrect = true;
                }
                await addQuestionToQuiz(quizId, q);
            }

            message.success({ content: `Đã nhập thành công ${newQuestions.length} câu hỏi!`, key: 'bulk_import' });
            setBulkText('');
            setIsBulkModalOpen(false);
            fetchQuizDetail();
        } catch (error) {
            console.error(error);
            message.error({ content: 'Lỗi trong quá trình nhập hàng loạt', key: 'bulk_import' });
        } finally {
            setIsBulkProcessing(false);
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

    const totalPoints = questions.reduce((sum, q) => sum + (parseFloat(q.points || q.point || q.Point || q.Points) || 0), 0);

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
                            { title: <span className="text-slate-400 cursor-pointer hover:text-[#0487e2]" onClick={() => navigate(`/dashboard/teacher/courses/${courseId}`)}>Chi tiết khóa học</span> },
                            { title: <span className="text-slate-600 font-bold">{quiz?.title}</span> },
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
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => setIsBulkModalOpen(true)}
                                    icon={<FileUp size={18} />}
                                    className="h-10 px-4 rounded-lg font-bold border-slate-200 text-slate-600 hover:text-[#0487e2] hover:border-blue-200 flex items-center"
                                >
                                    Nhập hàng loạt
                                </Button>
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
                <div className="space-y-6">
                    {questions.length > 0 ? (
                        questions.map((q, index) => {
                            const qType = q.questionType || q.type || q.QuestionType;
                            const qText = q.questionText || q.text || q.QuestionText;
                            const qPoints = q.points ?? q.point ?? q.Point ?? q.Points ?? 0;
                            const optionsList = q.options || q.Options || q.questionOptions || q.QuestionOptions || [];

                            return (
                                <div key={q.id || q.Id || q.questionId || q.QuestionId || index} className="group relative">
                                    <div className="absolute -left-3 top-6 bottom-6 w-1 bg-[#0487e2] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_8px_rgba(4,135,226,0.4)]"></div>

                                    <Card
                                        className="rounded-2xl border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-300 bg-white overflow-hidden"
                                        styles={{ body: { padding: '0' } }}
                                    >
                                        <div className="flex flex-col md:flex-row min-h-[160px]">
                                            {/* Side Info Panel */}
                                            <div className="md:w-32 bg-slate-50 border-r border-slate-100 p-6 flex flex-col items-center justify-between text-center shrink-0">
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Câu hỏi</div>
                                                    <div className="h-12 w-12 bg-white text-[#0487e2] flex items-center justify-center rounded-2xl font-black text-xl shadow-sm border border-slate-100 ring-4 ring-blue-50/50">
                                                        {index + 1}
                                                    </div>
                                                </div>

                                                <div className="mt-4 md:mt-0 pt-4 border-t border-slate-200/50 w-full">
                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Điểm số</div>
                                                    <Tag className="m-0 bg-[#0487e2]/10 text-[#0487e2] border-none font-black rounded-lg px-2 py-0.5 text-xs">
                                                        {qPoints}đ
                                                    </Tag>
                                                </div>
                                            </div>

                                            {/* Content Area */}
                                            <div className="flex-1 p-6 flex flex-col relative group/content">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            {qType === 'MCQ' && <Tag color="blue" className="rounded-md font-bold text-[10px] uppercase m-0 px-2 py-0.5 border-none shadow-sm">Một đáp án</Tag>}
                                                            {qType === 'MultipleChoice' && <Tag color="purple" className="rounded-md font-bold text-[10px] uppercase m-0 px-2 py-0.5 border-none shadow-sm">Nhiều đáp án</Tag>}
                                                            {qType === 'TrueFalse' && <Tag color="cyan" className="rounded-md font-bold text-[10px] uppercase m-0 px-2 py-0.5 border-none shadow-sm">Đúng/Sai</Tag>}
                                                            {qType === 'ShortAnswer' && <Tag color="orange" className="rounded-md font-bold text-[10px] uppercase m-0 px-2 py-0.5 border-none shadow-sm">Trả lời ngắn</Tag>}

                                                            {(q.explanation || q.Explanation) && (
                                                                <Tooltip title="Câu hỏi có phần giải thích AI">
                                                                    <div className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100">
                                                                        <Zap size={10} fill="currentColor" />
                                                                    </div>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                        <h3 className="text-base font-bold text-slate-800 leading-snug tracking-tight pr-16 group-hover/content:text-[#0487e2] transition-colors">
                                                            {qText || 'Chưa bộ dữ liệu nội dung câu hỏi'}
                                                        </h3>
                                                    </div>

                                                    {/* Desktop Actions */}
                                                    <div className="hidden md:flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 absolute top-6 right-6">
                                                        <Tooltip title="Chỉnh sửa câu hỏi">
                                                            <Button
                                                                onClick={() => handleOpenModal(q)}
                                                                icon={<Edit3 size={16} />}
                                                                className="h-9 w-9 flex items-center justify-center bg-white shadow-md border-slate-200 text-slate-400 hover:text-[#0487e2] hover:border-blue-200 rounded-xl transition-all"
                                                            />
                                                        </Tooltip>
                                                        <Tooltip title="Xóa vĩnh viễn">
                                                            <Button
                                                                danger
                                                                onClick={() => handleDeleteQuestion(q.id || q.Id || q.questionId || q.QuestionId)}
                                                                icon={<Trash2 size={16} />}
                                                                className="h-9 w-9 flex items-center justify-center bg-white shadow-md border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 rounded-xl transition-all"
                                                            />
                                                        </Tooltip>
                                                    </div>
                                                </div>

                                                {/* Options Grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
                                                    {optionsList.map((opt, oIdx) => {
                                                        const optCorrect = opt.isCorrect ?? opt.IsCorrect ?? opt.is_correct ?? false;
                                                        const qCorrectIdx = q.correctOptionIndex ?? q.CorrectOptionIndex;
                                                        const qCorrectAns = q.correctAnswer ?? q.CorrectAnswer;
                                                        const optText = opt.optionText || opt.text || opt.OptionText || "";

                                                        const isCorrect = optCorrect === true ||
                                                            String(optCorrect).toLowerCase() === "true" ||
                                                            (qCorrectIdx !== undefined && qCorrectIdx !== null && Number(qCorrectIdx) === oIdx) ||
                                                            (qCorrectAns && String(qCorrectAns).trim().toLowerCase() === String(optText).trim().toLowerCase());

                                                        return (
                                                            <div
                                                                key={opt.id || opt.Id || opt.optionId || opt.OptionId || oIdx}
                                                                className={`p-3 px-4 rounded-xl border flex items-center gap-3 transition-all ${isCorrect
                                                                    ? "bg-emerald-50/60 border-emerald-200 text-emerald-800 shadow-[0_2px_8px_-2px_rgba(16,185,129,0.1)] ring-1 ring-emerald-100"
                                                                    : "bg-slate-50/30 border-slate-100 text-slate-600 grayscale-[0.5] opacity-80"
                                                                    }`}
                                                            >
                                                                <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${isCorrect ? "bg-emerald-500 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-400"
                                                                    }`}>
                                                                    {String.fromCharCode(65 + oIdx)}
                                                                </div>
                                                                <span className={`text-sm tracking-tight truncate ${isCorrect ? "font-bold" : "font-medium text-slate-500"}`}>
                                                                    {optText}
                                                                </span>
                                                                {isCorrect && (
                                                                    <div className="ml-auto bg-emerald-100 p-1 rounded-full text-emerald-600">
                                                                        <Check size={10} strokeWidth={4} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Mobile Actions Overlay */}
                                                <div className="md:hidden flex gap-2 pt-4 mt-4 border-t border-slate-100">
                                                    <Button
                                                        block
                                                        onClick={() => handleOpenModal(q)}
                                                        icon={<Edit3 size={14} />}
                                                        className="rounded-lg font-bold text-xs h-9"
                                                    >Sửa</Button>
                                                    <Button
                                                        block
                                                        danger
                                                        onClick={() => handleDeleteQuestion(q.id || q.Id || q.questionId || q.QuestionId)}
                                                        icon={<Trash2 size={14} />}
                                                        className="rounded-lg font-bold text-xs h-9"
                                                    >Xóa</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-20 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
                            <Empty description="Chưa có câu hỏi nào trong bài thi này." />
                            <Button
                                type="primary"
                                icon={<Plus size={18} />}
                                onClick={() => handleOpenModal()}
                                className="mt-4 bg-[#0487e2] border-none font-bold rounded-lg h-10 px-6"
                            >
                                Tạo câu hỏi ngay
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0487e2]">
                            {editingQuestion ? <Edit3 size={18} /> : <Plus size={18} />}
                        </div>
                        <span className="text-lg font-bold text-slate-800">
                            {editingQuestion ? "Cập nhật câu hỏi" : "Thêm câu hỏi mới"}
                        </span>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={800}
                centered
                className="rounded-2xl"
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
            </Modal >

            {/* Bulk Import Modal */}
            < Modal
                title={
                    < div className="flex items-center gap-2" >
                        <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Zap size={18} />
                        </div>
                        <span className="text-lg font-bold text-slate-800">Nhập câu hỏi nhanh (Bulk Import)</span>
                    </div >
                }
                open={isBulkModalOpen}
                onCancel={() => !isBulkProcessing && setIsBulkModalOpen(false)}
                footer={null}
                width={700}
                centered
                className="rounded-2xl"
            >
                <div className="space-y-4">
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-4">
                        <div className="text-xs font-bold text-amber-700 uppercase mb-2">Hướng dẫn định dạng:</div>
                        <pre className="text-[10px] text-amber-600 font-medium leading-relaxed m-0">
                            {`1. Câu hỏi của bạn là gì?\nA. Đáp án sai\nB. Đáp án đúng (*)\n\nQ: Một câu hỏi khác?\n- Lựa chọn 1\n* Lựa chọn 2 (đúng)\n- Lựa chọn 3`}
                        </pre>
                    </div>

                    <Input.TextArea
                        value={bulkText}
                        onChange={e => setBulkText(e.target.value)}
                        placeholder="Dán nội dung câu hỏi vào đây..."
                        rows={12}
                        className="rounded-xl border-slate-200 bg-slate-50 p-4 font-medium"
                        disabled={isBulkProcessing}
                    />

                    <div className="flex gap-3 pt-2">
                        <Button
                            className="flex-1 h-11 rounded-xl font-bold text-slate-500"
                            onClick={() => setIsBulkModalOpen(false)}
                            disabled={isBulkProcessing}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            className="flex-1 h-11 rounded-xl font-bold bg-[#0487e2] border-none shadow-lg shadow-blue-100"
                            onClick={handleBulkImport}
                            loading={isBulkProcessing}
                        >
                            Bắt đầu nhập dữ liệu
                        </Button>
                    </div>
                </div>
            </Modal >
        </div >
    );
}