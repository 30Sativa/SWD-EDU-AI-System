import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    FolderOpen,
    FileQuestion,
    BrainCircuit,
    PenTool,
    Trash2,
    Eye,
    Edit,
    Layers,
    Clock,
    User,
    ListFilter
} from 'lucide-react';
import {
    Table,
    Button,
    Input,
    Tag,
    Select,
    Tooltip,
    Empty,
    Avatar
} from 'antd';

export default function QuestionBank() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Mock data for manager view - includes "author" field
    const questionFolders = [
        {
            id: 1,
            title: 'Hàm số bậc hai',
            code: 'MATH10-C2-L1',
            subject: 'Toán học',
            grade: 'Lớp 10',
            author: 'Nguyễn Văn Hùng',
            questionCount: 45,
            aiGenerated: 20,
            manual: 25,
            lastUpdated: '2 giờ trước',
            status: 'Active',
            difficulty: 'Trung bình'
        },
        {
            id: 2,
            title: 'Phương trình lượng giác',
            code: 'MATH11-C1-L3',
            subject: 'Toán học',
            grade: 'Lớp 11',
            author: 'Trần Thị Mai',
            questionCount: 32,
            aiGenerated: 15,
            manual: 17,
            lastUpdated: '1 ngày trước',
            status: 'Active',
            difficulty: 'Khó'
        },
        {
            id: 3,
            title: 'Động lực học chất điểm',
            code: 'PHYS10-C2-L5',
            subject: 'Vật lý',
            grade: 'Lớp 10',
            author: 'Lê Văn Lâm',
            questionCount: 28,
            aiGenerated: 28,
            manual: 0,
            lastUpdated: '3 ngày trước',
            status: 'Draft',
            difficulty: 'Dễ'
        },
        {
            id: 4,
            title: 'Di truyền học',
            code: 'BIO12-C3-L1',
            subject: 'Sinh học',
            grade: 'Lớp 12',
            author: 'Phạm Thị Lan',
            questionCount: 50,
            aiGenerated: 10,
            manual: 40,
            lastUpdated: '5 ngày trước',
            status: 'Active',
            difficulty: 'Khó'
        },
        {
            id: 5,
            title: 'Thì hiện tại hoàn thành',
            code: 'ENG10-U2-GR',
            subject: 'Tiếng Anh',
            grade: 'Lớp 10',
            author: 'David Nguyen',
            questionCount: 60,
            aiGenerated: 30,
            manual: 30,
            lastUpdated: '1 tuần trước',
            status: 'Active',
            difficulty: 'Trung bình'
        }
    ];

    const filteredData = questionFolders.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.author.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesStatus = true;
        if (statusFilter !== 'all') {
            const isActive = item.status === 'Active';
            if (statusFilter === 'active') matchesStatus = isActive;
            if (statusFilter === 'draft') matchesStatus = !isActive;
        }

        return matchesSearch && matchesStatus;
    });

    const columns = [
        {
            title: 'CHỦ ĐỀ',
            key: 'topic',
            width: 300,
            render: (_, record) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-sm border border-indigo-100 shrink-0">
                        <FolderOpen size={24} />
                    </div>
                    <div className="min-w-0">
                        <div className="font-bold text-slate-700 text-[15px] truncate">{record.title}</div>
                        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{record.code}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'NGƯỜI TẠO',
            key: 'author',
            width: 200,
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <Avatar size={32} style={{ backgroundColor: '#fde3cf', color: '#f56a00' }}>{record.author.charAt(0)}</Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{record.author}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Giáo viên</span>
                    </div>
                </div>
            )
        },
        {
            title: 'MÔN HỌC',
            key: 'subject',
            render: (_, record) => (
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-slate-700">{record.subject}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Layers size={12} className="text-slate-400" />
                        {record.grade}
                    </span>
                </div>
            )
        },
        {
            title: 'THỐNG KÊ',
            key: 'stats',
            render: (_, record) => (
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs" title="Tổng số câu hỏi">
                            <FileQuestion size={14} className="text-slate-400" />
                            {record.questionCount}
                        </div>
                        <Tag
                            color={record.difficulty === 'Dễ' ? 'success' : record.difficulty === 'Trung bình' ? 'warning' : 'error'}
                            className="m-0 border-none px-1.5 text-[10px] font-bold uppercase"
                        >
                            {record.difficulty}
                        </Tag>
                    </div>
                </div>
            )
        },
        {
            title: 'CẬP NHẬT',
            key: 'updated',
            render: (_, record) => (
                <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <Clock size={12} />
                    {record.lastUpdated}
                </div>
            )
        },
        {
            title: 'TRẠNG THÁI',
            key: 'status',
            align: 'center',
            render: (_, record) => {
                const isActive = record.status === 'Active';
                return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${isActive
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {isActive ? 'Sẵn sàng' : 'Nháp'}
                    </span>
                );
            }
        },
        {
            title: 'TÁC VỤ',
            key: 'action',
            align: 'right',
            render: (_, record) => (
                <div className="flex items-center justify-end gap-2">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<Eye size={16} />}
                            className="text-slate-400 hover:text-[#0487e2] hover:bg-blue-50"
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<Edit size={16} />}
                            className="text-slate-400 hover:text-[#0487e2] hover:bg-blue-50"
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<Trash2 size={16} />}
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        />
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Ngân hàng câu hỏi (Toàn biên)</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Quản lý toàn bộ kho câu hỏi của tất cả giảng viên trong hệ thống.</p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            className="h-11 px-5 rounded-lg font-bold border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                        >
                            Import / Export
                        </Button>
                        <Button
                            type="primary"
                            icon={<Plus size={18} />}
                            className="bg-[#0487e2] hover:bg-[#0374c4] h-11 px-6 rounded-lg font-bold shadow-md border-none flex items-center gap-2"
                        >
                            Tạo chủ đề mới
                        </Button>
                    </div>
                </header>

                {/* Main Content Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

                    {/* Toolbar */}
                    <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="text-sm font-medium text-slate-500">
                            Hiển thị {filteredData.length} chủ đề
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <Input
                                placeholder="Tìm kiếm bộ câu hỏi, giáo viên..."
                                prefix={<Search size={16} className="text-slate-400" />}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="h-10 w-full md:w-64 rounded-lg border-slate-200 bg-white hover:border-[#0487e2] focus:border-[#0487e2]"
                                allowClear
                            />

                            <Select
                                defaultValue="all-subjects"
                                className="w-40 h-10 [&>.ant-select-selector]:!rounded-lg [&>.ant-select-selector]:!border-slate-200 [&>.ant-select-selector]:!h-10 [&>.ant-select-selector]:!flex [&>.ant-select-selector]:!items-center"
                                options={[
                                    { value: 'all-subjects', label: 'Tất cả môn học' },
                                    { value: 'math', label: 'Toán học' },
                                    { value: 'physics', label: 'Vật lý' },
                                    { value: 'english', label: 'Tiếng Anh' }
                                ]}
                            />

                            <Select
                                value={statusFilter}
                                onChange={setStatusFilter}
                                className="w-40 h-10 [&>.ant-select-selector]:!rounded-lg [&>.ant-select-selector]:!border-slate-200 [&>.ant-select-selector]:!h-10 [&>.ant-select-selector]:!flex [&>.ant-select-selector]:!items-center"
                                options={[
                                    { value: 'all', label: 'Tất cả trạng thái' },
                                    { value: 'active', label: 'Sẵn sàng' },
                                    { value: 'draft', label: 'Nháp' }
                                ]}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: false,
                            className: "px-5 py-4"
                        }}
                        className="custom-table"
                        locale={{
                            emptyText: (
                                <div className="py-12 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                        <FolderOpen size={32} />
                                    </div>
                                    <Empty description={<span className="text-slate-400 font-medium">Không tìm thấy dữ liệu nào</span>} />
                                </div>
                            )
                        }}
                        onRow={(record) => ({
                            onClick: () => { }, // navigate to detail if needed
                            className: "cursor-pointer hover:bg-slate-50 transition-colors"
                        })}
                    />
                </div>
            </div>
        </div>
    );
}
