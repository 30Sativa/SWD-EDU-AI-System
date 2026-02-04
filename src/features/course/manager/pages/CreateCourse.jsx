import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    BookOpen,
    Layers,
    Tag,
    Hash,
    Sparkles,
    Globe,
    BarChart,
    Clock,
    FileText,
    Image as ImageIcon,
    Zap,
    Plus,
    Trash2,
    ChevronRight,
    ChevronLeft,
    CheckCircle2
} from 'lucide-react';
import {
    Form,
    Input,
    Button,
    Select,
    InputNumber,
    message,
    Card,
    Divider,
    Space,
    Tooltip,
    Steps
} from 'antd';
import { createCourse, createSection } from '../../api/courseApi';
import { getSubjects } from '../../../subject/api/subjectApi';
import { getGradeLevels } from '../../../grade/api/gradeApi';
import { getUsers } from '../../../user/api/userApi';

const { Option } = Select;
const { TextArea } = Input;

export default function CreateCourse() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [grades, setGrades] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subjectsRes, gradesRes, teachersRes] = await Promise.all([
                    getSubjects(),
                    getGradeLevels(),
                    getUsers({ Role: 3 }) // Fetch teachers
                ]);

                const extract = (res) => res?.data?.items || res?.items || res?.data || res || [];
                setSubjects(extract(subjectsRes));
                setGrades(extract(gradesRes));
                setTeachers(extract(teachersRes));
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu phụ trợ:', error);
                message.warning('Không thể tải danh sách dữ liệu cần thiết');
            }
        };
        fetchData();
    }, []);

    const next = async () => {
        try {
            // Validate only fields in currently visible step
            if (currentStep === 0) {
                await form.validateFields(['code', 'title', 'subjectId', 'gradeLevelId', 'categoryId']);
            }
            setCurrentStep(currentStep + 1);
        } catch (error) {
            // Validation failed
            console.log('Validation failed:', error);
        }
    };

    const prev = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            // Step 1: Prepare Course Payload (100% Match with Swagger DTO)
            const allValues = form.getFieldsValue(true);
            const timestamp = Date.now().toString().slice(-4);

            const coursePayload = {
                code: ((allValues.code || values.code)?.toUpperCase() || "C") + "_" + timestamp,
                title: allValues.title || values.title,
                description: allValues.description || "",
                thumbnail: allValues.thumbnail || "",
                subjectId: allValues.subjectId,
                gradeLevelId: (allValues.gradeLevelId && allValues.gradeLevelId !== "3fa85f64-5717-4562-b3fc-2c963f66afa6") ? allValues.gradeLevelId : "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                categoryId: (allValues.categoryId && allValues.categoryId !== "3fa85f64-5717-4562-b3fc-2c963f66afa6") ? allValues.categoryId : "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                level: allValues.level || "Beginner",
                language: "vi-VN",
                price: Number(0),
                discountPrice: Number(0),
                totalLessons: Number(allValues.totalLessons || 0),
                totalDuration: Number(allValues.totalDuration || 0)
            };

            console.log('Swagger-Matched Payload:', coursePayload);
            const courseRes = await createCourse(coursePayload);
            const courseId = courseRes?.data?.id || courseRes?.id;

            if (!courseId) throw new Error('Không lấy được ID khóa học sau khi khởi tạo');

            // Step 2: Create Sections if any
            if (values.sections && values.sections.length > 0) {
                const sectionPromises = values.sections.map(section =>
                    createSection(courseId, {
                        title: section.title,
                        description: "",
                        sortOrder: Number(section.sortOrder || 0)
                    })
                );
                await Promise.all(sectionPromises);
            }

            message.success('Khởi tạo khóa học và cấu trúc đề mục thành công!');
            navigate('/dashboard/manager/courses');
        } catch (error) {
            console.error('Lỗi khi thiết lập khóa học:', error);

            // Hiển thị lỗi chi tiết
            const errors = error.response?.data?.errors;
            if (errors) {
                const errorList = Object.entries(errors).map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`);
                message.error({
                    content: (
                        <div className="text-left font-sans max-w-sm">
                            <div className="font-bold text-red-600 mb-1 border-b pb-1">Lỗi xác thực dữ liệu:</div>
                            <div className="max-h-48 overflow-y-auto pt-1">
                                {errorList.map((err, i) => <div key={i} className="text-[11px] leading-relaxed text-slate-600 mb-1">• {err}</div>)}
                            </div>
                        </div>
                    ),
                    duration: 8
                });
            } else {
                const errorMsg = error.response?.data?.message || error.response?.data?.title || error.message || 'Có lỗi xảy ra khi đồng bộ dữ liệu';
                message.error(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        {
            title: 'Thông tin chung',
            icon: <FileText size={18} />,
        },
        {
            title: 'Cấu trúc bài học',
            icon: <Layers size={18} />,
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
            <div className="max-w-5xl mx-auto">

                {/* Navigation & Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                    <div className="text-left">
                        <button
                            onClick={() => navigate('/dashboard/manager/courses')}
                            className="flex items-center gap-2 text-slate-500 hover:text-[#0487e2] transition-all mb-3 text-sm font-bold group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Quay lại danh sách
                        </button>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                            Thiết lập <span className="text-[#0487e2]">Khóa học</span>
                        </h1>
                    </div>

                    <div className="w-full md:w-96">
                        <Steps
                            current={currentStep}
                            items={steps}
                            className="custom-steps"
                            size="small"
                        />
                    </div>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    preserve={true}
                    initialValues={{
                        level: 'Beginner',
                        language: 'Vietnamese',
                        totalLessons: 0,
                        totalDuration: 0,
                        categoryId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        sections: [{ title: '', sortOrder: 0 }]
                    }}
                    className="pb-20 text-left"
                >
                    {/* STEP 1: GENERAL INFO */}
                    <div className={currentStep === 0 ? "block" : "hidden"}>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="lg:col-span-8 space-y-8">
                                <Card className="rounded-2xl border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] overflow-hidden">
                                    <div className="border-b border-slate-100 bg-slate-50/30 flex items-center gap-3 px-6 py-4">
                                        <div className="w-8 h-8 bg-blue-50 text-[#0487e2] rounded-lg flex items-center justify-center">
                                            <FileText size={18} />
                                        </div>
                                        <h2 className="text-base font-bold text-slate-800">Nội dung cốt lõi</h2>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <Form.Item
                                                label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mã định danh</span>}
                                                name="code"
                                                rules={[{ required: true, message: 'Nhập mã khóa học' }]}
                                            >
                                                <Input
                                                    prefix={<Hash size={16} className="text-slate-400 mr-1" />}
                                                    placeholder="VD: MAT-10"
                                                    className="h-11 rounded-xl font-bold uppercase"
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tiêu đề khóa học</span>}
                                                name="title"
                                                className="md:col-span-2"
                                                rules={[{ required: true, message: 'Nhập tiêu đề' }]}
                                            >
                                                <Input
                                                    placeholder="Ví dụ: Đại số học nâng cao lớp 10"
                                                    className="h-11 rounded-xl font-bold"
                                                />
                                            </Form.Item>
                                        </div>

                                        <Form.Item
                                            label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mô tả tổng quan</span>}
                                            name="description"
                                        >
                                            <TextArea
                                                rows={4}
                                                placeholder="Mô tả mục tiêu và lộ trình..."
                                                className="rounded-xl p-4 resize-none shadow-none"
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Thumbnail URL</span>}
                                            name="thumbnail"
                                        >
                                            <Input
                                                prefix={<ImageIcon size={16} className="text-slate-400 mr-1" />}
                                                placeholder="Link ảnh đại diện..."
                                                className="h-11 rounded-xl"
                                            />
                                        </Form.Item>
                                    </div>
                                </Card>
                            </div>

                            <div className="lg:col-span-4 space-y-8">
                                <Card className="rounded-2xl border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] overflow-hidden">
                                    <div className="border-b border-slate-100 bg-slate-50/30 flex items-center gap-3 px-6 py-4">
                                        <div className="w-8 h-8 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center">
                                            <Tag size={18} />
                                        </div>
                                        <h2 className="text-base font-bold text-slate-800">Phân loại</h2>
                                    </div>
                                    <div className="p-6 space-y-5">
                                        <Form.Item label={<span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Môn học</span>} name="subjectId" rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}>
                                            <Select placeholder="Chọn môn" className="h-11 custom-selector-v4">
                                                {subjects.map(s => <Option key={s.id} value={s.id}>{s.name || s.title}</Option>)}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item label={<span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Giáo viên phụ trách</span>} name="teacherId" rules={[{ required: true, message: 'Vui lòng chọn giáo viên' }]}>
                                            <Select placeholder="Chọn giáo viên" className="h-11 custom-selector-v4" showSearch filterOption={(input, option) => (option?.children || '').toLowerCase().includes(input.toLowerCase())}>
                                                {teachers.map(t => <Option key={t.id} value={t.id}>{t.userName || t.fullName || t.email}</Option>)}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item label={<span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Khối lớp</span>} name="gradeLevelId" rules={[{ required: true }]}>
                                            <Select placeholder="Chọn khối" className="h-11 custom-selector-v4">
                                                {grades.map(g => <Option key={g.id} value={g.id}>{g.name}</Option>)}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item label={<span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Cấp độ</span>} name="level">
                                            <Select className="h-11 custom-selector-v4">
                                                <Option value="Beginner">Cơ bản</Option>
                                                <Option value="Intermediate">Trung bình</Option>
                                                <Option value="Advanced">Nâng cao</Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item label={<span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Ngôn ngữ</span>} name="language">
                                            <Select className="h-11 custom-selector-v4">
                                                <Option value="Vietnamese">Tiếng Việt</Option>
                                                <Option value="English">Tiếng Anh</Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item label={<span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Danh mục</span>} name="categoryId" rules={[{ required: true }]}>
                                            <Select className="h-11 custom-selector-v4">
                                                <Option value="3fa85f64-5717-4562-b3fc-2c963f66afa6">Mặc định</Option>
                                            </Select>
                                        </Form.Item>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* STEP 2: SECTIONS STRUCTURE */}
                    <div className={currentStep === 1 ? "block" : "hidden"}>
                        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <Card className="rounded-2xl border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] overflow-hidden">
                                <div className="border-b border-slate-100 bg-slate-50/30 flex items-center justify-between px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                                            <Layers size={18} />
                                        </div>
                                        <h2 className="text-base font-bold text-slate-800">Cấu trúc đề mục (Sections)</h2>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <Form.List name="sections">
                                        {(fields, { add, remove }) => (
                                            <div className="space-y-4">
                                                {fields.map(({ key, name, ...restField }) => (
                                                    <div key={key} className="flex items-end gap-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 group transition-all hover:border-blue-200">
                                                        <div className="flex-1">
                                                            <Form.Item {...restField} name={[name, 'title']} label={<span className="text-[10px] font-black uppercase text-slate-400">Tên chương/đề mục #{name + 1}</span>} rules={[{ required: true, message: 'Nhập tên' }]} className="mb-0">
                                                                <Input placeholder="VD: Giới thiệu chung" className="h-11 rounded-xl" />
                                                            </Form.Item>
                                                        </div>
                                                        <div className="w-24">
                                                            <Form.Item {...restField} name={[name, 'sortOrder']} label={<span className="text-[10px] font-black uppercase text-slate-400">Thứ tự</span>} className="mb-0">
                                                                <InputNumber min={0} className="w-full h-11 rounded-xl flex items-center" />
                                                            </Form.Item>
                                                        </div>
                                                        <Button type="text" danger icon={<Trash2 size={18} />} onClick={() => remove(name)} disabled={fields.length === 1} className="h-11 w-11 flex items-center justify-center rounded-xl hover:bg-red-50" />
                                                    </div>
                                                ))}
                                                <Button type="dashed" onClick={() => add()} block icon={<Plus size={16} />} className="h-14 rounded-2xl border-dashed border-slate-300 text-slate-500 font-bold hover:text-[#0487e2] hover:border-[#0487e2] bg-white transition-all">
                                                    Thêm chương học mới
                                                </Button>
                                            </div>
                                        )}
                                    </Form.List>
                                </div>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Card className="rounded-2xl border-slate-200 shadow-sm p-6 flex flex-col items-center text-center space-y-3">
                                    <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center">
                                        <BookOpen size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-slate-800">Số lượng bài học</h3>
                                        <Form.Item name="totalLessons" className="mb-0">
                                            <InputNumber min={0} className="w-32 h-11 rounded-xl flex items-center" />
                                        </Form.Item>
                                    </div>
                                </Card>
                                <Card className="rounded-2xl border-slate-200 shadow-sm p-6 flex flex-col items-center text-center space-y-3">
                                    <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                                        <Clock size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-slate-800">Tổng thời lượng (Phút)</h3>
                                        <Form.Item name="totalDuration" className="mb-0">
                                            <InputNumber min={0} className="w-32 h-11 rounded-xl flex items-center" />
                                        </Form.Item>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* CONTROL BUTTONS */}
                    <div className="mt-12 flex justify-center gap-4">
                        {currentStep > 0 && (
                            <Button
                                onClick={prev}
                                icon={<ChevronLeft size={20} />}
                                className="h-12 px-8 rounded-xl font-bold flex items-center border-slate-200 text-slate-500 hover:text-slate-700"
                            >
                                Quay lại
                            </Button>
                        )}

                        {currentStep < steps.length - 1 ? (
                            <Button
                                type="primary"
                                onClick={next}
                                className="h-12 px-10 rounded-xl font-bold flex items-center bg-[#0487e2] hover:bg-[#0374c4] border-none shadow-lg shadow-blue-500/20"
                            >
                                Tiếp tục
                                <ChevronRight size={20} className="ml-2" />
                            </Button>
                        ) : (
                            <Button
                                type="primary"
                                onClick={() => form.submit()}
                                loading={loading}
                                icon={<CheckCircle2 size={20} />}
                                className="h-12 px-10 rounded-xl font-bold flex items-center bg-emerald-500 hover:bg-emerald-600 border-none shadow-lg shadow-emerald-500/20"
                            >
                                Hoàn tất & Khởi tạo
                            </Button>
                        )}
                    </div>
                </Form>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-steps .ant-steps-item-title {
          font-weight: 800 !important;
          color: #94a3b8 !important;
          font-size: 13px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        .custom-steps .ant-steps-item-active .ant-steps-item-title {
          color: #0487e2 !important;
        }
        .custom-steps .ant-steps-item-icon {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-width: 2px !important;
        }
        .custom-selector-v4 .ant-select-selector {
          height: 44px !important;
          border-radius: 12px !important;
          border: 1px solid #e1e8f0 !important;
          font-weight: 600 !important;
          display: flex !important;
          align-items: center !important;
        }
        .ant-input-number {
           border: 1px solid #e1e8f0 !important;
        }
        .ant-form-item-label label {
          margin-bottom: 2px !important;
        }
      `}} />
        </div>
    );
}
