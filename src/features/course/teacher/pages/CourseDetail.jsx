import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Eye,
    Plus,
    Edit3,
    Trash2,
    ChevronDown,
    ChevronUp,
    Video,
    FileText,
    CheckSquare,
    GripVertical,
    MoreVertical,
    Clock,
    Users,
    BookOpen,
    BarChart,
    ArrowLeft,
    UploadCloud,
    X,
    Rocket
} from 'lucide-react';
import { Spin, message, Modal, Form, Input, Select, Button, Tag, Empty } from 'antd';
import {
    getTeacherCourseDetail,
    publishTeacherCourse,
    updateTeacherCourse,
    getMyCourses
} from '../../api/courseApi';

export default function CourseDetail() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [course, setCourse] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [form] = Form.useForm();

    const fetchDetail = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getTeacherCourseDetail(courseId);
            const data = res?.data || res;
            setCourse(data);
        } catch (error) {
            console.error('Lỗi tải chi tiết khóa học:', error);
            message.error('Không thể tải thông tin khóa học');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        if (courseId) fetchDetail();
    }, [courseId, fetchDetail]);

    const handlePublish = async () => {
        try {
            setSubmitting(true);
            await publishTeacherCourse(courseId);
            message.success('Xuất bản khóa học thành công!');
            fetchDetail();
        } catch (error) {
            console.error('Publish error:', error);
            message.error(error.response?.data?.message || 'Lỗi khi xuất bản khóa học');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateSubmit = async (values) => {
        try {
            setSubmitting(true);
            const payload = {
                title: values.title,
                description: values.description,
                thumbnail: values.thumbnail,
                level: parseInt(values.level),
                language: values.language || "Vietnamese"
            };
            await updateTeacherCourse(courseId, payload);
            message.success('Cập nhật thông tin thành công!');
            setIsEditModalOpen(false);
            fetchDetail();
        } catch (error) {
            console.error('Update error:', error);
            message.error('Không thể cập nhật thông tin');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleSession = (sessionId) => {
        setCourse(prev => ({
            ...prev,
            sections: (prev.sections || prev.sessions || []).map(session =>
                session.id === sessionId ? { ...session, isExpanded: !session.isExpanded } : session
            )
        }));
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50/50">
                <Spin size="large" />
                <p className="mt-4 text-slate-500 font-medium">Đang tải nội dung khóa học...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="p-10 text-center">
                <Empty description="Không tìm thấy khóa học" />
                <Button onClick={() => navigate('/dashboard/teacher/courses')} className="mt-4">Quay lại danh sách</Button>
            </div>
        );
    }

    const sections = course.sections || course.sessions || [];
    const isPublished = course.status === 'Published' || course.status === 'Active';

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans text-slate-900 animate-in fade-in duration-500">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Top Navigation & Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/dashboard/teacher/courses')}
                            className="h-10 w-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Quản lý Nội dung</h1>
                            <p className="text-slate-500 mt-1">Xây dựng chương trình học với các chương và bài học.</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm shadow-sm">
                            <Eye size={18} />
                            Xem trước
                        </button>
                        {!isPublished && (
                            <button
                                onClick={handlePublish}
                                disabled={submitting}
                                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold text-sm shadow-md shadow-emerald-200 transition-all active:scale-95 disabled:opacity-70"
                            >
                                <Rocket size={18} />
                                Xuất bản
                            </button>
                        )}
                    </div>
                </div>

                {/* Course Info Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                            {course.thumbnail ? (
                                <img src={course.thumbnail} className="w-24 h-24 rounded-2xl object-cover shadow-lg" alt="Thumbnail" />
                            ) : (
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-200">
                                    {course.title?.charAt(0) || 'C'}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-2xl font-bold text-slate-900">{course.title}</h2>
                                        <Tag color={isPublished ? "success" : "default"} className="rounded-full font-bold px-3">
                                            {isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                                        </Tag>
                                    </div>
                                    <p className="text-slate-500 max-w-2xl leading-relaxed">{course.description || 'Chưa có mô tả cho khóa học này.'}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        form.setFieldsValue(course);
                                        setIsEditModalOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium text-sm transition-colors"
                                >
                                    <Edit3 size={16} />
                                    Sửa thông tin
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-6 pt-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Users size={18} className="text-indigo-500" />
                                    <span className="font-semibold text-slate-900">{course.enrollmentCount || 0}</span> học viên
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <BookOpen size={18} className="text-emerald-500" />
                                    <span className="font-semibold text-slate-900">{course.totalLessons || 0}</span> bài học
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Clock size={18} className="text-amber-500" />
                                    <span className="font-semibold text-slate-900">
                                        {Math.floor(course.totalDuration / 60) || 0}h {course.totalDuration % 60 || 0}m
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Curriculum Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            Chương trình học
                            <span className="text-slate-400 font-normal text-base">• {sections.length} Chương</span>
                        </h3>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium text-sm shadow-sm transition-all active:scale-95">
                            <Plus size={18} />
                            Thêm chương mới
                        </button>
                    </div>

                    <div className="space-y-4">
                        {sections.length > 0 ? sections.map((session, index) => (
                            <div key={session.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md">
                                {/* Session Header */}
                                <div
                                    className="flex items-center justify-between p-4 bg-slate-50/50 cursor-pointer select-none"
                                    onClick={() => toggleSession(session.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-lg font-bold text-sm border border-indigo-200">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{session.title || session.name}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                                <span>{(session.lessons || session.subSections || []).length} Bài học</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span>{session.duration || '0h 0m'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" onClick={(e) => e.stopPropagation()}>
                                            <Edit3 size={16} />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" onClick={(e) => e.stopPropagation()}>
                                            <Trash2 size={16} />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-slate-600">
                                            {session.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Lessons List (Sections) */}
                                {session.isExpanded && (
                                    <div className="p-4 space-y-3 bg-white border-t border-slate-100">
                                        {(session.lessons || session.subSections || []).length > 0 ? (
                                            (session.lessons || session.subSections || []).map((lesson) => (
                                                <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2 rounded-lg bg-blue-100 text-blue-600 shadow-sm`}>
                                                            <FileText size={18} />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-900">{lesson.title || lesson.name}</div>
                                                            <div className="text-xs text-slate-500 capitalize flex items-center gap-1.5 mt-0.5">
                                                                {lesson.type || 'Nội dung'}
                                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                                {lesson.duration || '0m'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors">
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <button className="p-2 text-slate-300 hover:text-slate-500 cursor-move">
                                                            <GripVertical size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6 text-slate-400 text-sm italic">
                                                Chưa có bài học nào trong chương này.
                                            </div>
                                        )}

                                        <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 font-medium hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2 text-sm shadow-sm">
                                            <Plus size={18} />
                                            Thêm bài học mới
                                        </button>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="py-20 bg-white rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                    <BookOpen size={32} />
                                </div>
                                <p className="text-slate-500 font-medium">Chương trình học đang trống.</p>
                                <p className="text-slate-400 text-sm">Hãy bắt đầu thêm chương đầu tiên.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                title={<span className="font-bold text-lg">Cập nhật thông tin khóa học</span>}
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                footer={null}
                centered
                width={550}
            >
                <Form form={form} layout="vertical" onFinish={handleUpdateSubmit} className="pt-4">
                    <Form.Item name="title" label="Tên khóa học" rules={[{ required: true }]}>
                        <Input className="h-11 rounded-lg" />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={4} className="rounded-lg" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="level" label="Độ khó">
                            <Select className="h-11 [&>.ant-select-selector]:!rounded-lg">
                                <Select.Option value={1}>Cơ bản</Select.Option>
                                <Select.Option value={2}>Trung bình</Select.Option>
                                <Select.Option value={3}>Nâng cao</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="language" label="Ngôn ngữ">
                            <Select className="h-11 [&>.ant-select-selector]:!rounded-lg">
                                <Select.Option value="Vietnamese">Tiếng Việt</Select.Option>
                                <Select.Option value="English">Tiếng Anh</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item name="thumbnail" label="URL Ảnh bìa (Thumbnail)">
                        <Input className="h-11 rounded-lg" placeholder="https://example.com/image.jpg" />
                    </Form.Item>

                    <div className="flex gap-3 pt-6 border-t mt-4">
                        <Button className="flex-1 h-11 rounded-xl font-bold" onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={submitting} className="flex-1 h-11 rounded-xl bg-indigo-600 font-bold border-none">
                            Lưu thay đổi
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
