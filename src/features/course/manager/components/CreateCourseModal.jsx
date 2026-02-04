import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Select,
    Button,
    Space,
    Divider,
    message,
    Spin
} from 'antd';
import {
    Plus,
    Trash2,
    BookOpen,
    Layout,
    FileText,
    Layers,
    Save,
    X
} from 'lucide-react';
import { createCourse, createSection } from '../api/courseApi';
import { getSubjects } from '../../subject/api/subjectApi';

const { TextArea } = Input;
const { Option } = Select;

const CreateCourseModal = ({ open, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        if (open) {
            fetchSubjects();
        }
    }, [open]);

    const fetchSubjects = async () => {
        try {
            const res = await getSubjects();
            const data = res?.data?.items || res?.items || res?.data || [];
            setSubjects(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Lỗi khi tải môn học:', error);
            message.warning('Không thể tải danh sách môn học');
        }
    };

    const handleFinish = async (values) => {
        try {
            setLoading(true);

            // Step 1: Create Course
            const coursePayload = {
                title: values.title,
                description: values.description,
                subjectId: values.subjectId,
                // Defaulting or mock values for required fields from earlier requests
                code: `C-${Date.now().toString().slice(-6)}`,
                level: 'Beginner',
                language: 'Vietnamese',
                categoryId: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
            };

            const courseRes = await createCourse(coursePayload);
            const courseId = courseRes?.data?.id || courseRes?.id;

            if (!courseId) {
                throw new Error('Không lấy được ID khóa học mới tạo');
            }

            // Step 2 & 3: Create Sections sequentially or via Promise.all
            if (values.sections && values.sections.length > 0) {
                const sectionPromises = values.sections.map(section =>
                    createSection(courseId, {
                        title: section.title,
                        sortOrder: section.sortOrder || 0
                    })
                );
                await Promise.all(sectionPromises);
            }

            message.success('Khởi tạo khóa học và các đề mục thành công!');
            form.resetFields();
            onSuccess?.();
            onCancel();
        } catch (error) {
            console.error('Lỗi khi khởi tạo:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra trong quá trình xử lý');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            width={700}
            centered
            closeIcon={<X size={20} className="text-slate-400" />}
            title={
                <div className="flex items-center gap-2 text-[#0487e2] font-black uppercase tracking-wider text-sm">
                    <Plus size={18} />
                    Khởi tạo khóa học chi tiết
                </div>
            }
            className="modern-modal"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{ sections: [{ title: '', sortOrder: 0 }] }}
                className="mt-6 font-sans"
            >
                {/* Part 1: Course Info */}
                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 mb-8">
                    <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
                        <BookOpen size={18} className="text-[#0487e2]" />
                        Thông tin khóa học
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            label={<span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Tiêu đề khóa học</span>}
                            name="title"
                            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                            className="md:col-span-2"
                        >
                            <Input placeholder="VD: Khóa học lập trình React nâng cao" className="h-12 rounded-xl border-slate-200" />
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Môn học</span>}
                            name="subjectId"
                            rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
                        >
                            <Select placeholder="Chọn môn" className="h-12 custom-select-v6">
                                {subjects.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item
                        label={<span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Mô tả</span>}
                        name="description"
                    >
                        <TextArea rows={3} placeholder="Mô tả ngắn gọn về khóa học..." className="rounded-xl border-slate-200 p-3" />
                    </Form.Item>
                </div>

                <Divider className="my-6 border-slate-100">
                    <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Cấu trúc đề mục (Sections)</span>
                </Divider>

                {/* Part 2: Sections List */}
                <div className="mb-8">
                    <Form.List name="sections">
                        {(fields, { add, remove }) => (
                            <div className="space-y-4">
                                {fields.map(({ key, name, ...restField }) => (
                                    <div
                                        key={key}
                                        className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm transition-all hover:border-blue-100"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-xs shrink-0 mt-8">
                                            #{name + 1}
                                        </div>

                                        <Form.Item
                                            {...restField}
                                            name={[name, 'title']}
                                            label={<span className="text-[10px] font-bold text-slate-400 px-1">Tên chương/đề mục</span>}
                                            rules={[{ required: true, message: 'Nhập tên đề mục' }]}
                                            className="flex-1 mb-0"
                                        >
                                            <Input placeholder="VD: Giới thiệu về React Hooks" className="h-11 rounded-xl" />
                                        </Form.Item>

                                        <Form.Item
                                            {...restField}
                                            name={[name, 'sortOrder']}
                                            label={<span className="text-[10px] font-bold text-slate-400 px-1">STT</span>}
                                            className="w-20 mb-0"
                                        >
                                            <Input type="number" placeholder="0" className="h-11 rounded-xl" />
                                        </Form.Item>

                                        {fields.length > 1 && (
                                            <Button
                                                type="text"
                                                danger
                                                icon={<Trash2 size={18} />}
                                                onClick={() => remove(name)}
                                                className="mt-8 hover:bg-red-50 rounded-xl"
                                            />
                                        )}
                                    </div>
                                ))}

                                <Button
                                    type="dashed"
                                    onClick={() => add()}
                                    block
                                    icon={<Plus size={16} />}
                                    className="h-12 rounded-xl border-dashed border-slate-200 text-slate-500 hover:text-[#0487e2] hover:border-[#0487e2] transition-all flex items-center justify-center"
                                >
                                    Thêm đề mục mới
                                </Button>
                            </div>
                        )}
                    </Form.List>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        onClick={onCancel}
                        disabled={loading}
                        className="h-11 px-6 rounded-xl font-bold border-slate-200 text-slate-500 hover:bg-slate-50"
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        icon={<Save size={18} />}
                        className="h-11 px-8 rounded-xl font-bold bg-[#0487e2] border-none shadow-lg shadow-blue-100"
                    >
                        Xác nhận khởi tạo
                    </Button>
                </div>
            </Form>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-select-v6 .ant-select-selector {
                    height: 48px !important;
                    border-radius: 0.75rem !important;
                    border: 1px solid #e2e8f0 !important;
                    display: flex !important;
                    align-items: center !important;
                    background-color: transparent !important;
                }
                .ant-modal-content {
                    border-radius: 1.5rem !important;
                    padding: 2rem !important;
                }
                .ant-form-item-label {
                    padding-bottom: 4px !important;
                }
            `}} />
        </Modal>
    );
};

export default CreateCourseModal;
