import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, LayoutGrid, List, Eye, Hash, Palette, MoreVertical } from 'lucide-react';
import { Table, Button, Input, Modal, Form, Tag, message, Spin, Tooltip, Empty, Select, Dropdown } from 'antd';
import { getSubjects, createSubject } from '../../api/subjectApi';

export default function SubjectManagement() {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [statusFilter, setStatusFilter] = useState('All');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const fetchSubjects = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getSubjects();
            const data = response?.data?.items || response?.items || response?.data || response || [];
            setSubjects(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Không thể tải danh sách môn học:', error);
            message.error('Không thể kết nối máy chủ để tải danh sách môn học');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    const handleOpenCreateModal = () => {
        form.resetFields();
        form.setFieldsValue({ color: '#0487e2', isActive: true, sortOrder: 0 });
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
                ...values,
                code: values.code.toUpperCase()
            };

            await createSubject(payload);
            message.success('Tạo môn học mới thành công!');

            handleCloseModal();
            fetchSubjects();
        } catch (error) {
            console.error('Lỗi khi tạo môn học:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra trong quá trình xử lý');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredData = useMemo(() => subjects.filter(item => {
        const matchesSearch = (
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.code?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (statusFilter === 'Public') return matchesSearch && item.isActive;
        if (statusFilter === 'Draft') return matchesSearch && !item.isActive;
        return matchesSearch;
    }), [subjects, searchTerm, statusFilter]);

    // Define table columns (for list view)
    const columns = [
        {
            title: 'Môn học',
            key: 'subject',
            render: (_, record) => (
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/dashboard/manager/subjects/${record.id}`)}>
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm shrink-0"
                        style={{ backgroundColor: record.color || '#0487e2' }}
                    >
                        {record.name?.charAt(0)}
                    </div>
                    <div className="min-w-0 text-left">
                        <div className="font-bold text-slate-700 hover:text-[#0487e2] transition-colors truncate">{record.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium truncate uppercase">{record.nameEn || 'N/A'}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'Mã môn',
            dataIndex: 'code',
            key: 'code',
            render: (code) => <Tag className="rounded-lg font-mono font-bold border-none bg-slate-100 text-slate-600">{code}</Tag>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Tag color={isActive ? 'success' : 'default'} className="rounded-full px-3 uppercase text-[10px] font-bold border-none">
                    {isActive ? 'Công khai' : 'Bản nháp'}
                </Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'right',
            render: (_, record) => (
                <div className="flex items-center justify-end gap-1">
                    <Tooltip title="Xem chi tiết">
                        <Button type="text" icon={<Eye size={16} />} onClick={() => navigate(`/dashboard/manager/subjects/${record.id}`)} className="text-slate-400 hover:text-[#0487e2]" />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<Edit size={16} />} onClick={() => navigate(`/dashboard/manager/subjects/${record.id}`, { state: { isEditing: true } })} className="text-slate-400 hover:text-[#0487e2]" />
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <header className="flex flex-row justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Quản lý Môn học</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Quản lý và thiết lập cấu trúc chương trình học.</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<Plus size={18} />}
                        onClick={handleOpenCreateModal}
                        className="bg-[#0487e2] hover:bg-[#0463ca] h-11 px-6 rounded-lg font-bold shadow-md border-none flex items-center gap-2"
                    >
                        Tạo Môn học
                    </Button>
                </header>

                {/* Filters Section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-1 gap-4 w-full">
                            <Input
                                placeholder="Tìm kiếm mã hoặc tên môn học..."
                                prefix={<Search size={18} className="text-slate-400" />}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="flex-1 h-10 rounded-lg border-slate-200 bg-white hover:border-[#0487e2] focus:border-[#0487e2]"
                                allowClear
                            />
                            <Select
                                defaultValue="All"
                                className="w-48 h-10 [&>.ant-select-selector]:!rounded-lg [&>.ant-select-selector]:!border-slate-200 [&>.ant-select-selector]:!h-10 [&>.ant-select-selector]:!flex [&>.ant-select-selector]:!items-center"
                                onChange={setStatusFilter}
                                options={[
                                    { value: 'All', label: 'Tất cả trạng thái' },
                                    { value: 'Public', label: 'Đã công khai' },
                                    { value: 'Draft', label: 'Đang soạn thảo' },
                                ]}
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

                {/* Content Rendering */}
                {loading ? (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20">
                        <Spin size="large" />
                        <p className="mt-4 text-slate-500 font-medium">Đang tải dữ liệu...</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-20 text-center">
                        <Empty description={<span className="text-slate-400 font-medium">Không tìm thấy kết quả phù hợp</span>} />
                    </div>
                ) : viewMode === 'grid' ? (
                    /* Grid View */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                        {filteredData.map((item) => (
                            <div
                                key={item.id}
                                className="group bg-white rounded-xl p-5 border border-slate-200 hover:border-[#0487e2] hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between h-full relative"
                                onClick={() => navigate(`/dashboard/manager/subjects/${item.id}`)}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div
                                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-sm"
                                            style={{ backgroundColor: item.color || '#0487e2' }}
                                        >
                                            {item.name?.charAt(0)}
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                                                {item.code}
                                            </span>
                                            <Tag color={item.isActive ? 'success' : 'default'} className="m-0 border-none px-1.5 py-0 text-[9px] font-bold uppercase">
                                                {item.isActive ? 'Đã xuất bản' : 'Bản nháp'}
                                            </Tag>
                                        </div>
                                    </div>

                                    <div className="space-y-1 mb-4">
                                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#0487e2] transition-colors line-clamp-1">
                                            {item.name}
                                        </h3>
                                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider truncate">
                                            {item.nameEn || 'ENGLISH NAME N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-end">
                                    <Button
                                        size="small"
                                        type="text"
                                        icon={<Edit size={14} />}
                                        onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/manager/subjects/${item.id}`, { state: { isEditing: true } }); }}
                                        className="text-slate-400 hover:text-[#0487e2] hover:bg-transparent"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* List View (Table) */
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

            {/* Modal Setup (Unchanged) */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-[#0463ca] uppercase text-xs font-black tracking-widest">
                        <Plus size={16} />
                        Xác nhận khởi tạo môn học mới
                    </div>
                }
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={null}
                centered
                width={600}
                className="custom-modal"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="pt-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mã định danh (Code)</span>}
                            name="code"
                            rules={[{ required: true, message: 'Vui lòng nhập mã môn học' }]}
                        >
                            <Input placeholder="VD: MAT10" className="h-11 rounded-lg font-bold uppercase" prefix={<Hash size={16} className="text-slate-400" />} />
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Thứ tự ưu tiên</span>}
                            name="sortOrder"
                        >
                            <Input type="number" placeholder="0" className="h-11 rounded-lg" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tên Môn học (Tiếng Việt)</span>}
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên môn học' }]}
                    >
                        <Input placeholder="VD: Toán học - Lớp 10" className="h-11 rounded-lg font-bold" />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tên Môn học (Tiếng Anh)</span>}
                        name="nameEn"
                    >
                        <Input placeholder="VD: Mathematics Grade 10" className="h-11 rounded-lg" />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mô tả tóm tắt</span>}
                        name="description"
                    >
                        <Input.TextArea rows={3} placeholder="Giới thiệu sơ lược nội dung môn học..." className="rounded-lg" />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Màu sắc thương hiệu</span>}
                        name="color"
                    >
                        <div className="flex items-center gap-4">
                            <Input
                                type="color"
                                className="w-16 h-11 p-1 rounded-lg border-slate-200 cursor-pointer"
                                onChange={(e) => form.setFieldsValue({ color: e.target.value })}
                            />
                            <Input
                                placeholder="#0487e2"
                                className="h-11 rounded-lg font-mono uppercase"
                                prefix={<Palette size={16} className="text-slate-400" />}
                            />
                        </div>
                    </Form.Item>

                    <Form.Item name="isActive" valuePropName="checked">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                                <span className="text-sm font-bold text-slate-700 block">Xuất bản ngay</span>
                                <span className="text-[10px] text-slate-400 uppercase font-black">Cho phép giáo viên sử dụng môn học này</span>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className={`w-10 h-6 rounded-full transition-all relative ${form.getFieldValue('isActive') ? 'bg-[#0487e2]' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.getFieldValue('isActive') ? 'left-5' : 'left-1'}`} />
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={form.getFieldValue('isActive')}
                                    onChange={e => {
                                        form.setFieldsValue({ isActive: e.target.checked });
                                        // Update state to trigger re-render of this checkbox
                                        setSubmitting(s => s);
                                    }}
                                />
                            </label>
                        </div>
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
                            Xác nhận khởi tạo
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}