import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Hash } from 'lucide-react';
import { Table, Button, Input, Modal, Form, Tag, message, Spin, Tooltip, Empty } from 'antd';
import { getGradeLevels, createGradeLevel } from '../../api/gradeApi';

export default function GradeManagement() {
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const fetchGrades = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getGradeLevels();
            const data = response?.data?.items || response?.items || response?.data || response || [];
            setGrades(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Lỗi khi tải danh sách khối lớp:', error);
            message.error('Không thể kết nối máy chủ để tải danh sách khối lớp');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGrades();
    }, [fetchGrades]);

    const handleOpenModal = () => {
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);
            await createGradeLevel(values);
            message.success('Thêm khối lớp mới thành công!');
            handleCloseModal();
            fetchGrades();
        } catch (error) {
            console.error('Lỗi khi thêm khối lớp:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo khối lớp');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredGrades = grades.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            title: 'Tên Khối/Lớp',
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
                <span className="font-bold text-slate-700">{text}</span>
            )
        },
        {
            title: 'Mã định danh',
            dataIndex: 'code',
            key: 'code',
            render: (code) => (
                <Tag className="rounded-md font-mono font-bold border-none bg-slate-100 text-slate-500 uppercase px-2 py-0.5">
                    {code}
                </Tag>
            )
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            render: (desc) => <span className="text-slate-500 text-sm">{desc || '---'}</span>
        },
        {
            title: 'Thứ tự',
            dataIndex: 'sortOrder',
            key: 'sortOrder',
            render: (order) => <span className="font-medium text-slate-500">{order || 0}</span>
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'right',
            render: (_, record) => (
                <div className="flex items-center justify-end gap-1">
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<Edit size={16} />} className="text-slate-400 hover:text-[#0487e2]" />
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <header className="flex flex-row justify-between items-center mb-10">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Quản lý Khối lớp</h1>
                        <p className="text-slate-500 text-sm mt-1">Thiết lập các cấp độ học tập cho hệ thống.</p>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<Plus size={18} />}
                        onClick={handleOpenModal}
                        className="bg-[#0487e2] hover:bg-[#0463ca] h-11 px-6 rounded-lg font-semibold shadow-md border-none flex items-center"
                    >
                        Thêm Khối lớp
                    </Button>
                </header>

                {/* Filters Section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <Input
                            placeholder="Tìm kiếm khối lớp theo mã hoặc tên..."
                            prefix={<Search size={18} className="text-slate-400" />}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="flex-1 h-11 rounded-lg border-slate-200 focus:border-[#0487e2] shadow-none"
                            allowClear
                        />
                    </div>
                </div>

                {/* Table Content */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Spin size="large" />
                            <p className="mt-4 text-slate-500 font-medium">Đang tải dữ liệu khối lớp...</p>
                        </div>
                    ) : filteredGrades.length === 0 ? (
                        <div className="py-20 text-center">
                            <Empty description={<span className="text-slate-400">Chưa có dữ liệu khối lớp nào</span>} />
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={filteredGrades}
                            rowKey="id"
                            pagination={{ pageSize: 10, showSizeChanger: false }}
                            className="custom-table"
                        />
                    )}
                </div>
            </div>

            {/* Modal Setup */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-[#0463ca] uppercase text-xs font-black tracking-widest pt-2">
                        <Plus size={16} />
                        Thêm cấu hình khối lớp mới
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
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mã khối lớp</span>}
                            name="code"
                            rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
                        >
                            <Input placeholder="VD: G10" className="h-11 rounded-lg font-bold uppercase" prefix={<Hash size={16} className="text-slate-400" />} />
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Thứ tự ưu tiên</span>}
                            name="sortOrder"
                        >
                            <Input type="number" placeholder="0" className="h-11 rounded-lg" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tên Khối/Lớp (Việt hóa)</span>}
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                    >
                        <Input placeholder="VD: Khối lớp 10" className="h-11 rounded-lg font-bold" />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Thông tin mô tả</span>}
                        name="description"
                    >
                        <Input.TextArea rows={3} placeholder="Mô tả tóm tắt về khối lớp này..." className="rounded-lg" />
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
                            className="flex-1 bg-[#0487e2] h-11 rounded-lg font-bold uppercase text-xs tracking-widest shadow-md shadow-[#0487e2]/20 border-none"
                        >
                            Xác nhận tạo
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
