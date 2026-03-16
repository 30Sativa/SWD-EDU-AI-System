import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Button,
    Tag,
    Form,
    InputNumber,
    Input,
    message,
    Spin,
    Tooltip
} from 'antd';
import {
    ArrowLeft,
    CheckCircle2,
    ArrowRightCircle,
    Clock,
    UserCircle,
    Mail,
    ChevronDown,
    ChevronUp,
    Send,
    FileText,
    Download,
    Eye,
    EyeOff
} from 'lucide-react';
import dayjs from 'dayjs';
import { getAssignmentsByCourse } from '../../api/assignmentApi';
import { getSubmissionsByAssignment, gradeSubmission } from '../../api/submissionApi';



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
                getAssignmentsByCourse(courseId),
                getSubmissionsByAssignment(assignmentId)
            ]);

            const assignments = assignRes?.data?.items || assignRes?.items || assignRes?.data || (Array.isArray(assignRes) ? assignRes : []);
            const submissions = subRes?.data?.items || subRes?.items || subRes?.data || (Array.isArray(subRes) ? subRes : []);

            const assignData = assignments.find(a => String(a.id || a.Id || a.assignmentId || a.courseAssignmentId) === String(assignmentId));
            const subData = submissions.find(s => String(s.id || s.Id || s.submissionId || s.SubmissionId) === String(submissionId));

            setAssignment(assignData || null);
            setSubmission(subData || null);

            if (subData) {
                form.setFieldsValue({
                    score: subData.score ?? subData.grade,
                    feedback: subData.feedback || subData.Feedback
                });
            }
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

    const studentName = submission?.studentName || submission?.StudentName || (submission ? "Học sinh " + (submission.studentId?.substring(0, 4) || "ẩn danh") : "");
    const studentEmail = submission?.studentEmail || submission?.StudentEmail || submission?.email || "";

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800 animate-in fade-in duration-500">
            {loading ? (
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="text-center">
                        <Spin size="large" />
                        <p className="mt-4 text-slate-500 font-medium animate-pulse">Đang tải chi tiết bài làm...</p>
                    </div>
                </div>
            ) : !submission ? (
                <div className="p-20 text-center bg-white rounded-2xl border border-slate-200">
                    <p className="text-slate-500 font-medium">Không tìm thấy bài nộp.</p>
                    <Button onClick={() => navigate(-1)} className="mt-4">Quay lại</Button>
                </div>
            ) : (
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* --- HEADER SECTION --- */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(`/dashboard/teacher/courses/${courseId}`)}
                                className="h-10 w-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#0487e2] hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Chấm điểm bài nộp</h1>
                                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mt-0.5">
                                    <span>Khóa học</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                    <span className="text-slate-500">{assignment?.title || assignment?.Title || "..."}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                    <span className="text-slate-500">{studentName}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Tag color={(submission?.score !== null && submission?.score !== undefined || submission?.grade !== null && submission?.grade !== undefined) ? 'blue' : 'orange'} className="rounded-full px-4 py-1.5 m-0 font-bold border-none shadow-sm uppercase tracking-wide text-[10px]">
                                {(submission?.score !== null && submission?.score !== undefined || submission?.grade !== null && submission?.grade !== undefined) ? `Đã chấm: ${submission.score ?? submission.grade}/${assignment?.maxScore || 10}` : 'Chưa có điểm'}
                            </Tag>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                        {/* Left Side: Submission Details & Form */}
                        <div className="lg:col-span-5 space-y-6">

                            {/* Student Info Card */}
                            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-xl font-bold">
                                            {studentName[0].toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-white font-bold text-lg truncate leading-tight">{studentName}</div>
                                            <div className="text-blue-100 text-xs flex items-center gap-1 mt-1 font-medium">
                                                <Mail size={12} /> {studentEmail || "Không có email"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 grid grid-cols-2 gap-4 bg-white">
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="text-[10px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">Thời gian nộp</div>
                                        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm truncate">
                                            <Clock size={14} className="text-blue-500" />
                                            {submission.submittedAt ? dayjs(submission.submittedAt).format('HH:mm, DD/MM/YYYY') : "N/A"}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="text-[10px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">Lần nộp</div>
                                        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                                            <ArrowRightCircle size={14} className="text-indigo-500" />
                                            Lần 1
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Grading Form Card */}
                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                        <CheckCircle2 size={18} />
                                    </div>
                                    <div className="font-bold text-slate-800 uppercase tracking-widest text-xs">Đánh giá & Chấm điểm</div>
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
                                        className="w-full h-12 rounded-xl bg-[#0487e2] hover:bg-[#0374c4] font-bold border-none shadow-md shadow-blue-100 flex items-center justify-center gap-2 mt-4 transition-all"
                                    >
                                        Lưu kết quả & Công bố điểm
                                    </Button>
                                </Form>
                            </div>
                        </div>

                        {/* Right Side: Submission Content & Files */}
                        <div className="lg:col-span-7 space-y-6">

                            {/* Main Content Area */}
                            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                                <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <FileText size={18} />
                                        </div>
                                        <div className="font-bold text-slate-800 uppercase tracking-widest text-xs">Nội dung bài làm</div>
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
                                                className="bg-slate-900 text-white hover:bg-slate-800 border-none flex items-center gap-2 rounded-lg px-4 h-9 font-bold text-xs"
                                            >
                                                Tải xuống file
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col p-6 bg-slate-50/50">
                                    <div className="space-y-6 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar">

                                        {/* Text Content */}
                                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[150px]">
                                            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap m-0">
                                                {submission.content || submission.Content || (
                                                    <span className="text-slate-400 italic font-medium flex items-center gap-2">
                                                        Không có nội dung văn bản đi kèm.
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Live File Preview (if any) */}
                                        {submission?.fileUrl && isPreviewOpen && (
                                            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                                <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                                    <div className="h-10 w-10 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-sm">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-slate-900 font-bold block truncate text-sm">{submission.fileName || "Tệp bài làm đính kèm"}</div>
                                                        <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block mt-0.5">
                                                            {submission.fileSize ? `${(submission.fileSize / 1024).toFixed(1)} KB` : "Văn bản bài nộp"} • {submission.fileType || "Document"}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="h-[70vh] min-h-[500px] rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm relative group">
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
                            </div>

                            {/* Quick Tips Column */}
                            <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                                <div className="h-6 w-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                    <span className="font-bold text-[11px]">!</span>
                                </div>
                                <div className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                    <span className="font-bold uppercase tracking-widest block mb-1">Cần lưu ý:</span>
                                    Điểm số sau khi lưu sẽ được tính vào tiến độ học tập của học sinh. Nhận xét chi tiết sẽ giúp học sinh tiến bộ nhanh hơn.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GradeSubmission;
