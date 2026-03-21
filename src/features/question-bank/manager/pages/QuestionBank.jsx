import React, { useState, useEffect } from 'react';
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
    ListFilter,
    RefreshCw
} from 'lucide-react';
import {
    Table,
    Button,
    Input,
    Tag,
    Select,
    Tooltip,
    Empty,
    Avatar,
    message,
    Spin
} from 'antd';
import { getManagerQuestionBankSummary } from '../api/questionBankApi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function QuestionBank() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [summaryData, setSummaryData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const response = await getManagerQuestionBankSummary();
            if (response.success) {
                setSummaryData(response.data || []);
            } else {
                message.error(response.message || "Không thể tải dữ liệu ngân hàng câu hỏi");
            }
        } catch (error) {
            console.error("Error fetching summary:", error);
            message.error("Lỗi kết nối máy chủ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    const filteredData = (summaryData || []).filter(item => {
        const matchesSearch =
            (item.topicName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.topicCode || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.courseName || "").toLowerCase().includes(searchTerm.toLowerCase());

        let matchesStatus = true;
        if (statusFilter !== 'all') {
            const isActive = item.status === 'Sẵn sàng' || item.status === 'Active';
            if (statusFilter === 'active') matchesStatus = isActive;
            if (statusFilter === 'draft') matchesStatus = !isActive;
        }

        return matchesSearch && matchesStatus;
    });

    const columns = [
        {
            title: 'CHỦ ĐỀ / BÀI HỌC',
            key: 'topic',
            width: 320,
            render: (_, record) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-sm border border-indigo-100 shrink-0">
                        <FolderOpen size={24} />
                    </div>
                    <div className="min-w-0">
                        <div className="font-bold text-slate-700 text-[15px] truncate">{record.topicName}</div>
                        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{record.topicCode}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'KHÓA HỌC / LỚP',
            key: 'course',
            width: 250,
            render: (_, record) => (
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-slate-700">{record.courseName}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Layers size={12} className="text-slate-400" />
                        {record.grade}
                    </span>
                </div>
            )
        },
        {
            title: 'THỐNG KÊ CÂU HỎI',
            key: 'stats',
            width: 250,
            render: (_, record) => (
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
                        <FileQuestion size={16} className="text-slate-400" />
                        {record.totalQuestions} câu hỏi
                    </div>
                    <div className="flex gap-1">
                        <Tooltip title="Dễ">
                            <Tag className="m-0 border-none px-1.5 text-[10px] bg-emerald-50 text-emerald-600 font-bold uppercase">{record.stats?.easy || 0} Dễ</Tag>
                        </Tooltip>
                        <Tooltip title="Vừa">
                            <Tag className="m-0 border-none px-1.5 text-[10px] bg-orange-50 text-orange-600 font-bold uppercase">{record.stats?.medium || 0} Vừa</Tag>
                        </Tooltip>
                        <Tooltip title="Khó">
                            <Tag className="m-0 border-none px-1.5 text-[10px] bg-rose-50 text-rose-600 font-bold uppercase">{record.stats?.hard || 0} Khó</Tag>
                        </Tooltip>
                    </div>
                </div>
            )
        },
        {
            title: 'CẬP NHẬT',
            key: 'updated',
            width: 150,
            render: (_, record) => (
                <div className="text-xs text-slate-500 font-medium flex flex-col gap-1">
                    <span className="flex items-center gap-1.5">
                        <Clock size={12} />
                        {dayjs(record.lastUpdated).fromNow()}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-tighter">
                        {dayjs(record.lastUpdated).format('DD/MM/YYYY')}
                    </span>
                </div>
            )
        },
        {
            title: 'TRẠNG THÁI',
            key: 'status',
            align: 'center',
            width: 150,
            render: (_, record) => {
                const isActive = record.status === 'Sẵn sàng' || record.status === 'Active';
                return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${isActive
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {isActive ? 'Hoạt động' : 'Đang xử lý'}
                    </span>
                );
            }
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Quản lý Ngân hàng Câu hỏi</h1>
                            <Tag color="blue" className="rounded-md font-bold text-[10px] uppercase border-none px-2 shadow-sm"> MANAGER</Tag>
                        </div>
                        <p className="text-slate-500 text-[15px] font-medium max-w-2xl">
                            Kiểm soát toàn bộ kho tài nguyên học thuật bao gồm câu hỏi tự soạn và câu hỏi tạo từ AI của toàn giảng viên.
                        </p>
                    </div>


                </header>

                {/* Stats Cards - Optional enhancement */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><FileQuestion /></div>
                        <div>
                            <div className="text-2xl font-black text-slate-800">{(summaryData || []).reduce((acc, curr) => acc + curr.totalQuestions, 0)}</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tổng câu hỏi</div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><FolderOpen /></div>
                        <div>
                            <div className="text-2xl font-black text-slate-800">{(summaryData || []).length}</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Chủ đề / Bài học</div>
                        </div>
                    </div>
                    {/* Add more stats if needed */}
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">

                    {/* Toolbar */}
                    <div className="px-6 py-5 bg-white border-b border-slate-100 flex flex-col lg:flex-row gap-5 justify-between items-center">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                            <ListFilter size={18} className="text-indigo-500" />
                            Hiển thị {filteredData.length} danh mục nội dung
                        </div>

                        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                            <Input
                                placeholder="Tìm kiếm tên chủ đề, mã bài hoặc khóa học..."
                                prefix={<Search size={18} className="text-slate-400" />}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="h-12 w-full lg:w-80 rounded-xl border-slate-200 bg-slate-50 hover:bg-white hover:border-[#0487e2] focus:bg-white focus:border-[#0487e2]"
                                allowClear
                            />


                        </div>
                    </div>

                    {/* Table */}
                    <Spin spinning={loading} tip="Đang tải dữ liệu...">
                        <Table
                            columns={columns}
                            dataSource={filteredData}
                            rowKey="topicId"
                            onRow={(record) => ({
                                onClick: () => navigate(`/dashboard/manager/question-bank/topic/${record.topicId}`),
                            })}
                            rowClassName="cursor-pointer hover:bg-slate-50 transition-colors"
                            pagination={{
                                pageSize: 8,
                                showSizeChanger: true,
                                pageSizeOptions: ['8', '16', '32'],
                                className: "px-6 py-5 border-t border-slate-50",
                                showTotal: (total, range) => <span className="text-xs font-bold text-slate-400">{range[0]}-{range[1]} của {total} kết quả</span>
                            }}
                            className="manager-table-v2"
                            locale={{
                                emptyText: (
                                    <div className="py-20 flex flex-col items-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                                            <FolderOpen size={40} />
                                        </div>
                                        <Empty description={
                                            <div className="space-y-1">
                                                <div className="text-slate-600 font-bold text-lg">Ngân hàng trống</div>
                                                <div className="text-slate-400 text-sm">Chưa có dữ liệu thống kê từ giáo viên.</div>
                                            </div>
                                        } />
                                    </div>
                                )
                            }}
                        />
                    </Spin>
                </div>
            </div>
        </div>
    );
}
