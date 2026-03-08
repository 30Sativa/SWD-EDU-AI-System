import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Layout,
    Button,
    Card,
    Tag,
    Typography,
    Form,
    InputNumber,
    Input,
    message,
    Spin,
    Divider,
    Tooltip
} from 'antd';
import {
    ChevronLeft,
    User,
    Calendar,
    FileText,
    Download,
    Send,
    Eye,
    EyeOff,
    CheckCircle2,
    ArrowRightCircle,
    Clock,
    UserCircle,
    Mail
} from 'lucide-react';
import dayjs from 'dayjs';
import { getAssignmentById } from '../../api/assignmentApi';
import { getTeacherSubmissionDetail, gradeSubmission } from '../../api/submissionApi';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const GradeSubmission = () => {
    const { courseId, assignmentId, submissionId } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [assignment, setAssignment] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(true);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submissionId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [assignRes, subRes] = await Promise.all([
                getAssignmentById(assignmentId),
                getTeacherSubmissionDetail(submissionId)
            ]);

            const assignData = assignRes?.data || assignRes;
            const subData = subRes?.data || subRes;

            setAssignment(assignData);
            setSubmission(subData);

            form.setFieldsValue({
                score: subData.score ?? subData.grade,
                feedback: subData.feedback || subData.Feedback
            });
        } catch (error) {
            console.error("Error fetching data:", error);
            message.error("Không thể tải thông tin bài nộp");
        } finally {
            setLoading(false);
        }
    };

    const handleGradeSubmit = async (values) => {
        try {
            setSubmitting(true);
            await gradeSubmission(submissionId, {
                score: values.score,
                feedback: values.feedback,
                status: 'Graded'
            });
            message.success('Chấm điểm thành công!');
            // Refresh to show updated status/score if needed or just navigate back
            fetchData();
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi chấm điểm');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Spin size="large" />
                    <p className="mt-4 text-slate-500 font-medium animate-pulse">Đang tải chi tiết bài làm...</p>
                </div>
            </div>
        );
    }

    if (!submission) return <div className="p-10 text-center">Không tìm thấy bài nộp.</div>;

    const studentName = submission.studentName || submission.StudentName || "Học sinh " + (submission.studentId?.substring(0, 4) || "ẩn danh");
    const studentEmail = submission.studentEmail || submission.StudentEmail || submission.email || "";

    return (
        <Layout className="min-h-screen bg-slate-50/50">
            {/* Top Navigation Overlay */}
            <Header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 h-16 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Button
                        icon={<ChevronLeft size={18} />}
                        onClick={() => navigate(`/dashboard/teacher/courses/${courseId}`)}
                        className="flex items-center justify-center border-slate-200 hover:text-blue-600 hover:border-blue-200"
                    >
                        Quay lại khóa học
                    </Button>
                    <Divider type="vertical" height="24px" className="border-slate-200" />
                    <div>
                        <Title level={5} className="m-0 text-slate-900 font-bold max-w-[400px] truncate uppercase tracking-tight">
                            {assignment?.title || assignment?.Title || "Chấm điểm bài tập"}
                        </Title>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Tag color={(submission.score !== null || submission.grade !== null) ? 'blue' : 'orange'} className="rounded-full px-3 py-1 m-0 font-bold border-none shadow-sm capitalize">
                        {(submission.score !== null || submission.grade !== null) ? `Đã chấm: ${submission.score ?? submission.grade}/${assignment?.maxScore || 10}` : 'Chưa chấm'}
                    </Tag>
                </div>
            </Header>

            <Content className="p-6 md:p-8">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Side: Submission Details & Form */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Student Info Card */}
                        <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                        {studentName[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <Text className="text-white font-bold text-lg block truncate">{studentName}</Text>
                                        <Text className="text-blue-100 text-xs flex items-center gap-1 mt-0.5 font-medium">
                                            <Mail size={12} /> {studentEmail || "Không có email"}
                                        </Text>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-2 gap-4 bg-white">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <Text className="text-[10px] uppercase font-black text-slate-400 block mb-1">Thời gian nộp</Text>
                                    <div className="flex items-center gap-2 text-slate-700 font-bold truncate">
                                        <Clock size={14} className="text-blue-500" />
                                        {submission.submittedAt ? dayjs(submission.submittedAt).format('HH:mm, DD/MM/YYYY') : "N/A"}
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <Text className="text-[10px] uppercase font-black text-slate-400 block mb-1">Lần nộp</Text>
                                    <div className="flex items-center gap-2 text-slate-700 font-bold">
                                        <ArrowRightCircle size={14} className="text-indigo-500" />
                                        Lần 1
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Grading Form Card */}
                        <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/50">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm">
                                    <CheckCircle2 size={18} />
                                </div>
                                <Text className="font-black text-slate-800 uppercase tracking-widest text-xs">Đánh giá & Chấm điểm</Text>
                            </div>

                            <Form form={form} layout="vertical" onFinish={handleGradeSubmit} className="space-y-4">
                                <Form.Item
                                    name="score"
                                    label={<span className="font-bold text-slate-600">Điểm số (Tối đa {assignment?.maxScore || 10})</span>}
                                    rules={[{ required: true, message: 'Vui lòng nhập điểm' }]}
                                >
                                    <InputNumber
                                        min={0}
                                        max={assignment?.maxScore || 100}
                                        className="w-full h-12 rounded-xl bg-slate-50 border-slate-200 hover:bg-white focus:bg-white flex items-center text-lg font-bold"
                                        placeholder="0.0"
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="feedback"
                                    label={<span className="font-bold text-slate-600">Nhận xét của giáo viên</span>}
                                >
                                    <Input.TextArea
                                        rows={6}
                                        placeholder="Viết nhận xét chi tiết, góp ý cho học sinh tại đây..."
                                        className="rounded-xl bg-slate-50 border-slate-200 hover:bg-white focus:bg-white p-4"
                                    />
                                </Form.Item>

                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={submitting}
                                    icon={<Send size={18} />}
                                    className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 font-bold border-none shadow-lg shadow-blue-100 flex items-center justify-center gap-2 mt-4 hover:scale-[1.02] transition-transform"
                                >
                                    Lưu kết quả & Công bố điểm
                                </Button>
                            </Form>
                        </Card>
                    </div>

                    {/* Right Side: Submission Content & Files */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Main Content Area */}
                        <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/50 overflow-hidden min-h-[600px] flex flex-col">
                            <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                                        <FileText size={18} />
                                    </div>
                                    <Text className="font-black text-slate-800 uppercase tracking-widest text-xs">Nội dung bài làm</Text>
                                </div>

                                {submission?.fileUrl && (
                                    <div className="flex items-center gap-2">
                                        <Tooltip title={isPreviewOpen ? "Thu nhỏ xem file" : "Mở xem file trực tiếp"}>
                                            <Button
                                                icon={isPreviewOpen ? <EyeOff size={16} /> : <Eye size={16} />}
                                                onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                                                className="border-slate-200 flex items-center justify-center rounded-lg h-9 w-9 p-0"
                                            />
                                        </Tooltip>
                                        <Button
                                            icon={<Download size={16} />}
                                            href={submission.fileUrl}
                                            target="_blank"
                                            className="bg-slate-900 text-white hover:bg-slate-800 border-none flex items-center gap-2 rounded-lg px-4 h-9 font-bold"
                                        >
                                            Tải xuống file
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col p-6 bg-slate-50/50">
                                {/* Mixed View: Content + Optional File Preview */}
                                <div className="space-y-6 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar">

                                    {/* Text Content */}
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[150px]">
                                        <Paragraph className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap m-0">
                                            {submission.content || submission.Content || (
                                                <span className="text-slate-400 italic font-medium flex items-center gap-2">
                                                    Không có nội dung văn bản đi kèm.
                                                </span>
                                            )}
                                        </Paragraph>
                                    </div>

                                    {/* Live File Preview (if any) */}
                                    {submission?.fileUrl && isPreviewOpen && (
                                        <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                            <div className="flex items-center gap-3 p-4 bg-blue-600/5 border border-blue-200 rounded-xl">
                                                <div className="h-10 w-10 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-md">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <Text className="text-slate-900 font-bold block truncate">{submission.fileName || "Tệp bài làm đính kèm"}</Text>
                                                    <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest block">
                                                        {submission.fileSize ? `${(submission.fileSize / 1024).toFixed(1)} KB` : "Văn bản bài nộp"} • {submission.fileType || "Document"}
                                                    </Text>
                                                </div>
                                            </div>

                                            <div className="h-[600px] rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-lg relative group">
                                                {submission.fileUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                                                    <img
                                                        src={submission.fileUrl}
                                                        alt="Submission Preview"
                                                        className="w-full h-full object-contain bg-slate-50"
                                                    />
                                                ) : (
                                                    <iframe
                                                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(submission.fileUrl)}&embedded=true`}
                                                        className="w-full h-full border-none"
                                                        title="File Preview"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Quick Tips Column (Optional) */}
                        <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                <Text className="font-bold text-[11px] font-black">!</Text>
                            </div>
                            <Text className="text-[11px] text-amber-800 font-medium">
                                <span className="font-bold uppercase tracking-widest block mb-1">Cần lưu ý:</span>
                                Điểm số sau khi lưu sẽ được tính vào tiến độ học tập của học sinh. Nhận xét chi tiết sẽ giúp học sinh tiến bộ nhanh hơn.
                            </Text>
                        </div>
                    </div>
                </div>
            </Content>
        </Layout>
    );
};

export default GradeSubmission;
