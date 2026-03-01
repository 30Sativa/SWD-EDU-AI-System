import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Filter,
    MoreHorizontal,
    Eye,
    FileText,
    Trash2,
    Mail,
    ArrowUpRight,
    Users,
    Clock,
    CheckCircle2,
    ArrowLeft
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getClassDetail, getTeacherClassStudents, addStudentsToClass } from '../../api/classApi';
import { Spin, Modal, Select, message, Table, Input, Button, Tooltip, Empty } from 'antd';
import { getUsers } from '../../../user/api/userApi';

// Lấy danh sách học sinh từ chi tiết lớp (BE có thể trả students / enrollments / members)
function extractStudents(classDetail) {
    if (!classDetail) return [];
    const raw = classDetail.students ?? classDetail.enrollments ?? classDetail.members ?? classDetail.studentList ?? [];
    return Array.isArray(raw) ? raw : [];
}

// Avatar initials + màu nhất quán theo id
function getAvatarStyle(id) {
    const palettes = [
        'bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-700',
        'bg-gradient-to-tr from-emerald-200 to-emerald-100 text-emerald-700',
        'bg-gradient-to-tr from-violet-200 to-violet-100 text-violet-700',
        'bg-gradient-to-tr from-amber-200 to-amber-100 text-amber-700',
        'bg-gradient-to-tr from-rose-200 to-rose-100 text-rose-700',
    ];
    return palettes[Math.abs(String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % palettes.length];
}

export default function ClassStudentList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('All Classes');
    const [classDetail, setClassDetail] = useState(null);
    const [studentsData, setStudentsData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [reloadTrigger, setReloadTrigger] = useState(0); // Để trigger load lại data

    // States cho chức năng tìm kiếm học sinh
    const [fetchingStudents, setFetchingStudents] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);

    const navigate = useNavigate();
    const { classId } = useParams();

    useEffect(() => {
        if (!classId) {
            setLoading(false);
            return;
        }
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch class info and student list
                const [classRes, studentRes] = await Promise.all([
                    getClassDetail(classId).catch(() => null), // might return 403 for teachers, so catch it
                    getTeacherClassStudents(classId).catch((err) => {
                        console.error('Lỗi tải danh sách học sinh:', err);
                        return null;
                    })
                ]);

                if (classRes) {
                    setClassDetail(classRes?.data ?? classRes);
                }

                if (studentRes) {
                    const sData = studentRes?.data ?? studentRes;
                    setStudentsData(Array.isArray(sData) ? sData : []);
                }
            } catch (err) {
                console.error('Lỗi tải dữ liệu lớp:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [classId, reloadTrigger]);

    const fetchStudentsToAdd = async (keyword = '') => {
        try {
            setFetchingStudents(true);

            // 1. Fetch available users
            const res = await getUsers({ RoleFilter: 4, PageSize: 50, SearchTerm: keyword || null });
            let list = res?.data?.items ?? res?.items ?? res?.data ?? res;

            if (Array.isArray(list)) {
                // 2. Tạm thời filter: chỉ loại bỏ học sinh ĐÃ Ở TRONG LỚP HIỆN TẠI
                // (Để loại bỏ hoàn toàn các học sinh ở lớp KHÁC, cần API get toàn bộ học sinh của toàn bộ lớp,
                // Do thiết kế BE hiện tại "mỗi lần thêm đc 1 cái" -> FE sẽ lọc tạm danh sách trong lớp này)

                // Nếu FE muốn LỌC TOÀN BỘ CÁC LỚP, ta cần fetch getClasses() => load từng lớp => extract id. 
                // Do tốn resource, ta sẽ thực hiện Lọc học sinh có trạng thái "đã có lớp" nếu API User có trả về "classId", 
                // hiện tại API User chưa có field "classId", nên FE chỉ lọc chính xác nhất những em đã ở trong lớp hiện tại:
                const currentIds = studentsData.map(s => s.id ?? s.userId ?? s.studentId);
                list = list.filter(u => !currentIds.includes(u.id));

                // Tính năng mở rộng: Nếu data user có field liên quan đến việc đã có lớp (vd: isAssigned), FE có thể filter
                list = list.filter(u => !u.className && !u.classId); // Safe guard filter 

                setAvailableStudents(list);
            }
        } catch (err) {
            console.error('Không thể tải danh sách học sinh:', err);
        } finally {
            setFetchingStudents(false);
        }
    };

    // Handle mở modal và tải danh sách học sinh mặc định
    const openAddModal = async () => {
        setIsAddModalOpen(true);
        setSelectedStudentIds([]);
        setAvailableStudents([]);
        await fetchStudentsToAdd('');
    };

    // Hàm thực hiện tìm kiếm học sinh (debounce)
    const handleSearchStudents = (value) => {
        if (searchTimeout) clearTimeout(searchTimeout);
        setSearchTimeout(setTimeout(() => {
            fetchStudentsToAdd(value);
        }, 500));
    };

    // Handle submit thêm học sinh
    const handleAddStudents = async () => {
        if (!selectedStudentIds || selectedStudentIds.length === 0) {
            message.warning('Vui lòng chọn ít nhất một học sinh');
            return;
        }
        try {
            setIsAdding(true);
            // Gửi toàn bộ mảng ID lên API (chứa danh sách các chuỗi UUID như swagger yêu cầu)
            await addStudentsToClass(classId, selectedStudentIds);

            message.success(`Đã thêm thành công ${selectedStudentIds.length} học sinh`);
            setIsAddModalOpen(false);
            setSelectedStudentIds([]);
            setReloadTrigger(prev => prev + 1); // reload data
        } catch (err) {
            console.error('Lỗi khi thêm học sinh:', err);

            // Xử lý thông báo lỗi chi tiết từ backend nếu có
            let errorMsg = 'Thêm học sinh thất bại';
            if (err.response?.data) {
                const data = err.response.data;
                if (typeof data === 'string') errorMsg = data;
                else if (data.message || data.Message) errorMsg = data.message || data.Message;
            }
            message.error(errorMsg);
        } finally {
            setIsAdding(false);
        }
    };

    const rawStudents = studentsData.length > 0 ? studentsData : extractStudents(classDetail);
    const students = rawStudents.map(s => ({
        id: s.id ?? s.userId ?? s.studentId,
        name: s.fullName ?? s.name ?? s.userName ?? s.email ?? '—',
        email: s.email ?? '',
        avatar: (s.fullName ?? s.name ?? s.userName ?? s.email ?? '?').slice(0, 2).toUpperCase(),
        avatarBg: getAvatarStyle(s.id ?? s.userId ?? s.studentId ?? 0),
        class: s.className ?? classDetail?.name ?? '—',
        progress: s.progress ?? s.completionRate ?? 0,
        lastActive: s.lastActiveAt ?? s.lastActive ?? '—',
        status: (s.isActive !== false && s.status !== 'Inactive') ? 'Active' : 'Inactive',
    })).filter(s => s.id);
    const filteredStudents = searchTerm.trim()
        ? students.filter(s => [s.name, s.email].some(v => String(v).toLowerCase().includes(searchTerm.toLowerCase())))
        : students;

    // Hàm lấy style cho progress bar (màu + hiệu ứng glow)
    const getProgressStyles = (value) => {
        if (value >= 90) return { bg: 'bg-emerald-500', shadow: 'shadow-[0_0_10px_rgba(16,185,129,0.5)]' };
        if (value >= 70) return { bg: 'bg-indigo-500', shadow: 'shadow-[0_0_10px_rgba(99,102,241,0.5)]' };
        if (value >= 50) return { bg: 'bg-violet-500', shadow: 'shadow-[0_0_10px_rgba(139,92,246,0.5)]' };
        return { bg: 'bg-amber-500', shadow: 'shadow-[0_0_10px_rgba(245,158,11,0.5)]' };
    };

    const getStatusStyle = (status) => {
        if (status === 'Active') return 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-emerald-500/20';
        return 'bg-slate-50 text-slate-500 border-slate-200/60 ring-slate-500/20';
    };

    const columns = [
        {
            title: 'HỌC SINH',
            key: 'student',
            render: (_, record) => (
                <div className="flex items-center gap-4">
                    <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${record.avatarBg}`}>
                        {record.avatar}
                        <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${record.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    </div>
                    <div>
                        <div className="font-bold text-slate-700 hover:text-[#0487e2] transition-colors cursor-pointer">{record.name}</div>
                        <div className="text-[11px] font-medium text-slate-500 mt-0.5">{record.email}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'LỚP HỌC',
            key: 'class',
            render: (_, record) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-50 text-slate-600 border border-slate-200">
                    {record.class}
                </span>
            )
        },
        {
            title: 'TIẾN ĐỘ',
            key: 'progress',
            width: 200,
            render: (_, record) => {
                const progressStyle = getProgressStyles(record.progress);
                return (
                    <div className="flex flex-col gap-1.5 w-full pr-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700">{record.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${progressStyle.bg}`}
                                style={{ width: `${record.progress}%` }}
                            ></div>
                        </div>
                    </div>
                );
            }
        },
        {
            title: 'TRẠNG THÁI',
            key: 'status',
            render: (_, record) => (
                <div className="flex flex-col items-start gap-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${record.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${record.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {record.status === 'Active' ? 'Đang hoạt động' : 'Ngoại tuyến'}
                    </span>
                    <div className="text-[10px] text-slate-400 pl-1 font-medium flex items-center gap-1">
                        <Clock size={10} /> {record.lastActive}
                    </div>
                </div>
            )
        },
        {
            title: 'TÁC VỤ',
            key: 'action',
            align: 'right',
            render: (_, record) => (
                <div className="flex items-center justify-end gap-1">
                    <Tooltip title="Xem chi tiết">
                        <Button type="text" shape="circle" icon={<Eye size={17} />} className="text-slate-400 hover:text-[#0487e2] hover:bg-blue-50" />
                    </Tooltip>
                    <Tooltip title="Gửi email">
                        <Button type="text" shape="circle" icon={<Mail size={17} />} className="text-slate-400 hover:text-amber-600 hover:bg-amber-50" />
                    </Tooltip>
                    <Tooltip title="Xóa khỏi lớp">
                        <Button type="text" shape="circle" icon={<Trash2 size={17} />} className="text-slate-400 hover:text-rose-600 hover:bg-rose-50" />
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
                    <div className="flex items-center gap-3">
                        <Button
                            type="text"
                            onClick={() => navigate('/dashboard/teacher/classes')}
                            className="w-10 h-10 flex items-center justify-center p-0 text-slate-400 hover:text-[#0463ca] hover:bg-blue-50 border border-slate-200 rounded-lg shadow-sm"
                        >
                            <ArrowLeft size={20} strokeWidth={2.5} />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Danh sách Học sinh</h1>
                            <div className="flex items-center gap-2 mt-1 text-sm font-medium text-slate-500">
                                <span>Quản lý lớp học</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="text-[#0487e2]">
                                    {classDetail?.name ?? classDetail?.title ?? `Lớp #${classId || '—'}`}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button className="h-10 px-4 rounded-lg bg-white border-slate-200 text-slate-600 hover:text-[#0463ca] hover:border-[#0463ca] shadow-sm flex items-center gap-2 font-medium">
                            <FileText size={18} />
                            Xuất báo cáo
                        </Button>
                        <Button
                            type="primary"
                            onClick={openAddModal}
                            className="bg-[#0463ca] hover:bg-[#0352a8] h-10 px-5 rounded-lg font-bold shadow-md border-none flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Thêm học sinh
                        </Button>
                    </div>
                </header>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                        { label: 'Tổng học sinh', value: String(students.length), icon: Users, color: 'text-[#0487e2]', bg: 'bg-blue-50', border: 'border-blue-100' },
                        { label: 'Đang hoạt động', value: String(students.filter(s => s.status === 'Active').length), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                        { label: 'Tiến độ TB', value: students.length ? `${Math.round(students.reduce((a, s) => a + s.progress, 0) / students.length)}%` : '—', icon: Clock, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
                    ].map((stat, index) => (
                        <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center hover:shadow-md transition-all">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</h3>
                            </div>
                            <div className={`p-3.5 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-7 h-7 ${stat.color}`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

                    {/* Toolbar */}
                    <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="text-sm font-medium text-slate-500">
                            Hiển thị {filteredStudents.length} học sinh
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <Input
                                placeholder="Tìm kiếm theo tên, email..."
                                prefix={<Search size={16} className="text-slate-400" />}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="h-10 w-full md:w-64 rounded-lg border-slate-200 bg-white hover:border-[#0487e2] focus:border-[#0487e2]"
                                allowClear
                            />
                            {/* Filter mock placeholder to match design visually */}
                            <Select
                                defaultValue="all"
                                className="w-40 h-10 [&>.ant-select-selector]:!rounded-lg [&>.ant-select-selector]:!h-10 [&>.ant-select-selector]:!flex [&>.ant-select-selector]:!items-center"
                                options={[
                                    { value: 'all', label: 'Tất cả trạng thái' },
                                    { value: 'active', label: 'Đang hoạt động' },
                                    { value: 'inactive', label: 'Ngoại tuyến' }
                                ]}
                            />
                        </div>
                    </div>

                    {/* Table View */}
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center">
                            <Spin size="large" />
                            <p className="mt-4 text-slate-500 font-medium">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={filteredStudents}
                            rowKey="id"
                            pagination={{
                                pageSize: 15,
                                showSizeChanger: false,
                                className: "px-5 py-4 m-0 border-t border-slate-100",
                                showTotal: (total, range) => <span className="text-slate-500 font-medium">{`Hiển thị ${range[0]}-${range[1]} trên ${total}`}</span>
                            }}
                            className="custom-table"
                            locale={{
                                emptyText: (
                                    <div className="py-12 flex flex-col items-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                            <Users size={32} />
                                        </div>
                                        <Empty description={<span className="text-slate-400 font-medium">Không tìm thấy học sinh nào</span>} />
                                    </div>
                                )
                            }}
                        />
                    )}
                </div>

                <Modal
                    title={
                        <div className="flex items-center gap-2 pb-2">
                            <span className="text-lg font-bold text-[#0463ca]">Thêm Học Sinh Vào Lớp</span>
                        </div>
                    }
                    open={isAddModalOpen}
                    onCancel={() => {
                        setIsAddModalOpen(false);
                        setSelectedStudentIds([]);
                    }}
                    onOk={handleAddStudents}
                    confirmLoading={isAdding}
                    okText="Xác nhận thêm"
                    cancelText="Hủy bỏ"
                    okButtonProps={{ className: "bg-[#0463ca] hover:bg-[#0352a8] border-none shadow-sm font-semibold" }}
                    cancelButtonProps={{ className: "font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-none shadow-none" }}
                    destroyOnHidden
                >
                    <div className="py-4 space-y-4">
                        <p className="text-sm font-medium text-slate-500">
                            Tìm kiếm theo tên hoặc email. Có thể chọn cùng lúc nhiều học sinh.
                        </p>
                        <Select
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder="Nhập tên hoặc email học sinh..."
                            value={selectedStudentIds}
                            onChange={setSelectedStudentIds}
                            onSearch={handleSearchStudents}
                            loading={fetchingStudents}
                            notFoundContent={fetchingStudents ? <Spin size="small" /> : "Không tìm thấy học sinh phù hợp"}
                            filterOption={false} // Để Server tự filter bằng API
                            className="custom-student-select [&>.ant-select-selector]:!min-h-[46px] [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-slate-200"
                            options={availableStudents.map(student => ({
                                label: (
                                    <div className="flex flex-col py-1">
                                        <span className="font-semibold text-slate-700 text-sm">
                                            {student.fullName || student.name || student.email || student.userName}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium tracking-wide">
                                            {student.email || student.userName || 'Chưa cung cấp email'}
                                        </span>
                                    </div>
                                ),
                                value: student.id,
                            }))}
                            popupRender={(menu) => (
                                <div className="rounded-xl overflow-hidden drop-shadow-lg">
                                    {menu}
                                </div>
                            )}
                        />
                    </div>
                </Modal>
            </div>
        </div>
    );
}