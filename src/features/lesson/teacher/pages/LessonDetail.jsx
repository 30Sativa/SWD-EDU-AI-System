import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Video,
    FileText,
    CheckSquare,
    Play,
    Download,
    Plus,
    Settings2,
    Clock,
    BookOpen,
    Layers,
    AlignLeft,
    Sparkles,
    Bot,
    Edit3,
    Trash2,
    Settings,
    Target,
    HelpCircle,
    Eye,
    FileVideo,
    MessageSquare,
    Image,
    HelpCircle as QuestionIcon
} from 'lucide-react';
import { Upload, Tag, Button, Tabs, Switch, Breadcrumb, Spin, message, Empty, Tooltip, Modal, Input, Select, InputNumber, Form } from 'antd';
import {
    getLessonDetail,
    getLessonBlocks,
    updateLesson,
    uploadLessonMaterial,
    generateAIBlocks,
    getAIPreviewBlocks,
    saveAIPreviewBlocks,
    createLessonBlock,
    deleteLessonBlock,
    updateLessonBlock,
    getLessonFaqs,
    createLessonFaq,
    updateLessonFaq,
    deleteLessonFaq
} from '../../api/lessonApi';
import { getLessonQuizzes, createFormativeQuiz, updateQuiz, deleteQuiz } from '../../../quiz/teacher/api/quizApi';


const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// Hàm làm sạch markdown và JSON thừa từ stream (giúp chạy chữ như ChatGPT)
const formatAIStream = (text) => {
    if (!text) return '';
    let cleaned = text;

    // 1. Loại bỏ các khối code kĩ thuật
    cleaned = cleaned.replace(/```(json|markdown|)\s*/gi, '');
    cleaned = cleaned.replace(/```/g, '');

    // 2. Xử lý các ký tự escape JSON (giúp hiển thị xuống dòng thực tế)
    cleaned = cleaned.replace(/\\n/g, '\n');
    cleaned = cleaned.replace(/\\"/g, '"');
    cleaned = cleaned.replace(/\\r/g, '');
    cleaned = cleaned.replace(/\\t/g, '    ');

    // 3. Nếu AI lỡ trả về định dạng JSON, lọc bỏ các cấu trúc kĩ thuật cực kì triệt để
    // Loại bỏ các key JSON phổ biến
    cleaned = cleaned.replace(/"(blocks|blockType|title|content|estimatedMinutes|isRequired|sortOrder|inputSourceType|inputContent|lessonTitle|saveToDB)":/gi, '');
    // Loại bỏ các dấu ngoặc, dấu phẩy dư thừa do cấu trúc JSON
    cleaned = cleaned.replace(/[\[\]\{\}]/g, ' ');
    cleaned = cleaned.replace(/,\s*"/g, '"');
    cleaned = cleaned.replace(/",\s*"/g, ' ');
    cleaned = cleaned.replace(/":\s*"/g, ': ');

    // 4. Loại bỏ các dấu ngoặc kép ở đầu và cuối nội dung nếu còn sót
    cleaned = cleaned.replace(/^"|"$|(?<=\s)"|"(?=\s)/g, '');

    // 5. Làm sạch Markdown bold/italic (theo yêu cầu user)
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
    cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');

    // 6. Dọn dẹp khoảng trắng thừa do việc xóa các ký tự trên
    cleaned = cleaned.replace(/\n\s+\n/g, '\n\n');
    cleaned = cleaned.replace(/ +/g, ' ');

    return cleaned.trim();
};

const cleanMarkdown = (text) => {
    if (!text) return '';
    return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
};

export default function LessonDetail() {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [lesson, setLesson] = useState(null);
    const [blocks, setBlocks] = useState([]);

    // AI States
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isAIGenerating, setIsAIGenerating] = useState(false);
    const [aiInputType, setAiInputType] = useState('Text');
    const [aiInputContent, setAiInputContent] = useState('');
    const [aiPreviewBlocks, setAiPreviewBlocks] = useState(null);
    const [isAIPreviewOpen, setIsAIPreviewOpen] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const [displayedStreamingContent, setDisplayedStreamingContent] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);

    // Quiz States
    const [quizzes, setQuizzes] = useState([]);
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    const [submittingQuiz, setSubmittingQuiz] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [form] = Form.useForm();

    // FAQ States
    const [faqs, setFaqs] = useState([]);
    const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
    const [submittingFaq, setSubmittingFaq] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [faqForm] = Form.useForm();

    // Manual Content States
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [submittingManual, setSubmittingManual] = useState(false);
    const [manualForm] = Form.useForm();

    // Edit Block States
    const [isEditBlockModalOpen, setIsEditBlockModalOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState(null);
    const [submittingEditBlock, setSubmittingEditBlock] = useState(false);
    const [editBlockForm] = Form.useForm();

    // Edit Lesson States
    const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
    const [submittingEditLesson, setSubmittingEditLesson] = useState(false);
    const [editLessonForm] = Form.useForm();

    // UI States
    const [activeTab, setActiveTab] = useState('1');

    const fetchLessonData = React.useCallback(async () => {
        try {
            setLoading(true);
            const [detailRes, blocksRes, quizzesRes, faqsRes] = await Promise.all([
                getLessonDetail(lessonId),
                getLessonBlocks(lessonId),
                getLessonQuizzes(lessonId),
                getLessonFaqs(lessonId)
            ]);
            setLesson(detailRes.data || detailRes);
            setBlocks(blocksRes.data || blocksRes || []);
            setQuizzes(quizzesRes.data || quizzesRes || []);
            setFaqs(faqsRes.data || faqsRes || []);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu bài học:", error);
            message.error("Không thể tải thông tin bài học");
        } finally {
            setLoading(false);
        }
    }, [lessonId]);

    useEffect(() => {
        if (lessonId) {
            fetchLessonData();
        }
    }, [lessonId, fetchLessonData]);

    // Hiệu ứng "nhả chữ" (typewriter) cho AI streaming
    useEffect(() => {
        if (isStreaming && streamingContent.length > displayedStreamingContent.length) {
            const timer = setTimeout(() => {
                setDisplayedStreamingContent(streamingContent.substring(0, displayedStreamingContent.length + 3)); // Nhả 3 ký tự một lần
            }, 30);
            return () => clearTimeout(timer);
        } else if (!isStreaming && streamingContent && displayedStreamingContent !== streamingContent) {
            // Đảm bảo hiển thị hết chữ khi đã xong streaming
            setDisplayedStreamingContent(streamingContent);
        }
    }, [streamingContent, displayedStreamingContent, isStreaming]);

    const handleTogglePublish = async (checked) => {
        try {
            await updateLesson(lessonId, { ...lesson, isPublished: checked });
            setLesson(prev => ({ ...prev, isPublished: checked }));
            message.success(checked ? "Đã công khai bài giảng" : "Đã chuyển thành bản nháp");
        } catch (error) {
            message.error("Lỗi khi cập nhật trạng thái bài giảng");
        }
    };

    const handleGenerateAI = async () => {
        if (!aiInputContent.trim()) {
            message.warning("Vui lòng nhập nội dung đầu vào cho AI");
            return;
        }

        try {
            setIsAIGenerating(true);
            setAiPreviewBlocks(null);
            setStreamingContent('');
            setIsStreaming(true);
            setIsAIModalOpen(false);
            setIsAIPreviewOpen(true);

            // BƯỚC 1: STREAMING (Dùng fetch trực tiếp vì axios không hỗ trợ streaming tốt)
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/teacher/lessons/${lessonId}/blocks/generate-ai-stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    inputSourceType: aiInputType,
                    inputContent: aiInputContent + "\n\n(Lưu ý: Hãy viết nội dung bài giảng chi tiết. KHÔNG sử dụng định dạng markdown bôi đậm bằng dấu ** hoặc * trong văn bản.)",
                    lessonTitle: lesson?.title || "Bài học mới",
                    saveToDB: false
                })
            });

            if (!response.ok) throw new Error("Lỗi khi kết nối với luồng AI");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = '';
            let sseBuffer = '';

            setStreamingContent('');
            setDisplayedStreamingContent('');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                sseBuffer += chunk;

                // Xử lý SSE (data: {...})
                const lines = sseBuffer.split('\n');
                sseBuffer = lines.pop(); // Giữ lại dòng cuối cùng (có thể chưa hoàn chỉnh)

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) continue;

                    if (trimmedLine.startsWith('data: ')) {
                        const jsonStr = trimmedLine.substring(6);
                        if (jsonStr === '[DONE]') break;

                        try {
                            const json = JSON.parse(jsonStr);
                            const text = json.text || json.content || json.choices?.[0]?.delta?.content || "";
                            if (text) {
                                accumulatedText += text;
                                setStreamingContent(formatAIStream(accumulatedText));
                            }
                        } catch (e) {
                            // Bỏ qua nếu dòng JSON bị cắt ngang chưa parse được
                        }
                    }
                }
            }

            setIsStreaming(false);

            // BƯỚC 2: TỐI ƯU HÓA - Thử parse JSON từ luồng đã nhận để giảm tải API (tránh lỗi Quota)
            let finalBlocks = [];
            try {
                // Tìm đoạn JSON trong văn bản (loại bỏ ```json và các rác văn bản xung quanh)
                let jsonMatch = accumulatedText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    finalBlocks = parsed.blocks || parsed.generatedBlocks || (Array.isArray(parsed) ? parsed : []);
                }
            } catch (e) {
                console.log("Không thể parse trực tiếp từ stream, sẽ dùng fallback API...");
            }

            // Nếu không lấy được blocks từ stream, mới gọi API fallback (vốn tốn thêm 1 lần quota AI)
            if (finalBlocks.length === 0) {
                message.loading({ content: 'Đang chuẩn hóa dữ liệu...', key: 'ai_loading' });
                await generateAIBlocks(lessonId, {
                    inputSourceType: aiInputType,
                    inputContent: aiInputContent,
                    lessonTitle: lesson?.title || "Bài học mới",
                    saveToDB: false
                });

                const previewRes = await getAIPreviewBlocks(lessonId);
                if (Array.isArray(previewRes)) {
                    finalBlocks = previewRes;
                } else if (previewRes?.data?.generatedBlocks && Array.isArray(previewRes.data.generatedBlocks)) {
                    finalBlocks = previewRes.data.generatedBlocks;
                } else if (previewRes?.data && Array.isArray(previewRes.data)) {
                    finalBlocks = previewRes.data;
                } else if (previewRes) {
                    finalBlocks = previewRes.blocks || previewRes.generatedBlocks || previewRes.items || previewRes.result || [];
                }
            }

            finalBlocks = finalBlocks.filter(b => b && (b.content || b.Content || b.blockType || b.BlockType));

            // Làm sạch nội dung các block trước khi hiển thị preview
            const cleanedBlocks = finalBlocks.map(b => ({
                ...b,
                title: cleanMarkdown(b.title || b.Title || ''),
                content: cleanMarkdown(b.content || b.Content || '')
            }));

            setAiPreviewBlocks(cleanedBlocks);
            message.success({ content: 'Đã hoàn tất sinh nội dung!', key: 'ai_loading', duration: 2 });

        } catch (error) {
            console.error("Lỗi AI:", error);
            setIsStreaming(false);
            const errorMessage = error.message || "Không thể kết nối với AI. Vui lòng thử lại sau.";
            message.error({ content: errorMessage, key: 'ai_loading', duration: 5 });
            setIsAIPreviewOpen(false);
        } finally {
            setIsAIGenerating(false);
        }
    };

    const handleUpdateAIPreviewBlock = (index, field, value) => {
        const newBlocks = [...aiPreviewBlocks];
        // Ensure we normalize the property names if they come back from backend with different casing
        const block = { ...newBlocks[index] };

        // Handle both Title/title and Content/content
        if (field === 'title') {
            if ('Title' in block) block.Title = value;
            else block.title = value;
        } else if (field === 'content') {
            if ('Content' in block) block.Content = value;
            else block.content = value;
        } else {
            block[field] = value;
        }

        newBlocks[index] = block;
        setAiPreviewBlocks(newBlocks);
    };

    const handleConfirmAI = async () => {
        if (!Array.isArray(aiPreviewBlocks) || aiPreviewBlocks.length === 0) return;

        try {
            setIsAIGenerating(true);

            // Đảm bảo dữ liệu gửi lên cũng được làm sạch
            const cleanedBlocksBeforeSave = aiPreviewBlocks.map(b => ({
                ...b,
                title: cleanMarkdown(b.title || b.Title || ''),
                content: cleanMarkdown(b.content || b.Content || '')
            }));

            await saveAIPreviewBlocks(lessonId, { blocks: cleanedBlocksBeforeSave });
            message.success("Tuyệt vời! Nội dung đã được lưu vào bài học.");
            setIsAIPreviewOpen(false);
            setAiPreviewBlocks(null);
            setAiInputContent('');
            fetchLessonData();
        } catch (error) {
            message.error("Lỗi khi lưu nội dung AI.");
        } finally {
            setIsAIGenerating(false);
        }
    };

    const handleManualSubmit = async (values) => {
        try {
            setSubmittingManual(true);
            const steps = [
                { title: '1. Khái niệm & Lý thuyết', content: values.concept, blockType: 'Concept' },
                { title: '2. Ví dụ minh họa', content: values.example, blockType: 'Example' },
                { title: '3. Bài tập thực hành', content: values.exercise, blockType: 'Exercise' },
                { title: '4. Câu hỏi củng cố', content: values.reflection, blockType: 'Reflection' }
            ].filter(step => step.content);

            await Promise.all(steps.map((step, index) =>
                createLessonBlock(lessonId, {
                    title: step.title,
                    content: step.content,
                    blockType: step.blockType,
                    sortOrder: (blocks.length || 0) + index + 1,
                    isRequired: true
                })
            ));

            message.success("Đã thêm nội dung bài học thành công!");
            setIsManualModalOpen(false);
            manualForm.resetFields();
            fetchLessonData();
        } catch (error) {
            message.error("Có lỗi xảy ra khi lưu nội dung. Vui lòng thử lại.");
        } finally {
            setSubmittingManual(false);
        }
    };

    const handleEditBlock = (block) => {
        setEditingBlock(block);
        editBlockForm.setFieldsValue({
            title: block.title,
            content: block.content,
            blockType: block.blockType || block.type,
            sortOrder: block.sortOrder || 0,
            estimatedMinutes: block.estimatedMinutes || 0,
            isRequired: block.isRequired ?? true
        });
        setIsEditBlockModalOpen(true);
    };

    const handleFaqSubmit = async (values) => {
        try {
            setSubmittingFaq(true);
            if (editingFaq) {
                await updateLessonFaq(lessonId, editingFaq.id, values);
                message.success("Cập nhật câu hỏi thành công!");
            } else {
                await createLessonFaq(lessonId, {
                    ...values,
                    sortOrder: faqs.length + 1
                });
                message.success("Thêm câu hỏi thành công!");
            }
            setIsFaqModalOpen(false);
            faqForm.resetFields();
            const faqsRes = await getLessonFaqs(lessonId);
            setFaqs(faqsRes.data || faqsRes || []);
        } catch (error) {
            message.error("Lỗi khi lưu câu hỏi.");
        } finally {
            setSubmittingFaq(false);
        }
    };

    const handleEditFaq = (faq) => {
        setEditingFaq(faq);
        faqForm.setFieldsValue({
            question: faq.question,
            answer: faq.answer
        });
        setIsFaqModalOpen(true);
    };

    const handleDeleteFaq = async (faqId) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa câu hỏi này không?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await deleteLessonFaq(lessonId, faqId);
                    message.success("Đã xóa câu hỏi");
                    const faqsRes = await getLessonFaqs(lessonId);
                    setFaqs(faqsRes.data || faqsRes || []);
                } catch (error) {
                    message.error("Lỗi khi xóa câu hỏi");
                }
            }
        });
    };

    const handleUpdateBlock = async (values) => {
        try {
            setSubmittingEditBlock(true);
            await updateLessonBlock(lessonId, editingBlock.id, {
                ...values,
                blockType: values.blockType,
                content: values.content,
                sortOrder: values.sortOrder,
                isRequired: values.isRequired,
                estimatedMinutes: values.estimatedMinutes
            });

            message.success("Cập nhật nội dung thành công!");
            setIsEditBlockModalOpen(false);
            fetchLessonData();
        } catch (error) {
            message.error("Không thể cập nhật nội dung.");
        } finally {
            setSubmittingEditBlock(false);
        }
    };

    const handleDeleteBlock = async (blockId) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa khối nội dung này? Hành động này không thể hoàn tác.',
            okText: 'Xóa ngay',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await deleteLessonBlock(lessonId, blockId);
                    message.success("Đã xóa khối nội dung");
                    fetchLessonData();
                } catch (error) {
                    message.error("Lỗi khi xóa khối nội dung");
                }
            }
        });
    };

    const handleUpdateLessonBasic = async (values) => {
        try {
            setSubmittingEditLesson(true);
            await updateLesson(lessonId, {
                ...lesson,
                ...values
            });
            message.success("Cập nhật thông tin bài học thành công!");
            setIsEditLessonModalOpen(false);
            fetchLessonData();
        } catch (error) {
            message.error("Lỗi khi cập nhật thông tin bài học");
        } finally {
            setSubmittingEditLesson(false);
        }
    };

    const handleOpenQuizModal = (quiz = null) => {
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
                timeLimit: 15,
                maxAttempts: 1,
                passingScore: 50,
                isPublished: false
            });
        }
        setIsQuizModalOpen(true);
    };

    const handleQuizSubmit = async (values) => {
        try {
            setSubmittingQuiz(true);
            if (editingQuiz) {
                await updateQuiz(editingQuiz.id, values);
                message.success("Cập nhật bài kiểm tra thành công");
            } else {
                await createFormativeQuiz({
                    ...values,
                    lessonId: lessonId
                });
                message.success("Tạo bài kiểm tra thành công");
            }
            setIsQuizModalOpen(false);
            fetchLessonData();
        } catch (err) {
            message.error("Có lỗi xảy ra khi lưu bài kiểm tra");
        } finally {
            setSubmittingQuiz(false);
        }
    };

    const handleDeleteQuiz = async (id) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa bài kiểm tra này không? Hành động này không thể hoàn tác.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await deleteQuiz(id);
                    message.success("Đã xóa bài kiểm tra");
                    fetchLessonData();
                } catch (err) {
                    message.error("Lỗi khi xóa bài kiểm tra");
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Spin size="large" />
                <p className="mt-4 text-slate-500 font-medium">Đang tải chi tiết bài học...</p>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <Empty description={<span className="text-slate-500 font-medium">Không tìm thấy bài học</span>}>
                    <Button type="primary" onClick={() => navigate(-1)} className="bg-[#0487e2] h-10 px-6 rounded-lg font-bold">Quay lại</Button>
                </Empty>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800 pb-12">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <Breadcrumb
                        className="text-xs font-medium text-slate-500"
                        items={[
                            { title: <a onClick={() => navigate('/dashboard/teacher/courses')} className="hover:text-[#0487e2] transition-colors">Khóa học</a> },
                            { title: <span className="cursor-pointer hover:text-[#0487e2] transition-colors" onClick={() => navigate(-1)}>Chi tiết</span> },
                            { title: <span className="text-slate-800 font-bold">{lesson.title}</span> },
                        ]}
                    />

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-200">
                        <div className="flex items-start gap-4">
                            <Button
                                type="text"
                                icon={<ArrowLeft size={22} />}
                                onClick={() => navigate(-1)}
                                className="mt-1 h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm hover:text-[#0487e2] hover:border-[#0487e2] hover:bg-blue-50 transition-all"
                            />
                            <div className="space-y-1">
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0463ca] m-0 leading-tight">
                                    {lesson.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Layers size={14} className="text-[#0487e2]" /> {lesson.subjectName || 'Môn học'}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} className="text-amber-500" /> {lesson.duration || 0} phút
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                icon={<Eye size={16} />}
                                className="h-10 px-4 rounded-lg font-semibold border-slate-200 text-slate-600 hover:border-[#0487e2] hover:text-[#0487e2] transition-all flex items-center gap-2 bg-white"
                            >
                                Xem thử
                            </Button>
                            <Button
                                type="primary"
                                className="bg-[#0487e2] hover:bg-[#0374c4] h-10 px-6 rounded-lg font-bold shadow-md border-none transition-all"
                            >
                                Lưu thay đổi
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="bg-white px-5 rounded-xl border border-slate-200 shadow-sm mt-4">
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        className="custom-tabs"
                        items={[
                            { key: '1', label: 'Nội dung bài giảng' },
                            { key: '2', label: 'Tài liệu & Tài nguyên' },
                            { key: '3', label: 'Bài tập & Quiz' },
                            { key: '4', label: 'Thống kê' },
                        ]}
                    />
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Content (Chiếm 2/3) */}
                    <div className="lg:col-span-2 space-y-6">

                        {activeTab === '1' && (
                            <>
                                {/* Video Preview Container */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="aspect-video bg-slate-900 relative flex items-center justify-center group">
                                        {lesson.type === 'Video' || !lesson.type ? (
                                            <>
                                                {getYoutubeId(lesson.content) ? (
                                                    <iframe
                                                        className="absolute inset-0 w-full h-full border-0"
                                                        src={`https://www.youtube.com/embed/${getYoutubeId(lesson.content)}?rel=0&modestbranding=1&autohide=1&showinfo=0`}
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        title="Video bài học"
                                                    ></iframe>
                                                ) : (
                                                    <>
                                                        <img
                                                            src={lesson.thumbnail || "https://images.unsplash.com/photo-1610484826967-09c5720778c7?q=80&w=2070&auto=format&fit=crop"}
                                                            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity duration-300"
                                                            alt="Video preview"
                                                        />
                                                        <div className="relative z-10">
                                                            <button className="w-16 h-16 bg-[#0487e2]/90 hover:bg-[#0487e2] text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/20">
                                                                <Play size={28} fill="currentColor" className="ml-1" />
                                                            </button>
                                                        </div>
                                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10">
                                                            <div>
                                                                <Tag className="bg-blue-500/80 text-white border-none font-bold backdrop-blur-md mb-2">VIDEO CHÍNH</Tag>
                                                                <h3 className="text-white font-bold text-lg drop-shadow-md line-clamp-1">{lesson.title}</h3>
                                                            </div>
                                                            <div className="bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded text-xs font-bold">
                                                                {lesson.duration || '00:00'}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 text-slate-400">
                                                {(lesson.type === 'Document' || lesson.type === 'Text') ? <FileText size={48} /> : <CheckSquare size={48} />}
                                                <p className="font-bold">Bài giảng dạng: {lesson.type}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-xs text-slate-500 font-medium">Bạn có thể thay đổi hoặc tải lên video mới trong phần Cài đặt.</span>
                                        <Button
                                            type="text"
                                            size="small"
                                            className="text-[#0487e2] font-semibold hover:bg-blue-50"
                                            onClick={() => {
                                                editLessonForm.setFieldsValue({
                                                    title: lesson.title,
                                                    type: lesson.type || 'Video',
                                                    duration: lesson.duration,
                                                    content: lesson.content
                                                });
                                                setIsEditLessonModalOpen(true);
                                            }}
                                        >
                                            Đổi Video
                                        </Button>
                                    </div>
                                </div>

                                {/* Blocks/Content Editor Section */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                            <AlignLeft size={18} className="text-[#0487e2]" />
                                            Nội dung & Khối kiến thức
                                        </h2>
                                        <div className="flex gap-2">
                                            <Button
                                                icon={<Sparkles size={14} />}
                                                onClick={() => {
                                                    if (lesson?.canUseAI === false) {
                                                        message.warning("Bài học này chưa được kích hoạt tính năng AI. Vui lòng liên hệ Quản trị viên.");
                                                        return;
                                                    }
                                                    setIsAIModalOpen(true);
                                                }}
                                                className={`h-9 px-3 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${lesson?.canUseAI === false ? 'bg-slate-100 text-slate-400 border-slate-200 pointer-events-none' : 'bg-[#0487e2] text-white border-none shadow-sm hover:bg-[#0374c4]'}`}
                                                title={lesson?.canUseAI === false ? "Tính năng AI bị khóa cho bài học này" : ""}
                                            >
                                                Soạn bằng AI
                                            </Button>
                                            <Button
                                                type="dashed"
                                                icon={<Plus size={14} />}
                                                onClick={() => setIsManualModalOpen(true)}
                                                className="h-9 px-3 rounded-lg border-slate-300 text-slate-600 font-semibold hover:border-[#0487e2] hover:text-[#0487e2] flex items-center gap-1.5"
                                            >
                                                Thêm thủ công
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        {/* Description */}
                                        <div className="mb-6">
                                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mô tả bài học</h3>
                                            {lesson.content ? (
                                                <div className="p-4 bg-slate-50 rounded-xl text-slate-700 font-medium text-sm border border-slate-100 whitespace-pre-wrap">
                                                    {lesson.content}
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 font-medium italic text-sm">
                                                    Chưa có mô tả tổng quan cho bài học này.
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Các khối kiến thức</h3>
                                            {blocks && blocks.length > 0 ? (
                                                <div className="space-y-4">
                                                    {blocks.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((block, idx) => {
                                                        const p = (t) => {
                                                            switch (t) {
                                                                case 'Concept': return { l: 'Lý thuyết', c: 'blue' };
                                                                case 'Example': return { l: 'Ví dụ', c: 'green' };
                                                                case 'Exercise': return { l: 'Thực hành', c: 'orange' };
                                                                case 'Reflection': return { l: 'Củng cố', c: 'purple' };
                                                                default: return { l: 'Nội dung', c: 'default' };
                                                            }
                                                        };
                                                        const params = p(block.blockType || block.type);

                                                        return (
                                                            <div key={block.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition-all shadow-sm hover:shadow-md group relative flex gap-4">
                                                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0487e2] flex items-center justify-center font-bold text-sm shrink-0">
                                                                    {idx + 1}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start justify-between mb-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <h4 className="font-bold text-slate-800 text-base m-0 leading-none">{block.title || params.l}</h4>
                                                                            <Tag color={params.c} className="m-0 text-[10px] font-bold uppercase border-none">{params.l}</Tag>
                                                                        </div>
                                                                        <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <Button
                                                                                type="text"
                                                                                size="small"
                                                                                icon={<Edit3 size={14} />}
                                                                                onClick={() => handleEditBlock(block)}
                                                                                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-[#0487e2] hover:bg-blue-50 rounded"
                                                                            />
                                                                            <Button
                                                                                type="text"
                                                                                size="small"
                                                                                icon={<Trash2 size={14} />}
                                                                                onClick={() => handleDeleteBlock(block.id)}
                                                                                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                                                                        {block.content}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center">
                                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-300 mb-3">
                                                        <Layers size={20} />
                                                    </div>
                                                    <p className="text-slate-500 font-medium mb-1">Chưa có khối nội dung nào.</p>
                                                    <p className="text-slate-400 text-xs">Hãy thêm các phần diễn giải, hình ảnh hoặc ví dụ chi tiết.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === '3' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                        <div>
                                            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                                <CheckSquare size={18} className="text-[#0487e2]" />
                                                Bài kiểm tra tiến trình (Formative Quiz)
                                            </h2>
                                            <p className="text-xs text-slate-500 font-medium mt-1">Học sinh làm bài ngay sau khi kết thúc bài giảng</p>
                                        </div>
                                        <Button
                                            type="primary"
                                            icon={<Plus size={16} />}
                                            onClick={() => handleOpenQuizModal()}
                                            className="bg-[#0487e2] hover:bg-[#0374c4] font-bold rounded-lg h-10 px-4 shadow-sm border-none"
                                        >
                                            Tạo Quiz
                                        </Button>
                                    </div>

                                    <div className="p-6">
                                        {quizzes.length > 0 ? (
                                            <div className="space-y-4">
                                                {quizzes.map((quiz) => (
                                                    <div key={quiz.id} className="group relative flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border border-slate-200 rounded-xl transition-all duration-300 hover:shadow-md hover:border-blue-200 overflow-hidden">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-[#0487e2] group-hover:text-white rounded-lg transition-all duration-300 border border-slate-100 shrink-0">
                                                                <CheckSquare size={20} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-3 mb-1">
                                                                    <span className="font-bold text-slate-800 text-base truncate">{quiz.title}</span>
                                                                    <Tag className={`m-0 border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded ${quiz.isPublished ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                                                                        {quiz.isPublished ? "Công khai" : "Bản nháp"}
                                                                    </Tag>
                                                                </div>
                                                                <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 uppercase">
                                                                    <span className="flex items-center gap-1"><Clock size={12} /> {quiz.timeLimit} phút</span>
                                                                    <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                                                    <span className="flex items-center gap-1 text-[#0487e2]"><Target size={12} /> {quiz.passingScore}% đạt</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-4 md:mt-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                                                            <Button
                                                                onClick={() => navigate(`/dashboard/teacher/courses/${courseId}/quizzes/${quiz.id}`)}
                                                                className="h-9 px-4 rounded-lg border-slate-200 text-slate-600 font-bold hover:text-[#0487e2] hover:border-[#0487e2] flex items-center gap-1.5"
                                                            >
                                                                <Edit3 size={14} /> Thiết kế
                                                            </Button>
                                                            <Tooltip title="Cài đặt">
                                                                <Button
                                                                    onClick={() => handleOpenQuizModal(quiz)}
                                                                    icon={<Settings size={14} />}
                                                                    className="h-9 w-9 rounded-lg border-slate-200 text-slate-400 hover:text-[#0487e2] hover:border-[#0487e2] flex items-center justify-center"
                                                                />
                                                            </Tooltip>
                                                            <Button
                                                                danger
                                                                icon={<Trash2 size={14} />}
                                                                onClick={() => handleDeleteQuiz(quiz.id)}
                                                                className="h-9 w-9 rounded-lg border-slate-200 hover:bg-rose-50 flex items-center justify-center"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-slate-300">
                                                    <HelpCircle size={28} />
                                                </div>
                                                <h3 className="text-slate-700 font-bold text-sm mb-1">Chưa có bài kiểm tra nào</h3>
                                                <p className="text-slate-400 text-xs mb-4">Đánh giá mức độ hiểu bài của học sinh ngay sau bài giảng.</p>
                                                <Button
                                                    type="primary"
                                                    icon={<Plus size={14} />}
                                                    onClick={() => handleOpenQuizModal()}
                                                    className="bg-[#0487e2] font-bold rounded-lg h-9 px-5 border-none"
                                                >
                                                    Tạo bài quiz
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {(activeTab === '2' || activeTab === '4') && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                                <Empty description={<span className="text-slate-400 font-medium text-sm">Tính năng đang được phát triển...</span>} />
                            </div>
                        )}
                    </div>

                    {/* Right Column: Settings & Resources (Chiếm 1/3) */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Status & Visibility Card */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                                <Settings2 size={18} className="text-[#0487e2]" />
                                <h3 className="font-bold text-slate-800 text-sm">Cấu hình hiển thị</h3>
                            </div>

                            <div className="p-5 space-y-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-[#0487e2] text-sm flex items-center gap-1.5">
                                            <Sparkles size={14} /> AI Assistant
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5">Sử dụng AI soạn bài</div>
                                    </div>
                                    <Switch
                                        checked={lesson.canUseAI}
                                        onChange={async (checked) => {
                                            try {
                                                await updateLesson(lessonId, { ...lesson, canUseAI: checked });
                                                setLesson(prev => ({ ...prev, canUseAI: checked }));
                                                message.success(checked ? "Đã bật tính năng AI" : "Đã tắt tính năng AI");
                                            } catch (error) {
                                                message.error("Không thể cập nhật quyền AI");
                                            }
                                        }}
                                        className={lesson.canUseAI ? 'bg-[#0487e2]' : ''}
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm">Cho phép tải tài liệu</div>
                                        <div className="text-xs text-slate-500 mt-0.5">Quyền tải PDF, Slides...</div>
                                    </div>
                                    <Switch defaultChecked className="bg-[#0487e2]" />
                                </div>
                            </div>
                        </div>

                        {/* Materials Section */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <BookOpen size={18} className="text-[#0487e2]" />
                                    <h3 className="font-bold text-slate-800 text-sm">Tài liệu đính kèm</h3>
                                </div>
                                <span className="w-5 h-5 rounded-full bg-blue-50 text-[#0487e2] text-xs font-bold flex items-center justify-center border border-blue-100">
                                    {lesson?.materials?.length || 0}
                                </span>
                            </div>

                            <div className="p-5 space-y-3">
                                {(() => {
                                    const allMaterials = [...(lesson?.materials || [])];

                                    if (lesson?.materialUrl && !allMaterials.find(m => m.url === lesson.materialUrl)) {
                                        allMaterials.push({
                                            title: lesson.materialName || "Tài liệu bài học",
                                            url: lesson.materialUrl,
                                            type: lesson.materialType,
                                            isNew: true
                                        });
                                    }

                                    if (allMaterials.length === 0) {
                                        return (
                                            <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                                <p className="text-xs text-slate-400 font-medium">Chưa có tài liệu nào</p>
                                            </div>
                                        );
                                    }

                                    return allMaterials.map((doc, idx) => (
                                        <a
                                            key={idx}
                                            href={doc.url || doc.path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={doc.title || doc.name || 'Tài liệu'}
                                            className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group/item no-underline block"
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${doc.type?.toLowerCase()?.includes('pdf') ? 'bg-rose-50 text-rose-500' :
                                                (doc.type?.toLowerCase()?.match(/\.(jpg|jpeg|png|gif|webp)$/) || doc.type?.toLowerCase()?.includes('image')) ? 'bg-emerald-50 text-emerald-500' :
                                                    'bg-orange-50 text-orange-500'
                                                }`}>
                                                {doc.type?.toLowerCase()?.includes('pdf') ? <FileText size={20} /> :
                                                    (doc.type?.toLowerCase()?.includes('mp4') ? <FileVideo size={20} /> :
                                                        ((doc.type?.toLowerCase()?.match(/\.(jpg|jpeg|png|gif|webp)$/) || doc.type?.toLowerCase()?.includes('image')) ? <Image size={20} /> : <BookOpen size={20} />))}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-[13px] text-slate-700 group-hover/item:text-[#0487e2] transition-colors truncate">
                                                    {doc.title || doc.name || 'Tài liệu không tên'}
                                                    {doc.isNew && <span className="ml-2 text-[9px] bg-blue-500 text-white px-1 rounded">MỚI</span>}
                                                </div>
                                                <div className="text-[11px] font-semibold text-slate-400 mt-0.5 uppercase">{doc.type || 'FILE'}</div>
                                            </div>
                                            <div className="w-8 h-8 shrink-0 flex items-center justify-center text-slate-300 group-hover/item:text-[#0487e2] group-hover/item:bg-white rounded-md transition-all">
                                                <Download size={16} />
                                            </div>
                                        </a>
                                    ));
                                })()}

                                <Upload
                                    accept=".pdf,.pptx,.ppt,.docx,.doc,.mp4,.jpg,.jpeg,.png,.gif,.webp"
                                    beforeUpload={(file) => {
                                        const allowedExtensions = ['.pdf', '.pptx', '.ppt', '.docx', '.doc', '.mp4', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
                                        const fileExt = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
                                        const isAllowedType = allowedExtensions.includes(fileExt);

                                        if (!isAllowedType) {
                                            message.error('Chỉ hỗ trợ file PDF, PPTX, DOCX, MP4 hoặc Hình ảnh (JPG, PNG, GIF, WEBP)!');
                                            return Upload.LIST_IGNORE;
                                        }
                                        const currentCount = lesson?.materials?.length || 0;
                                        if (currentCount >= 2) {
                                            message.warning('Mỗi bài học chỉ được phép gán tối đa 2 tài liệu!');
                                            return Upload.LIST_IGNORE;
                                        }
                                        return true;
                                    }}
                                    customRequest={async ({ file, onSuccess, onError }) => {
                                        try {
                                            const res = await uploadLessonMaterial(lessonId, file);
                                            const uploadData = res?.data || res;
                                            await updateLesson(lessonId, {
                                                ...lesson,
                                                materialUrl: uploadData.materialUrl || uploadData.MaterialUrl,
                                                materialType: uploadData.materialType || uploadData.MaterialType,
                                                videoType: uploadData.videoType || uploadData.VideoType
                                            });
                                            onSuccess();
                                            message.success("Tải lên và gán tài liệu thành công");
                                            fetchLessonData();
                                        } catch (e) {
                                            onError(e);
                                            message.error("Lỗi khi tải lên tài liệu");
                                        }
                                    }}
                                    showUploadList={false}
                                >
                                    <Button
                                        type="dashed"
                                        block
                                        className="mt-2 h-10 rounded-lg border-slate-300 text-slate-500 font-semibold hover:border-[#0487e2] hover:text-[#0487e2]"
                                        icon={<Plus size={16} />}
                                        disabled={(lesson?.materials?.length || 0) >= 2}
                                    >
                                        {(lesson?.materials?.length || 0) >= 2 ? "Đã đạt giới hạn tài liệu" : "Tải lên tài liệu"}
                                    </Button>
                                </Upload>
                            </div>
                        </div>

                        {/* FAQs Card */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
                            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <MessageSquare size={18} className="text-[#0487e2]" />
                                    <h3 className="font-bold text-slate-800 text-sm">Câu hỏi thường gặp</h3>
                                </div>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<Plus size={14} />}
                                    onClick={() => {
                                        setEditingFaq(null);
                                        faqForm.resetFields();
                                        setIsFaqModalOpen(true);
                                    }}
                                    className="text-[#0487e2] font-semibold h-8 flex items-center gap-1 hover:bg-blue-50 px-2 rounded-lg"
                                >
                                    Thêm
                                </Button>
                            </div>
                            <div className="p-4">
                                {faqs.length > 0 ? (
                                    <div className="space-y-3">
                                        {faqs.map((faq) => (
                                            <div key={faq.id} className="group bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 hover:border-blue-200 hover:bg-white hover:shadow-sm transition-all relative">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex-1 min-w-0 pr-6">
                                                        <div className="font-bold text-slate-800 text-xs mb-1 line-clamp-2 leading-tight">
                                                            {faq.question}
                                                        </div>
                                                        <div className="text-slate-500 text-[11px] line-clamp-2 italic leading-relaxed">
                                                            {faq.answer}
                                                        </div>
                                                    </div>
                                                    <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            type="text"
                                                            size="small"
                                                            icon={<Edit3 size={11} />}
                                                            onClick={() => handleEditFaq(faq)}
                                                            className="h-6 w-6 flex items-center justify-center p-0 rounded-md bg-white border border-slate-100 text-slate-400 hover:text-[#0487e2] shadow-sm"
                                                        />
                                                        <Button
                                                            type="text"
                                                            size="small"
                                                            icon={<Trash2 size={11} />}
                                                            onClick={() => handleDeleteFaq(faq.id)}
                                                            className="h-6 w-6 flex items-center justify-center p-0 rounded-md bg-white border border-slate-100 text-slate-400 hover:text-rose-600 shadow-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                        <MessageSquare size={20} className="text-slate-200 mx-auto mb-2" />
                                        <p className="text-slate-400 text-[11px] font-medium leading-relaxed">Chưa có FAQ nào. Hãy thêm thắc mắc thường gặp của học viên.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-tabs .ant-tabs-nav {
                    margin-bottom: 0 !important;
                }
                .custom-tabs .ant-tabs-tab {
                    padding: 16px 0;
                    margin: 0 32px 0 0;
                }
                .custom-tabs .ant-tabs-tab-btn {
                    font-size: 14px;
                    font-weight: 700;
                    color: #64748b;
                }
                .custom-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
                    color: #0487e2 !important;
                }
                .custom-tabs .ant-tabs-ink-bar {
                    background: #0487e2 !important;
                    height: 3px !important;
                    border-radius: 3px 3px 0 0;
                }
            `}</style>

            {/* AI Input Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <Bot size={20} className="text-[#0487e2]" />
                        <span className="font-bold text-lg">Trợ lý AI soạn nội dung</span>
                    </div>
                }
                open={isAIModalOpen}
                onCancel={() => setIsAIModalOpen(false)}
                footer={null}
                width={600}
                centered
                className="custom-modal"
            >
                <div className="space-y-5 pt-4">
                    <p className="text-slate-500 text-sm m-0">
                        AI sẽ dựa trên nội dung cung cấp để sinh ra 4 khối kiến thức chuẩn:
                        <span className="font-bold text-slate-700"> Lý thuyết → Ví dụ → Thực hành → Củng cố</span>.
                    </p>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Nguồn dữ liệu</label>
                        <Select
                            defaultValue="Text"
                            className="w-full h-11 [&>.ant-select-selector]:!rounded-lg"
                            onChange={v => {
                                setAiInputType(v);
                                setAiInputContent('');
                            }}
                        >
                            <Select.Option value="Text">Văn bản nhập trực tiếp</Select.Option>
                            <Select.Option value="PDF">Nội dung từ file PDF đã trích xuất</Select.Option>
                            <Select.Option value="File">Nội dung từ file DOCX/PPTX</Select.Option>
                        </Select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Nội dung đầu vào</label>
                        <Input.TextArea
                            rows={6}
                            placeholder="Dán nội dung bài giảng tại đây để AI phân tích..."
                            value={aiInputContent}
                            onChange={e => setAiInputContent(e.target.value)}
                            className="rounded-lg p-3"
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                        <Button className="h-10 px-5 rounded-lg font-semibold text-slate-600" onClick={() => setIsAIModalOpen(false)}>Hủy</Button>
                        <Button
                            type="primary"
                            loading={isAIGenerating}
                            onClick={handleGenerateAI}
                            className="h-10 px-6 rounded-lg bg-[#0487e2] font-bold border-none shadow-md"
                        >
                            Bắt đầu soạn bài
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* AI Preview Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <Sparkles size={20} className="text-[#0487e2]" />
                        <span className="font-bold text-lg">Xem trước nội dung do AI tạo</span>
                    </div>
                }
                open={isAIPreviewOpen}
                onCancel={() => setIsAIPreviewOpen(false)}
                footer={null}
                width={700}
                centered
                className="custom-modal"
            >
                <div className="py-4">
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
                        {isStreaming ? (
                            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 animate-pulse-slow">
                                <div className="flex items-center gap-2 mb-4 text-[#0487e2]">
                                    <Sparkles size={16} className="animate-spin-slow" />
                                    <span className="font-bold text-xs uppercase tracking-wider">AI đang viết...</span>
                                </div>
                                <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                    {displayedStreamingContent || "Đang kết nối với trí tuệ nhân tạo..."}
                                    <span className="inline-block w-2 h-4 ml-1 bg-[#0487e2] animate-pulse"></span>
                                </div>
                            </div>
                        ) : Array.isArray(aiPreviewBlocks) && aiPreviewBlocks.length > 0 ? aiPreviewBlocks.map((block, idx) => {
                            const bContent = block.content || block.Content || "";
                            const bType = block.blockType || block.BlockType || block.type || block.Type || "Concept";
                            const bTitle = block.title || block.Title || "";

                            const getTitleByType = (t) => {
                                switch (t) {
                                    case 'Concept': return 'Lý thuyết';
                                    case 'Example': return 'Ví dụ';
                                    case 'Exercise': return 'Thực hành';
                                    case 'Reflection': return 'Củng cố';
                                    default: return 'Nội dung';
                                }
                            };

                            const displayTitle = bTitle || getTitleByType(bType);

                            return (
                                <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                    <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Tag className="m-0 font-black uppercase text-[10px] rounded px-2 border-none bg-[#0487e2] text-white">
                                                {getTitleByType(bType)}
                                            </Tag>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{bType}</span>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[#0487e2] font-bold text-[10px]">
                                            <Edit3 size={10} /> <span>BẤM ĐỂ CHỈNH SỬA</span>
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="relative group/field">
                                            <Input
                                                value={displayTitle}
                                                onChange={(e) => handleUpdateAIPreviewBlock(idx, 'title', e.target.value)}
                                                placeholder="Tiêu đề..."
                                                variant="borderless"
                                                className="p-0 font-black text-slate-800 text-lg hover:bg-blue-50/50 rounded-md px-2 -mx-2 transition-all h-auto"
                                            />
                                        </div>
                                        <div className="relative group/field">
                                            <Input.TextArea
                                                value={bContent}
                                                onChange={(e) => handleUpdateAIPreviewBlock(idx, 'content', e.target.value)}
                                                placeholder="Nội dung chi tiết..."
                                                variant="borderless"
                                                autoSize={{ minRows: 2, maxRows: 15 }}
                                                className="p-0 text-slate-600 text-sm leading-relaxed hover:bg-blue-50/50 rounded-md px-2 -mx-2 transition-all custom-scrollbar py-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="py-20 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-slate-400 font-medium">Không tìm thấy nội dung xem trước.</p>
                                <p className="text-slate-300 text-xs mt-1">Vui lòng thử lại hoặc nhập nội dung chi tiết hơn.</p>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-5 mt-2 border-t border-slate-100">
                        <Button className="h-10 px-5 rounded-lg font-semibold text-slate-600" onClick={() => setIsAIPreviewOpen(false)}>Làm lại</Button>
                        <Button
                            type="primary"
                            loading={isAIGenerating}
                            onClick={handleConfirmAI}
                            className="h-10 px-6 rounded-lg bg-emerald-600 border-none font-bold shadow-md"
                        >
                            Lưu vào bài học
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Formative Quiz Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <CheckSquare size={20} className="text-[#0487e2]" />
                        <span className="font-bold text-lg">{editingQuiz ? 'Cài đặt bài kiểm tra' : 'Tạo bài kiểm tra mới'}</span>
                    </div>
                }
                open={isQuizModalOpen}
                onCancel={() => setIsQuizModalOpen(false)}
                footer={null}
                centered
                width={550}
                className="custom-modal"
            >
                <Form form={form} layout="vertical" onFinish={handleQuizSubmit} className="pt-4 space-y-4">
                    <Form.Item
                        name="title"
                        label={<span className="font-semibold text-slate-700">Tiêu đề Quiz</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                        className="mb-0"
                    >
                        <Input placeholder="Ví dụ: Quiz củng cố kiến thức" className="h-11 rounded-lg" />
                    </Form.Item>

                    <Form.Item name="description" label={<span className="font-semibold text-slate-700">Mô tả (tùy chọn)</span>} className="mb-0">
                        <Input.TextArea rows={3} placeholder="Mô tả mục tiêu của bài quiz..." className="rounded-lg p-3" />
                    </Form.Item>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item
                                name="timeLimit"
                                label={<span className="font-semibold text-slate-600 text-xs">Thời gian (phút)</span>}
                                rules={[{ required: true, message: 'Bắt buộc!' }]}
                                className="mb-0"
                            >
                                <InputNumber min={1} max={180} className="w-full h-10 rounded-lg flex items-center" />
                            </Form.Item>
                            <Form.Item
                                name="passingScore"
                                label={<span className="font-semibold text-slate-600 text-xs">Điểm đạt (%)</span>}
                                rules={[{ required: true, message: 'Bắt buộc!' }]}
                                className="mb-0"
                            >
                                <InputNumber min={1} max={100} className="w-full h-10 rounded-lg flex items-center" />
                            </Form.Item>
                            <Form.Item
                                name="maxAttempts"
                                label={<span className="font-semibold text-slate-600 text-xs">Số lần làm lại</span>}
                                initialValue={1}
                                className="mb-0"
                            >
                                <InputNumber min={1} max={10} className="w-full h-10 rounded-lg flex items-center" />
                            </Form.Item>
                            <Form.Item
                                name="isPublished"
                                label={<span className="font-semibold text-slate-600 text-xs">Trạng thái</span>}
                                valuePropName="checked"
                                className="mb-0"
                            >
                                <Switch checkedChildren="Công khai" unCheckedChildren="Bản nháp" className="bg-slate-300" />
                            </Form.Item>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
                        <Button className="flex-1 h-11 rounded-lg font-semibold text-slate-600" onClick={() => setIsQuizModalOpen(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={submittingQuiz} className="flex-1 h-11 rounded-lg bg-[#0487e2] font-bold border-none shadow-md">
                            {editingQuiz ? "Cập nhật" : "Tạo mới"}
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Manual Content Creation Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <Edit3 size={20} className="text-[#0487e2]" />
                        <span className="font-bold text-lg">Soạn nội dung bài học (4 bước chuẩn)</span>
                    </div>
                }
                open={isManualModalOpen}
                onCancel={() => setIsManualModalOpen(false)}
                footer={null}
                width={700}
                centered
                className="custom-modal"
            >
                <Form
                    form={manualForm}
                    layout="vertical"
                    onFinish={handleManualSubmit}
                    className="pt-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar space-y-4"
                >
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-2">
                        <p className="text-xs text-blue-700 font-medium m-0">
                            Hệ thống khuyến khích bạn soạn bài theo cấu trúc chuẩn để học sinh dễ tiếp thu nhất.
                            Bạn có thể bỏ trống các phần không cần thiết.
                        </p>
                    </div>

                    <Form.Item name="concept" label={<span className="font-semibold text-slate-700">Bước 1: Khái niệm & Lý thuyết</span>} className="mb-0">
                        <Input.TextArea rows={4} placeholder="Nhập định nghĩa, công thức hoặc kiến thức cốt lõi..." className="rounded-lg p-3" />
                    </Form.Item>
                    <Form.Item name="example" label={<span className="font-semibold text-slate-700">Bước 2: Ví dụ minh họa</span>} className="mb-0">
                        <Input.TextArea rows={4} placeholder="Đưa ra các ví dụ thực tế giúp làm rõ lý thuyết..." className="rounded-lg p-3" />
                    </Form.Item>
                    <Form.Item name="exercise" label={<span className="font-semibold text-slate-700">Bước 3: Bài tập thực hành</span>} className="mb-0">
                        <Input.TextArea rows={4} placeholder="Các câu hỏi hoặc bài tập nhỏ để học sinh tự làm..." className="rounded-lg p-3" />
                    </Form.Item>
                    <Form.Item name="reflection" label={<span className="font-semibold text-slate-700">Bước 4: Câu hỏi củng cố / Mở rộng</span>} className="mb-0">
                        <Input.TextArea rows={4} placeholder="Câu hỏi gợi mở hoặc tóm tắt lại kiến thức..." className="rounded-lg p-3" />
                    </Form.Item>

                    <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-4">
                        <Button className="h-10 px-5 rounded-lg font-semibold text-slate-600" onClick={() => setIsManualModalOpen(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={submittingManual} className="h-10 px-6 rounded-lg bg-[#0487e2] font-bold border-none shadow-md">
                            Lưu bài học
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Edit Single Block Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <Edit3 size={20} className="text-[#0487e2]" />
                        <span className="font-bold text-lg">Chỉnh sửa khối nội dung</span>
                    </div>
                }
                open={isEditBlockModalOpen}
                onCancel={() => setIsEditBlockModalOpen(false)}
                footer={null}
                width={650}
                centered
                className="custom-modal"
            >
                <Form form={editBlockForm} layout="vertical" onFinish={handleUpdateBlock} className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="title" label={<span className="font-semibold text-slate-700">Tiêu đề</span>} rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]} className="mb-0">
                            <Input placeholder="Tiêu đề khối kiến thức..." className="h-11 rounded-lg" />
                        </Form.Item>
                        <Form.Item name="blockType" label={<span className="font-semibold text-slate-700">Loại nội dung</span>} rules={[{ required: true }]} className="mb-0">
                            <Select className="h-11 [&>.ant-select-selector]:!rounded-lg">
                                <Select.Option value="Concept">Lý thuyết</Select.Option>
                                <Select.Option value="Example">Ví dụ</Select.Option>
                                <Select.Option value="Exercise">Bài tập</Select.Option>
                                <Select.Option value="Reflection">Củng cố</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item name="content" label={<span className="font-semibold text-slate-700">Nội dung chi tiết</span>} rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]} className="mb-0">
                        <Input.TextArea rows={8} placeholder="Nhập nội dung kiến thức tại đây..." className="rounded-lg p-3" />
                    </Form.Item>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="grid grid-cols-3 gap-4">
                            <Form.Item name="sortOrder" label={<span className="font-semibold text-slate-600 text-xs">Thứ tự</span>} className="mb-0">
                                <InputNumber min={1} className="w-full h-10 rounded-lg flex items-center" />
                            </Form.Item>
                            <Form.Item name="estimatedMinutes" label={<span className="font-semibold text-slate-600 text-xs">Thời gian (phút)</span>} className="mb-0">
                                <InputNumber min={0} className="w-full h-10 rounded-lg flex items-center" />
                            </Form.Item>
                            <Form.Item name="isRequired" label={<span className="font-semibold text-slate-600 text-xs">Bắt buộc</span>} valuePropName="checked" className="mb-0">
                                <Switch checkedChildren="Có" unCheckedChildren="Không" className="bg-slate-300" />
                            </Form.Item>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                        <Button className="h-11 px-5 rounded-lg font-semibold text-slate-600" onClick={() => setIsEditBlockModalOpen(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={submittingEditBlock} className="h-11 px-6 rounded-lg bg-[#0487e2] font-bold border-none shadow-md">
                            Cập nhật
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Lesson FAQ Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <MessageSquare size={20} className="text-[#0487e2]" />
                        <span className="font-bold text-lg">{editingFaq ? 'Sửa câu hỏi FAQ' : 'Thêm câu hỏi FAQ mới'}</span>
                    </div>
                }
                open={isFaqModalOpen}
                onCancel={() => setIsFaqModalOpen(false)}
                footer={null}
                width={550}
                centered
                className="custom-modal"
            >
                <Form form={faqForm} layout="vertical" onFinish={handleFaqSubmit} className="pt-4 space-y-4">
                    <Form.Item
                        name="question"
                        label={<span className="font-semibold text-slate-700">Câu hỏi</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập câu hỏi!' }]}
                        className="mb-0"
                    >
                        <Input.TextArea rows={2} placeholder="Ví dụ: Làm sao để cài đặt môi trường NodeJS?" className="rounded-lg p-3" />
                    </Form.Item>

                    <Form.Item
                        name="answer"
                        label={<span className="font-semibold text-slate-700">Câu trả lời</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập câu trả lời!' }]}
                        className="mb-0"
                    >
                        <Input.TextArea rows={5} placeholder="Nhập câu trả lời chi tiết..." className="rounded-lg p-3" />
                    </Form.Item>

                    <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                        <Button className="h-11 px-5 rounded-lg font-semibold text-slate-600" onClick={() => setIsFaqModalOpen(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={submittingFaq} className="h-11 px-6 rounded-lg bg-[#0487e2] font-bold border-none shadow-md">
                            {editingFaq ? 'Cập nhật' : 'Thêm mới'}
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Edit Lesson Basic Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <Edit3 size={20} className="text-[#0487e2]" />
                        <span className="font-bold text-lg">Chỉnh sửa bài học</span>
                    </div>
                }
                open={isEditLessonModalOpen}
                onCancel={() => setIsEditLessonModalOpen(false)}
                footer={null}
                width={550}
                centered
                className="custom-modal"
            >
                <Form form={editLessonForm} layout="vertical" onFinish={handleUpdateLessonBasic} className="pt-4 space-y-4">
                    <Form.Item name="title" label={<span className="font-semibold text-slate-700">Tiêu đề bài học</span>} rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}>
                        <Input className="h-11 rounded-lg" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="type" label={<span className="font-semibold text-slate-700">Loại bài học</span>}>
                            <Select className="h-11 [&>.ant-select-selector]:!rounded-lg">
                                <Select.Option value="Video">Video</Select.Option>
                                <Select.Option value="Document">Tài liệu</Select.Option>
                                <Select.Option value="Quiz">Trắc nghiệm</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="duration" label={<span className="font-semibold text-slate-700">Thời lượng (Phút)</span>}>
                            <InputNumber min={1} className="w-full h-11 rounded-lg flex items-center" />
                        </Form.Item>
                    </div>

                    <Form.Item name="content" label={<span className="font-semibold text-slate-700">Nội dung/Link</span>}>
                        <Input.TextArea rows={4} placeholder="URL Video hoặc nội dung bài học..." className="rounded-lg p-3" />
                    </Form.Item>

                    <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                        <Button className="h-11 px-5 rounded-lg font-semibold text-slate-600" onClick={() => setIsEditLessonModalOpen(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={submittingEditLesson} className="h-11 px-6 rounded-lg bg-[#0487e2] font-bold border-none shadow-md">
                            Cập nhật
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}