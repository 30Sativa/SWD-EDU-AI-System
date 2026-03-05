import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    Rocket,
    GripVertical as DragHandle,
    BookOpen,
    Clock,
    ArrowLeft
} from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Spin, message, Modal, Form, Input, Select, Button, Tag, Empty } from 'antd';
import {
    getTeacherCourseDetail,
    publishTeacherCourse,
    updateTeacherCourse,
    createSection,
    updateSection,
    deleteSection,
    getCourseSections
} from '../../api/courseApi';
import { createLesson, updateLesson, deleteLesson, getLessonsBySection } from '../../../lesson/api/lessonApi';

const slugify = (text) => {
    if (!text) return "";
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/([^0-9a-z-\s])/g, '')
        .replace(/(\s+)/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
};

export default function CourseDetail() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [course, setCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
    const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
    const [activeSectionId, setActiveSectionId] = useState(null);
    const [editingLesson, setEditingLesson] = useState(null);

    const [form] = Form.useForm();
    const [sectionForm] = Form.useForm();
    const [editSectionForm] = Form.useForm();
    const [lessonForm] = Form.useForm();
    const [editLessonForm] = Form.useForm();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchDetail = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getTeacherCourseDetail(courseId);
            const data = (res?.data || res);

            let structure = data.sections || data.items || data.Sections || [];

            if (structure.length === 0) {
                try {
                    const sectionsRes = await getCourseSections(courseId);
                    structure = sectionsRes?.data?.items || sectionsRes?.items || sectionsRes?.data || [];
                } catch {
                    // Fail silently
                }
            }

            // Preserving existing state (lessons and isExpanded) via functional update
            setSections(prev => {
                return structure.map(sec => {
                    const existing = prev.find(s => s.id === sec.id);
                    return {
                        ...sec,
                        lessons: existing?.lessons || sec.lessons || sec.Lessons || sec.items || sec.Items || sec.subSections || [],
                        isExpanded: existing?.isExpanded || false
                    };
                });
            });

            setCourse(data);
        } catch {
            message.error('Không thể tải thông tin khóa học');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    // Function to fetch lessons for a specific section
    const fetchSectionLessons = async (sectionId) => {
        try {
            const res = await getLessonsBySection(sectionId);
            const lessons = res?.data?.items || res?.items || res?.data || (Array.isArray(res) ? res : []);

            setSections(prev => prev.map(sec =>
                sec.id === sectionId ? { ...sec, lessons } : sec
            ));
            return lessons;
        } catch (error) {
            console.error("Error fetching lessons:", error);
            return [];
        }
    };

    useEffect(() => {
        if (courseId) fetchDetail();
    }, [courseId, fetchDetail]);

    const handlePublish = async () => {
        if (!course?.title?.trim() || !course?.description?.trim() || !course?.thumbnail?.trim()) {
            message.warning('Vui lòng cập nhật đầy đủ Tên khóa học, Mô tả và Ảnh bìa (Thumbnail) trước khi xuất bản.');
            form.setFieldsValue(course);
            setIsEditModalOpen(true);
            return;
        }

        try {
            setSubmitting(true);
            await publishTeacherCourse(courseId);
            message.success('Xuất bản khóa học thành công!');
            fetchDetail();
        } catch (error) {
            const errorMsg = error.response?.data?.Message || error.response?.data?.message || 'Lỗi khi xuất bản khóa học';
            if (errorMsg === "Course not ready.") {
                message.error('Khóa học chưa sẵn sàng. Vui lòng cập nhật đầy đủ Tên khóa học, Mô tả và Ảnh bìa.');
            } else {
                message.error(errorMsg);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateSubmit = async (values) => {
        try {
            setSubmitting(true);
            const payload = {
                title: values.title,
                description: values.description || "",
                thumbnail: values.thumbnail || "",
                level: parseInt(values.level) || 1,
                language: values.language || "vi"
            };
            await updateTeacherCourse(courseId, payload);
            message.success('Cập nhật thông tin thành công!');
            setIsEditModalOpen(false);
            fetchDetail();
        } catch (error) {
            console.error(error);
            const errorData = error.response?.data;
            let errorMsg = errorData?.Message || errorData?.title || errorData?.message || 'Không thể cập nhật thông tin';

            if (errorData?.errors) {
                const validationErrors = Object.values(errorData.errors).flat().join(", ");
                errorMsg = `${errorMsg}: ${validationErrors}`;
            }

            message.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleSession = async (sessionId) => {
        const section = sections.find(s => s.id === sessionId);
        const willExpand = !section?.isExpanded;

        setSections(prev =>
            prev.map(session =>
                session.id === sessionId ? { ...session, isExpanded: willExpand } : session
            )
        );

        // Fetch lessons if expanding and currently empty
        if (willExpand && (!section?.lessons || section.lessons.length === 0)) {
            fetchSectionLessons(sessionId);
        }
    };

    const handleAddSection = async (values) => {
        try {
            setSubmitting(true);
            const payload = {
                title: values.title,
                slug: slugify(values.title),
                description: values.description || "",
                sortOrder: sections.length + 1
            };
            await createSection(courseId, payload);
            message.success('Thêm chương mới thành công!');
            setIsSectionModalOpen(false);
            sectionForm.resetFields();
            fetchDetail();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Lỗi khi thêm chương';
            message.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateSection = async (values) => {
        try {
            setSubmitting(true);
            const payload = {
                title: values.title,
                slug: slugify(values.title),
                description: values.description || "",
                sortOrder: editingSection.sortOrder || 1
            };
            await updateSection(courseId, editingSection.id, payload);
            message.success('Cập nhật chương thành công!');
            setIsEditSectionModalOpen(false);
            setEditingSection(null);
            fetchDetail();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Lỗi khi cập nhật chương';
            message.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSection = (sectionId) => {
        Modal.confirm({
            title: 'Xác nhận xóa chương?',
            content: 'Toàn bộ bài học bên trong chương này cũng sẽ bị xóa.',
            okText: 'Xóa ngay',
            okType: 'danger',
            cancelText: 'Hủy bỏ',
            onOk: async () => {
                try {
                    await deleteSection(courseId, sectionId);
                    message.success('Đã xóa chương thành công!');
                    fetchDetail();
                } catch (error) {
                    message.error('Lỗi khi xóa chương');
                }
            }
        });
    };

    const handleAddLesson = async (values) => {
        try {
            setSubmitting(true);
            const payload = {
                sectionId: activeSectionId,
                title: values.title,
                slug: slugify(values.title),
                type: values.type,
                duration: parseInt(values.duration) || 0,
                content: values.content || "",
                sortOrder: 1
            };
            await createLesson(payload);
            message.success('Thêm bài học thành công!');
            setIsLessonModalOpen(false);
            lessonForm.resetFields();

            // Refresh lessons for this section immediately
            fetchSectionLessons(activeSectionId);
            // Also refresh overall course stats
            const res = await getTeacherCourseDetail(courseId);
            const data = (res?.data || res);
            setCourse(prev => ({ ...prev, ...data }));
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.title || 'Lỗi khi thêm bài học';
            message.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateLesson = async (values) => {
        try {
            setSubmitting(true);
            const payload = {
                sectionId: editingLesson.sectionId || editingLesson.SectionId || activeSectionId,
                title: values.title,
                slug: slugify(values.title),
                type: values.type,
                duration: parseInt(values.duration) || 0,
                content: values.content || "",
                sortOrder: editingLesson.sortOrder || editingLesson.SortOrder || 1
            };
            await updateLesson(editingLesson.id, payload);
            message.success('Cập nhật bài học thành công!');
            setIsEditLessonModalOpen(false);
            setEditingLesson(null);

            // Refresh lessons for this section
            fetchSectionLessons(payload.sectionId);
            // Refresh overall stats
            const res = await getTeacherCourseDetail(courseId);
            const data = (res?.data || res);
            setCourse(prev => ({ ...prev, ...data }));
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.title || 'Lỗi khi cập nhật bài học';
            message.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteLesson = (lessonId) => {
        Modal.confirm({
            title: 'Xác nhận xóa bài học?',
            content: 'Thao tác này không thể hoàn tác.',
            okText: 'Xóa ngay',
            okType: 'danger',
            cancelText: 'Hủy bỏ',
            onOk: async () => {
                try {
                    await deleteLesson(lessonId);
                    message.success('Đã xóa bài học thành công!');

                    // Force refresh all sections to ensure UI is up to date
                    // Since we don't know which section the lesson belonged to here (easily)
                    // we call fetchDetail which will preserve expanded states
                    fetchDetail();

                    // Also refresh each expanded section's lessons to be sure
                    sections.filter(s => s.isExpanded).forEach(s => fetchSectionLessons(s.id));
                } catch (error) {
                    message.error('Lỗi khi xóa bài học');
                }
            }
        });
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = sections.findIndex((item) => item.id === active.id);
        const newIndex = sections.findIndex((item) => item.id === over.id);

        const newSections = arrayMove(sections, oldIndex, newIndex);
        setSections(newSections);

        try {
            message.loading({ content: 'Đang cập nhật thứ tự...', key: 'sort_update' });
            const movedSection = newSections[newIndex];
            const payload = {
                title: movedSection.title || movedSection.Title,
                slug: slugify(movedSection.title || movedSection.Title),
                description: movedSection.description || movedSection.Description || "",
                sortOrder: newIndex + 1
            };
            await updateSection(courseId, movedSection.id, payload);
            message.success({ content: 'Đã cập nhật thứ tự chương', key: 'sort_update' });
        } catch {
            message.error({ content: 'Lỗi khi cập nhật thứ tự', key: 'sort_update' });
            fetchDetail();
        }
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

    const isPublished = (course.status ?? "").toString().toLowerCase() === 'published' ||
        (course.status ?? "").toString().toLowerCase() === 'active' ||
        course.statusCode === 1 ||
        course.Status === 'Active';

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800 animate-in fade-in duration-500">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard/teacher/courses')}
                            className="h-10 w-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#0487e2] hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Quản lý Nội dung</h1>
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mt-0.5">
                                <span>Khóa học</span>
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className="text-slate-500">{course.title}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            icon={<Eye size={16} />}
                            className="flex items-center gap-2 h-10 px-4 rounded-lg bg-white border-slate-200 text-slate-600 font-bold text-sm shadow-sm"
                        >
                            Xem trước
                        </Button>
                        {!isPublished && (
                            <Button
                                type="primary"
                                onClick={handlePublish}
                                loading={submitting}
                                icon={<Rocket size={16} />}
                                className="flex items-center gap-2 h-10 px-6 bg-[#0487e2] hover:bg-[#0374c4] rounded-lg font-bold text-sm shadow-md border-none"
                            >
                                Xuất bản
                            </Button>
                        )}
                    </div>
                </div>

                {/* --- COURSE INFO CARD --- */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0 relative w-24 h-24 rounded-lg overflow-hidden bg-blue-50 flex items-center justify-center border border-slate-100 shadow-sm text-[#0487e2]">
                            <BookOpen size={36} className="absolute z-0 opacity-50" />
                            {course.thumbnail && (
                                <img
                                    src={course.thumbnail}
                                    className="absolute inset-0 z-10 w-full h-full object-cover"
                                    alt="Thumbnail"
                                    onError={(e) => {
                                        // Hide on error to show background icon
                                        e.target.style.display = 'none';
                                    }}
                                />
                            )}
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold text-slate-800">{course.title}</h2>
                                        <Tag color={isPublished ? "success" : "default"} className="rounded-full font-bold px-3">
                                            {isPublished ? 'Hoạt động' : 'Bản nháp'}
                                        </Tag>
                                    </div>
                                    <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">{course.description || 'Chưa có mô tả cho khóa học này.'}</p>
                                </div>
                                <Button
                                    icon={<Edit3 size={14} />}
                                    onClick={() => {
                                        form.setFieldsValue(course);
                                        setIsEditModalOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#0487e2] border-blue-100/50 rounded-lg hover:bg-blue-100 font-bold text-xs"
                                >
                                    Sửa
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-6 pt-2">
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                    <BookOpen size={16} className="text-emerald-500" />
                                    <span className="font-bold text-slate-700">{course.totalLessons || 0}</span> bài học
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                    <Clock size={16} className="text-amber-500" />
                                    <span className="font-bold text-slate-700">
                                        {Math.floor(course.totalDuration / 60) || 0}h {course.totalDuration % 60 || 0}m
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CURRICULUM SECTION --- */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900">Chương trình học</h3>
                            <span className="bg-slate-100 text-slate-500 text-[11px] font-bold px-2 py-0.5 rounded-full">{sections.length} Chương</span>
                        </div>
                        <button
                            onClick={() => setIsSectionModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-bold text-sm shadow-sm transition-all active:scale-95"
                        >
                            <Plus size={18} />
                            Thêm chương mới
                        </button>
                    </div>

                    <div className="space-y-4">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={sections.map(s => s.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {sections.length > 0 ? sections.map((session, index) => (
                                    <SortableSection
                                        key={session.id}
                                        session={session}
                                        index={index}
                                        toggleSession={toggleSession}
                                        handleDeleteSection={handleDeleteSection}
                                        setEditingSection={setEditingSection}
                                        editSectionForm={editSectionForm}
                                        setIsEditSectionModalOpen={setIsEditSectionModalOpen}
                                        setActiveSectionId={setActiveSectionId}
                                        setIsLessonModalOpen={setIsLessonModalOpen}
                                        handleDeleteLesson={handleDeleteLesson}
                                        setEditingLesson={setEditingLesson}
                                        setIsEditLessonModalOpen={setIsEditLessonModalOpen}
                                        editLessonForm={editLessonForm}
                                    />
                                )) : (
                                    <div className="py-20 bg-white rounded-2xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200">
                                            <BookOpen size={32} />
                                        </div>
                                        <h4 className="text-slate-900 font-bold">Chương trình học đang trống</h4>
                                        <p className="text-slate-400 text-sm mt-1 max-w-xs">Hãy bắt đầu xây dựng nội dung bằng cách thêm chương đầu tiên.</p>
                                        <button
                                            onClick={() => setIsSectionModalOpen(true)}
                                            className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-sm shadow-md"
                                        >
                                            Khởi tạo ngay
                                        </button>
                                    </div>
                                )}
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>
            </div>

            {/* --- MODALS --- */}

            {/* Edit Course Modal */}
            <Modal
                title={<span className="font-bold text-xl">Cập nhật thông tin khóa học</span>}
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                footer={null}
                centered
                width={550}
                className="rounded-2xl"
            >
                <Form form={form} layout="vertical" onFinish={handleUpdateSubmit} className="pt-4">
                    <Form.Item name="title" label="Tên khóa học" rules={[{ required: true, message: 'Vui lòng nhập tên khóa học!' }]}>
                        <Input className="h-11 rounded-lg bg-slate-50 border-transparent hover:bg-white focus:bg-white font-medium shadow-none" />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={4} className="rounded-lg bg-slate-50 border-transparent hover:bg-white focus:bg-white shadow-none" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="level" label="Độ khó">
                            <Select className="h-11 [&>.ant-select-selector]:!rounded-lg [&>.ant-select-selector]:!bg-slate-50 [&>.ant-select-selector]:!border-transparent">
                                <Select.Option value={1}>Cơ bản</Select.Option>
                                <Select.Option value={2}>Trung bình</Select.Option>
                                <Select.Option value={3}>Nâng cao</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="language" label="Ngôn ngữ">
                            <Select className="h-11 [&>.ant-select-selector]:!rounded-lg [&>.ant-select-selector]:!bg-slate-50 [&>.ant-select-selector]:!border-transparent">
                                <Select.Option value="vi">Tiếng Việt</Select.Option>
                                <Select.Option value="en">Tiếng Anh</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item name="thumbnail" label="URL Ảnh bìa (Thumbnail)">
                        <Input className="h-11 rounded-lg bg-slate-50 border-transparent hover:bg-white focus:bg-white shadow-none" placeholder="https://example.com/image.jpg" />
                    </Form.Item>

                    <div className="flex gap-3 pt-6 border-t border-slate-100 mt-4">
                        <Button className="flex-1 h-11 rounded-xl font-bold text-slate-500 border-slate-200" onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={submitting} className="flex-1 h-11 rounded-xl bg-[#0487e2] font-bold border-none shadow-lg shadow-blue-100">
                            Lưu thay đổi
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Add Section Modal */}
            <Modal
                title={<span className="font-bold text-xl">Thêm chương mới</span>}
                open={isSectionModalOpen}
                onCancel={() => setIsSectionModalOpen(false)}
                footer={null}
                centered
                className="rounded-2xl"
            >
                <Form form={sectionForm} layout="vertical" onFinish={handleAddSection} className="pt-4">
                    <Form.Item name="title" label="Tên chương" rules={[{ required: true }]}>
                        <Input className="h-11 rounded-lg bg-slate-50 border-transparent hover:bg-white focus:bg-white font-medium" placeholder="VD: Chương 1: Giới thiệu chung" />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả ngắn">
                        <Input.TextArea rows={3} className="rounded-lg bg-slate-50 border-transparent hover:bg-white focus:bg-white" />
                    </Form.Item>
                    <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
                        <Button className="flex-1 h-11 rounded-xl font-bold text-slate-500 border-slate-200" onClick={() => setIsSectionModalOpen(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={submitting} className="flex-1 h-11 rounded-xl bg-slate-900 font-bold border-none shadow-lg shadow-slate-200">
                            Tạo chương
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Edit Section Modal */}
            <Modal
                title={<span className="font-bold text-xl">Chỉnh sửa chương</span>}
                open={isEditSectionModalOpen}
                onCancel={() => {
                    setIsEditSectionModalOpen(false);
                    setEditingSection(null);
                }}
                footer={null}
                centered
                className="rounded-2xl"
            >
                <Form form={editSectionForm} layout="vertical" onFinish={handleUpdateSection} className="pt-4">
                    <Form.Item name="title" label="Tên chương" rules={[{ required: true }]}>
                        <Input className="h-11 rounded-lg bg-slate-50 border-transparent hover:bg-white focus:bg-white font-medium" />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={3} className="rounded-lg bg-slate-50 border-transparent hover:bg-white focus:bg-white" />
                    </Form.Item>
                    <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
                        <Button className="flex-1 h-11 rounded-xl font-bold text-slate-500 border-slate-200" onClick={() => setIsEditSectionModalOpen(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={submitting} className="flex-1 h-11 rounded-xl bg-[#0487e2] font-bold border-none shadow-lg shadow-blue-100">
                            Cập nhật
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Add Lesson Modal */}
            <Modal
                title={<span className="font-bold text-xl">Thêm bài học mới</span>}
                open={isLessonModalOpen}
                onCancel={() => setIsLessonModalOpen(false)}
                footer={null}
                centered
                className="rounded-2xl"
            >
                <Form form={lessonForm} layout="vertical" onFinish={handleAddLesson} className="pt-4">
                    <Form.Item name="title" label="Tiêu đề bài học" rules={[{ required: true }]}>
                        <Input className="h-11 rounded-lg bg-slate-50 border-transparent hover:bg-white focus:bg-white font-medium" />
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="type" label="Loại bài học" initialValue="Video">
                            <Select className="h-11 [&>.ant-select-selector]:!rounded-lg [&>.ant-select-selector]:!bg-slate-50 [&>.ant-select-selector]:!border-transparent">
                                <Select.Option value="Video">Video</Select.Option>
                                <Select.Option value="Document">Tài liệu</Select.Option>
                                <Select.Option value="Quiz">Trắc nghiệm</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="duration" label="Thời lượng (Phút)">
                            <Input type="number" className="h-11 rounded-lg bg-slate-50 border-transparent" />
                        </Form.Item>
                    </div>
                    <Form.Item name="content" label="Nội dung/Link">
                        <Input.TextArea rows={3} className="rounded-lg bg-slate-50 border-transparent hover:bg-white focus:bg-white font-medium" placeholder="URL Video hoặc nội dung bài học..." />
                    </Form.Item>
                    <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
                        <Button className="flex-1 h-11 rounded-xl font-bold text-slate-500 border-slate-200" onClick={() => setIsLessonModalOpen(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={submitting} className="flex-1 h-11 rounded-xl bg-[#0487e2] font-bold border-none shadow-lg shadow-blue-100">
                            Thêm bài học
                        </Button>
                    </div>
                </Form>
            </Modal>
            {/* Edit Lesson Modal */}
            <Modal
                title={<span className="font-bold text-xl">Chỉnh sửa bài học</span>}
                open={isEditLessonModalOpen}
                onCancel={() => {
                    setIsEditLessonModalOpen(false);
                    setEditingLesson(null);
                }}
                footer={null}
                centered
                className="rounded-2xl"
            >
                <Form form={editLessonForm} layout="vertical" onFinish={handleUpdateLesson} className="pt-4">
                    <Form.Item name="title" label="Tiêu đề bài học" rules={[{ required: true }]}>
                        <Input className="h-11 rounded-lg bg-slate-50 border-transparent hover:bg-white focus:bg-white font-medium" />
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="type" label="Loại bài học">
                            <Select className="h-11 [&>.ant-select-selector]:!rounded-lg [&>.ant-select-selector]:!bg-slate-50 [&>.ant-select-selector]:!border-transparent">
                                <Select.Option value="Video">Video</Select.Option>
                                <Select.Option value="Document">Tài liệu</Select.Option>
                                <Select.Option value="Quiz">Trắc nghiệm</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="duration" label="Thời lượng (Phút)">
                            <Input type="number" className="h-11 rounded-lg bg-slate-50 border-transparent" />
                        </Form.Item>
                    </div>
                    <Form.Item name="content" label="Nội dung/Link">
                        <Input.TextArea rows={3} className="rounded-lg bg-slate-50 border-transparent hover:bg-white focus:bg-white font-medium" />
                    </Form.Item>
                    <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
                        <Button className="flex-1 h-11 rounded-xl font-bold text-slate-500 border-slate-200" onClick={() => setIsEditLessonModalOpen(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={submitting} className="flex-1 h-11 rounded-xl bg-[#0487e2] font-bold border-none shadow-lg shadow-blue-100">
                            Cập nhật
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}

const SortableSection = React.memo(({
    session,
    index,
    toggleSession,
    handleDeleteSection,
    setEditingSection,
    editSectionForm,
    setIsEditSectionModalOpen,
    setActiveSectionId,
    setIsLessonModalOpen,
    handleDeleteLesson,
    setEditingLesson,
    setIsEditLessonModalOpen,
    editLessonForm
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: session.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all hover:border-blue-200 relative group"
        >
            {/* Section Header */}
            <div
                className={`flex items-center justify-between p-4 cursor-pointer select-none transition-colors ${session.isExpanded ? 'bg-slate-50/80 border-b border-slate-100' : 'bg-white'}`}
                onClick={() => toggleSession(session.id)}
            >
                <div className="flex items-center gap-4">
                    <div
                        {...attributes}
                        {...listeners}
                        className="p-2 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <DragHandle size={20} />
                    </div>
                    <div className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${session.isExpanded ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-slate-100 text-slate-500'}`}>
                        {index + 1}
                    </div>
                    <div>
                        <div className="font-bold text-slate-900">{session.title || session.name || session.Title || session.Name || 'Không có tiêu đề'}</div>
                        <div className="text-[11px] text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1"><BookOpen size={12} /> {(session.lessons || []).length} Bài học</span>
                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                            <span className="flex items-center gap-1"><Clock size={12} /> {session.duration || session.Duration || '0 phút'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <button
                            className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-[#0487e2] hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditingSection(session);
                                editSectionForm.setFieldsValue({
                                    title: session.title || session.Title,
                                    description: session.description || session.Description
                                });
                                setIsEditSectionModalOpen(true);
                            }}
                        >
                            <Edit3 size={14} />
                        </button>
                        <button
                            className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSection(session.id);
                            }}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <div className={`h-8 w-8 flex items-center justify-center text-slate-400 transition-transform duration-300 ${session.isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={20} />
                    </div>
                </div>
            </div>

            {/* Lessons List Content */}
            {session.isExpanded && (
                <div className="p-4 space-y-3 bg-white animate-in slide-in-from-top-2 duration-300">
                    {(session.lessons || []).length > 0 ? (
                        (session.lessons || []).map((lesson) => (
                            <div key={lesson.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all group/lesson">
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${(lesson.type || lesson.Type) === 'Video' ? 'bg-blue-50 text-[#0487e2]' : 'bg-slate-50 text-slate-500'}`}>
                                        {(lesson.type || lesson.Type) === 'Video' ? <Video size={18} /> : ((lesson.type || lesson.Type) === 'Quiz' ? <CheckSquare size={18} /> : <FileText size={18} />)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-700 text-sm group-hover/lesson:text-[#0487e2] transition-colors uppercase tracking-tight">
                                            {lesson.title || lesson.title || lesson.Title || lesson.Name || lesson.name || 'Bài học rỗng'}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-2">
                                            {lesson.type || lesson.Type || 'Nội dung'}
                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                            {lesson.duration || lesson.Duration || '0m'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-10 group-hover/lesson:opacity-100 transition-opacity">
                                    <button
                                        className="p-2 text-slate-400 hover:text-[#0487e2] hover:bg-white rounded-lg transition-colors shadow-sm"
                                        onClick={() => {
                                            setEditingLesson(lesson);
                                            editLessonForm.setFieldsValue({
                                                title: lesson.title,
                                                type: lesson.type,
                                                duration: lesson.duration,
                                                content: lesson.content
                                            });
                                            setIsEditLessonModalOpen(true);
                                        }}
                                    >
                                        <Edit3 size={14} />
                                    </button>
                                    <button
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors shadow-sm"
                                        onClick={() => handleDeleteLesson(lesson.id)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                            <p className="text-slate-400 text-xs font-medium italic">Chưa có bài học nào trong chương này.</p>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            setActiveSectionId(session.id);
                            setIsLessonModalOpen(true);
                        }}
                        className="w-full py-3 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 font-bold text-xs uppercase cursor-pointer hover:border-blue-200 hover:text-[#0487e2] hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={16} />
                        Thêm bài học mới
                    </button>
                </div>
            )}
        </div>
    );
});
