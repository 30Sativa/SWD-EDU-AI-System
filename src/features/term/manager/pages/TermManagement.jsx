import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Calendar, Edit, X } from 'lucide-react';
import { Table, Button, Input, Modal, Form, Tag, message, Spin, Tooltip, Empty, DatePicker } from 'antd';
import { getTerms, createTerm } from '../../api/termApi';
import dayjs from 'dayjs';

export default function TermManagement() {
    const [loading, setLoading] = useState(true);
    const [terms, setTerms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
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

    const handleCreateSubmit = async (values) => {
        try {
            setSubmitting(true);
            const payload = {
                ...values,
                startDate: values.startDate ? dayjs(values.startDate).format('YYYY-MM-DD') : null,
                endDate: values.endDate ? dayjs(values.endDate).format('YYYY-MM-DD') : null,
            };
            console.log('Term Payload:', payload);
            await createTerm(payload);
            message.success('Tạo kỳ học mới thành công!');
            setIsModalOpen(false);
            form.resetFields();
            fetchTerms();
        } catch (error) {
            console.error('Create Term Error:', error);
            if (error.response && error.response.data && error.response.data.errors) {
                // Inspect validation errors if available
                const errorMsg = Object.values(error.response.data.errors).flat().join(', ');
                message.error(errorMsg || 'Lỗi dữ liệu không hợp lệ');
            } else {
                message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo kỳ học');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenModal = () => {
        form.resetFields();
        setIsModalOpen(true);
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
                onCancel={() => setIsModalOpen(false)}
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
                        <h3 className="text-xl font-bold text-slate-800">Thêm Kỳ Học Mới</h3>
                        <p className="text-slate-500 text-sm mt-1">Tạo kỳ học mới cho hệ thống</p>
                    </div>

                    <Form form={form} layout="vertical" onFinish={handleCreateSubmit} className="space-y-4">
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
                            <Button className="flex-1 h-11 rounded-xl font-semibold border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => setIsModalOpen(false)}>Hủy bỏ</Button>
                            <Button type="primary" htmlType="submit" loading={submitting} className="flex-1 h-11 rounded-xl bg-[#0487e2] font-bold shadow-lg shadow-blue-200 border-none">Tạo Mới</Button>
                        </div>
                    </Form>
                </div>
            </Modal>
        </div>
    );
}
