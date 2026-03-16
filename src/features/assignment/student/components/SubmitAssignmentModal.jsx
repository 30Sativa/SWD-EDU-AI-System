import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Upload, Button, message, Space, Typography, Tag, Divider, Spin } from 'antd';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Clock, Link as LinkIcon, Trash2, ExternalLink } from 'lucide-react';
import { submitAssignment, getMySubmission } from '../../api/submissionApi';
import dayjs from 'dayjs';

const { Text, Title, Paragraph } = Typography;

export default function SubmitAssignmentModal({ visible, onClose, assignment, onSuccess }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [submission, setSubmission] = useState(null);
    const [fetchingSubmission, setFetchingSubmission] = useState(false);
    const [fileList, setFileList] = useState([]);

    const assignmentId = assignment?.id || assignment?.Id || assignment?.assignmentId || assignment?.AssignmentId || assignment?.courseAssignmentId;

    // Reset state when opening a new assignment
    useEffect(() => {
        if (visible) {
            setSubmission(null);
            setFileList([]);
            form.resetFields();
            if (assignmentId) {
                fetchUserSubmission();
            }
        }
    }, [visible, assignmentId]);

    const fetchUserSubmission = async () => {
        try {
            setFetchingSubmission(true);
            const res = await getMySubmission(assignmentId);
            const data = res?.data || res;
            if (data && data.submissionId) {
                setSubmission(data);
                form.setFieldsValue({
                    content: data.content
                });
                if (data.fileUrl) {
                    setFileList([
                        {
                            uid: '-1',
                            name: data.fileName || 'tai-lieu-da-nop.pdf',
                            status: 'done',
                            url: data.fileUrl,
                        },
                    ]);
                }
            }
        } catch (error) {
            console.error("Lỗi khi tải bài nộp", error);
        } finally {
            setFetchingSubmission(false);
        }
    };

    const onFinish = async (values) => {
        if (!assignmentId) return;

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('content', values.content || '');

            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append('file', fileList[0].originFileObj);
            }

            const res = await submitAssignment(assignmentId, formData);
            if (res.success) {
                message.success("Nộp bài tập thành công!");
                onSuccess?.();
                onClose();
            } else {
                message.error(res.message || "Không thể nộp bài tập");
            }
        } catch (error) {
            console.error("Lỗi khi nộp bài", error);
            message.error("Gặp lỗi khi nộp bài. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = ({ fileList: newFileList }) => {
        // Only allow one file
        setFileList(newFileList.slice(-1));
    };

    const isOverdue = assignment?.dueDate && dayjs().isAfter(dayjs(assignment.dueDate));
    const isGraded = !!submission && (submission.status === 'Graded' || (submission.score !== null && submission.score !== undefined));

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={700}
            className="premium-modal"
            centered
            destroyOnHidden
            styles={{ body: { padding: 0 } }}
        >
            <div className="relative overflow-hidden rounded-t-[1.5rem] bg-indigo-600 px-8 py-10 text-white">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <FileText size={20} />
                        </div>
                        <Tag color={submission ? "success" : "processing"} className="rounded-full border-none px-3 text-[10px] font-black uppercase m-0">
                            {submission ? "ĐÃ NỘP" : "CHƯA NỘP"}
                        </Tag>
                    </div>
                    <Title level={3} className="!text-white !m-0 !text-2xl font-black tracking-tight mb-2">
                        {assignment?.title || assignment?.Title || "Nộp bài tập"}
                    </Title>
                    <Paragraph className="text-indigo-100/80 mb-0 font-medium line-clamp-2">
                        {assignment?.description || assignment?.Description || "Vui lòng hoàn thành các yêu cầu của bài tập và nộp bài đúng hạn."}
                    </Paragraph>
                </div>

                {/* Patterns */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
            </div>

            <div className="p-8">
                {fetchingSubmission ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <Spin size="large" />
                        <Text className="mt-4 text-slate-400 font-medium">Đang kiểm tra bài nộp của bạn...</Text>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center gap-6 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-slate-400" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">HẠN NỘP</p>
                                    <p className={`text-xs font-bold ${isOverdue ? 'text-rose-500' : 'text-slate-700'}`}>
                                        {assignment?.dueDate ? dayjs(assignment.dueDate).format('HH:mm, DD/MM/YYYY') : "Không giới hạn"}
                                    </p>
                                </div>
                            </div>
                            <Divider vertical className="h-8 border-slate-200" />
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-slate-400" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">ĐIỂM TỐI ĐA</p>
                                    <p className="text-xs font-bold text-slate-700">{assignment?.maxScore || assignment?.MaxScore || 10} điểm</p>
                                </div>
                            </div>
                            {submission && (
                                <>
                                    <Divider vertical className="h-8 border-slate-200" />
                                    <div className="flex items-center gap-2">
                                        <AlertCircle size={16} className="text-blue-500" />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">TRẠNG THÁI</p>
                                            <p className="text-xs font-bold text-blue-600">{submission.status || "Đã nhận bài"}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {isGraded && (
                            <div className="mb-8 p-6 rounded-3xl bg-emerald-50 border border-emerald-100 relative overflow-hidden">
                                <div className="relative z-10 flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100 font-black text-xl">
                                        {submission.score}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight mb-1">Kết quả đánh giá</h4>
                                        <p className="text-sm text-emerald-700 font-medium m-0 italic">
                                            "{submission.feedback || "Giáo viên không để lại nhận xét."}"
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute -right-2 -bottom-2 opacity-10">
                                    <CheckCircle2 size={100} className="text-emerald-600" />
                                </div>
                            </div>
                        )}

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            requiredMark={false}
                            disabled={isGraded}
                        >
                            <Form.Item
                                name="content"
                                label={<Text className="font-bold text-slate-700 uppercase text-[10px] tracking-widest pl-1">Mô tả bài làm (Tùy chọn)</Text>}
                            >
                                <Input.TextArea
                                    placeholder="Nhập ghi chú hoặc nội dung bài làm văn bản tại đây..."
                                    rows={4}
                                    className="rounded-2xl border-slate-200 hover:border-indigo-300 focus:border-indigo-500 transition-all p-4 text-sm font-medium shadow-sm"
                                />
                            </Form.Item>

                            <Form.Item
                                label={<Text className="font-bold text-slate-700 uppercase text-[10px] tracking-widest pl-1">Đính kèm tệp tin</Text>}
                            >
                                <Upload.Dragger
                                    fileList={fileList}
                                    onChange={handleFileChange}
                                    beforeUpload={() => false}
                                    maxCount={1}
                                    className="rounded-[2.5rem] !bg-slate-50 border-2 border-dashed border-slate-200 hover:border-indigo-300 transition-all group overflow-hidden"
                                >
                                    <div className="py-8">
                                        <div className="w-16 h-16 rounded-3xl bg-white mx-auto flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 shadow-sm border border-slate-100 transition-all mb-4">
                                            <UploadCloud size={28} />
                                        </div>
                                        <p className="text-sm font-bold text-slate-700 mb-1">Nhấp hoặc kéo thả tệp vào đây</p>
                                        <p className="text-xs text-slate-400 font-medium">Hỗ trợ PDF, DOCX, ZIP hoặc hình ảnh (Tối đa 25MB)</p>
                                    </div>
                                </Upload.Dragger>
                            </Form.Item>

                            {submission && !isGraded && (
                                <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 border-dashed flex items-center gap-3">
                                    <AlertCircle size={18} className="text-amber-500" />
                                    <Text className="text-xs text-amber-700 font-bold tracking-tight">
                                        Lưu ý: Nộp lại sẽ thay thế bài làm cũ bằng bản mới nhất.
                                    </Text>
                                </div>
                            )}

                            <div className="flex items-center gap-4 pt-4">
                                <Button
                                    onClick={onClose}
                                    className="h-14 flex-1 rounded-2xl border-none bg-slate-100 hover:bg-slate-200 text-slate-600 font-black uppercase tracking-widest shadow-none"
                                >
                                    Đóng
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    disabled={isGraded}
                                    className="h-14 flex-1 rounded-2xl border-none bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-100"
                                >
                                    {submission ? "Nộp lại bài làm" : "Xác nhận nộp bài"}
                                </Button>
                            </div>
                        </Form>
                    </>
                )}
            </div>

            <style>{`
                .premium-modal .ant-modal-content {
                    border-radius: 2.5rem;
                    overflow: hidden;
                    border: none;
                    box-shadow: 0 40px 100px -20px rgba(15, 23, 42, 0.2);
                }
                .premium-modal .ant-modal-close {
                    top: 24px;
                    right: 24px;
                    color: white;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(8px);
                }
                .premium-modal .ant-modal-close:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                .premium-modal .ant-upload-drag {
                    background: #f8fafc !important;
                }
            `}</style>
        </Modal>
    );
}
