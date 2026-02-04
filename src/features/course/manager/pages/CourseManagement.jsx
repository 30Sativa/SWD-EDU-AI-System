import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    BookOpen,
    MoreVertical,
    Filter,
    LayoutGrid,
    List as ListIcon,
    Calendar,
    Layers,
    CheckCircle2,
    AlertCircle,
    Eye,
    Edit
} from 'lucide-react';
import {
    Table,
    Button,
    Input,
    Tag,
    message,
    Spin,
    Select,
    Empty,
    Tooltip
} from 'antd';
import { getCourses } from '../../api/courseApi';

export default function CourseManagement() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getCourses();
            // Robust extraction handling { success, data: { items } } or { success, data: [...] }
            const data = res?.data?.items || res?.items || res?.data || res || [];
            setCourses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Lỗi khi tải danh sách khóa học:', error);
            message.error('Không thể kết nối máy chủ để tải danh sách khóa học');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const filteredCourses = courses.filter(course =>
        (course.title || course.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            title: 'Khóa học',
            key: 'course',
            render: (_, record) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-blue-50 flex items-center justify-center text-[#0487e2] shadow-sm shrink-0 border border-slate-100 relative group/thumb">
                        {record.thumbnail ? (
                            <img src={record.thumbnail} alt={record.title} className="w-full h-full object-cover transition-transform group-hover/thumb:scale-110" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                            <BookOpen size={24} />
                        )}
                        {record.isFeatured && (
                            <div className="absolute top-0 right-0 p-1">
                                <div className="w-2 h-2 bg-amber-400 rounded-full shadow-sm ring-2 ring-white" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-base leading-tight truncate">{record.title || record.name}</span>
                            {record.isFeatured && (
                                <Tag color="gold" className="m-0 text-[8px] font-black uppercase px-1.5 leading-tight rounded-sm border-none bg-gradient-to-r from-amber-400 to-orange-500 text-white">VIP</Tag>
                            )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">{record.code}</span>
                    </div>
                </div>
            )
        },
        {
            title: 'Phân loại',
            key: 'level',
            render: (_, record) => (
                <div className="flex flex-col gap-1">
                    <Tag className="rounded-lg font-bold border-none bg-blue-50 text-blue-600 px-2 py-0 text-[10px] w-fit">
                        {record.level || 'Chưa định nghĩa'}
                    </Tag>
                    <span className="text-[10px] text-slate-500 font-bold px-1 flex items-center gap-1">
                        <Layers size={10} className="text-[#0487e2]" />
                        {record.subjectName || 'Khối lớp N/A'}
                    </span>
                </div>
            )
        },
        {
            title: 'Chỉ số tương tác',
            key: 'metrics',
            render: (_, record) => (
                <div className="space-y-1.5">
                    <div className="flex items-center gap-4">
                        <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                            <Users size={12} className="text-slate-400" />
                            {record.enrollmentCount || 0}
                        </div>
                        <div className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                            <CheckCircle2 size={12} fill="currentColor" className="text-amber-100" />
                            {record.rating || '0.0'}
                        </div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock size={10} />
                        {record.totalLessons || 0} bài • {Math.floor(record.totalDuration / 60) || 0}h {(record.totalDuration % 60) || 0}m
                    </div>
                </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const isActive = status === 'Active' || status === 'Published';
                return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${isActive
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                        {isActive ? 'Hoạt động' : 'Bản nháp'}
                    </span>
                );
            }
        },
        {
            title: '',
            key: 'action',
            align: 'right',
            render: () => (
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip title="Xem chi tiết">
                        <Button type="text" icon={<Eye size={18} />} className="text-slate-300 hover:text-[#0487e2]" />
                    </Tooltip>
                    <Tooltip title="Sửa nhanh">
                        <Button type="text" icon={<Edit size={18} />} className="text-slate-300 hover:text-[#0487e2]" />
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none">
                            Danh mục <span className="text-[#0487e2]">Khóa học</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-sm italic">Quản lý chuyên sâu các chương trình đào tạo của hệ thống.</p>
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        icon={<Plus size={20} />}
                        onClick={() => navigate('/dashboard/manager/courses/create')}
                        className="bg-[#0487e2] hover:bg-[#0374c4] h-14 px-8 rounded-[1.25rem] font-bold shadow-xl shadow-blue-200 border-none flex items-center gap-2 transition-all hover:-translate-y-1 hover:shadow-blue-300 active:scale-95"
                    >
                        Tạo Khóa học mới
                    </Button>
                </header>

                {/* Filters/Toolbar */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-4 md:p-6 backdrop-blur-sm bg-white/90 sticky top-4 z-10 mx-1">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative flex-1 w-full group">
                            <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0487e2] transition-colors" />
                            <Input
                                placeholder="Tìm khóa học chuyên sâu..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 rounded-xl border-none bg-slate-50 group-focus-within:bg-white transition-all text-base font-medium shadow-none group-focus-within:ring-2 ring-blue-100"
                                allowClear
                            />
                        </div>
                        <div className="flex gap-3 shrink-0">
                            <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100 flex items-center gap-1">
                                <Button type="text" className="h-10 rounded-lg bg-white shadow-sm text-[#0487e2] font-bold"><LayoutGrid size={18} /></Button>
                                <Button type="text" className="h-10 rounded-lg text-slate-400 hover:text-slate-600"><ListIcon size={18} /></Button>
                            </div>
                            <Select
                                defaultValue="all"
                                className="w-48 h-14 custom-select-v5"
                                options={[{ value: 'all', label: 'Mọi trạng thái' }]}
                            />
                        </div>
                    </div>
                </div>

                {/* Table/List View */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden min-h-[500px] mx-1">
                    {loading ? (
                        <div className="py-40 flex flex-col items-center justify-center space-y-6">
                            <div className="relative flex items-center justify-center">
                                <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-500 rounded-full animate-spin"></div>
                                <BookOpen className="absolute text-blue-500" size={20} />
                            </div>
                            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Synchronizing Data</p>
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="py-32 text-center flex flex-col items-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                                <BookOpen size={48} />
                            </div>
                            <Empty description={<span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Không có dữ liệu khóa học</span>} />
                            <Button type="link" onClick={() => navigate('/dashboard/manager/courses/create')} className="mt-4 font-black text-[#0487e2] uppercase text-xs">Phát triển khóa học ngay</Button>
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={filteredCourses}
                            rowKey="id"
                            pagination={{
                                pageSize: 8,
                                showSizeChanger: false,
                                className: "custom-pagination"
                            }}
                            rowClassName="group cursor-pointer"
                            onRow={(record) => ({
                                onClick: () => { } // Navigate to detail
                            })}
                            className="custom-course-table-v2"
                        />
                    )}
                </div>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-course-table-v2 .ant-table-thead > tr > th {
          background: #fafbfc !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          font-size: 10px !important;
          letter-spacing: 0.15em !important;
          color: #94a3b8 !important;
          padding: 1.5rem !important;
          border-bottom: 2px solid #f1f5f9 !important;
        }
        .custom-course-table-v2 .ant-table-tbody > tr > td {
          padding: 1.5rem !important;
          border-bottom: 1px solid #f8fafc !important;
          transition: all 0.3s !important;
        }
        .custom-course-table-v2 .ant-table-tbody > tr:hover > td {
          background-color: #fcfdfe !important;
        }
        .custom-select-v5 .ant-select-selector {
          height: 56px !important;
          border-radius: 0.75rem !important;
          border: none !important;
          background-color: #f8fafc !important;
          display: flex !important;
          align-items: center !important;
          font-weight: 700 !important;
        }
        .custom-pagination .ant-pagination-item-active {
           border-color: #0487e2 !important;
           border-radius: 8px !important;
        }
      `}} />
        </div>
    );
}
