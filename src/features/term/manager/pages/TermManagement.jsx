import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Calendar, Edit, X, Trash2, Power } from 'lucide-react';
import { Table, Button, Input, Modal, Form, Tag, message, Spin, Tooltip, Empty, DatePicker, Popconfirm } from 'antd';
import { getTerms, createTerm, updateTerm, deleteTerm, changeTermStatus } from '../../api/termApi';
import dayjs from 'dayjs';

export default function TermManagement() {
    const [loading, setLoading] = useState(true);
    const [terms, setTerms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingTerm, setEditingTerm] = useState(null);
    const [form] = Form.useForm();

    const fetchTerms = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getTerms();
            const data = response?.data?.items || response?.items || response?.data || response || [];
            setTerms(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Lỗi khi tải danh sách kỳ học:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTerms();
    }, [fetchTerms]);

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);
            const payload = {
                ...values,
                startDate: values.startDate ? dayjs(values.startDate).format('YYYY-MM-DD') : null,
                endDate: values.endDate ? dayjs(values.endDate).format('YYYY-MM-DD') : null,
            };

            if (editingTerm) {
                await updateTerm(editingTerm.id, payload);
                message.success('Cập nhật kỳ học thành công!');
            } else {
                await createTerm(payload);
                message.success('Tạo kỳ học mới thành công!');
            }

            setIsModalOpen(false);
            form.resetFields();
            setEditingTerm(null);
            fetchTerms();
        } catch (error) {
            console.error('Term Submit Error:', error);
            if (error.response && error.response.data && error.response.data.errors) {
                const errorMsg = Object.values(error.response.data.errors).flat().join(', ');
                message.error(errorMsg || 'Lỗi dữ liệu không hợp lệ');
            } else {
                message.error(error.response?.data?.message || 'Có lỗi xảy ra');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenModal = () => {
        setEditingTerm(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEditClick = (record) => {
        setEditingTerm(record);
        form.setFieldsValue({
            code: record.code,
            name: record.name,
            startDate: record.startDate ? dayjs(record.startDate) : null,
            endDate: record.endDate ? dayjs(record.endDate) : null,
            description: record.description || '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await deleteTerm(id);
            message.success('Xóa kỳ học thành công');
            fetchTerms();
        } catch (error) {
            console.error('Delete Error:', error);
            message.error(error.response?.data?.message || 'Không thể xóa kỳ học này');
            setLoading(false);
        }
    };

    const handleToggleStatus = async (record) => {
        try {
            setLoading(true);
            await changeTermStatus(record.id, { isActive: !record.isActive });
            message.success('Cập nhật trạng thái thành công');
            fetchTerms();
        } catch (error) {
            console.error('Status Error:', error);
            message.error('Không thể cập nhật trạng thái');
            setLoading(false);
        }
    };

    const filteredTerms = terms.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            title: 'MÃ KỲ',
            dataIndex: 'code',
            key: 'code',
            render: (text) => (
                <div className="font-bold text-[#0487e2]">{text}</div>
            )
        },
        {
            title: 'TÊN KỲ HỌC',
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
                <div className="font-bold text-slate-700">{text}</div>
            )
        },
        {
            title: 'THỜI GIAN',
            key: 'time',
            render: (_, record) => {
                const start = record.startDate ? dayjs(record.startDate).format('DD/MM/YYYY') : '??';
                const end = record.endDate ? dayjs(record.endDate).format('DD/MM/YYYY') : '??';
                return (
                    <div className="text-xs font-semibold text-slate-500">
                        {start} - {end}
                    </div>
                )
            }
        },
        {
            title: 'MÔ TẢ',
            dataIndex: 'description',
            key: 'description',
            render: (text) => (
                <div className="text-slate-500 text-sm truncate max-w-xs">{text || '--'}</div>
            )
        },
        {
            title: 'TRẠNG THÁI',
            dataIndex: 'isActive',
            key: 'isActive',
            align: 'center',
            render: (isActive) => (
                <Tag color={isActive ? "success" : "default"} className="border-0 m-0">
                    {isActive ? "Đang hoạt động" : "Kết thúc"}
                </Tag>
            )
        },
        {
            title: 'THAO TÁC',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <div className="flex items-center justify-center gap-2">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<Edit size={16} />}
                            className="text-slate-400 hover:text-[#0487e2] hover:bg-blue-50"
                            onClick={() => handleEditClick(record)}
                        />
                    </Tooltip>
                    <Tooltip title={record.isActive ? "Tạm ngưng" : "Kích hoạt"}>
                        <Popconfirm
                            title="Xác nhận"
                            description={`Bạn có chắc muốn ${record.isActive ? "ngưng" : "mở"} kỳ học này?`}
                            onConfirm={() => handleToggleStatus(record)}
                            okText="Đồng ý"
                            cancelText="Hủy"
                        >
                            <Button
                                type="text"
                                icon={<Power size={16} />}
                                className={`hover:bg-slate-100 ${record.isActive ? 'text-amber-500 hover:text-amber-600' : 'text-emerald-500 hover:text-emerald-600'}`}
                            />
                        </Popconfirm>
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Xóa kỳ học"
                            description="Bạn có chắc chắn muốn xóa kỳ học này? Hành động không thể hoàn tác."
                            onConfirm={() => handleDelete(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Button
                                type="text"
                                danger
                                icon={<Trash2 size={16} />}
                                className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                            />
                        </Popconfirm>
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Quản lý Kỳ học</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Thiết lập và quản lý các kỳ học trong năm.</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<Plus size={18} />}
                        onClick={handleOpenModal}
                        className="bg-[#0487e2] hover:bg-[#0374c4] h-11 px-6 rounded-lg font-bold shadow-md border-none flex items-center"
                    >
                        Thêm Kỳ mới
                    </Button>
                </header>

                {/* Main Content */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="text-sm font-medium text-slate-500 pl-2">
                            Hiển thị {filteredTerms.length} kết quả
                        </div>
                        <div className="w-full md:w-auto">
                            <Input
                                placeholder="Tìm kiếm tên hoặc mã kỳ..."
                                prefix={<Search size={16} className="text-slate-400" />}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="h-9 w-full md:w-64 rounded-lg border-slate-200"
                            />
                        </div>
                    </div>

                    {/* Data Table */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Spin size="large" />
                            <p className="mt-4 text-slate-500 font-medium">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={filteredTerms}
                            rowKey="id"
                            pagination={{ pageSize: 12, showSizeChanger: false }}
                            className="custom-table"
                            locale={{
                                emptyText: <Empty description="Chưa có dữ liệu kỳ học" />
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Create Modal */}
            <Modal
                title={null}
                open={isModalOpen}
                onCancel={() => { setIsModalOpen(false); setEditingTerm(null); }}
                footer={null}
                centered
                width={480}
                closeIcon={<div className="p-1.5 bg-slate-100 rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={18} /></div>}
            >
                <div className="pt-6 px-2">
                    <div className="mb-6 text-center">
                        <div className="w-12 h-12 bg-blue-50 text-[#0487e2] rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Calendar size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{editingTerm ? 'Cập Nhật Kỳ Học' : 'Thêm Kỳ Học Mới'}</h3>
                        <p className="text-slate-500 text-sm mt-1">{editingTerm ? 'Chỉnh sửa thông tin kỳ học' : 'Tạo kỳ học mới cho hệ thống'}</p>
                    </div>

                    <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-4">
                        <Form.Item label="Mã Kỳ" name="code" rules={[{ required: true, message: 'Vui lòng nhập mã kỳ' }]}>
                            <Input className="h-11 rounded-xl bg-slate-50 border-transparent hover:bg-white focus:bg-white transition-all font-medium" placeholder="VD: FA24" />
                        </Form.Item>

                        <Form.Item label="Tên Kỳ Học" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên kỳ học' }]}>
                            <Input className="h-11 rounded-xl bg-slate-50 border-transparent hover:bg-white focus:bg-white transition-all font-medium" placeholder="VD: Fall 2024" />
                        </Form.Item>

                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item label="Ngày bắt đầu" name="startDate" rules={[{ required: true, message: 'Chọn ngày bắt đầu' }]}>
                                <DatePicker className="h-11 w-full rounded-xl bg-slate-50 border-transparent hover:bg-white focus:bg-white transition-all font-medium" format="DD/MM/YYYY" placeholder="DD/MM/YYYY" />
                            </Form.Item>
                            <Form.Item label="Ngày kết thúc" name="endDate" rules={[{ required: true, message: 'Chọn ngày kết thúc' }]}>
                                <DatePicker className="h-11 w-full rounded-xl bg-slate-50 border-transparent hover:bg-white focus:bg-white transition-all font-medium" format="DD/MM/YYYY" placeholder="DD/MM/YYYY" />
                            </Form.Item>
                        </div>

                        <Form.Item label="Mô tả" name="description">
                            <Input.TextArea rows={3} className="rounded-xl bg-slate-50 border-transparent hover:bg-white focus:bg-white transition-all font-medium" placeholder="Mô tả thêm về kỳ học..." />
                        </Form.Item>

                        <div className="flex gap-3 pt-2">
                            <Button className="flex-1 h-11 rounded-xl font-semibold border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => { setIsModalOpen(false); setEditingTerm(null); }}>Hủy bỏ</Button>
                            <Button type="primary" htmlType="submit" loading={submitting} className="flex-1 h-11 rounded-xl bg-[#0487e2] font-bold shadow-lg shadow-blue-200 border-none">{editingTerm ? 'Cập Nhật' : 'Tạo Mới'}</Button>
                        </div>
                    </Form>
                </div>
            </Modal>
        </div>
    );
}
