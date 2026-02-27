import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    BookOpen,
    Filter,
    LayoutGrid,
    List as ListIcon,
    Layers,
    CheckCircle2,
    Eye,
    Edit,
    Users,
    Clock,
    MoreVertical
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
import { getCourseTemplates } from '../../api/courseApi';
import { getSubjects } from '../../../subject/api/subjectApi';
import { getGradeLevels } from '../../../grade/api/gradeApi';
import { getCourseCategories } from '../../../category/api/categoryApi';

export default function CourseManagement() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Data maps for ID-to-Name resolution
    const [subjectsMap, setSubjectsMap] = useState({});
    const [gradesMap, setGradesMap] = useState({});
    const [categoriesMap, setCategoriesMap] = useState({});

    // Fetch dependency data
    const fetchDependencies = useCallback(async () => {
        try {
            const [subjectsRes, gradesRes, categoriesRes] = await Promise.allSettled([
                getSubjects(),
                getGradeLevels(),
                getCourseCategories({ pageSize: 100 })
            ]);

            const extract = (res) => {
                if (res.status === 'fulfilled') {
                    const data = res.value?.data?.items || res.value?.items || res.value?.data || res.value || [];
                    return Array.isArray(data) ? data : [];
                }
                console.warn('Failed to fetch dependency data:', res.reason);
                return [];
            };

            const subjectsData = extract(subjectsRes);
            const gradesData = extract(gradesRes);
            const categoriesData = extract(categoriesRes);

            const sMap = {}; subjectsData.forEach(item => sMap[item.id] = item.name || item.title);
            const gMap = {}; gradesData.forEach(item => gMap[item.id] = item.name || item.title);
            const cMap = {}; categoriesData.forEach(item => cMap[item.id] = item.name || item.title);

            setSubjectsMap(sMap);
            setGradesMap(gMap);
            setCategoriesMap(cMap);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu phụ trợ:', error);
        }
    }, []);

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getCourseTemplates();
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
        fetchDependencies();
        fetchCourses();
    }, [fetchDependencies, fetchCourses]);

    const filteredCourses = courses.filter(course => {
        const matchesSearch = (course.title || course.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.code?.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesStatus = true;
        if (statusFilter !== 'all') {
            const isActive = course.status === 'Active' || course.status === 'Published';
            if (statusFilter === 'active') matchesStatus = isActive;
            if (statusFilter === 'draft') matchesStatus = !isActive;
        }

        return matchesSearch && matchesStatus;
    });

    const columns = [
        {
            title: 'KHÓA HỌC',
            key: 'course',
            width: 350,
            render: (_, record) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-blue-50 flex items-center justify-center text-[#0487e2] shrink-0 border border-slate-100 relative group/thumb">
                        {record.thumbnail ? (
                            <img src={record.thumbnail} alt={record.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                            <BookOpen size={24} />
                        )}
                        {record.isFeatured && (
                            <div className="absolute top-0 right-0 p-0.5">
                                <div className="w-2 h-2 bg-amber-400 rounded-full ring-1 ring-white" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700 text-[15px] truncate">{record.title || record.name}</span>
                            {record.isFeatured && (
                                <Tag color="gold" className="m-0 text-[10px] font-bold uppercase px-1 leading-tight rounded-sm border-none">VIP</Tag>
                            )}
                        </div>
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{record.code}</span>
                    </div>
                </div>
            )
        },
        {
            title: 'PHÂN LOẠI',
            key: 'level',
            render: (_, record) => {

                const categoryName = record.categoryName || record.CategoryName || record.category?.name || categoriesMap[record.categoryId] || categoriesMap[record.CategoryId] || 'Chưa định nghĩa';

                const gradeId = record.gradeLevelId || record.GradeLevelId || record.gradeId || record.GradeId;
                const gradeName = record.gradeName || record.GradeName || record.gradeLevelName || record.GradeLevelName ||
                    record.grade?.name || record.gradeLevel?.name ||
                    gradesMap[gradeId] || (gradeId ? `ID: ${gradeId.slice(0, 8)}...` : 'Khối lớp N/A');

                const subjectId = record.subjectId || record.SubjectId;
                const subjectName = record.subjectName || record.SubjectName || record.subject?.name || subjectsMap[subjectId] || '';

                const levels = { 1: 'Cơ bản', 2: 'Trung bình', 3: 'Nâng cao' };
                const levelDisplay = levels[record.level] || record.levelName || record.LevelName || (record.level ? `Cấp độ ${record.level}` : 'Chưa định nghĩa');

                return (
                    <div className="flex flex-col gap-1">
                        <Tag className="rounded font-bold border-none bg-blue-50 text-blue-600 px-2 py-0 text-[11px] w-fit">
                            {levelDisplay}
                        </Tag>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-slate-500 font-medium px-1 flex items-center gap-1">
                                <Layers size={12} className="text-[#0487e2]" />
                                {gradeName}
                            </span>
                            {subjectName && (
                                <span className="text-[10px] text-slate-400 font-medium px-1 italic">
                                    Môn: {subjectName}
                                </span>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            title: 'THỐNG KÊ',
            key: 'metrics',
            render: (_, record) => (
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                            <Layers size={12} />
                        </div>
                        <span className="text-xs font-bold text-slate-600">
                            {record.totalSections || record.TotalSections || record.totalSection || record.TotalSection ||
                                record.sectionCount || record.SectionCount || record.sections?.length || 0} Chương
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center text-[#0487e2]">
                            <BookOpen size={12} />
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                            {record.totalLessons || record.TotalLessons || record.totalLesson || record.TotalLesson ||
                                record.lessonCount || record.LessonCount || record.lessons?.length || 0} Bài học
                        </span>
                    </div>
                </div>
            )
        },
        {
            title: 'TRẠNG THÁI',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => {
                const isActive = status === 'Active' || status === 'Published';
                return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${isActive
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {isActive ? 'Hoạt động' : 'Bản nháp'}
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
                        <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Quản lý Khóa học</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Quản lý chuyên sâu các chương trình đào tạo của hệ thống.</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<Plus size={18} />}
                        onClick={() => navigate('/dashboard/manager/courses/create')}
                        className="bg-[#0487e2] hover:bg-[#0463ca] h-11 px-6 rounded-lg font-bold shadow-md border-none flex items-center gap-2"
                    >
                        Tạo Template mới
                    </Button>
                </header>

                {/* Main Content Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

                    {/* Toolbar */}
                    <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="text-sm font-medium text-slate-500">
                            Hiển thị {filteredCourses.length} khóa học
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <Input
                                placeholder="Tìm kiếm khóa học..."
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
                                    { value: 'draft', label: 'Bản nháp' }
                                ]}
                            />

                            <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                                <Button type="text" className="h-8 w-8 !p-0 flex items-center justify-center rounded text-[#0487e2] bg-blue-50"><ListIcon size={16} /></Button>
                                <Button type="text" className="h-8 w-8 !p-0 flex items-center justify-center rounded text-slate-400 hover:text-slate-600"><LayoutGrid size={16} /></Button>
                            </div>
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
                            dataSource={filteredCourses}
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
                                        <Empty description={<span className="text-slate-400 font-medium">Không tìm thấy khóa học nào</span>} />
                                    </div>
                                )
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
