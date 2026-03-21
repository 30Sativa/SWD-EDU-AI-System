import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Upload, message, Spin, Tabs } from 'antd';
import { FileText, Sparkles, BookOpen, Layers, Plus, Trash2, Save } from 'lucide-react';
import { updateCourseTemplate, scanCourseTemplate, getCourseSections, saveCourseStructure } from '../../api/courseApi';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

const InnerForm = ({
    visible,
    onClose,
    course,
    subjects,
    grades,
    categories,
    onSuccess,
    activeTab,
    setActiveTab
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [hasSections, setHasSections] = useState(false);
    const [checkingSections, setCheckingSections] = useState(false);
    const [sectionsData, setSectionsData] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        if (visible && course) {
            form.setFieldsValue({
                title: course.title || course.name,
                code: course.code,
                subjectId: course.subjectId || course.SubjectId,
                gradeLevelId: course.gradeLevelId || course.GradeLevelId || course.gradeId || course.GradeId,
                categoryId: course.categoryId || course.CategoryId,
                level: course.level,
                description: course.description
            });
            
            const fetchSections = async () => {
                try {
                    setCheckingSections(true);
                    const res = await getCourseSections(course.id);
                    const data = res?.data?.items || res?.items || res?.data || res || [];
                    const sectionsList = Array.isArray(data) ? data : [];
                    setSectionsData(sectionsList);
                    const hasData = sectionsList.length > 0;
                    setHasSections(hasData);
                    setIsEditMode(hasData);
                    if (hasData) {
                        setActiveTab('2');
                    }
                } catch (error) {
                    const total = course.totalSections || course.TotalSections || course.sections?.length || 0;
                    setHasSections(total > 0);
                    setIsEditMode(total > 0);
                } finally {
                    setCheckingSections(false);
                }
            };
            fetchSections();
        }
    }, [visible, course, form, setActiveTab]);

    const handleAddSection = () => {
        setSectionsData([...sectionsData, { title: 'Chương mới', description: '', lessons: [] }]);
    };

    const handleRemoveSection = (index) => {
        const newSections = sectionsData.filter((_, i) => i !== index);
        setSectionsData(newSections);
    };

    const handleSectionChange = (index, value) => {
        const newSections = [...sectionsData];
        newSections[index].title = value;
        setSectionsData(newSections);
    };

    const handleAddLesson = (sIdx) => {
        const newSections = [...sectionsData];
        const lessons = newSections[sIdx].lessons || newSections[sIdx].Lessons || [];
        newSections[sIdx].lessons = [...lessons, { title: 'Bài học mới', description: '' }];
        setSectionsData(newSections);
    };

    const handleRemoveLesson = (sIdx, lIdx) => {
        const newSections = [...sectionsData];
        const lessons = newSections[sIdx].lessons || newSections[sIdx].Lessons || [];
        newSections[sIdx].lessons = lessons.filter((_, i) => i !== lIdx);
        setSectionsData(newSections);
    };

    const handleLessonChange = (sIdx, lIdx, value) => {
        const newSections = [...sectionsData];
        const lessons = newSections[sIdx].lessons || newSections[sIdx].Lessons || [];
        lessons[lIdx].title = value;
        setSectionsData(newSections);
    };

    const handleSaveStructure = async () => {
        try {
            setLoading(true);
            message.loading({ content: 'Đang lưu cấu trúc...', key: 'save_struct' });
            
            const payload = sectionsData.map((sec, i) => ({
                title: sec.title || sec.Title || sec.name,
                description: sec.description || sec.Description || "",
                sortOrder: sec.sortOrder || (i + 1),
                lessons: Array.isArray(sec.lessons || sec.Lessons) ? (sec.lessons || sec.Lessons).map((l, j) => ({
                    title: l.title || l.Title || l.name,
                    description: l.description || l.Description || "",
                    sortOrder: l.sortOrder || (j + 1)
                })) : []
            }));

            await saveCourseStructure(course.id, payload);

            message.success({ content: 'Lưu cấu trúc thành công!', key: 'save_struct' });
            onSuccess();
        } catch (error) {
            message.error({ content: error.response?.data?.message || 'Có lỗi xảy ra khi lưu cấu trúc', key: 'save_struct' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBasicInfo = async (values) => {
        try {
            setLoading(true);
            await updateCourseTemplate(course.id, {
                code: values.code,
                title: values.title,
                subjectId: values.subjectId,
                gradeLevelId: values.gradeLevelId,
                categoryId: values.categoryId,
                description: values.description || "",
                thumbnail: course.thumbnail || "",
                level: Number(values.level)
            });
            message.success('Cập nhật thông tin cơ bản thành công!');
            onSuccess();
            onClose();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật template');
        } finally {
            setLoading(false);
        }
    };

    const handleAIScan = async () => {
        if (!fileList.length) {
            message.warning('Vui lòng chọn file đề cương để phân tích');
            return;
        }
        try {
            setIsScanning(true);
            const formData = new FormData();
            const fileToUpload = fileList[0].originFileObj || fileList[0];
            formData.append('File', fileToUpload);

            message.loading({ content: 'Đang phân tích và xử lý với AI...', key: 'ai_scan' });
            const res = await scanCourseTemplate(course.id, formData);
            const sections = res?.data?.sections || res?.sections || res?.data?.Items || res?.Items || (Array.isArray(res?.data) ? res.data : []);
            
            if (sections.length > 0) {
                message.loading({ content: 'Đang lưu cấu trúc...', key: 'ai_scan' });
                
                const payload = sections.map((sec, i) => ({
                    title: sec.title || sec.Title,
                    description: sec.description || sec.Description || "",
                    sortOrder: sec.sortOrder || (i + 1),
                    lessons: Array.isArray(sec.lessons || sec.Lessons) ? (sec.lessons || sec.Lessons).map((l, j) => ({
                        title: l.title || l.Title,
                        description: l.description || l.Description || "",
                        sortOrder: l.sortOrder || (j + 1)
                    })) : []
                }));

                await saveCourseStructure(course.id, payload);

                message.success({ content: 'Quét bằng AI và cập nhật cấu trúc thành công!', key: 'ai_scan' });
                onSuccess();
                // Refetch sections local state
                const refreshRes = await getCourseSections(course.id);
                setSectionsData(refreshRes?.data?.items || refreshRes?.items || refreshRes?.data || refreshRes || []);
                setHasSections(true);
                setIsEditMode(true);
            } else {
                message.warning({ content: 'Không tìm thấy cấu trúc nào từ file này', key: 'ai_scan' });
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data || error.message || 'Lỗi xử lý file với AI';
            message.error({ content: typeof errorMsg === 'string' ? errorMsg : 'Lỗi xử lý file với AI', key: 'ai_scan' });
        } finally {
            setIsScanning(false);
        }
    };

    const tabItems = [
        {
            key: '1',
            label: 'Thông tin cơ bản',
            children: (
                <Form form={form} layout="vertical" onFinish={handleUpdateBasicInfo}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item name="title" label="Tên Template" rules={[{ required: true, message: 'Nhập tên Template' }]}>
                            <Input placeholder="VD: Tiếng Anh Tiểu Học - Nền Tảng" className="h-10 rounded-lg font-bold" />
                        </Form.Item>

                        <Form.Item name="code" label="Mã Template (Code)" rules={[{ required: true, message: 'Nhập mã Template' }]}>
                            <Input placeholder="VD: ENG_BASIC" className="h-10 rounded-lg uppercase" />
                        </Form.Item>

                        <Form.Item name="subjectId" label="Môn học" rules={[{ required: true, message: 'Chọn môn học' }]}>
                            <Select placeholder="Chọn môn học..." className="h-10">
                                {subjects.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>)}
                            </Select>
                        </Form.Item>

                        <Form.Item name="gradeLevelId" label="Khối / Lớp" rules={[{ required: true, message: 'Chọn khối lớp' }]}>
                            <Select placeholder="Chọn khối lớp..." className="h-10">
                                {grades.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>)}
                            </Select>
                        </Form.Item>

                        <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Chọn danh mục' }]}>
                            <Select placeholder="Chọn danh mục..." className="h-10">
                                {categories.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>)}
                            </Select>
                        </Form.Item>

                        <Form.Item name="level" label="Cấp độ khó (Level)" rules={[{ required: true, message: 'Chọn trình độ' }]}>
                            <Select placeholder="Chọn trình độ..." className="h-10">
                                <Option value={1}>1 - Cơ bản (Beginner)</Option>
                                <Option value={2}>2 - Trung bình (Intermediate)</Option>
                                <Option value={3}>3 - Nâng cao (Advanced)</Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item name="description" label="Mô tả">
                        <TextArea rows={4} placeholder="Nhập mô tả chi tiết..." className="rounded-lg" />
                    </Form.Item>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <Button onClick={onClose} className="mr-3 h-10 px-6 rounded-lg font-bold">Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={loading} className="h-10 px-8 rounded-lg bg-[#0487e2] font-bold">
                            Lưu thông tin
                        </Button>
                    </div>
                </Form>
            )
        },
        {
            key: '2',
            label: 'Cấu trúc bài học',
            children: checkingSections ? (
                <div className="py-12 flex justify-center"><Spin /></div>
            ) : hasSections ? (
                <div className="py-2 flex flex-col h-[550px]">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-slate-800">Cấu trúc Chương trình</h3>
                            <span className="text-sm font-semibold text-[#0487e2] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                {sectionsData.length} Chương
                            </span>
                        </div>
                        {!isEditMode && (
                            <Button type="dashed" icon={<Plus size={16} />} onClick={handleAddSection} className="font-semibold text-slate-600">
                                Thêm Chương
                            </Button>
                        )}
                    </div>
                    
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
                        {sectionsData.length > 0 ? sectionsData.map((sec, index) => (
                            <div key={sec.id || index} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                                <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="bg-[#0487e2] text-white w-6 h-6 rounded flex items-center justify-center font-bold text-sm shrink-0">
                                            {index + 1}
                                        </div>
                                        <Input
                                            value={sec.title || sec.Title || sec.name}
                                            onChange={(e) => handleSectionChange(index, e.target.value)}
                                            className="font-bold text-slate-700 h-8 max-w-[400px]"
                                            placeholder="Tên chương..."
                                            disabled={isEditMode}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {!isEditMode && (
                                            <>
                                                <Button size="small" type="text" icon={<Plus size={14} />} onClick={() => handleAddLesson(index)} className="text-blue-600 font-medium">Thêm bài</Button>
                                                <Button size="small" type="text" danger icon={<Trash2 size={14} />} onClick={() => handleRemoveSection(index)} />
                                            </>
                                        )}
                                    </div>
                                </div>
                                {(sec.lessons || sec.Lessons)?.length > 0 && (
                                    <div className="p-2 bg-white divide-y divide-slate-50">
                                        {(sec.lessons || sec.Lessons).map((lesson, lIdx) => (
                                            <div key={lesson.id || lIdx} className="flex items-center gap-3 py-2 px-3 hover:bg-slate-50 rounded-lg transition-colors group">
                                                <div className="w-5 h-5 rounded border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                                                    <span className="text-[10px] font-bold">{index+1}.{lIdx+1}</span>
                                                </div>
                                                <Input
                                                    value={lesson.title || lesson.Title || lesson.name}
                                                    onChange={(e) => handleLessonChange(index, lIdx, e.target.value)}
                                                    className="font-semibold text-slate-600 text-[13px] border-transparent hover:border-slate-200 focus:border-[#0487e2] h-7 px-2"
                                                    placeholder="Tên bài học..."
                                                    disabled={isEditMode}
                                                />
                                                {!isEditMode && (
                                                    <Button size="small" type="text" danger icon={<Trash2 size={14} />} onClick={() => handleRemoveLesson(index, lIdx)} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="py-10 text-center space-y-4 border-2 border-dashed border-slate-200 rounded-xl">
                                <div className="w-16 h-16 bg-blue-50 text-[#0487e2] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Layers size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Chưa có hoặc đã xóa hết</h3>
                                <p className="text-slate-500">
                                    Bấm "Thêm chương" để bắt đầu xây dựng lại.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4 shrink-0">
                        {isEditMode ? (
                            <span className="text-amber-500 text-xs font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 italic">
                                Chế độ xem: Template đã được khởi tạo cấu trúc, không thể lưu đè bằng công cụ này.
                            </span>
                        ) : (
                            <div />
                        )}
                        <Button 
                            type="primary" 
                            loading={loading} 
                            onClick={handleSaveStructure} 
                            icon={<Save size={16} />} 
                            className={`h-10 px-8 rounded-lg font-bold ${isEditMode ? 'bg-slate-300 pointer-events-none' : 'bg-[#0487e2]'}`}
                            disabled={isEditMode}
                        >
                            Lưu cấu trúc
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="py-6 space-y-6">
                    <div className="text-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Chưa có cấu trúc</h3>
                        <p className="text-slate-500 text-sm">Template này hiện đang trống. Bạn có thể tự thêm chương trình học bằng hai cách sau.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-200 rounded-xl p-5 hover:border-[#0487e2] transition-colors bg-white">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4">
                                <BookOpen size={20} />
                            </div>
                            <h4 className="font-bold text-slate-800 mb-2">Tạo thủ công</h4>
                            <p className="text-sm text-slate-500 mb-4 h-10">Tự tạo danh sách các bài học từng bước một cách linh hoạt theo ý muốn.</p>
                            <Button 
                                type="primary" 
                                className="w-full bg-indigo-500 hover:bg-indigo-600 font-bold border-none"
                                onClick={() => { 
                                    setSectionsData([{ title: 'Chương 1', description: '', lessons: [] }]);
                                    setHasSections(true);
                                }}
                            >
                                Bắt đầu thủ công
                            </Button>
                        </div>

                        <div className="border border-slate-200 rounded-xl p-5 hover:border-[#0487e2] transition-colors bg-white">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0487e2] flex items-center justify-center mb-4">
                                <Sparkles size={20} />
                            </div>
                            <h4 className="font-bold text-slate-800 mb-2">Dùng AI quét đề cương</h4>
                            <p className="text-sm text-slate-500 mb-4 h-10">Tải lên file PDF/Excel (syllabus) hệ thống sẽ bóc tách và tự lưu cấu trúc.</p>
                            
                            <Upload
                                beforeUpload={(file) => {
                                    setFileList([file]);
                                    return false;
                                }}
                                fileList={fileList}
                                onRemove={() => setFileList([])}
                                maxCount={1}
                                accept=".pdf,.xlsx,.xls,.csv,.txt"
                            >
                                <Button className="w-full h-8 flex items-center justify-center bg-white border-slate-300 gap-2 font-medium">
                                    <FileText size={14} /> Chọn File đề cương
                                </Button>
                            </Upload>
                            
                            <Button 
                                type="primary" 
                                className="w-full mt-4 bg-[#0487e2] font-bold border-none" 
                                onClick={handleAIScan}
                                loading={isScanning}
                                icon={<Sparkles size={14} />}
                            >
                                Bắt đầu quét AI
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={tabItems} 
            className="font-medium" 
        />
    );
};

export default function EditTemplateModal({
    visible,
    onClose,
    course,
    subjects,
    grades,
    categories,
    onSuccess
}) {
    const [activeTab, setActiveTab] = useState('1');

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            title={
                <div className="flex items-center gap-2 text-lg font-bold text-[#0463ca]">
                    <Layers size={20} />
                    Chỉnh sửa Template Khóa học
                </div>
            }
            width={800}
            destroyOnHidden
            className="top-10"
        >
            <div className="pt-4">
                {visible && (
                    <InnerForm
                        visible={visible}
                        onClose={onClose}
                        course={course}
                        subjects={subjects}
                        grades={grades}
                        categories={categories}
                        onSuccess={onSuccess}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
                )}
            </div>
        </Modal>
    );
}
