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

const { Option } = Select;
const { TextArea } = Input;

export default function CreateCourse() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [grades, setGrades] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subjectsRes, gradesRes] = await Promise.all([
                    getSubjects(),
                    getGradeLevels()
                ]);

                const extract = (res) => res?.data?.items || res?.items || res?.data || res || [];
                setSubjects(extract(subjectsRes));
                setGrades(extract(gradesRes));
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu phụ trợ:', error);
                message.warning('Không thể tải danh sách dữ liệu cần thiết');
            }
        };
        fetchData();
    }, []);

    const next = async () => {
        try {
            if (currentStep === 0) {
                await form.validateFields(['code', 'title', 'subjectId', 'gradeLevelId', 'categoryId']);
            }
            setCurrentStep(currentStep + 1);
        } catch (error) {
            console.log('Validation failed:', error);
        }
    };

    const prev = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            // Step 1: Prepare Course Payload
            const allValues = form.getFieldsValue(true);
            const timestamp = Date.now().toString().slice(-4);

            const coursePayload = {
                code: ((allValues.code || values.code)?.toUpperCase() || "C") + "_" + timestamp,
                title: allValues.title || values.title,
                description: allValues.description || "",
                thumbnail: allValues.thumbnail || "",
                subjectId: allValues.subjectId,
                gradeLevelId: (allValues.gradeLevelId && allValues.gradeLevelId !== "3fa85f64-5717-4562-b3fc-2c963f66afa6") ? allValues.gradeLevelId : null,
                categoryId: (allValues.categoryId && allValues.categoryId !== "3fa85f64-5717-4562-b3fc-2c963f66afa6") ? allValues.categoryId : null,
                level: allValues.level || "Beginner",
                language: "vi-VN",
                price: 0,
                discountPrice: 0,
                totallessons: Number(allValues.totalLessons || 0),
                totalDuration: Number(allValues.totalDuration || 0)
            };

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

            message.success('Khởi tạo khóa học thành công!');
            navigate('/dashboard/teacher/courses');
        } catch (error) {
            console.error('Lỗi khi thiết lập khóa học:', error);
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
                message.error(error.response?.data?.message || 'Có lỗi xảy ra');
            }
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { title: 'Thông tin chung', icon: <FileText size={18} /> },
        { title: 'Cấu trúc bài học', icon: <Layers size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 text-left">
                    <div>
                        <button onClick={() => navigate('/dashboard/teacher/courses')} className="flex items-center gap-2 text-slate-500 hover:text-[#0487e2] transition-all mb-3 text-sm font-bold group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Quay lại danh sách
                        </button>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                            Tạo <span className="text-[#0487e2]">Khóa học mới</span>
                        </h1>
                    </div>
                    <div className="w-full md:w-96">
                        <Steps current={currentStep} items={steps} className="custom-steps" size="small" />
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
                    <div className={currentStep === 0 ? "block" : "hidden"}>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 space-y-8">
                                <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                                    <div className="border-b border-slate-100 bg-slate-50/30 px-6 py-4 flex items-center gap-2">
                                        <FileText size={18} className="text-[#0487e2]" />
                                        <span className="font-bold">Nội dung cốt lõi</span>
                                    </div>
                                    <div className="p-6 space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <Form.Item name="code" label={<span className="text-xs font-bold text-slate-500 uppercase">Mã khóa học</span>} rules={[{ required: true }]}>
                                                <Input prefix={<Hash size={16} />} placeholder="VD: ENG-101" className="h-11 rounded-xl uppercase font-bold" />
                                            </Form.Item>
                                            <Form.Item name="title" label={<span className="text-xs font-bold text-slate-500 uppercase">Tiêu đề</span>} className="md:col-span-2" rules={[{ required: true }]}>
                                                <Input placeholder="Tên khóa học" className="h-11 rounded-xl font-bold" />
                                            </Form.Item>
                                        </div>
                                        <Form.Item name="description" label={<span className="text-xs font-bold text-slate-500 uppercase">Mô tả</span>}>
                                            <TextArea rows={4} className="rounded-xl p-4 resize-none" />
                                        </Form.Item>
                                        <Form.Item name="thumbnail" label={<span className="text-xs font-bold text-slate-500 uppercase">Thumbnail URL</span>}>
                                            <Input prefix={<ImageIcon size={16} />} className="h-11 rounded-xl" />
                                        </Form.Item>
                                    </div>
                                </Card>
                            </div>

                            <div className="lg:col-span-4 space-y-8">
                                <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                                    <div className="border-b border-slate-100 bg-slate-50/30 px-6 py-4 flex items-center gap-2">
                                        <Tag size={18} className="text-indigo-500" />
                                        <span className="font-bold">Phân loại</span>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <Form.Item name="subjectId" label={<span className="text-xs font-bold text-slate-500 uppercase">Môn học</span>} rules={[{ required: true }]}>
                                            <Select placeholder="Chọn môn" className="h-11 custom-selector-v4">
                                                {subjects.map(s => <Option key={s.id} value={s.id}>{s.name || s.title}</Option>)}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item name="gradeLevelId" label={<span className="text-xs font-bold text-slate-500 uppercase">Khối lớp</span>} rules={[{ required: true }]}>
                                            <Select placeholder="Chọn khối" className="h-11 custom-selector-v4">
                                                {grades.map(g => <Option key={g.id} value={g.id}>{g.name}</Option>)}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item name="level" label={<span className="text-xs font-bold text-slate-500 uppercase">Cấp độ</span>}>
                                            <Select className="h-11 custom-selector-v4">
                                                <Option value="Beginner">Cơ bản</Option>
                                                <Option value="Intermediate">Trung bình</Option>
                                                <Option value="Advanced">Nâng cao</Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item name="categoryId" label={<span className="text-xs font-bold text-slate-500 uppercase">Danh mục</span>}>
                                            <Select className="h-11 custom-selector-v4">
                                                <Option value="3fa85f64-5717-4562-b3fc-2c963f66afa6">Mặc định</Option>
                                            </Select>
                                        </Form.Item>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>

                    <div className={currentStep === 1 ? "block" : "hidden"}>
                        <div className="max-w-4xl mx-auto space-y-8">
                            <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                                <div className="border-b border-slate-100 bg-slate-50/30 px-6 py-4 font-bold">Cấu trúc đề mục</div>
                                <div className="p-6">
                                    <Form.List name="sections">
                                        {(fields, { add, remove }) => (
                                            <div className="space-y-4">
                                                {fields.map(({ key, name, ...restField }) => (
                                                    <div key={key} className="flex items-end gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                        <div className="flex-1">
                                                            <Form.Item {...restField} name={[name, 'title']} rules={[{ required: true }]} className="mb-0">
                                                                <Input placeholder="Tên chương" className="h-11 rounded-lg" />
                                                            </Form.Item>
                                                        </div>
                                                        <Button danger icon={<Trash2 size={18} />} onClick={() => remove(name)} className="h-11 rounded-lg" />
                                                    </div>
                                                ))}
                                                <Button type="dashed" onClick={() => add()} block icon={<Plus size={16} />} className="h-12 rounded-xl">Thêm chương mới</Button>
                                            </div>
                                        )}
                                    </Form.List>
                                </div>
                            </Card>
                        </div>
                    </div>

                    <div className="mt-12 flex justify-center gap-4">
                        {currentStep > 0 && <Button onClick={prev} className="h-12 px-8 rounded-xl font-bold">Quay lại</Button>}
                        {currentStep < steps.length - 1 ? (
                            <Button type="primary" onClick={next} className="h-12 px-10 rounded-xl font-bold bg-[#0487e2]">Tiếp tục</Button>
                        ) : (
                            <Button type="primary" onClick={() => form.submit()} loading={loading} className="h-12 px-10 rounded-xl font-bold bg-emerald-500 border-none">Hoàn tất</Button>
                        )}
                    </div>
                </Form>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-steps .ant-steps-item-title { font-weight: 800 !important; font-size: 13px !important; text-transform: uppercase !important; }
                .custom-selector-v4 .ant-select-selector { height: 44px !important; border-radius: 12px !important; display: flex !important; align-items: center !important; }
            `}} />
        </div>
    );
}
