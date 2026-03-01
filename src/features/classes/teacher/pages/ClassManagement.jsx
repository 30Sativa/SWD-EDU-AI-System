import { Search, Filter, Users, Calendar, BookOpen, Layers, Edit, Eye, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getTeacherHomeroomClasses } from '../../api/classApi';
import { Spin, Table, Button, Input, Select, Tag, Tooltip, Empty, message } from 'antd';
import { getGradeLevels } from '../../../grade/api/gradeApi';
import { getTerms } from '../../../term/api/termApi';

function extractList(res) {
    if (!res) return [];
    const raw = res?.data?.items ?? res?.items ?? res?.data ?? res;
    return Array.isArray(raw) ? raw : [];
}

const ClassManagement = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [gradesMap, setGradesMap] = useState({});
    const [termsMap, setTermsMap] = useState({});

    useEffect(() => {
        const fetchDependencies = async () => {
            try {
                const [gradesRes, termsRes] = await Promise.all([
                    getGradeLevels(),
                    getTerms()
                ]);

                const gList = extractList(gradesRes);
                const tList = extractList(termsRes);

                const gMap = {};
                gList.forEach(g => { gMap[g.id] = g.name; });

                const tMap = {};
                tList.forEach(t => { tMap[t.id] = t.name; });

                setGradesMap(gMap);
                setTermsMap(tMap);
            } catch (err) {
                console.error('Lỗi tải dữ liệu phụ trợ:', err);
            }
        };
        fetchDependencies();

        const fetchClasses = async () => {
            try {
                setLoading(true);
                const res = await getTeacherHomeroomClasses();

                let allItems = extractList(res);
                setClasses(allItems);
            } catch (err) {
                console.error('Lỗi tải danh sách lớp:', err);
                message.error('Không thể tải danh sách lớp học');
                setClasses([]);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    const filteredClasses = classes.filter(c => {
        const term = searchTerm.toLowerCase();
        const title = (c.name ?? c.title ?? '').toLowerCase();
        const code = (c.code ?? '').toLowerCase();

        const matchesSearch = title.includes(term) || code.includes(term);

        let matchesStatus = true;
        if (statusFilter !== 'all') {
            const isActive = c.isActive !== false && c.status !== 'Archived';
            if (statusFilter === 'active') matchesStatus = isActive;
            if (statusFilter === 'archived') matchesStatus = !isActive;
        }

        return matchesSearch && matchesStatus;
    });

    const columns = [
        {
            title: 'LỚP HỌC',
            key: 'class',
            width: 300,
            render: (_, record) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shadow-sm border border-blue-100">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <div className="font-bold text-slate-700 text-[15px]">{record.name}</div>
                        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{record.code || '---'}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'THÔNG TIN',
            key: 'info',
            render: (_, record) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Layers size={14} className="text-slate-400" />
                        <span>{record.gradeName || gradesMap[record.gradeLevelId] || `Khối ${record.gradeLevelId || '?'}`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Calendar size={14} className="text-slate-400" />
                        <span>{record.termName || termsMap[record.termId] || 'Học kỳ -'}</span>
                    </div>
                </div>
            )
        },
        {
            title: 'SĨ SỐ',
            key: 'students',
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                        <Users size={16} />
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-slate-700">{record.currentStudents || record.studentCount || 0}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Học viên</span>
                    </div>
                </div>
            )
        },
        {
            title: 'TRẠNG THÁI',
            key: 'status',
            align: 'center',
            render: (_, record) => {
                const isActive = record.isActive !== false && record.status !== 'Archived';
                return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${isActive
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {isActive ? 'Hoạt động' : 'Lưu trữ'}
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
                    <Tooltip title="Danh sách học sinh">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<Users size={18} />}
                            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/teacher/classes/${record.id}/students`);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<Eye size={18} />}
                            className="text-slate-400 hover:text-[#0487e2] hover:bg-blue-50"
                            onClick={(e) => {
                                e.stopPropagation();
                                // navigate(`/dashboard/teacher/classes/${record.id}`); // Future feature
                            }}
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
                        <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Quản lý Lớp học</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Theo dõi và quản lý các lớp học được phân công.</p>
                    </div>
                </header>

                {/* Main Content Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

                    {/* Toolbar */}
                    <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="text-sm font-medium text-slate-500">
                            Hiển thị {filteredClasses.length} lớp học
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <Input
                                placeholder="Tìm kiếm lớp học..."
                                prefix={<Search size={16} className="text-slate-400" />}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="h-10 w-full md:w-64 rounded-lg border-slate-200 bg-white hover:border-[#0487e2] focus:border-[#0487e2]"
                                allowClear
                            />

                            <Select
                                value={statusFilter}
                                onChange={setStatusFilter}
                                className="w-40 h-10 [&>.ant-select-selector]:!rounded-lg [&>.ant-select-selector]:!border-slate-200 [&>.ant-select-selector]:!h-10 [&>.ant-select-selector]:!flex [&>.ant-select-selector]:!items-center"
                                options={[
                                    { value: 'all', label: 'Tất cả trạng thái' },
                                    { value: 'active', label: 'Hoạt động' },
                                    { value: 'archived', label: 'Lưu trữ' }
                                ]}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center">
                            <Spin size="large" />
                            <p className="mt-4 text-slate-500 font-medium">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={filteredClasses}
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
                                            <BookOpen size={32} />
                                        </div>
                                        <Empty description={<span className="text-slate-400 font-medium">Không tìm thấy lớp học nào</span>} />
                                    </div>
                                )
                            }}
                            onRow={(record) => ({
                                onClick: () => navigate(`/dashboard/teacher/classes/${record.id}/students`),
                                className: "cursor-pointer hover:bg-slate-50 transition-colors"
                            })}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default ClassManagement;