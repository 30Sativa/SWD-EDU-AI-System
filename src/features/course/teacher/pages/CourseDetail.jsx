import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
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
    ArrowLeft,
    Target,
    Settings,
    LayoutGrid,
    ChevronRight,
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
import { Spin, message, Modal, Form, Input, Select, Button, Tag, Empty, Switch, Dropdown, Menu, DatePicker, InputNumber } from 'antd';
import {
    getTeacherCourseDetail,
    publishTeacherCourse,
    updateTeacherCourse,
    createTeacherSection,
    updateTeacherSection,
    deleteTeacherSection,
    getCourseSections
} from '../../api/courseApi';
import { createLesson, updateLesson, deleteLesson, getLessonsBySection, getLessonBlocks, createLessonBlock, updateLessonBlock, deleteLessonBlock } from '../../../lesson/api/lessonApi';
import { getAssignmentsByCourse, getStudentAssignmentsByCourse, createAssignment, updateAssignment, deleteAssignment, publishAssignment, unpublishAssignment } from '../../../assignment/api/assignmentApi';
import {
    createFormativeQuiz,
    createSummativeQuiz,
    getLessonQuizzes,
    getCourseQuizzes,
    updateQuiz,
    deleteQuiz,
    getQuizDetail
} from '../../../quiz/teacher/api/quizApi';


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

    // Sidebar & Tabs
    const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' or 'assignments'

    // Blocks Modal State
    const [isBlocksModalOpen, setIsBlocksModalOpen] = useState(false);
    const [activeLessonForBlocks, setActiveLessonForBlocks] = useState(null);
    const [lessonBlocks, setLessonBlocks] = useState([]);
    const [loadingBlocks, setLoadingBlocks] = useState(false);
    const [editingBlock, setEditingBlock] = useState(null);
    const [blockForm] = Form.useForm();

    // Assignment State
    const [assignments, setAssignments] = useState([]);
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [assignmentForm] = Form.useForm();

    // Quiz State
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    const [quizForm] = Form.useForm();
    const [quizMode, setQuizMode] = useState('formative'); // 'formative' | 'summative'
    const [activeQuizTargetId, setActiveQuizTargetId] = useState(null);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [summativeQuizzes, setSummativeQuizzes] = useState([]);

    // Lesson Quizzes Management
    const [isLessonQuizzesModalOpen, setIsLessonQuizzesModalOpen] = useState(false);
    const [activeLessonForQuizzes, setActiveLessonForQuizzes] = useState(null);


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

    const fetchAssignments = useCallback(async () => {
        if (!courseId) return;
        try {
            // Sử dụng student API để lấy danh sách bài tập (Pattern này giống với Quiz feature giúp tránh lỗi 500 trên teacher endpoint hiện tại)
            const res = await getStudentAssignmentsByCourse(courseId);
            const data = res?.data?.items || res?.items || res?.data || (Array.isArray(res) ? res : []);
            setAssignments(data);
        } catch (error) {
            console.error("Không thể tải danh sách bài tập", error);
        }
    }, [courseId]);

    const handleAssignmentSubmit = async (values) => {
        try {
            setSubmitting(true);
            const payload = {
                courseId: courseId,
                title: values.title,
                description: values.description || ""
            };

            if (editingAssignment) {
                await updateAssignment(editingAssignment.id, payload);
                message.success('Cập nhật bài tập thành công!');
            } else {
                await createAssignment(payload);
                message.success('Thêm bài tập thành công!');
            }

            setIsAssignmentModalOpen(false);
            setEditingAssignment(null);
            assignmentForm.resetFields();
            fetchAssignments();
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi lưu bài tập');
        } finally {
            setSubmitting(false);
        }
    };

    const openQuizModal = (targetId, mode, quiz = null) => {
        setQuizMode(mode);
        setActiveQuizTargetId(targetId);
        setEditingQuiz(quiz);

        if (quiz) {
            quizForm.setFieldsValue({
                title: quiz.title,
                description: quiz.description,
                timeLimit: quiz.timeLimit,
                maxAttempts: quiz.maxAttempts,
                passingScore: quiz.passingScore,
                isPublished: quiz.isPublished,
                isRequired: quiz.isRequired,
                showAnswers: quiz.showAnswers,
                shuffleQuestions: quiz.shuffleQuestions
            });
        } else {
            quizForm.resetFields();
            quizForm.setFieldsValue({
                isPublished: true,
                isRequired: true,
                showAnswers: true,
                shuffleQuestions: true,
                maxAttempts: 1,
                passingScore: 50,
                timeLimit: 30
            });
        }
        setIsQuizModalOpen(true);
    };

    const handleDeleteQuiz = (quizId) => {
        Modal.confirm({
            title: 'Xóa bài kiểm tra này?',
            content: 'Dữ liệu và kết quả liên quan sẽ bị xóa vĩnh viễn.',
            okText: 'Xóa ngay',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await deleteQuiz(quizId);
                    message.success('Đã xóa Quiz thành công!');

                    // Refresh all lists
                    fetchDetail(); // Will refresh summative
                    sections.filter(s => s.isExpanded).forEach(s => fetchSectionLessons(s.id));
                } catch {
                    message.error('Lỗi khi xóa bài kiểm tra');
                }
            }
        });
    };

    const handleQuizSubmit = async (values) => {
        try {
            setSubmitting(true);
            const payload = {
                title: values.title,
                description: values.description || "",
                timeLimit: parseInt(values.timeLimit) || 0,
                maxAttempts: parseInt(values.maxAttempts) || 0,
                passingScore: parseInt(values.passingScore) || 50,
                isPublished: values.isPublished ?? true,
                isRequired: values.isRequired ?? true,
                showAnswers: values.showAnswers ?? true,
                shuffleQuestions: values.shuffleQuestions ?? true
            };

            if (editingQuiz) {
                await updateQuiz(editingQuiz.id || editingQuiz.quizId, payload);
                message.success('Cập nhật thông tin Quiz thành công!');
            } else if (quizMode === 'formative') {
                payload.lessonId = activeQuizTargetId;
                const res = await createFormativeQuiz(payload);
                const newQuiz = res?.data || res;
                message.success('Tạo Quiz bài học thành công!');
                if (newQuiz?.id) {
                    navigate(`/dashboard/teacher/courses/${courseId}/quizzes/${newQuiz.id}`);
                }
            } else {
                payload.courseId = activeQuizTargetId;
                const res = await createSummativeQuiz(payload);
                const newQuiz = res?.data || res;
                message.success('Tạo Quiz cuối khóa thành công!');
                if (newQuiz?.id) {
                    navigate(`/dashboard/teacher/courses/${courseId}/quizzes/${newQuiz.id}`);
                }
            }

            setIsQuizModalOpen(false);
            setEditingQuiz(null);
            quizForm.resetFields();

            // Critical: Refresh detail to update summative lists
            fetchDetail();
            // Refresh lessons to update formative lists
            sections.filter(s => s.isExpanded).forEach(s => fetchSectionLessons(s.id));
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi lưu bài kiểm tra');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleAssignmentPublish = async (assignment) => {
        try {
            message.loading({ content: 'Đang xử lý...', key: 'publish_assignment' });
            // Detect publish status as boolean, supporting both Boolean and String 'true' from backend
            const rawStatus = assignment.isPublished ?? assignment.IsPublished ?? assignment.status ?? false;
            const isPublished = rawStatus === true || rawStatus === "true" || rawStatus === "Published" || rawStatus === 1;

            const assignmentId = assignment.id || assignment.Id || assignment.assignmentId || assignment.AssignmentId || assignment.courseAssignmentId;

            if (isPublished) {
                await unpublishAssignment(assignmentId);
                message.success({ content: 'Đã ẩn bài tập!', key: 'publish_assignment' });
            } else {
                await publishAssignment(assignmentId);
                message.success({ content: 'Đã công bố bài tập!', key: 'publish_assignment' });
            }
            fetchAssignments();
        } catch (error) {
            message.error({ content: error.response?.data?.message || 'Lỗi khi thay đổi trạng thái', key: 'publish_assignment' });
        }
    };

    const handleDeleteAssignment = (assignmentId) => {
        Modal.confirm({
            title: 'Xác nhận xóa bài tập?',
            content: 'Bạn có chắc chắn muốn xóa bài tập này không? Hành động này không thể hoàn tác.',
            okText: 'Xóa ngay',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await deleteAssignment(assignmentId);
                    message.success('Đã xóa bài tập thành công!');
                    fetchAssignments();
                } catch (error) {
                    message.error(error.response?.data?.message || 'Lỗi khi xóa bài tập');
                }
            }
        });
    };

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

            // Standardizing mapping and filtering soft-deleted sections
            setSections(prev => {
                console.log("Raw structure to map:", structure);
                const mapped = structure
                    .filter(sec => {
                        // More aggressive deletion check
                        const isDel = sec.isDeleted || sec.IsDeleted || sec.status === 'Deleted' || sec.Status === 'Deleted' || sec.isdeleted || sec.deleted === true;
                        return !isDel;
                    })
                    .map(sec => {
                        const secId = sec.id || sec.Id || sec.sectionId || sec.SectionId;
                        const secSortOrder = sec.sortOrder ?? sec.SortOrder ?? sec.order ?? sec.Order ?? 0;
                        const existing = prev.find(s => (s.id || s.Id) === secId);
                        return {
                            ...sec,
                            id: secId,
                            sortOrder: Number(secSortOrder),
                            lessons: existing?.lessons || sec.lessons || sec.Lessons || sec.items || sec.Items || sec.subSections || [],
                            isExpanded: existing?.isExpanded || false
                        };
                    });

                // Stable sort by sortOrder, then by original ID to prevent jumping
                return [...mapped].sort((a, b) => {
                    const diff = a.sortOrder - b.sortOrder;
                    if (diff !== 0) return diff;
                    return String(a.id).localeCompare(String(b.id));
                });
            });

            // If the detail API doesn't return base fields (like subjectId), fetch from list to supplement
            if (!data.subjectId && !data.SubjectId && !data.subject?.id) {
                try {
                    const { getMyCourses } = await import('../../api/courseApi');
                    const myCoursesRes = await getMyCourses({ pageSize: 1000 });
                    const coursesList = myCoursesRes?.data?.items || myCoursesRes?.items || myCoursesRes?.data || [];
                    const baseCourse = coursesList.find(c => c.id === courseId);
                    if (baseCourse) {
                        data.subjectId = baseCourse.subjectId || baseCourse.SubjectId;
                        data.categoryId = baseCourse.categoryId || baseCourse.CategoryId;
                        data.gradeLevelId = baseCourse.gradeLevelId || baseCourse.gradeId || baseCourse.GradeLevelId;
                        data.code = baseCourse.code || baseCourse.Code;
                    }
                } catch (e) {
                    console.error("Could not supplement course base fields", e);
                }
            }

            setCourse(data);

            // Fetch Summative Quizzes for Course
            getCourseQuizzes(courseId).then(quizRes => {
                const quizList = quizRes?.data || quizRes || [];
                setSummativeQuizzes(Array.isArray(quizList) ? quizList : []);
            }).catch(err => {
                console.error("Course Quizzes fetch failed:", err);
            });

            // Load Assignments
            fetchAssignments();
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

            // Map each lesson to include its formative quizzes
            const lessonsWithQuizzes = await Promise.all(lessons.map(async (lesson) => {
                try {
                    const quizRes = await getLessonQuizzes(lesson.id);
                    const qData = Array.isArray(quizRes?.data) ? quizRes.data : (Array.isArray(quizRes) ? quizRes : []);
                    return { ...lesson, quizzes: qData };
                } catch (e) {
                    return { ...lesson, quizzes: [] };
                }
            }));

            setSections(prev => prev.map(sec =>
                sec.id === sectionId ? { ...sec, lessons: lessonsWithQuizzes } : sec
            ));
            return lessonsWithQuizzes;
        } catch (error) {
            console.error("Error fetching lessons:", error);
            return [];
        }
    };

    useEffect(() => {
        if (courseId) fetchDetail();
    }, [courseId, fetchDetail]);

    // Auto-fetch lessons and quizzes for all sections when opening Quizzes tab
    useEffect(() => {
        if (activeTab === 'quizzes' && sections.length > 0) {
            sections.forEach(s => {
                if (!s.lessons || s.lessons.length === 0) {
                    fetchSectionLessons(s.id);
                }
            });
        }
    }, [activeTab, sections.length]);

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
                code: course?.code || course?.Code || "COURSE_CODE",
                subjectId: course?.subjectId || course?.SubjectId,
                gradeLevelId: course?.gradeLevelId || course?.GradeLevelId || course?.gradeId || course?.GradeId,
                categoryId: course?.categoryId || course?.CategoryId,
                description: values.description || "",
                thumbnail: values.thumbnail ? values.thumbnail.replace(/^["']|["']$/g, '') : "",
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

        // Fetch lessons and quizzes when expanding
        if (willExpand) {
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
            await createTeacherSection(courseId, payload);
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
            const currentOrder = editingSection.sortOrder ?? editingSection.order ?? editingSection.SortOrder ?? (sections.findIndex(s => s.id === editingSection.id) + 1);
            const payload = {
                title: values.title,
                slug: slugify(values.title),
                description: values.description || "",
                sortOrder: Number(currentOrder),
                order: Number(currentOrder) // Include both just in case
            };
            await updateTeacherSection(courseId, editingSection.id, payload);
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

    const handleDeleteSection = (sectionIdOrObj) => {
        const targetSectionId = typeof sectionIdOrObj === 'object'
            ? (sectionIdOrObj.id || sectionIdOrObj.Id || sectionIdOrObj.sectionId || sectionIdOrObj.SectionId)
            : sectionIdOrObj;

        if (!targetSectionId) {
            message.warning("Không tìm thấy mã chương!");
            return;
        }

        Modal.confirm({
            title: 'Xóa chương này?',
            content: 'Toàn bộ bài học trong chương cũng sẽ bị xóa vĩnh viễn.',
            okText: 'Xóa ngay',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                const prevSectionsState = [...sections];
                try {
                    // Force immediately remove from UI with case-insensitive comparison
                    setSections(prev => prev.filter(s => {
                        const sid = String(s.id || s.Id || s.sectionId || s.SectionId || "").toLowerCase();
                        const tid = String(targetSectionId || "").toLowerCase();
                        return sid !== tid && sid !== "";
                    }));

                    message.loading({ content: 'Đang xử lý xóa...', key: 'deleting_section' });
                    await deleteTeacherSection(courseId, targetSectionId);
                    message.success({ content: 'Đã xóa chương thành công!', key: 'deleting_section' });

                    // Delay refresh to let server update consistency 
                    setTimeout(() => fetchDetail(), 1000);
                } catch (error) {
                    console.error("Delete section failed:", error);
                    message.error({
                        content: error.response?.data?.message || 'Lỗi khi xóa chương',
                        key: 'deleting_section'
                    });
                    setSections(prevSectionsState); // Rollback on error
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

    const openBlocksModal = async (lesson) => {
        setActiveLessonForBlocks(lesson);
        setIsBlocksModalOpen(true);
        fetchLessonBlocks(lesson.id);
    };

    const fetchLessonBlocks = async (lessonId) => {
        try {
            setLoadingBlocks(true);
            const res = await getLessonBlocks(lessonId);
            const items = res?.data?.items || res?.items || res?.data || (Array.isArray(res) ? res : []);
            setLessonBlocks(items);
        } catch (error) {
            message.error('Lỗi khi tải nội dung bài học');
        } finally {
            setLoadingBlocks(false);
        }
    };

    const handleBlockSubmit = async (values) => {
        try {
            setSubmitting(true);
            const payload = {
                title: values.title || "",
                content: values.content || "",
                type: values.type || "Text",
                sortOrder: editingBlock ? editingBlock.sortOrder : lessonBlocks.length + 1
            };

            if (editingBlock) {
                await updateLessonBlock(activeLessonForBlocks.id, editingBlock.id, payload);
                message.success('Cập nhật khối nội dung thành công!');
                setEditingBlock(null);
            } else {
                await createLessonBlock(activeLessonForBlocks.id, payload);
                message.success('Thêm khối nội dung thành công!');
            }

            blockForm.resetFields();
            fetchLessonBlocks(activeLessonForBlocks.id);
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi lưu khối nội dung');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteBlock = (blockId) => {
        Modal.confirm({
            title: 'Xóa nội dung này?',
            content: 'Nội dung sẽ bị xóa vĩnh viễn.',
            okText: 'Xóa ngay',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await deleteLessonBlock(activeLessonForBlocks.id, blockId);
                    message.success('Đã xóa thành công!');
                    fetchLessonBlocks(activeLessonForBlocks.id);
                } catch {
                    message.error('Lỗi khi xóa nội dung');
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
            await updateTeacherSection(courseId, movedSection.id, payload);
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

                {/* --- TABS --- */}
                <div className="flex border-b border-slate-200 mb-6">
                    <button
                        className={`pb-3 px-6 font-bold text-sm transition-colors border-b-2 ${activeTab === 'curriculum' ? 'border-[#0487e2] text-[#0487e2]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('curriculum')}
                    >
                        Chương trình học
                    </button>
                    <button
                        className={`pb-3 px-6 font-bold text-sm transition-colors border-b-2 ${activeTab === 'assignments' ? 'border-[#0487e2] text-[#0487e2]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('assignments')}
                    >
                        Bài tập (Assignments)
                    </button>
                    <button
                        className={`pb-3 px-6 font-bold text-sm transition-colors border-b-2 ${activeTab === 'quizzes' ? 'border-[#0487e2] text-[#0487e2]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('quizzes')}
                    >
                        Quản lý Quiz
                    </button>
                </div>

                {/* --- CONTENT BASED ON TAB --- */}
                {activeTab === 'curriculum' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-slate-900">Chương trình học</h3>
                                <span className="bg-slate-100 text-slate-500 text-[11px] font-bold px-2 py-0.5 rounded-full">{sections.length} Chương</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openQuizModal(courseId, 'summative')}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold text-sm shadow-sm transition-all active:scale-95"
                                >
                                    <CheckSquare size={18} />
                                    Tạo Quiz cuối khóa
                                </button>
                                <button
                                    onClick={() => setIsSectionModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-bold text-sm shadow-sm transition-all active:scale-95"
                                >
                                    <Plus size={18} />
                                    Thêm chương mới
                                </button>
                            </div>
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
                                            openBlocksModal={openBlocksModal}
                                            openQuizModal={openQuizModal}
                                            handleDeleteQuiz={handleDeleteQuiz}
                                            courseId={courseId}
                                            navigate={navigate}
                                            openLessonQuizzesModal={(lesson) => {
                                                setActiveLessonForQuizzes(lesson);
                                                setIsLessonQuizzesModalOpen(true);
                                            }}
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
                )}

                {/* --- ASSIGNMENTS SECTION --- */}
                {activeTab === 'assignments' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-slate-900">Danh sách Bài tập</h3>
                                <span className="bg-slate-100 text-slate-500 text-[11px] font-bold px-2 py-0.5 rounded-full">{assignments.length} Bài</span>
                            </div>
                            <button
                                onClick={() => {
                                    setEditingAssignment(null);
                                    assignmentForm.resetFields();
                                    setIsAssignmentModalOpen(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-bold text-sm shadow-sm transition-all"
                            >
                                <Plus size={18} />
                                Thêm bài tập mới
                            </button>
                        </div>

                        <div className="space-y-4">
                            {assignments.length > 0 ? assignments.map((assignment, index) => {
                                const assignmentId = assignment.id || assignment.Id || assignment.assignmentId || assignment.AssignmentId || assignment.courseAssignmentId;
                                return (
                                    <div key={assignmentId} className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center hover:border-blue-300 transition-all">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-slate-800">{assignment.title || assignment.Title}</h4>
                                                {(() => {
                                                    const rawStatus = assignment.isPublished ?? assignment.IsPublished ?? assignment.status ?? false;
                                                    const isPublished = rawStatus === true || rawStatus === "true" || rawStatus === "Published" || rawStatus === 1;
                                                    return (
                                                        <>
                                                            <Tag color={isPublished ? "success" : "default"}>
                                                                {isPublished ? "Đã công bố" : "Đang ẩn"}
                                                            </Tag>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                            <p className="text-sm text-slate-500 mb-2">{assignment.description || assignment.Description || "Không có mô tả"}</p>
                                            <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-wider">
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <Clock size={12} className="text-slate-300" />
                                                    Hạn nộp: <span className={assignment.dueDate || assignment.DueDate ? "text-slate-600" : "text-slate-300 italic"}>
                                                        {(assignment.dueDate || assignment.DueDate)
                                                            ? dayjs(assignment.dueDate || assignment.DueDate).format('HH:mm, DD/MM/YYYY')
                                                            : "Chưa thiết lập"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-400 border-l border-slate-200 pl-4">
                                                    <CheckSquare size={12} className="text-slate-300" />
                                                    Điểm tối đa: <span className="text-[#0487e2]">{assignment.maxScore || assignment.MaxScore || 10}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleAssignmentPublish(assignment)}
                                                className="h-8 px-3 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg"
                                            >
                                                {(() => {
                                                    const rawStatus = assignment.isPublished ?? assignment.IsPublished ?? assignment.status ?? false;
                                                    const isPublished = rawStatus === true || rawStatus === "true" || rawStatus === "Published" || rawStatus === 1;
                                                    return isPublished ? "Ẩn" : "Công bố";
                                                })()}
                                            </button>
                                            <button
                                                className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-[#0487e2] hover:bg-blue-50 focus:bg-blue-50 rounded-lg transition-colors border border-transparent shadow-sm"
                                                onClick={() => {
                                                    const editId = assignment.id || assignment.Id;
                                                    setEditingAssignment(assignment);
                                                    assignmentForm.setFieldsValue({
                                                        title: assignment.title || assignment.Title,
                                                        description: assignment.description || assignment.Description,
                                                        dueDate: (assignment.dueDate || assignment.DueDate) ? dayjs(assignment.dueDate || assignment.DueDate) : null,
                                                        maxScore: assignment.maxScore || assignment.MaxScore || 10
                                                    });
                                                    setIsAssignmentModalOpen(true);
                                                }}
                                                title="Chỉnh sửa"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 focus:bg-rose-50 rounded-lg transition-colors border border-transparent shadow-sm"
                                                onClick={() => handleDeleteAssignment(assignmentId)}
                                                title="Xóa"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="py-20 bg-white rounded-2xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200">
                                        <FileText size={32} />
                                    </div>
                                    <h4 className="text-slate-900 font-bold">Chưa có bài tập nào</h4>
                                    <p className="text-slate-400 text-sm mt-1 max-w-xs">Giao bài tập để học viên rèn luyện kỹ năng.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- QUIZZES TAB --- */}
                {activeTab === 'quizzes' && (
                    <div className="space-y-10">
                        {/* Summative Section */}
                        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                            <div className="bg-gradient-to-r from-blue-600/5 to-transparent p-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                                        <Target size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">Bài kiểm tra tổng kết Course</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Sử dụng để đánh giá cuối khóa học</p>
                                    </div>
                                </div>
                                <Button
                                    type="primary"
                                    icon={<Plus size={18} />}
                                    onClick={() => openQuizModal(courseId, 'summative')}
                                    className="h-11 rounded-xl bg-blue-600 font-bold border-none shadow-md"
                                >
                                    Tạo Summative Quiz
                                </Button>
                            </div>
                            <div className="p-6 space-y-4">
                                {summativeQuizzes.length > 0 ? summativeQuizzes.map(quiz => (
                                    <div key={quiz.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-white hover:border-blue-100 hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-5">
                                            <div className="h-10 w-10 flex items-center justify-center bg-white rounded-xl shadow-inner text-[#0463ca]">
                                                <CheckSquare size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-bold text-slate-800 text-base">{quiz.title}</span>
                                                    <Tag color={quiz.isPublished ? "success" : "default"} className="rounded-full px-2 border-0 text-[10px] font-black uppercase tracking-widest">
                                                        {quiz.isPublished ? "Đã công bố" : "Bản nháp"}
                                                    </Tag>
                                                </div>
                                                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 tracking-tight uppercase">
                                                    <span>⏰ {quiz.timeLimit} phút</span>
                                                    <span>🎯 {quiz.questionCount || 0} câu</span>
                                                    <span className="text-blue-500">🏆 Vượt qua: {quiz.passingScore}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 mt-4 md:mt-0">
                                            <Button
                                                onClick={() => navigate(`/dashboard/teacher/courses/${courseId}/quizzes/${quiz.id}`)}
                                                className="rounded-xl border-slate-200 text-slate-600 font-bold hover:text-blue-600 hover:border-blue-100 flex items-center gap-2"
                                            >
                                                <Edit3 size={14} /> Thiết kế
                                            </Button>
                                            <Button
                                                onClick={() => openQuizModal(courseId, 'summative', quiz)}
                                                icon={<Settings size={14} />}
                                                className="rounded-xl border-slate-200 text-slate-400"
                                            />
                                            <Button
                                                danger
                                                icon={<Trash2 size={14} />}
                                                onClick={() => handleDeleteQuiz(quiz.id)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </div>
                                )) : (
                                    <Empty description="Chưa có bài kiểm tra tổng kết nào." className="py-10" />
                                )}
                            </div>
                        </div>

                        {/* Formative Section Summary */}
                        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                            <div className="bg-gradient-to-r from-emerald-600/5 to-transparent p-6 border-b border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
                                        <CheckSquare size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">Bài kiểm tra tiến trình (Formative)</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Đánh giá mức độ hiểu bài sau mỗi bài học</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-6">
                                    {sections.map(section => (
                                        <div key={section.id} className="space-y-3">
                                            <div className="text-xs font-black text-slate-400 uppercase tracking-[2px] mb-2 pl-2 border-l-2 border-emerald-500">
                                                {section.title || section.Title}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {(section.lessons || []).map(lesson => (
                                                    <div key={lesson.id} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-emerald-100 transition-all flex justify-between items-center group/lesson-mini">
                                                        <div className="max-w-[70%]">
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Bài học</div>
                                                            <div className="font-bold text-slate-700 text-sm truncate">
                                                                {lesson.title || lesson.Title || lesson.Name || lesson.name || 'Bài học rỗng'}
                                                            </div>
                                                            <div className="mt-2">
                                                                {lesson.quizzes && lesson.quizzes.length > 0 ? (
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {lesson.quizzes.map(q => (
                                                                            <Tag
                                                                                key={q.id || q.quizId}
                                                                                className="m-0 rounded-full border-0 bg-emerald-50 text-emerald-600 font-bold text-[10px] py-0.5 cursor-pointer hover:bg-emerald-100 transition-colors"
                                                                                onClick={() => navigate(`/dashboard/teacher/courses/${courseId}/quizzes/${q.id || q.quizId}`)}
                                                                            >
                                                                                {q.title}
                                                                            </Tag>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-[10px] italic text-slate-400">Chưa có Quiz</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="small"
                                                            icon={<Plus size={14} />}
                                                            onClick={() => openQuizModal(lesson.id, 'formative')}
                                                            className="rounded-lg h-8 w-8 text-emerald-500 opacity-20 group-hover/lesson-mini:opacity-100 transition-opacity"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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
            {/* Manage Blocks Modal */}
            <Modal
                title={
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-xl">
                            Các khối nội dung - {activeLessonForBlocks?.title}
                        </span>
                    </div>
                }
                open={isBlocksModalOpen}
                onCancel={() => {
                    setIsBlocksModalOpen(false);
                    setActiveLessonForBlocks(null);
                    setEditingBlock(null);
                    blockForm.resetFields();
                }}
                footer={null}
                width={700}
                centered
                className="rounded-2xl"
            >
                <div className="pt-4 space-y-6">
                    {/* List of blocks */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 max-h-[350px] overflow-y-auto custom-scrollbar">
                        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center justify-between">
                            Danh sách nội dung
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{lessonBlocks.length} khối</span>
                        </h4>

                        {loadingBlocks ? (
                            <div className="py-8 flex justify-center"><Spin /></div>
                        ) : lessonBlocks.length > 0 ? (
                            <div className="space-y-3">
                                {lessonBlocks.map((block, idx) => (
                                    <div key={block.id} className="bg-white border border-slate-200 rounded-lg p-3 flex gap-3 group hover:border-blue-300 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0487e2] flex items-center justify-center font-bold text-xs shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div className="font-semibold text-slate-800 text-sm truncate pr-2">
                                                    {block.title || `Khối ${idx + 1}`}
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                                                    {block.type || 'Text'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 line-clamp-2 pr-2">
                                                {block.content}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                onClick={() => {
                                                    setEditingBlock(block);
                                                    blockForm.setFieldsValue({
                                                        title: block.title,
                                                        type: block.type || 'Text',
                                                        content: block.content
                                                    });
                                                }}
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                                onClick={() => handleDeleteBlock(block.id)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-slate-400 italic text-sm">
                                Chưa có nội dung nào. Hãy thêm nội dung mới.
                            </div>
                        )}
                    </div>

                    {/* Block Form */}
                    <div className="border-t border-slate-100 pt-5">
                        <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                            {editingBlock ? (
                                <><Edit3 size={16} className="text-[#0487e2]" /> Chỉnh sửa nội dung</>
                            ) : (
                                <><Plus size={16} className="text-emerald-500" /> Thêm nội dung mới</>
                            )}
                        </h4>
                        <Form form={blockForm} layout="vertical" onFinish={handleBlockSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item name="title" label="Tiêu đề khối" className="mb-4">
                                    <Input className="h-10 rounded-lg bg-slate-50 border-transparent hover:bg-white focus:bg-white" placeholder="VD: Video hướng dẫn" />
                                </Form.Item>
                                <Form.Item name="type" label="Loại" initialValue="Text" className="mb-4">
                                    <Select className="h-10 [&>.ant-select-selector]:!rounded-lg [&>.ant-select-selector]:!bg-slate-50 [&>.ant-select-selector]:!border-transparent">
                                        <Select.Option value="Text">Văn bản</Select.Option>
                                        <Select.Option value="Video">Video / URL</Select.Option>
                                        <Select.Option value="Image">Hình ảnh</Select.Option>
                                        <Select.Option value="Code">Mã nguồn</Select.Option>
                                    </Select>
                                </Form.Item>
                            </div>
                            <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]} className="mb-4">
                                <Input.TextArea rows={4} className="rounded-lg bg-slate-50 border-transparent hover:bg-white focus:bg-white" placeholder="Nhập văn bản, đoạn code hoặc paste URL vào đây..." />
                            </Form.Item>

                            <div className="flex gap-3 justify-end mt-2">
                                {editingBlock && (
                                    <Button
                                        type="default"
                                        onClick={() => {
                                            setEditingBlock(null);
                                            blockForm.resetFields();
                                        }}
                                        className="h-10 rounded-lg font-bold border-slate-200"
                                    >
                                        Hủy sửa
                                    </Button>
                                )}
                                <Button type="primary" htmlType="submit" loading={submitting} className="h-10 px-6 rounded-lg bg-[#0487e2] font-bold shadow-md shadow-blue-100 border-none">
                                    {editingBlock ? 'Cập nhật' : 'Thêm vào bài học'}
                                </Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </Modal>

            {/* Assignment Form Modal */}
            <Modal
                title={<span className="font-bold text-xl">{editingAssignment ? 'Cập nhật bài tập' : 'Thêm bài tập mới'}</span>}
                open={isAssignmentModalOpen}
                onCancel={() => {
                    setIsAssignmentModalOpen(false);
                    setEditingAssignment(null);
                    assignmentForm.resetFields();
                }}
                footer={null}
                centered
                className="rounded-2xl"
            >
                <Form form={assignmentForm} layout="vertical" onFinish={handleAssignmentSubmit} className="pt-4">
                    <Form.Item name="title" label="Tiêu đề bài tập" rules={[{ required: true }]}>
                        <Input className="h-11 rounded-lg bg-slate-50 border-transparent hover:bg-white focus:bg-white font-medium" />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả / Hướng dẫn thêm">
                        <Input.TextArea rows={4} className="rounded-lg bg-slate-50 border-transparent hover:bg-white focus:bg-white" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="dueDate" label="Hạn nộp bài">
                            <DatePicker showTime className="w-full h-11 rounded-lg bg-slate-50 border-transparent hover:bg-white focus:bg-white" placeholder="Chọn ngày giờ" />
                        </Form.Item>
                        <Form.Item name="maxScore" label="Điểm tối đa" initialValue={10}>
                            <InputNumber min={0} max={100} className="w-full h-11 rounded-lg bg-slate-50 border-transparent hover:bg-white focus:bg-white flex items-center" />
                        </Form.Item>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
                        <Button className="flex-1 h-11 rounded-xl font-bold text-slate-500 border-slate-200" onClick={() => {
                            setIsAssignmentModalOpen(false);
                            setEditingAssignment(null);
                        }}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={submitting} className="flex-1 h-11 rounded-xl bg-[#0487e2] font-bold border-none shadow-lg shadow-blue-100">
                            {editingAssignment ? 'Cập nhật' : 'Tạo mới'}
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Lesson Quizzes Management Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                            <CheckSquare size={20} />
                        </div>
                        <div>
                            <span className="font-bold text-xl block">Quản lý Quiz bài học</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeLessonForQuizzes?.title}</span>
                        </div>
                    </div>
                }
                open={isLessonQuizzesModalOpen}
                onCancel={() => {
                    setIsLessonQuizzesModalOpen(false);
                    setActiveLessonForQuizzes(null);
                }}
                footer={null}
                width={700}
                centered
                className="rounded-3xl overflow-hidden"
            >
                <div className="pt-6 space-y-4">
                    {(activeLessonForQuizzes?.quizzes || []).length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {(activeLessonForQuizzes.quizzes).map((quiz, idx) => (
                                <div key={quiz.id || quiz.quizId} className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between hover:border-emerald-200 hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-bold text-sm group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-slate-800 m-0">{quiz.title}</h4>
                                                <Tag color={quiz.isPublished ? "success" : "default"} className="rounded-full border-none px-2 text-[9px] font-black uppercase">
                                                    {quiz.isPublished ? "Công bố" : "Nháp"}
                                                </Tag>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                <span>⏰ {quiz.timeLimit} phút</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                <span>🎯 {quiz.passingScore}% để đạt</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                                        <Button
                                            type="primary"
                                            ghost
                                            icon={<Edit3 size={14} />}
                                            onClick={() => navigate(`/dashboard/teacher/courses/${courseId}/quizzes/${quiz.id || quiz.quizId}`)}
                                            className="rounded-xl font-bold text-xs border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                                        >
                                            Thiết kế
                                        </Button>
                                        <Button
                                            icon={<Settings size={14} />}
                                            onClick={() => openQuizModal(activeLessonForQuizzes.id, 'formative', quiz)}
                                            className="rounded-xl text-slate-400 hover:text-blue-600"
                                        />
                                        <Button
                                            danger
                                            icon={<Trash2 size={14} />}
                                            onClick={() => handleDeleteQuiz(quiz.id || quiz.quizId)}
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-200 mb-3 shadow-inner">
                                <CheckSquare size={24} />
                            </div>
                            <p className="text-slate-400 font-bold text-sm tracking-tight">Chưa có bài Quiz nào cho bài học này</p>
                            <Button
                                type="primary"
                                icon={<Plus size={16} />}
                                onClick={() => openQuizModal(activeLessonForQuizzes.id, 'formative')}
                                className="mt-4 rounded-xl bg-emerald-600 border-none px-6 font-bold h-10 shadow-lg shadow-emerald-100"
                            >
                                Tạo Quiz đầu tiên
                            </Button>
                        </div>
                    )}

                    {(activeLessonForQuizzes?.quizzes || []).length > 0 && (
                        <div className="pt-4 flex justify-center">
                            <Button
                                type="dashed"
                                icon={<Plus size={16} />}
                                onClick={() => openQuizModal(activeLessonForQuizzes.id, 'formative')}
                                className="rounded-xl h-12 px-8 font-bold text-slate-500 border-slate-200 hover:text-emerald-600 hover:border-emerald-300 transition-all"
                            >
                                Thêm Quiz mới vào bài học
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>
            <Modal
                title={
                    <span className="font-bold text-xl">
                        {editingQuiz ? 'Chỉnh sửa Quiz' : (quizMode === 'formative' ? 'Tạo Quiz bài học (Tiến trình)' : 'Tạo Quiz cuối khóa (Tổng kết)')}
                    </span>
                }
                open={isQuizModalOpen}
                onCancel={() => {
                    setIsQuizModalOpen(false);
                    setEditingQuiz(null);
                }}
                footer={null}
                centered
                width={650}
                className="rounded-2xl"
            >
                <Form form={quizForm} layout="vertical" onFinish={handleQuizSubmit} className="pt-4" initialValues={{ isPublished: true, isRequired: true, showAnswers: true, shuffleQuestions: true, maxAttempts: 1 }}>
                    <Form.Item name="title" label="Tiêu đề Quiz" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}>
                        <Input className="h-11 rounded-lg bg-slate-50 border-transparent hover:bg-white focus:bg-white font-medium shadow-none" placeholder="VD: Kiểm tra kiến thức chương 1" />
                    </Form.Item>

                    <Form.Item name="description" label="Hướng dẫn làm bài">
                        <Input.TextArea rows={3} className="rounded-lg bg-slate-50 border-transparent hover:bg-white focus:bg-white shadow-none" placeholder="Hãy chọn đáp án đúng nhất..." />
                    </Form.Item>

                    <div className="grid grid-cols-3 gap-4">
                        <Form.Item name="timeLimit" label="Thời gian (phút)">
                            <Input className="h-11 rounded-lg bg-slate-50 border-transparent shadow-none" type="number" placeholder="30" />
                        </Form.Item>
                        <Form.Item name="passingScore" label="Điểm đạt (%)">
                            <Input className="h-11 rounded-lg bg-slate-50 border-transparent shadow-none" type="number" placeholder="50" />
                        </Form.Item>
                        <Form.Item name="maxAttempts" label="Số lần làm tối đa">
                            <Input className="h-11 rounded-lg bg-slate-50 border-transparent shadow-none" type="number" placeholder="1" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-2 pb-4">
                        <Form.Item name="isRequired" label="Bắt buộc hoàn thành" valuePropName="checked" className="mb-0">
                            <Switch />
                        </Form.Item>
                        <Form.Item name="isPublished" label="Công bố ngay" valuePropName="checked" className="mb-0">
                            <Switch />
                        </Form.Item>
                        <Form.Item name="shuffleQuestions" label="Ngẫu nhiên câu hỏi" valuePropName="checked" className="mb-0">
                            <Switch />
                        </Form.Item>
                        <Form.Item name="showAnswers" label="Xem đáp án sau khi làm" valuePropName="checked" className="mb-0">
                            <Switch />
                        </Form.Item>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-slate-100 mt-4">
                        <Button className="flex-1 h-11 rounded-xl font-bold text-slate-500 border-slate-200" onClick={() => {
                            setIsQuizModalOpen(false);
                            setEditingQuiz(null);
                        }}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={submitting} className={`flex-1 h-11 rounded-xl font-bold border-none shadow-lg ${editingQuiz ? 'bg-blue-600 shadow-blue-100' : 'bg-emerald-600 shadow-emerald-100'}`}>
                            {editingQuiz ? 'Lưu thay đổi' : 'Tạo Quiz'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

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
    editLessonForm,
    openBlocksModal,
    openQuizModal,
    handleDeleteQuiz,
    courseId,
    navigate,
    openLessonQuizzesModal
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
                            <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {(() => {
                                    const totalMinutes = (session.lessons || []).reduce((acc, curr) => acc + (Number(curr.duration || curr.Duration) || 0), 0);
                                    if (totalMinutes > 0) return `${totalMinutes} phút`;
                                    return session.duration || session.Duration || '0 phút';
                                })()}
                            </span>
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
                                handleDeleteSection(session);
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
                                <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => navigate(`/dashboard/teacher/courses/${courseId}/lessons/${lesson.id}`)}>
                                    <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${(lesson.type || lesson.Type) === 'Video' ? 'bg-blue-50 text-[#0487e2]' : 'bg-slate-50 text-slate-500'}`}>
                                        {(lesson.type || lesson.Type) === 'Video' ? <Video size={18} /> : ((lesson.type || lesson.Type) === 'Quiz' ? <CheckSquare size={18} /> : <FileText size={18} />)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-700 text-sm group-hover/lesson:text-[#0487e2] transition-colors tracking-tight">
                                            {lesson.title || lesson.Title || lesson.Name || lesson.name || 'Bài học rỗng'}
                                        </div>
                                        <div className="text-[11px] text-slate-400 font-bold mt-0.5 flex items-center gap-2">
                                            {lesson.type || lesson.Type || 'Nội dung'}
                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                            {lesson.duration || lesson.Duration ? `${lesson.duration || lesson.Duration} phút` : '0 phút'}
                                            {lesson.quizzes && lesson.quizzes.length > 0 && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <span className="text-emerald-600 flex items-center gap-1 font-bold">
                                                        <CheckSquare size={10} /> {lesson.quizzes.length} Quiz
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-50 group-hover/lesson:opacity-100 transition-opacity">
                                    {(lesson.quizzes || []).length > 0 ? (
                                        <Dropdown
                                            trigger={['click']}
                                            menu={{
                                                className: "rounded-xl shadow-xl border border-slate-100 p-1.5 min-w-[180px]",
                                                items: [
                                                    {
                                                        key: 'manage-all',
                                                        onClick: () => openLessonQuizzesModal(lesson),
                                                        label: (
                                                            <div className="flex items-center gap-2 font-bold text-emerald-600 text-[11px] uppercase tracking-tight">
                                                                <LayoutGrid size={14} />
                                                                Quản lý nâng cao ({lesson.quizzes.length})
                                                            </div>
                                                        ),
                                                        className: "rounded-lg mb-1 bg-emerald-50/50 h-10 border border-emerald-100/50"
                                                    },
                                                    { type: 'divider' },
                                                    ...lesson.quizzes.map((quiz, qIdx) => ({
                                                        key: `quiz-group-${quiz.id || quiz.quizId}`,
                                                        label: (
                                                            <div className="flex flex-col py-0.5">
                                                                <div className="font-bold text-slate-800 text-xs truncate max-w-[150px]">{quiz.title}</div>
                                                                <div className="text-[9px] text-slate-400 flex items-center gap-1.5 mt-0.5 font-bold">
                                                                    <span className={quiz.isPublished ? "text-emerald-500" : "text-amber-500 uppercase"}>
                                                                        {quiz.isPublished ? "Đang hoạt động" : "Bản nháp"}
                                                                    </span>
                                                                    <span className="w-0.5 h-0.5 rounded-full bg-slate-200" />
                                                                    <span>Cấu hình <ChevronRight size={8} /></span>
                                                                </div>
                                                            </div>
                                                        ),
                                                        children: [
                                                            {
                                                                key: `${quiz.id || quiz.quizId}-edit-questions`,
                                                                onClick: () => navigate(`/dashboard/teacher/courses/${courseId}/quizzes/${quiz.id || quiz.quizId}`),
                                                                label: 'Thiết kế câu hỏi',
                                                                icon: <CheckSquare size={14} className="text-[#0463ca]" />,
                                                                className: "rounded-lg"
                                                            },
                                                            {
                                                                key: `${quiz.id || quiz.quizId}-edit-settings`,
                                                                onClick: () => openQuizModal(lesson.id, 'formative', quiz),
                                                                label: 'Cài đặt Quiz',
                                                                icon: <Settings size={14} className="text-slate-500" />,
                                                                className: "rounded-lg"
                                                            },
                                                            {
                                                                key: `${quiz.id || quiz.quizId}-delete`,
                                                                danger: true,
                                                                onClick: () => handleDeleteQuiz(quiz.id || quiz.quizId),
                                                                label: 'Xóa bài Quiz',
                                                                icon: <Trash2 size={14} />,
                                                                className: "rounded-lg"
                                                            },
                                                        ]
                                                    })),
                                                    { type: 'divider' },
                                                    {
                                                        key: 'add-new-quiz',
                                                        onClick: () => openQuizModal(lesson.id, 'formative'),
                                                        label: (
                                                            <div className="flex items-center gap-2 font-bold text-[#0487e2] text-xs">
                                                                <Plus size={14} />
                                                                Thêm Quiz mới
                                                            </div>
                                                        ),
                                                        className: "rounded-lg h-9 bg-blue-50/50"
                                                    }
                                                ]
                                            }}
                                        >
                                            <span onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    className="p-2 text-[#0463ca] hover:bg-white rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                                                >
                                                    <div className="relative">
                                                        <CheckSquare size={16} />
                                                        <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white font-bold">
                                                            {lesson.quizzes.length}
                                                        </span>
                                                    </div>
                                                    <ChevronDown size={12} className="opacity-50" />
                                                </button>
                                            </span>
                                        </Dropdown>
                                    ) : (
                                        <button
                                            className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-white rounded-lg transition-colors shadow-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openQuizModal(lesson.id, 'formative');
                                            }}
                                            title="Thêm Quiz bài học (Formative)"
                                        >
                                            <CheckSquare size={14} />
                                        </button>
                                    )}

                                    <button
                                        className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-white rounded-lg transition-colors shadow-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openBlocksModal(lesson);
                                        }}
                                        title="Quản lý nội dung (Blocks)"
                                    >
                                        <FileText size={14} />
                                    </button>
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
                        className="w-full py-3 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 font-bold text-sm cursor-pointer hover:border-blue-200 hover:text-[#0487e2] hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={16} />
                        Thêm bài học mới
                    </button>
                </div>
            )}
        </div>
    );
});
