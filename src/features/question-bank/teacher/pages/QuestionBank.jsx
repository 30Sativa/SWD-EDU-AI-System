import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    FolderOpen,
    FileQuestion,
    Clock,
    ChevronRight,
    ArrowRightLeft,
    TrendingUp,
    Zap,
    Download,
    Eye,
    Layers,
    CheckCircle2
} from 'lucide-react';
import {
    Table,
    Button,
    Input,
    Tag,
    Select,
    Tooltip,
    Empty,
    message,
    Spin,
    Card,
    Progress
} from 'antd';
import { getQuestionBankSummary } from '../../../quiz/teacher/api/quizApi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function QuestionBank() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [bankData, setBankData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchSummary = useCallback(async () => {
        try {
            setLoading(true);
            const resp = await getQuestionBankSummary();
            // From provided JSON, data is an array
            setBankData(resp.data || []);
        } catch (error) {
            console.error("Lỗi khi tải thống kê ngân hàng:", error);
            message.error("Không thể tải dữ liệu ngân hàng câu hỏi");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    const filteredData = bankData.filter(item => {
        const matchesSearch = 
            (item.topicName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.topicCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.courseName || '').toLowerCase().includes(searchTerm.toLowerCase());

        let matchesStatus = true;
        if (statusFilter !== 'all') {
            matchesStatus = item.status === statusFilter;
        }

        return matchesSearch && matchesStatus;
    });

    const totalQuestionsInBank = bankData.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0);
    const totalTopics = bankData.length;

    const columns = [
        {
            title: 'CHỦ ĐỀ / BÀI HỌC',
            key: 'topic',
            width: 320,
            render: (_, record) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100 shrink-0">
                        <FolderOpen size={22} />
                    </div>
                    <div className="min-w-0">
                        <div className="font-bold text-slate-800 text-[15px] truncate group-hover:text-[#0487e2] transition-colors">
                            {record.topicName}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                {record.topicCode}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">•</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[120px]">
                                {record.courseName}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'THÔNG TIN CHUNG',
            key: 'info',
            render: (_, record) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">{record.grade}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium">
                        {record.courseName}
                    </span>
                </div>
            )
        },
        {
            title: 'THỐNG KÊ CÂU HỎI',
            key: 'stats',
            width: 250,
            render: (_, record) => {
                const total = record.totalQuestions || 0;
                const { easy = 0, medium = 0, hard = 0 } = record.stats || {};
                
                return (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                <FileQuestion size={16} className="text-[#0487e2]" />
                                {total} <span className="text-[10px] text-slate-400 font-bold uppercase">câu</span>
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-1 w-full h-1.5 rounded-full overflow-hidden bg-slate-100">
                            {easy > 0 && <div style={{ width: `${(easy/total)*100}%` }} className="h-full bg-emerald-400" />}
                            {medium > 0 && <div style={{ width: `${(medium/total)*100}%` }} className="h-full bg-amber-400" />}
                            {hard > 0 && <div style={{ width: `${(hard/total)*100}%` }} className="h-full bg-rose-400" />}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-tighter text-emerald-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {easy} Dễ
                            </div>
                            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-tighter text-amber-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {medium} TB
                            </div>
                            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-tighter text-rose-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> {hard} Khó
                            </div>
                        </div>
                    </div>
                );
            }
        },
        {
            title: 'CẬP NHẬT',
            key: 'updated',
            render: (_, record) => (
                <div className="text-xs text-slate-500 font-bold flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-slate-400" />
                        {dayjs(record.lastUpdated).fromNow()}
                    </div>
                    <span className="text-[10px] text-slate-300 font-medium">
                        {dayjs(record.lastUpdated).format('DD/MM/YYYY')}
                    </span>
                </div>
            )
        },
        {
            title: 'TRẠNG THÁI',
            key: 'status',
            align: 'center',
            render: (_, record) => {
                const isReady = record.status === 'Sẵn sàng';
                return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isReady
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isReady ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        {record.status}
                    </span>
                );
            }
        },
        {
            title: '',
            key: 'action',
            align: 'right',
            render: (_, record) => (
                <Button
                    type="text"
                    icon={<ChevronRight size={18} />}
                    className="text-slate-300 hover:text-[#0487e2] hover:bg-blue-50 transition-all rounded-lg"
                    onClick={(e) => {
                        e.stopPropagation();
                        const type = record.topicName === record.courseName ? 'course' : 'lesson';
                        navigate(`/dashboard/teacher/question-bank/${record.topicId}?type=${type}`);
                    }}
                />
            )
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Spin size="large" />
                <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Đang tải ngân hàng câu hỏi...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Section */}
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Kho Ngân Hàng Câu Hỏi</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium italic opacity-80">
                            Tổ chức, lọc và tái sử dụng nội dung giảng dạy của bạn một cách hiệu quả.
                        </p>
                    </div>


                </header>

                {/* Dashboard Stats Banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="rounded-2xl border-none shadow-sm bg-indigo-600 text-white overflow-hidden relative group p-1">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                                    <FileQuestion size={20} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">TỔNG SỐ CÂU HỎI</span>
                            </div>
                            <div className="text-4xl font-bold mb-1">{totalQuestionsInBank}</div>
                            <div className="text-[11px] font-bold opacity-70 italic">Có sẵn trong kho lưu trữ của bạn</div>
                        </div>
                        <Zap className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 group-hover:rotate-12 transition-transform duration-500" />
                    </Card>

                    <Card className="rounded-2xl border border-slate-100 shadow-sm bg-white overflow-hidden relative group p-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                                <Layers size={20} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">CHƯƠNG & BÀI HỌC</span>
                        </div>
                        <div className="text-4xl font-bold text-slate-900 mb-1">{totalTopics}</div>
                        <div className="text-[11px] font-bold text-slate-500 tracking-tight flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-emerald-500" /> 100% Đã được phân loại
                        </div>
                    </Card>

                    <Card className="rounded-2xl border border-slate-100 shadow-sm bg-white overflow-hidden relative group p-1">
                         <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                                <TrendingUp size={20} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ĐỘ PHỦ KIẾN THỨC</span>
                        </div>
                        <div className="text-4xl font-bold text-slate-900 mb-1">92%</div>
                        <Progress percent={92} showInfo={false} strokeColor="#f59e0b" className="m-0 mt-2" />
                        <div className="text-[11px] font-bold text-slate-500 mt-2 italic opacity-70">Dựa trên chương trình chuẩn</div>
                    </Card>
                </div>

                {/* Main Table Area */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                    
                    {/* Toolbar */}
                    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-end border-b border-slate-100">
                        <div className="flex items-end gap-6 w-full md:w-auto">
                            <div className="flex-1 md:flex-initial">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">TÌM KIẾM CHỦ ĐỀ</label>
                                <Input
                                    placeholder="Tìm kiếm theo tên, mã hoặc môn học..."
                                    prefix={<Search size={18} className="text-slate-300" />}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="h-12 w-full md:w-80 rounded-xl border-slate-200 text-sm font-medium transition-all"
                                    allowClear
                                />
                            </div>

                            <div className="w-full md:w-48">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">TRẠNG THÁI</label>
                                <Select
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                    className="w-full h-12 custom-select [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-slate-200"
                                    options={[
                                        { value: 'all', label: 'Tất cả trạng thái' },
                                        { value: 'Sẵn sàng', label: 'Sẵn sàng' },
                                        { value: 'Nháp', label: 'Đang soạn' }
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                icon={<Filter size={18} />}
                                className="h-12 w-12 rounded-xl border-slate-200 text-slate-400 hover:text-[#0463ca] hover:border-[#0463ca] flex items-center justify-center transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="px-4 pb-4">
                        <Table
                            columns={columns}
                            dataSource={filteredData}
                            rowKey="topicId"
                            pagination={{
                                pageSize: 12,
                                showSizeChanger: false,
                                className: "px-8 py-6",
                                position: ['bottomCenter']
                            }}
                            className="question-bank-table"
                            rowClassName="group cursor-pointer hover:bg-blue-50/30 transition-all duration-300"
                            onRow={(record) => ({
                                onClick: () => {
                                    const type = record.topicName === record.courseName ? 'course' : 'lesson';
                                    navigate(`/dashboard/teacher/question-bank/${record.topicId}?type=${type}`);
                                }
                            })}
                            locale={{
                                emptyText: (
                                    <div className="py-20 flex flex-col items-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-200">
                                            <FolderOpen size={40} />
                                        </div>
                                        <Empty description={
                                            <div className="space-y-1">
                                                <p className="text-slate-700 font-bold text-base">Không tìm thấy chủ đề nào</p>
                                                <p className="text-slate-400 text-sm font-medium">Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                                            </div>
                                        } />
                                    </div>
                                )
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Aesthetic Overlays */}
            <style dangerouslySetInnerHTML={{ __html: `
                .question-bank-table .ant-table-thead > tr > th {
                    background: transparent;
                    border-bottom: 2px solid #f8fafc;
                    padding: 20px 24px;
                    color: #94a3b8;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }
                .question-bank-table .ant-table-tbody > tr > td {
                    padding: 20px 24px;
                    border-bottom: 1px solid #f8fafc;
                }
                .question-bank-table .ant-table-row:last-child td {
                    border-bottom: none;
                }
                .ant-progress-inner {
                    background-color: #f1f5f9 !important;
                }
            ` }} />
        </div>
    );
}

