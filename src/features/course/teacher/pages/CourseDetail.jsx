import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    BookOpen,
    Users,
    Clock,
    Edit3,
    MoreVertical,
    Plus,
    FileText,
    Video,
    Trash2,
    Save,
    Settings,
    Layout,
    CheckCircle
} from 'lucide-react';
import {
    Tabs,
    Button,
    Spin,
    message,
    Tag,
    Collapse,
    Empty,
    Modal,
    Form,
    Input,
    Tooltip,
    Dropdown
} from 'antd';
import { getCourseById, createSection, publishCourse, deleteCourse } from '../../api/courseApi';
// Import shared components if needed

const { Panel } = Collapse;

export default function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('curriculum');

    // Action States
    const [isCreatingSection, setIsCreatingSection] = useState(false);
    const [sectionForm] = Form.useForm();

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const res = await getCourseById(id);
            const data = res?.data?.data || res?.data || res;
            setCourse(data);
        } catch (error) {
            console.error("Failed to load course", error);
            message.error("Không thể tải thông tin khóa học");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchCourse();
    }, [id]);

    const handleCreateSection = async (values) => {
        try {
            await createSection(id, {
                Name: values.name,
                Description: values.description || '',
                CourseId: id
            });
            message.success("Thêm chương thành công");
            setIsCreatingSection(false);
            sectionForm.resetFields();
            fetchCourse(); // Refresh data
        } catch (error) {
            message.error("Lỗi khi thêm chương: " + (error?.response?.data?.message || "Lỗi hệ thống"));
        }
    };

    const handlePublish = async () => {
        try {
            await publishCourse(id);
            message.success("Đã xuất bản khóa học");
            fetchCourse();
        } catch (error) {
            message.error("Lỗi xuất bản");
        }
    };

    const handleDelete = async () => {
        Modal.confirm({
            title: "Xóa khóa học?",
            content: "Hành động này không thể hoàn tác.",
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteCourse(id);
                    message.success("Đã xóa khóa học");
                    navigate('/dashboard/teacher/courses');
                } catch (error) {
                    message.error("Không thể xóa");
                }
            }
        });
    };

    const OverviewTab = () => (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2 space-y-4">
                    <div>
                        <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">Mô tả khóa học</h3>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{course.description || "Chưa có mô tả."}</p>
                    </div>
                </div>
                <div className="col-span-1 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-3">Thông tin chung</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500">Môn học</span>
                                <span className="font-semibold text-slate-800">{course.subject?.name || "---"}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500">Khối lớp</span>
                                <span className="font-semibold text-slate-800">{course.gradeLevel?.name || "---"}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500">Học phí</span>
                                <span className="font-semibold text-emerald-600">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const CurriculumTab = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-700">Nội dung học tập</h3>
                <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    onClick={() => setIsCreatingSection(true)}
                    className="bg-[#0487e2] font-semibold rounded-lg"
                >
                    Thêm chương mới
                </Button>
            </div>

            {(!course.sections || course.sections.length === 0) ? (
                <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-200">
                    <Empty description="Chưa có nội dung nào" />
                    <Button type="dashed" className="mt-4" onClick={() => setIsCreatingSection(true)}>Tạo chương đầu tiên</Button>
                </div>
            ) : (
                <Collapse
                    defaultActiveKey={course.sections.map(s => s.id)}
                    ghost
                    className="site-collapse-custom-collapse"
                >
                    {course.sections.map((section, index) => (
                        <Panel
                            key={section.id}
                            header={
                                <div className="flex justify-between items-center w-full pr-4 py-1">
                                    <div className="font-bold text-slate-700 text-base">
                                        <span className="text-slate-400 mr-2 uppercase text-xs">Chương {index + 1}:</span>
                                        {section.name}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Tag color="blue">{section.lessons?.length || 0} bài học</Tag>
                                        <Button size="small" type="text" icon={<Edit3 size={14} />} onClick={(e) => e.stopPropagation()} />
                                        <Button size="small" type="text" danger icon={<Trash2 size={14} />} onClick={(e) => e.stopPropagation()} />
                                    </div>
                                </div>
                            }
                            className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4 overflow-hidden"
                        >
                            <div className="pl-4 pr-2 space-y-2">
                                {section.lessons && section.lessons.length > 0 ? section.lessons.map((lesson, lIndex) => (
                                    <div key={lesson.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg group transition-colors border border-transparent hover:border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-blue-50 text-[#0487e2] flex items-center justify-center">
                                                {lesson.type === 'Video' ? <Video size={16} /> : <FileText size={16} />}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-700 text-sm">{lIndex + 1}. {lesson.name}</div>
                                                <div className="text-xs text-slate-400">{lesson.duration ? `${lesson.duration} phút` : 'Tài liệu'}</div>
                                            </div>
                                        </div>
                                        <Button size="small" className="opacity-0 group-hover:opacity-100">Sửa</Button>
                                    </div>
                                )) : (
                                    <div className="text-center py-4 text-slate-400 text-sm italic">
                                        Chưa có bài học nào trong chương này.
                                        <br />
                                        <Button type="link" size="small">Thêm bài học</Button>
                                    </div>
                                )}
                            </div>
                        </Panel>
                    ))}
                </Collapse>
            )}
        </div>
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Spin size="large" />
        </div>
    );

    if (!course) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <Empty description="Không tìm thấy khóa học" />
            <Button onClick={() => navigate('/dashboard/teacher/courses')} className="mt-4">Quay lại</Button>
        </div>
    );

    const items = [
        { key: 'overview', label: 'Tổng quan', children: <OverviewTab />, icon: <Layout size={18} /> },
        { key: 'curriculum', label: 'Đề cương', children: <CurriculumTab />, icon: <BookOpen size={18} /> },
        {
            key: 'settings', label: 'Cài đặt', children: <div className="p-8 bg-white rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4">Khu vực nguy hiểm</h3>
                <Button danger onClick={handleDelete}>Xóa khóa học này</Button>
            </div>, icon: <Settings size={18} />
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<ArrowLeft size={20} />}
                            onClick={() => navigate('/dashboard/teacher/courses')}
                            className="text-slate-500 hover:text-[#0463ca] hover:bg-white"
                        />
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">{course.title || course.name}</h1>
                                <Tag color={course.isActive ? "success" : "default"} className="font-bold rounded-md border-0">{course.isActive ? "ĐANG HOẠT ĐỘNG" : "BẢN NHÁP"}</Tag>
                            </div>
                            <p className="text-slate-500 text-sm mt-1 font-medium flex items-center gap-4">
                                <span className="flex items-center gap-1"><Users size={14} /> {course.enrollmentCount || 0} học viên</span>
                                <span className="flex items-center gap-1"><Clock size={14} /> {Math.floor((course.totalDuration || 0) / 60)}h {(course.totalDuration || 0) % 60}m</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {!course.isActive && <Button type="default" onClick={handlePublish} icon={<CheckCircle size={16} className="text-emerald-500" />}>Xuất bản</Button>}
                        <Button type="primary" className="bg-[#0487e2] font-semibold border-none shadow-md">Xem trước</Button>
                    </div>
                </div>

                {/* Main Tabs */}
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={items}
                    type="card"
                    className="custom-tabs"
                />
            </div>

            {/* Create Section Modal */}
            <Modal
                title="Thêm chương mới"
                open={isCreatingSection}
                onCancel={() => setIsCreatingSection(false)}
                footer={null}
            >
                <Form form={sectionForm} onFinish={handleCreateSection} layout="vertical">
                    <Form.Item name="name" label="Tên chương" rules={[{ required: true }]}>
                        <Input placeholder="Ví dụ: Chương 1 - Giới thiệu" />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea placeholder="Mô tả ngắn về nội dung chương này" />
                    </Form.Item>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={() => setIsCreatingSection(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit" className="bg-[#0487e2]">Tạo chương</Button>
                    </div>
                </Form>
            </Modal>

            <style>{`
                .custom-tabs .ant-tabs-nav::before { border-bottom: none; }
                .custom-tabs .ant-tabs-tab { 
                    border: none !important; 
                    background: transparent !important; 
                    font-weight: 600; 
                    color: #64748b;
                    font-size: 14px;
                }
                .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { 
                    color: #0463ca !important; 
                }
                .custom-tabs .ant-tabs-ink-bar { 
                    background: #0463ca !important; 
                    height: 3px !important;
                    border-radius: 3px 3px 0 0;
                }
            `}</style>
        </div>
    );
}
