import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Upload, Save, BookOpen, DollarSign, Layers, GraduationCap } from 'lucide-react';
import {
    Form,
    Input,
    Select,
    Button,
    InputNumber,
    message,
    Card,
    Spin,
    Upload as AntUpload
} from 'antd';
import { createCourse, getCourseById } from '../../api/courseApi';
import { getSubjects } from '../../../subject/api/subjectApi'; // Adjust path if needed
import { getGradeLevels } from '../../../grade/api/gradeApi'; // Adjust path if needed

const { TextArea } = Input;
const { Option } = Select;

export default function CreateCourse() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const templateId = searchParams.get('templateId');

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetchingTemplate, setFetchingTemplate] = useState(false);

    const [subjects, setSubjects] = useState([]);
    const [grades, setGrades] = useState([]);

    // Fetch master data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subjectsRes, gradesRes] = await Promise.all([
                    getSubjects({ PageSize: 100 }),
                    getGradeLevels({ PageSize: 100 })
                ]);

                const subjectItems = subjectsRes?.data?.items || subjectsRes?.items || [];
                const gradeItems = gradesRes?.data?.items || gradesRes?.items || [];

                setSubjects(Array.isArray(subjectItems) ? subjectItems : []);
                setGrades(Array.isArray(gradeItems) ? gradeItems : []);
            } catch (error) {
                console.error("Failed to fetch master data", error);
            }
        };
        fetchData();
    }, []);

    // Fetch Template if exists
    useEffect(() => {
        if (templateId) {
            setFetchingTemplate(true);
            getCourseById(templateId)
                .then(res => {
                    const data = res.data?.data || res.data || res;
                    form.setFieldsValue({
                        name: `Copy of ${data.name || data.title}`,
                        description: data.description,
                        subjectId: data.subjectId,
                        gradeLevelId: data.gradeLevelId,
                        price: data.price,
                        thumbnail: data.thumbnail
                    });
                })
                .catch(err => message.error("Không thể tải khóa học mẫu"))
                .finally(() => setFetchingTemplate(false));
        }
    }, [templateId, form]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // Mapping values to API Payload (PascalCase assumed based on system convention)
            const payload = {
                Name: values.name,
                Description: values.description,
                SubjectId: values.subjectId,
                GradeLevelId: values.gradeLevelId,
                Price: values.price || 0,
                Thumbnail: values.thumbnail, // Handling simplistic URL input or uploaded string
                Content: values.description // Fallback content
            };

            // Should also copy sections if it's from a template?
            // For now, simplify to creating the course shell.

            const res = await createCourse(payload);
            const newCourseId = res?.data?.id || res?.id; // Adjust based on actual response

            message.success('Tạo khóa học thành công!');

            // Navigate to detail page to add content
            if (newCourseId) {
                navigate(`/dashboard/teacher/courses/${newCourseId}`);
            } else {
                navigate('/dashboard/teacher/courses');
            }

        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || 'Tạo khóa học thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        type="text"
                        shape="circle"
                        icon={<ArrowLeft size={20} />}
                        onClick={() => navigate('/dashboard/teacher/courses')}
                        className="text-slate-500 hover:text-[#0463ca] hover:bg-white"
                    />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Tạo khóa học mới</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Thiết lập thông tin cơ bản cho khóa học của bạn</p>
                    </div>
                </div>

                <Card className="rounded-xl border border-slate-200 shadow-sm overflow-hidden" bodyStyle={{ padding: 0 }}>
                    {fetchingTemplate ? (
                        <div className="p-12 text-center text-slate-400">
                            <Spin />
                            <div className="mt-4">Đang tải thông tin mẫu...</div>
                        </div>
                    ) : (
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            className="p-8"
                            size="large"
                            initialValues={{ price: 0 }}
                        >
                            <Form.Item
                                name="name"
                                label={<span className="font-bold text-slate-600 text-xs uppercase tracking-wider">Tên khóa học</span>}
                                rules={[{ required: true, message: 'Vui lòng nhập tên khóa học' }]}
                            >
                                <Input placeholder="VD: Nhập môn Lập trình Web..." className="font-semibold text-slate-700" />
                            </Form.Item>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Form.Item
                                    name="subjectId"
                                    label={<span className="font-bold text-slate-600 text-xs uppercase tracking-wider flex items-center gap-2"><BookOpen size={14} /> Môn học</span>}
                                    rules={[{ required: true, message: 'Chọn môn học' }]}
                                >
                                    <Select placeholder="Chọn môn học" showSearch optionFilterProp="children">
                                        {subjects.map(s => (
                                            <Option key={s.id} value={s.id}>{s.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name="gradeLevelId"
                                    label={<span className="font-bold text-slate-600 text-xs uppercase tracking-wider flex items-center gap-2"><GraduationCap size={14} /> Khối lớp</span>}
                                    rules={[{ required: true, message: 'Chọn khối lớp' }]}
                                >
                                    <Select placeholder="Chọn khối lớp">
                                        {grades.map(g => (
                                            <Option key={g.id} value={g.id}>{g.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </div>

                            <Form.Item
                                name="description"
                                label={<span className="font-bold text-slate-600 text-xs uppercase tracking-wider">Mô tả giới thiệu</span>}
                                rules={[{ required: true, message: 'Hãy viết mô tả ngắn gọn' }]}
                            >
                                <TextArea rows={4} placeholder="Mô tả nội dung và mục tiêu khóa học..." />
                            </Form.Item>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Form.Item
                                    name="price"
                                    label={<span className="font-bold text-slate-600 text-xs uppercase tracking-wider flex items-center gap-2"><DollarSign size={14} /> Học phí (VNĐ)</span>}
                                >
                                    <InputNumber
                                        className="w-full"
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                        min={0}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="thumbnail"
                                    label={<span className="font-bold text-slate-600 text-xs uppercase tracking-wider text-slate-400">Ảnh bìa (URL)</span>}
                                    extra="Tính năng upload ảnh sẽ cập nhật sau. Vui lòng dán link ảnh."
                                >
                                    <Input prefix={<Upload size={16} className="text-slate-300" />} placeholder="https://example.com/image.jpg" />
                                </Form.Item>
                            </div>

                            <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-6">
                                <Button
                                    size="large"
                                    onClick={() => navigate('/dashboard/teacher/courses')}
                                    className="rounded-lg font-semibold text-slate-500 border-slate-200"
                                >
                                    Hủy bỏ
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    loading={loading}
                                    className="bg-[#0487e2] font-bold rounded-lg border-none shadow-md px-8 flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    Tạo và tiếp tục
                                </Button>
                            </div>

                        </Form>
                    )}
                </Card>
            </div>
        </div>
    );
}
