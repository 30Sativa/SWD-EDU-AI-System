import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Search, Edit, LayoutGrid, List, Eye, LayoutList } from 'lucide-react';
import { Table, Button, Input, Modal, Form, Tag, message, Spin, Tooltip, Empty, Select } from 'antd';
import { getCourseCategories, createCourseCategory, updateCourseCategory } from '../../api/categoryApi';

export default function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [statusFilter, setStatusFilter] = useState('All');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getCourseCategories({ pageSize: 1000 });
            const data = response?.data?.items || response?.items || response?.data || response || [];
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Không thể tải danh sách danh mục:', error);
            message.error('Không thể tải tài nguyên từ máy chủ');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleOpenCreateModal = () => {
        form.resetFields();
        setIsEditing(false);
        setEditingId(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (record) => {
        form.setFieldsValue({
            name: record.name,
            description: record.description,
        });
        setIsEditing(true);
        setEditingId(record.id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);
            const payload = {
                name: values.name,
                description: values.description || ""
            };

            if (isEditing) {
                await updateCourseCategory(editingId, payload);
                message.success('Cập nhật danh mục thành công!');
            } else {
                await createCourseCategory(payload);
                message.success('Tạo danh mục mới thành công!');
            }

            handleCloseModal();
            fetchCategories();
        } catch (error) {
            console.error('Lỗi khi lưu danh mục:', error);
            message.error(error.response?.data?.message?.toString() || 'Có lỗi xảy ra trong quá trình xử lý');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredData = useMemo(() => categories.filter(item => {
        const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    }), [categories, searchTerm, statusFilter]);

    const columns = [
        {
            title: 'Danh mục khóa học',
            key: 'category',
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-[#0487e2] bg-blue-50 font-bold shadow-sm shrink-0"
                    >
                        <LayoutList size={20} />
                    </div>
                    <div className="min-w-0 text-left">
                        <div className="font-bold text-slate-700 hover:text-[#0487e2] transition-colors truncate">{record.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium truncate">{record.description || 'Không có mô tả'}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'right',
            width: 100,
            render: (_, record) => (
                <div className="flex items-center justify-end gap-1">
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<Edit size={16} />} onClick={(e) => { e.stopPropagation(); handleOpenEditModal(record); }} className="text-slate-400 hover:text-[#0487e2]" />
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto space-y-6">
                <header className="flex flex-row justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Quản lý Danh mục</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Bố trí và phân loại hệ thống chương trình đào tạo.</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<Plus size={18} />}
                        onClick={handleOpenCreateModal}
                        className="bg-[#0487e2] hover:bg-[#0463ca] h-11 px-6 rounded-lg font-bold shadow-md border-none flex items-center gap-2"
                    >
                        Tạo Danh mục
                    </Button>
                </header>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-1 gap-4 w-full">
                            <Input
                                placeholder="Tìm kiếm tên danh mục..."
                                prefix={<Search size={18} className="text-slate-400" />}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="flex-1 max-w-md h-10 rounded-lg border-slate-200 bg-white hover:border-[#0487e2] focus:border-[#0487e2]"
                                allowClear
                            />
                        </div>
                        <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg shrink-0">
                            <Button
                                type="text"
                                icon={<LayoutGrid size={16} />}
                                onClick={() => setViewMode('grid')}
                                className={`rounded-md h-8 w-8 flex items-center justify-center p-0 ${viewMode === 'grid' ? 'bg-blue-50 text-[#0487e2]' : 'text-slate-400 hover:text-slate-600'}`}
                            />
                            <Button
                                type="text"
                                icon={<List size={16} />}
                                onClick={() => setViewMode('list')}
                                className={`rounded-md h-8 w-8 flex items-center justify-center p-0 ${viewMode === 'list' ? 'bg-blue-50 text-[#0487e2]' : 'text-slate-400 hover:text-slate-600'}`}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20">
                        <Spin size="large" />
                        <p className="mt-4 text-slate-500 font-medium">Đang tải dữ liệu...</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-20 text-center">
                        <Empty description={<span className="text-slate-400 font-medium">Không tìm thấy danh mục nào</span>} />
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                        {filteredData.map((item) => (
                            <div
                                key={item.id}
                                className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#0487e2] hover:shadow-xl hover:shadow-[#0487e2]/5 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-50 to-transparent -z-0 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 rounded-bl-full pointer-events-none" />

                                <div className="relative z-10 w-full mb-auto pb-4 border-b border-slate-100/80 group-hover:border-blue-100 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="w-14 h-14 rounded-[14px] flex items-center justify-center text-[#0487e2] bg-blue-50/50 text-2xl font-black shadow-sm shrink-0 ring-4 ring-white"
                                        >
                                            <LayoutList size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <h3 className="text-base sm:text-lg font-bold text-slate-800 group-hover:text-[#0487e2] transition-colors leading-tight line-clamp-2">
                                                {item.name}
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 mt-4 flex items-center justify-between w-full">
                                    <p className="text-[11px] text-slate-400 font-semibold tracking-wide truncate w-full pr-4">
                                        {item.description || "Không có mô tả chi tiết."}
                                    </p>

                                    <Button
                                        size="small"
                                        type="text"
                                        icon={<Edit size={16} />}
                                        onClick={(e) => { e.stopPropagation(); handleOpenEditModal(item); }}
                                        className="text-slate-400 hover:text-[#0487e2] hover:bg-blue-50 shrink-0 w-8 h-8 flex items-center justify-center rounded-lg"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <Table
                            columns={columns}
                            dataSource={filteredData}
                            rowKey="id"
                            pagination={{ pageSize: 10, showSizeChanger: false }}
                            className="custom-table"
                        />
                    </div>
                )}
            </div>

            <Modal
                title={
                    <div className="flex items-center gap-2 text-[#0463ca] uppercase text-xs font-black tracking-widest">
                        <LayoutList size={16} />
                        {isEditing ? 'Cập nhật Danh mục' : 'Xác nhận tạo Danh mục'}
                    </div>
                }
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={null}
                centered
                width={500}
                className="custom-modal"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="pt-6"
                >
                    <Form.Item
                        label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tên Danh mục</span>}
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                    >
                        <Input placeholder="VD: Lập trình Web" className="h-11 rounded-lg font-bold" />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mô tả</span>}
                        name="description"
                    >
                        <Input.TextArea rows={4} placeholder="Thông tin chuyên sâu..." className="rounded-lg" />
                    </Form.Item>

                    <div className="flex gap-3 pt-4">
                        <Button
                            onClick={handleCloseModal}
                            className="flex-1 rounded-lg h-11 font-bold text-slate-400 border-none bg-slate-100 hover:bg-slate-200"
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            className="flex-1 bg-[#0487e2] h-11 rounded-lg font-bold uppercase text-xs tracking-widest shadow-md border-none"
                        >
                            {isEditing ? 'Lưu thay đổi' : 'Khởi tạo ngay'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
