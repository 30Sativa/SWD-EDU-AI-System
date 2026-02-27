import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Plus, Trash2, CheckCircle2, FileText } from 'lucide-react';
import { Form, Input, Button, Select, InputNumber, message, Card, Steps, Upload } from 'antd';
import { createCourseTemplate, scanCourseTemplate, saveCourseStructure } from '../../api/courseApi';
import { getSubjects } from '../../../subject/api/subjectApi';
import { getGradeLevels } from '../../../grade/api/gradeApi';
import { getCourseCategories } from '../../../category/api/categoryApi';

const { Option } = Select;
const { TextArea } = Input;

export default function CreateTemplate() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Dependencies data
    const [subjects, setSubjects] = useState([]);
    const [grades, setGrades] = useState([]);
    const [categories, setCategories] = useState([]);

    // Flow State
    const [currentStep, setCurrentStep] = useState(0);
    const [createdCourseId, setCreatedCourseId] = useState(null);
    const [createdTemplateInfo, setCreatedTemplateInfo] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [scannedSections, setScannedSections] = useState([]);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subjectsRes, gradesRes, categoriesRes] = await Promise.all([
                    getSubjects(),
                    getGradeLevels(),
                    getCourseCategories({ pageSize: 100 })
                ]);
                const extract = (res) => res?.data?.items || res?.items || res?.data || res || [];
                setSubjects(extract(subjectsRes));
                setGrades(extract(gradesRes));
                setCategories(extract(categoriesRes));
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu phụ trợ:', error);
                message.warning('Không thể tải một số danh sách dữ liệu.');
            }
        };
        fetchData();
    }, []);

    const getCurrentUserId = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                return user.id;
            }
        } catch (e) { console.error(e); }
        // Fallback user ID for testing if needed
        return "76d2bcfd-87e9-4d21-aff2-a3b933517b02";
    };

    const handleCreateTemplate = async (values) => {
        try {
            setLoading(true);
            const payload = {
                code: values.code || "TMPL_" + Date.now().toString().slice(-4),
                title: values.title,
                subjectId: values.subjectId,
                gradeLevelId: values.gradeLevelId,
                categoryId: values.categoryId,
                description: values.description || "",
                thumbnail: values.thumbnail || "",
                createdByUserId: getCurrentUserId(),
                level: Number(values.level) // Ensure it's number
            };

            const res = await createCourseTemplate(payload);
            console.log('Response from createCourseTemplate:', res);

            // Comprehensive ID extraction
            const courseId = res?.id || res?.Id || res?.data?.id || res?.data?.Id ||
                res?.courseId || res?.CourseId ||
                (typeof res?.data === 'string' ? res.data : null);

            if (courseId) {
                const subjectName = subjects.find(s => s.id === values.subjectId)?.name || '';
                const gradeName = grades.find(g => g.id === values.gradeLevelId)?.name || '';
                const categoryName = categories.find(c => c.id === values.categoryId)?.name || '';
                const levels = { 1: '1 - Cơ bản (Beginner)', 2: '2 - Trung bình (Intermediate)', 3: '3 - Nâng cao (Advanced)' };

                setCreatedTemplateInfo({
                    ...payload,
                    subjectName,
                    gradeName,
                    categoryName,
                    levelName: levels[payload.level] || payload.level
                });

                setCreatedCourseId(courseId);
                message.success('Tạo Template Khóa học cơ bản thành công!');
                setCurrentStep(1); // Move to AI Scan
            } else {
                message.error('Không thể lấy ID của Khóa học vừa tạo');
            }
        } catch (error) {
            console.error('Lỗi tạo template:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo template');
        } finally {
            setLoading(false);
        }
    };

    const handleAIScan = async () => {
        if (!fileList.length) {
            message.warning('Vui lòng chọn file đề cương để chẩn đoán');
            return;
        }

        try {
            setLoading(true);
            console.log('Starting AI Scan for Course ID:', createdCourseId);
            console.log('File to upload:', fileList[0]);

            const formData = new FormData();
            // Using 'File' (capitalized) as it's common for .NET IFormFile
            formData.append('File', fileList[0].originFileObj);

            const res = await scanCourseTemplate(createdCourseId, formData);
            console.log('AI Scan Response:', res);

            // Comprehensive sections extraction
            const sections = res?.data?.sections || res?.sections ||
                res?.data?.Items || res?.Items ||
                (Array.isArray(res?.data) ? res.data : []);

            if (sections.length > 0) {
                setScannedSections(sections);
                message.success('Phân tích đề cương bằng AI hoàn tất!');
                setCurrentStep(2); // Move to Save Structure
            } else {
                console.warn('No sections found in response:', res);
                message.warning('Không tìm thấy cấu trúc nào từ file này');
            }
        } catch (error) {
            console.error('Lỗi phân tích AI chi tiết:', error);
            const errorMsg = error.response?.data?.message || error.response?.data || error.message || 'Lỗi xử lý file với AI';
            message.error(typeof errorMsg === 'string' ? errorMsg : 'Lỗi xử lý file với AI (Xem console)');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveStructure = async () => {
        if (!scannedSections.length) {
            message.warning('Cấu trúc trống, vui lòng thực hiện phân tích lại');
            return;
        }

        try {
            setLoading(true);
            // Try sending the array directly if wrapping doesn't work.
            // Many APIs expect the root body to be the array for list-based POSTs.
            const payload = scannedSections.map((sec, index) => ({
                Title: sec.title || sec.Title,
                Description: sec.description || sec.Description || "",
                SortOrder: index + 1
            }));

            await saveCourseStructure(createdCourseId, payload);
            message.success('Lưu cấu trúc khóa học xuất sắc!');
            setCurrentStep(3); // Complete
        } catch (error) {
            console.error('Lỗi lưu cấu trúc:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu cấu trúc');
        } finally {
            setLoading(false);
        }
    };

    const handleSectionChange = (index, field, value) => {
        const newSections = [...scannedSections];
        newSections[index][field] = value;
        setScannedSections(newSections);
    };

    const addSection = () => {
        setScannedSections([...scannedSections, { title: 'Chương mới', description: '' }]);
    };

    const removeSection = (index) => {
        setScannedSections(scannedSections.filter((_, i) => i !== index));
    };

    const stepItems = [
        { title: 'Thông tin chung', icon: <FileText size={16} /> },
        { title: 'AI phân tích', icon: <Sparkles size={16} /> },
        { title: 'Chỉnh sửa cấu trúc', icon: <Save size={16} /> },
        { title: 'Hoàn tất', icon: <CheckCircle2 size={16} /> }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">
            <div className="max-w-4xl mx-auto space-y-6">
                <Button
                    type="text"
                    icon={<ArrowLeft size={16} />}
                    onClick={() => navigate('/dashboard/manager/courses')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 p-0"
                >
                    Trở về danh sách Template
                </Button>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <Steps current={currentStep} items={stepItems} className="mb-8" />

                    {/* HIỂN THỊ THÔNG TIN TEMPLATE ĐÃ TẠO */}
                    {createdTemplateInfo && currentStep >= 1 && (
                        <div className="mb-8 p-5 bg-blue-50/50 border border-blue-100 rounded-xl shadow-sm">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-100/50">
                                <h3 className="font-bold text-blue-800 flex items-center gap-2">
                                    <FileText size={18} className="text-[#0487e2]" />
                                    Thông tin Template đã tạo
                                </h3>
                                <div className="text-xs font-bold text-[#0487e2] bg-blue-100/50 px-2 py-1 rounded">
                                    CODE: {createdTemplateInfo.code}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 text-sm">
                                <div className="col-span-2 md:col-span-4">
                                    <span className="text-slate-500 block text-xs font-semibold mb-1 uppercase tracking-wider">Tên Template</span>
                                    <span className="font-bold text-slate-800 text-base">{createdTemplateInfo.title}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs font-semibold mb-1 uppercase tracking-wider">Môn học</span>
                                    <span className="font-semibold text-slate-700">{createdTemplateInfo.subjectName || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs font-semibold mb-1 uppercase tracking-wider">Khối lớp</span>
                                    <span className="font-semibold text-slate-700">{createdTemplateInfo.gradeName || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs font-semibold mb-1 uppercase tracking-wider">Danh mục</span>
                                    <span className="font-semibold text-slate-700">{createdTemplateInfo.categoryName || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs font-semibold mb-1 uppercase tracking-wider">Mức độ</span>
                                    <span className="font-semibold text-slate-700">{createdTemplateInfo.levelName || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 0: BASIC INFO */}
                    {currentStep === 0 && (
                        <Form form={form} layout="vertical" onFinish={handleCreateTemplate}>
                            <h2 className="text-xl font-bold text-slate-800 mb-6">Thông tin khóa học mẫu</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Form.Item name="title" label="Tên Template" rules={[{ required: true, message: 'Nhập tên Template' }]}>
                                    <Input placeholder="VD: Tiếng Anh Tiểu Học - Nền Tảng" className="h-11 rounded-lg font-bold text-slate-700" />
                                </Form.Item>

                                <Form.Item name="code" label="Mã Template (Code)" rules={[{ required: true, message: 'Nhập mã Template' }]}>
                                    <Input placeholder="VD: ENG_BASIC" className="h-11 rounded-lg uppercase" />
                                </Form.Item>

                                <Form.Item name="subjectId" label="Môn học" rules={[{ required: true, message: 'Chọn môn học' }]}>
                                    <Select placeholder="Chọn môn học..." className="h-11">
                                        {subjects.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>)}
                                    </Select>
                                </Form.Item>

                                <Form.Item name="gradeLevelId" label="Khối / Lớp" rules={[{ required: true, message: 'Chọn khối lớp' }]}>
                                    <Select placeholder="Chọn khối lớp..." className="h-11">
                                        {grades.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>)}
                                    </Select>
                                </Form.Item>

                                <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Chọn danh mục' }]}>
                                    <Select placeholder="Chọn danh mục..." className="h-11">
                                        {categories.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>)}
                                    </Select>
                                </Form.Item>

                                <Form.Item name="level" label="Cấp độ khó (Level)" rules={[{ required: true, message: 'Chọn trình độ' }]}>
                                    <Select placeholder="Chọn trình độ..." className="h-11">
                                        <Option value={1}>1 - Cơ bản (Beginner)</Option>
                                        <Option value={2}>2 - Trung bình (Intermediate)</Option>
                                        <Option value={3}>3 - Nâng cao (Advanced)</Option>
                                    </Select>
                                </Form.Item>
                            </div>

                            <Form.Item name="description" label="Mô tả">
                                <TextArea rows={4} placeholder="Nhập mô tả chi tiết..." className="rounded-lg" />
                            </Form.Item>

                            <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="h-11 px-8 rounded-lg bg-[#0487e2] hover:bg-[#0463ca] font-bold"
                                >
                                    Khởi tạo Template
                                </Button>
                            </div>
                        </Form>
                    )}

                    {/* STEP 1: AI SCAN */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-800">Sử dụng AI Phân tích đề cương</h2>
                            <p className="text-slate-500">Tải lên file đề cương (Syllabus) dạng PDF hoặc DOCX để hệ thống tự động bóc tách thành các chương bài học.</p>

                            <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center">
                                <Upload
                                    beforeUpload={(file) => {
                                        setFileList([file]);
                                        return false;
                                    }}
                                    fileList={fileList}
                                    onRemove={() => setFileList([])}
                                    maxCount={1}
                                    accept=".pdf,.docx,.doc,.txt"
                                >
                                    <Button className="h-11 flex items-center justify-center bg-white border-slate-300 gap-2 mb-2">
                                        <FileText size={16} /> Chọn File đề cương
                                    </Button>
                                </Upload>
                                <span className="text-xs text-slate-400 mt-2">Định dạng hỗ trợ: PDF, DOCX (Tối đa 5MB)</span>
                            </div>

                            <div className="flex gap-4 justify-end pt-4 border-t border-slate-100">
                                <Button
                                    loading={loading}
                                    onClick={() => setCurrentStep(2)}
                                    className="h-11 px-6 rounded-lg text-slate-500 border-slate-200 hover:text-slate-800"
                                >
                                    Bỏ qua (Tạo thủ công)
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={handleAIScan}
                                    loading={loading}
                                    icon={<Sparkles size={16} />}
                                    className="h-11 px-8 rounded-lg bg-indigo-500 hover:bg-indigo-600 font-bold border-none"
                                >
                                    Bắt đầu Phân tích AI
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: EDIT STRUCTURE */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-800">Chỉnh sửa cấu trúc Chương</h2>
                                <Button type="dashed" icon={<Plus size={16} />} onClick={addSection} className="h-9">Thêm Chương mới</Button>
                            </div>

                            <div className="space-y-4">
                                {scannedSections.map((section, index) => (
                                    <Card key={index} size="small" className="border-slate-200">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0487e2] font-bold flex items-center justify-center shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <Input
                                                    value={section.title}
                                                    onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                                                    placeholder="Tên chương..."
                                                    className="font-bold text-slate-700 h-10"
                                                />
                                                <TextArea
                                                    value={section.description}
                                                    onChange={(e) => handleSectionChange(index, 'description', e.target.value)}
                                                    placeholder="Mô tả chương (Tùy chọn)..."
                                                    rows={2}
                                                />
                                            </div>
                                            <Button
                                                type="text"
                                                danger
                                                icon={<Trash2 size={16} />}
                                                onClick={() => removeSection(index)}
                                            />
                                        </div>
                                    </Card>
                                ))}

                                {scannedSections.length === 0 && (
                                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
                                        <p className="text-slate-500 font-medium">Chưa có chương nào. Hãy phân tích bằng AI hoặc thêm chương thủ công.</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 justify-end pt-6 border-t border-slate-100">
                                <Button
                                    onClick={() => setCurrentStep(1)}
                                    className="h-11 px-6 rounded-lg text-slate-500 hover:text-slate-800"
                                    disabled={loading}
                                >
                                    Quay lại
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={handleSaveStructure}
                                    loading={loading}
                                    icon={<Save size={16} />}
                                    className="h-11 px-8 rounded-lg bg-[#0487e2] hover:bg-[#0463ca] font-bold border-none"
                                >
                                    Lưu cấu trúc khóa học
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: COMPLETE */}
                    {currentStep === 3 && (
                        <div className="text-center py-12 space-y-6">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 size={40} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Hoàn tất khởi tạo Mẫu (Template)</h2>
                                <p className="text-slate-500 mt-2">Bây giờ giáo viên đã có thể sử dụng cấu trúc Mẫu này để tạo Khóa học thương mại thực tế.</p>
                            </div>
                            <Button
                                type="primary"
                                onClick={() => navigate('/dashboard/manager/courses')}
                                className="h-11 px-8 rounded-lg bg-[#0487e2] hover:bg-[#0463ca] font-bold border-none"
                            >
                                Trở về Quản lý Mẫu
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
