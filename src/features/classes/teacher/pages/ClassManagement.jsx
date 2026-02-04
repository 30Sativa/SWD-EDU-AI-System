import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    LayoutGrid,
    List as ListIcon,
    Users,
    Calendar,
    MoreVertical,
    BookOpen,
    Filter,
    Clock,
    School
} from 'lucide-react';
import {
    Table,
    Button,
    Input,
    Tag,
    Dropdown,
    Menu,
    message,
    Spin,
    Empty,
    Tooltip
} from 'antd';
import { getClasses } from '../../api/classApi';

// --- Shared Components (Clean Admin Style) ---

const StatCard = ({ label, value, subtext, icon: Icon, color }) => {
    const colorMap = {
        blue: 'text-blue-600 bg-blue-50',
        emerald: 'text-emerald-600 bg-emerald-50',
        purple: 'text-purple-600 bg-purple-50',
        amber: 'text-amber-600 bg-amber-50',
    };

    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${colorMap[color] || colorMap.blue}`}>
                <Icon size={24} />
            </div>
            <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-0.5">{label}</p>
                <div className="text-2xl font-bold text-slate-800 leading-none">{value}</div>
                <p className="text-[10px] text-slate-400 font-bold mt-1.5 italic hidden md:block">{subtext}</p>
            </div>
        </div>
    );
};

const StatusBadge = ({ status, isActive }) => {
    // Priority to explicit isActive boolean, fallback to string check
    const active = isActive === true || isActive === 'true' || status === 'Active' || status === 'Hoạt động';
    return (
        <Tag color={active ? 'success' : 'default'} className="border-0 m-0 font-semibold px-2 py-0.5 rounded-md">
            {active ? 'Hoạt động' : 'Đã kết thúc'}
        </Tag>
    );
};

const ClassCard = ({ data, navigate }) => {
    return (
        <div
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group relative flex flex-col cursor-pointer overflow-hidden p-5"
            onClick={() => navigate(`/dashboard/teacher/classes/${data.id}/students`)}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0487e2] flex items-center justify-center shrink-0">
                    <School size={20} />
                </div>
                <StatusBadge status={data.status} isActive={data.isActive} />
            </div>

            <h3 className="font-bold text-base text-slate-800 mb-1 group-hover:text-[#0487e2] transition-colors line-clamp-1">
                {data.name || data.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-1">
                {data.code || 'Mã lớp: ---'}
            </p>

            <div className="space-y-2 mt-auto border-t border-slate-100 pt-3">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5"><Users size={14} /> Sĩ số</span>
                    <span className="font-bold text-slate-700">{data.studentCount || data.students || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5"><Calendar size={14} /> Khai giảng</span>
                    <span className="font-bold text-slate-700">{data.startDate ? new Date(data.startDate).toLocaleDateString('vi-VN') : '---'}</span>
                </div>
            </div>
        </div>
    );
};

export default function ClassManagement() {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const res = await getClasses();
            const data = res?.data?.items || res?.items || res?.data || [];

            // Fallback mock data if API returns nothing (for development)
            if (Array.isArray(data) && data.length === 0) {
                const mockData = [
                    { id: 1, name: 'Lớp Toán 10A1', code: 'MATH10A1', students: 35, startDate: '2024-09-05', isActive: true },
                    { id: 2, name: 'Lớp Lý 11B2', code: 'PHYS11B2', students: 28, startDate: '2024-09-06', isActive: true },
                    { id: 3, name: 'Lớp Hóa 12C3', code: 'CHEM12C3', students: 30, startDate: '2024-01-15', isActive: false },
                ];
                setClasses(mockData);
            } else {
                setClasses(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error(error);
            // Fallback on error too
            setClasses([
                { id: 1, name: 'Lớp Toán 10A1', code: 'MATH10A1', students: 35, startDate: '2024-09-05', isActive: true },
                { id: 2, name: 'Lớp Lý 11B2', code: 'PHYS11B2', students: 28, startDate: '2024-09-06', isActive: true },
            ]);
            // message.error('Không thể tải danh sách lớp học');
        } finally {
            setLoading(false);
        }
    };

    const filteredClasses = classes.filter(cls =>
        (cls.name || cls.title)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            title: 'LỚP HỌC',
            key: 'name',
            render: (_, record) => (
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate(`/dashboard/teacher/classes/${record.id}/students`)}>
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 group-hover:bg-blue-50 group-hover:text-[#0463ca] transition-colors">
                        <School size={18} />
                    </div>
                    <div>
                        <div className="font-bold text-slate-700 group-hover:text-[#0463ca] transition-colors">{record.name || record.title}</div>
                        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{record.code || '---'}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'SĨ SỐ',
            dataIndex: 'studentCount', // Try both keys
            key: 'students',
            align: 'center',
            render: (val, record) => <span className="font-semibold text-slate-600">{val || record.students || 0}</span>
        },
        {
            title: 'NGÀY KHAI GIẢNG',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (val) => <span className="text-slate-600 text-sm">{val ? new Date(val).toLocaleDateString('vi-VN') : '---'}</span>
        },
        {
            title: 'TRẠNG THÁI',
            key: 'status',
            align: 'center',
            render: (_, record) => <StatusBadge status={record.status} isActive={record.isActive} />
        },
        {
            title: 'TÁC VỤ',
            key: 'action',
            align: 'right',
            render: (_, record) => (
                <Button
                    type="text"
                    className="font-semibold text-slate-500 hover:text-[#0463ca] hover:bg-blue-50"
                    onClick={() => navigate(`/dashboard/teacher/classes/${record.id}/students`)}
                >
                    Chi tiết
                </Button>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Quản lý Lớp học</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Danh sách các lớp đang giảng dạy và theo dõi</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            type="primary"
                            icon={<Plus size={18} />}
                            className="bg-[#0487e2] hover:bg-[#0374c4] h-11 px-6 rounded-lg font-bold shadow-sm border-none flex items-center gap-2"
                        >
                            Tạo lớp mới
                        </Button>
                    </div>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                        label="Tổng số lớp"
                        value={classes.length}
                        subtext="Lớp đang phụ trách"
                        icon={BookOpen}
                        color="blue"
                    />
                    <StatCard
                        label="Tổng học viên"
                        value={classes.reduce((acc, c) => acc + (c.studentCount || c.students || 0), 0)}
                        subtext="Trong tất cả các lớp"
                        icon={Users}
                        color="emerald"
                    />
                    <StatCard
                        label="Lớp đang hoạt động"
                        value={classes.filter(c => c.isActive || c.status === 'Hoạt động').length}
                        subtext="Đang diễn ra"
                        icon={Clock}
                        color="purple"
                    />
                </div>

                {/* Toolbar */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Input
                        placeholder="Tìm kiếm lớp học, mã lớp..."
                        prefix={<Search size={18} className="text-slate-400" />}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="h-10 rounded-lg border-slate-200 max-w-sm font-medium"
                    />

                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#0487e2]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <ListIcon size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#0487e2]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Spin size="large" />
                        </div>
                    ) : filteredClasses.length === 0 ? (
                        <div className="py-24 text-center">
                            <Empty description="Không tìm thấy dữ liệu" />
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredClasses.map(cls => (
                                <ClassCard key={cls.id} data={cls} navigate={navigate} />
                            ))}
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={filteredClasses}
                            rowKey="id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: false,
                                className: "px-6 py-4"
                            }}
                            rowClassName="hover:bg-slate-50 transition-colors"
                        />
                    )}
                </div>

            </div>
        </div>
    );
}