import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Layers, BookOpen, Filter, School, Trash2, X, Users, Calendar } from 'lucide-react';
import { Table, Button, Input, Modal, Form, Tag, message, Spin, Tooltip, Empty, Switch, Select, Tabs, Popconfirm } from 'antd';
import {
    getGradeLevels,
    createGradeLevel,
    updateGradeLevel,
    changeGradeLevelStatus
} from '../../api/gradeApi';
import {
    getClasses,
    createClass,
    updateClass,
    changeClassStatus,
    deleteClass
} from '../../../classes/api/classApi';

import { getUsers, ROLE_ENUM } from '../../../user/api/userApi';
import { getTerms } from '../../../term/api/termApi';

export default function GradeManagement() {
    const [activeTab, setActiveTab] = useState('1'); // '1': Grades, '2': Classes

    // Common State
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Data State
    const [grades, setGrades] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [terms, setTerms] = useState([]);

    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
    const [editingGrade, setEditingGrade] = useState(null);
    const [gradeSubmitting, setGradeSubmitting] = useState(false);

    // Class State
    const [classes, setClasses] = useState([]);
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [classSubmitting, setClassSubmitting] = useState(false);
    const [filterGradeId, setFilterGradeId] = useState('All');
    const [editingClass, setEditingClass] = useState(null);

    const [statusUpdating, setStatusUpdating] = useState(null);
    const [form] = Form.useForm();
    const [classForm] = Form.useForm();

    // Fetch Data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [gradeRes, classRes, teacherRes, termRes] = await Promise.all([
                getGradeLevels(),
                getClasses(),
                getUsers({ RoleFilter: ROLE_ENUM.TEACHER, PageSize: 100 }),
                getTerms().catch(() => ({ data: [] })) // Use centralized API
            ]);

            const gradeData = gradeRes?.data?.items || gradeRes?.items || gradeRes?.data || gradeRes || [];
            const classData = classRes?.data?.items || classRes?.items || classRes?.data || classRes || [];

            // Handle Teachers
            const teacherItems = teacherRes?.data?.items || teacherRes?.items || teacherRes?.data || teacherRes || [];
            setTeachers(Array.isArray(teacherItems) ? teacherItems : []);

            // Handle Terms
            const termItems = termRes?.data?.items || termRes?.items || termRes?.data || termRes || [];
            setTerms(Array.isArray(termItems) ? termItems : []);

            setGrades(Array.isArray(gradeData) ? gradeData : []);
            setClasses(Array.isArray(classData) ? classData : []);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            message.error('Không thể kết nối máy chủ để tải dữ liệu');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- HANDLERS ---
    const handleOpenGradeModal = (grade = null) => {
        setEditingGrade(grade);
        if (grade) {
            form.setFieldsValue({
                code: grade.code,
                name: grade.name,
                description: grade.description,
                sortOrder: grade.sortOrder
            });
        } else {
            form.resetFields();
            form.setFieldsValue({ sortOrder: 0 });
        }
        setIsGradeModalOpen(true);
    };

    const handleGradeSubmit = async (values) => {
        try {
            setGradeSubmitting(true);
            if (editingGrade) {
                await updateGradeLevel(editingGrade.id, values);
                message.success('Cập nhật khối lớp thành công!');
            } else {
                await createGradeLevel(values);
                message.success('Thêm khối lớp mới thành công!');
            }
            setIsGradeModalOpen(false);
            fetchData();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setGradeSubmitting(false);
        }
    };

    const handleToggleGradeStatus = (record) => {
        if (!record || !record.id) {
            console.error('Grade record or ID is missing', record);
            message.error('Không thể xác định khối lớp');
            return;
        }

        const isDeactivating = record.isActive;
        const relatedClasses = classes.filter(c => c.gradeLevelId === record.id || c.gradeId === record.id);
        const activeClassesCount = relatedClasses.filter(c => c.isActive).length;

        Modal.confirm({
            title: `Xác nhận ${isDeactivating ? 'ngưng hoạt động' : 'kích hoạt'} khối ${record.name}?`,
            content: (
                <div>
                    <p>Bạn có chắc chắn muốn thay đổi trạng thái của khối này?</p>
                    {isDeactivating && activeClassesCount > 0 && (
                        <p className="text-red-500 mt-2 font-medium">
                            Lưu ý: {activeClassesCount} lớp học đang hoạt động thuộc khối này cũng sẽ bị ngưng hoạt động theo.
                        </p>
                    )}
                </div>
            ),
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            okButtonProps: { danger: isDeactivating },
            onOk: async () => {
                const previousGrades = [...grades];
                const previousClasses = [...classes];

                try {
                    setStatusUpdating(record.id);

                    // 1. Optimistic Update immediately
                    const newIsActive = !record.isActive;

                    // Update Grade List
                    const updatedGrades = grades.map(g =>
                        g.id === record.id ? { ...g, isActive: newIsActive } : g
                    );
                    setGrades(updatedGrades);

                    // Update Class List (Cascade Deactivation)
                    if (isDeactivating) {
                        const updatedClasses = classes.map(c => {
                            if (c.gradeLevelId === record.id || c.gradeId === record.id) {
                                return { ...c, isActive: false };
                            }
                            return c;
                        });
                        setClasses(updatedClasses);
                    }

                    // 2. Call API for Grade
                    await changeGradeLevelStatus(record.id, newIsActive);

                    // 3. Call API for Classes (Cascade Deactivation)
                    if (isDeactivating) {
                        const classesToUpdate = classes.filter(c => c.gradeLevelId === record.id || c.gradeId === record.id);
                        if (classesToUpdate.length > 0) {
                            await Promise.all(classesToUpdate.map(c => changeClassStatus(c.id, false)));
                        }
                    }

                    message.success('Cập nhật trạng thái khối thành công');

                    // 3. Re-fetch eventually to ensure consistency
                    setTimeout(() => fetchData(), 2000);

                } catch (error) {
                    message.error('Không thể đổi trạng thái');
                    console.error(error);
                    // Revert on error
                    setGrades(previousGrades);
                    setClasses(previousClasses);
                } finally {
                    setStatusUpdating(null);
                }
            }
        });
    };

    const handleToggleClassStatus = async (record) => {
        if (!record || !record.id) return;

        // Optional: Block if parent grade is inactive? Or just warn? 
        // For now, allow independent toggle but maybe warn if grade is inactive.

        const newIsActive = !record.isActive;
        const previousClasses = [...classes];

        try {
            setStatusUpdating(record.id);

            // Optimistic Update
            const updatedClasses = classes.map(c =>
                c.id === record.id ? { ...c, isActive: newIsActive } : c
            );
            setClasses(updatedClasses);

            message.success(`Đã ${newIsActive ? 'kích hoạt' : 'ngưng hoạt động'} lớp ${record.name}`);

            // Call API
            await changeClassStatus(record.id, newIsActive);

            // Re-fetch eventually
            setTimeout(() => fetchData(), 2000);

        } catch (error) {
            console.error('Toggle Class Status Error:', error);
            message.error('Không thể cập nhật trạng thái lớp');
            setClasses(previousClasses);
        } finally {
            setStatusUpdating(null);
        }
    };

    const handleDeleteClass = async (id) => {
        const previousClasses = [...classes];
        try {
            // Optimistic update
            setClasses(classes.filter(c => c.id !== id));
            message.success('Đã xóa lớp học thành công');

            await deleteClass(id);
            // No need to fetch if delete is simple, but can fetch to be safe
            // setTimeout(fetchData, 1000); 

        } catch (error) {
            console.error('Delete Class Error:', error);
            message.error(error.response?.data?.message || 'Không thể xóa lớp học');
            setClasses(previousClasses);
        }
    };

    const handleOpenClassModal = (classItem = null) => {
        setEditingClass(classItem);
        if (classItem) {
            classForm.setFieldsValue({
                code: classItem.code,
                name: classItem.name,
                maxStudents: classItem.maxStudents || classItem.maxStudent || 40,
                termId: classItem.termId,
                teacherId: classItem.teacherId,
                gradeLevelId: classItem.gradeLevelId || classItem.gradeId,
                description: classItem.description
            });
        } else {
            classForm.resetFields();
            classForm.setFieldsValue({ maxStudents: 40 });
        }
        setIsClassModalOpen(true);
    };

    const handleClassSubmit = async (values) => {
        try {
            setClassSubmitting(true);
            const payload = {
                ...values,
                maxStudents: parseInt(values.maxStudents)
            };

            if (editingClass) {
                await updateClass(editingClass.id, payload);
                message.success('Cập nhật lớp học thành công!');
            } else {
                await createClass(payload);
                message.success('Tạo lớp học mới thành công!');
            }

            setIsClassModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Update/Create Class Error:', error);
            if (error.response && error.response.data && error.response.data.errors) {
                const errorMsg = Object.values(error.response.data.errors).flat().join(', ');
                message.error(errorMsg || 'Lỗi dữ liệu không hợp lệ');
            } else {
                message.error(error.response?.data?.message || 'Có lỗi xảy ra');
            }
        } finally {
            setClassSubmitting(false);
        }
    };

    // --- FILTERS ---
    const filteredGrades = grades.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredClasses = classes.filter(item => {
        const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.code?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGrade = filterGradeId === 'All' || item.gradeLevelId === filterGradeId || item.gradeId === filterGradeId;
        return matchesSearch && matchesGrade;
    });

    // --- COLUMNS ---
    const gradeColumns = [
        {
            title: 'THÔNG TIN KHỐI',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0487e2] flex items-center justify-center font-bold shadow-sm">
                        {record.code?.replace(/[^0-9]/g, '') || 'K'}
                    </div>
                    <div>
                        <div className="font-bold text-slate-700 text-[15px]">{text}</div>
                        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{record.code}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'LỚP TRỰC THUỘC',
            key: 'classes',
            render: (_, record) => {
                const gradeClasses = classes.filter(c => c.gradeLevelId === record.id || c.gradeId === record.id);
                return (
                    <div className="flex items-center gap-2">
                        <Tag color={gradeClasses.length > 0 ? "blue" : "default"} className="font-semibold border-0 m-0">
                            {gradeClasses.length} Lớp
                        </Tag>
                        {gradeClasses.length > 0 && (
                            <span className="text-xs text-slate-400 font-medium">
                                ({gradeClasses.filter(c => c.isActive).length} hoạt động)
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            title: 'ƯU TIÊN',
            dataIndex: 'sortOrder',
            align: 'center',
            render: (v) => <div className="w-8 h-8 mx-auto rounded-full bg-slate-50 flex items-center justify-center text-slate-500 font-bold text-xs">{v}</div>
        },
        {
            title: 'TRẠNG THÁI',
            dataIndex: 'isActive',
            align: 'center',
            render: (isActive, record) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Switch
                        size="small"
                        checked={isActive}
                        loading={statusUpdating === record.id}
                        onChange={() => handleToggleGradeStatus(record)}
                        className={isActive ? 'bg-[#0487e2]' : 'bg-slate-300'}
                    />
                </div>
            )
        },
        {
            title: 'TÁC VỤ',
            key: 'action',
            align: 'right',
            render: (_, record) => (
                <Tooltip title="Chỉnh sửa">
                    <Button
                        type="text"
                        shape="circle"
                        icon={<Edit size={16} />}
                        className="text-slate-400 hover:text-[#0487e2] hover:bg-blue-50 transition-colors"
                        onClick={() => handleOpenGradeModal(record)}
                    />
                </Tooltip>
            )
        }
    ];

    const classColumns = [
        {
            title: 'THÔNG TIN LỚP',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-sm">
                        {record.code?.replace(/[^0-9]/g, '') || 'K'}
                    </div>
                    <div>
                        <div className="font-bold text-slate-700 text-[15px]">{text}</div>
                        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{record.code}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'THUỘC KHỐI',
            key: 'grade',
            render: (_, record) => {
                const grade = grades.find(g => g.id === record.gradeLevelId || g.id === record.gradeId);
                return grade ? (
                    <Tag color="cyan" className="font-semibold border-0 m-0">
                        {grade.name}
                    </Tag>
                ) : <span className="text-slate-400 text-xs italic">-- Chưa phân khối --</span>;
            }
        },
        {
            title: 'HỌC KỲ',
            key: 'term',
            render: (_, record) => {
                const term = terms.find(t => t.id === record.termId);
                return term ? (
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <Calendar size={14} className="text-slate-400" />
                        {term.code || term.name}
                    </div>
                ) : <span className="text-slate-400 text-xs italic">--</span>;
            }
        },
        {
            title: 'GIÁO VIÊN',
            key: 'teacher',
            render: (_, record) => {
                // Try to find teacher name from the record or look it up in the teachers list if we have IDs
                const teacherName = record.homeroomTeacherName ||
                    record.teacherName ||
                    teachers.find(t => t.id === record.teacherId)?.fullName;

                return (
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
                            <Users size={14} />
                        </div>
                        <span className="font-medium text-slate-600 text-sm">
                            {teacherName || <span className="text-slate-400 italic font-normal">Chưa phân công</span>}
                        </span>
                    </div>
                );
            }
        },
        {
            title: 'SĨ SỐ',
            dataIndex: 'studentCount',
            key: 'students',
            render: (count, record) => {
                const current = count || 0;
                const max = record.maxStudents || record.maxStudent || 40;
                return (
                    <div className="text-sm font-medium text-slate-600">
                        {current} / {max}
                    </div>
                )
            }
        },
        {
            title: 'TRẠNG THÁI',
            dataIndex: 'isActive',
            align: 'center',
            render: (isActive, record) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Switch
                        size="small"
                        checked={isActive}
                        loading={statusUpdating === record.id}
                        onChange={() => handleToggleClassStatus(record)}
                        className={isActive ? 'bg-emerald-500' : 'bg-slate-300'}
                    />
                </div>
            )
        },
        {
            title: 'TÁC VỤ',
            key: 'action',
            align: 'right',
            render: (_, record) => (
                <div className="flex justify-end gap-2">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<Edit size={16} />}
                            className="text-slate-400 hover:text-[#0487e2] hover:bg-blue-50 transition-colors"
                            onClick={() => handleOpenClassModal(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa lớp học"
                        description={`Bạn có chắc chắn muốn xóa lớp ${record.name}?`}
                        onConfirm={() => handleDeleteClass(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button
                                type="text"
                                shape="circle"
                                icon={<Trash2 size={16} />}
                                className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                            />
                        </Tooltip>
                    </Popconfirm>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Quản lý Khối & Lớp</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Cấu trúc tổ chức lớp học và phân cấp trong nhà trường.</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<Plus size={18} />}
                        onClick={() => activeTab === '1' ? handleOpenGradeModal() : handleOpenClassModal()}
                        className="bg-[#0487e2] hover:bg-[#0374c4] h-11 px-6 rounded-lg font-bold shadow-md border-none flex items-center"
                    >
                        {activeTab === '1' ? 'Thêm Khối mới' : 'Thêm Lớp mới'}
                    </Button>
                </header>

                {/* Main Content with Tabs */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 pt-2">
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            items={[
                                {
                                    key: '1',
                                    label: (
                                        <span className="flex items-center gap-2 px-1">
                                            <Layers size={16} />
                                            Danh sách Khối
                                        </span>
                                    ),
                                },
                                {
                                    key: '2',
                                    label: (
                                        <span className="flex items-center gap-2 px-1">
                                            <BookOpen size={16} />
                                            Danh sách Lớp học
                                        </span>
                                    ),
                                }
                            ]}
                        />
                    </div>

                    {/* Toolbar inside the card, below tabs */}
                    <div className="px-4 py-3 bg-slate-50/50 border-t border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="text-sm font-medium text-slate-500 pl-2">
                            Hiển thị {activeTab === '1' ? filteredGrades.length : filteredClasses.length} kết quả
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <Input
                                placeholder={activeTab === '1' ? "Tìm kiếm khối..." : "Tìm kiếm lớp..."}
                                prefix={<Search size={16} className="text-slate-400" />}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="h-9 w-full md:w-64 rounded-lg border-slate-200"
                            />
                            {activeTab === '2' && (
                                <Select
                                    value={filterGradeId}
                                    onChange={setFilterGradeId}
                                    className="w-40 h-9"
                                    options={[
                                        { value: 'All', label: 'Tất cả Khối' },
                                        ...grades.map(g => ({ value: g.id, label: g.name }))
                                    ]}
                                />
                            )}
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
                            columns={activeTab === '1' ? gradeColumns : classColumns}
                            dataSource={activeTab === '1' ? filteredGrades : filteredClasses}
                            rowKey="id"
                            pagination={{ pageSize: 12, showSizeChanger: false }}
                            className="custom-table"
                            locale={{
                                emptyText: <Empty description="Chưa có dữ liệu" />
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Modal: Grade */}
            <Modal
                title={null}
                open={isGradeModalOpen}
                onCancel={() => setIsGradeModalOpen(false)}
                footer={null}
                centered
                width={480}
                closeIcon={<div className="p-1.5 bg-slate-100 rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={18} /></div>}
                className="custom-modal"
            >
                <div className="pt-6 px-2">
                    <div className="mb-6 text-center">
                        <div className="w-12 h-12 bg-blue-50 text-[#0487e2] rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Layers size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">
                            {editingGrade ? "Cập nhật Khối lớp" : "Thêm Khối lớp mới"}
                        </h3>
                        <p className="text-slate-500 text-sm mt-1">Điền thông tin khối lớp bên dưới</p>
                    </div>

                    <Form form={form} layout="vertical" onFinish={handleGradeSubmit} className="space-y-4">
                        <Form.Item label="Mã Khối" name="code" rules={[{ required: true, message: 'Nhập mã khối' }]}>
                            <Input className="h-11 rounded-xl bg-slate-50 border-transparent hover:bg-white focus:bg-white transition-all font-medium" placeholder="VD: G10" />
                        </Form.Item>
                        <Form.Item label="Tên Khối" name="name" rules={[{ required: true, message: 'Nhập tên khối' }]}>
                            <Input className="h-11 rounded-xl bg-slate-50 border-transparent hover:bg-white focus:bg-white transition-all font-medium" placeholder="VD: Khối 10" />
                        </Form.Item>
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item label="Thứ tự" name="sortOrder">
                                <Input type="number" className="h-11 rounded-xl bg-slate-50 border-transparent hover:bg-white focus:bg-white transition-all font-medium" />
                            </Form.Item>
                            <Form.Item label="Mô tả" name="description">
                                <Input className="h-11 rounded-xl bg-slate-50 border-transparent hover:bg-white focus:bg-white transition-all font-medium" />
                            </Form.Item>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button className="flex-1 h-11 rounded-xl font-semibold border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => setIsGradeModalOpen(false)}>Hủy bỏ</Button>
                            <Button type="primary" htmlType="submit" loading={gradeSubmitting} className="flex-1 h-11 rounded-xl bg-[#0487e2] font-bold shadow-lg shadow-blue-200 border-none">Lưu Thay Đổi</Button>
                        </div>
                    </Form>
                </div>
            </Modal>

            {/* Modal: Class */}
            <Modal
                title={null}
                open={isClassModalOpen}
                onCancel={() => setIsClassModalOpen(false)}
                footer={null}
                centered
                width={600}
                closeIcon={<div className="p-1.5 bg-slate-100 rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={18} /></div>}
            >
                <div className="pt-4 px-1">
                    <div className="mb-4 text-center">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                            <School size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">
                            {editingClass ? "Cập nhật Lớp học" : "Thêm Lớp học mới"}
                        </h3>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {editingClass ? "Điều chỉnh thông tin lớp học hiện tại" : "Tạo lớp học mới cho năm học hiện tại"}
                        </p>
                    </div>

                    <Form form={classForm} layout="vertical" onFinish={handleClassSubmit} className="space-y-3">

                        <Form.Item label="Tên Lớp" name="name" rules={[{ required: true, message: 'Nhập tên lớp' }]} className="mb-2">
                            <Input className="h-10 rounded-xl bg-slate-50 border-transparent hover:bg-white focus:bg-white transition-all font-medium" placeholder="VD: Lớp 10A1" />
                        </Form.Item>

                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item label="Mã Lớp" name="code" rules={[{ required: true, message: 'Nhập mã lớp' }]} className="mb-2">
                                <Input className="h-10 rounded-xl bg-slate-50 border-transparent hover:bg-white focus:bg-white transition-all font-medium" placeholder="VD: 10A1" />
                            </Form.Item>
                            <Form.Item label="Sĩ số tối đa" name="maxStudents" className="mb-2">
                                <Input type="number" className="h-10 rounded-xl bg-slate-50 border-transparent hover:bg-white focus:bg-white transition-all font-medium" placeholder="40" />
                            </Form.Item>
                        </div>

                        <Form.Item label="Thuộc Học Kỳ" name="termId" rules={[{ required: true, message: 'Vui lòng chọn học kỳ' }]} className="mb-2">
                            <Select
                                placeholder="Chọn học kỳ"
                                className="h-10 [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!bg-slate-50 [&>.ant-select-selector]:!border-transparent [&>.ant-select-selector]:!h-10 [&>.ant-select-selector]:!flex [&>.ant-select-selector]:!items-center"
                            >
                                {terms.length > 0 ? terms.map(t => (
                                    <Select.Option key={t.id} value={t.id}>{t.name} ({t.code})</Select.Option>
                                )) : (
                                    <>
                                        <Select.Option value="term_1">Học kỳ 1 (2025-2026)</Select.Option>
                                        <Select.Option value="term_2">Học kỳ 2 (2025-2026)</Select.Option>
                                    </>
                                )}
                            </Select>
                        </Form.Item>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item label="Giáo viên chủ nhiệm" name="teacherId" rules={[{ required: true, message: 'Vui lòng chọn giáo viên' }]} className="mb-2">
                                <Select
                                    placeholder="Chọn giáo viên"
                                    showSearch
                                    optionFilterProp="children"
                                    className="h-10 [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!bg-slate-50 [&>.ant-select-selector]:!border-transparent [&>.ant-select-selector]:!h-10 [&>.ant-select-selector]:!flex [&>.ant-select-selector]:!items-center"
                                >
                                    {teachers.map(t => (
                                        <Select.Option key={t.id} value={t.id}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-[10px] font-bold">
                                                    {t.fullName?.charAt(0)}
                                                </div>
                                                {t.fullName}
                                            </div>
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item label="Thuộc Khối" name="gradeLevelId" rules={[{ required: true, message: 'Vui lòng chọn khối' }]} className="mb-2">
                                <Select
                                    placeholder="Chọn khối lớp"
                                    className="h-10 [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!bg-slate-50 [&>.ant-select-selector]:!border-transparent [&>.ant-select-selector]:!h-10 [&>.ant-select-selector]:!flex [&>.ant-select-selector]:!items-center"
                                >
                                    {grades.map(g => (
                                        <Select.Option key={g.id} value={g.id}>{g.name} ({g.code})</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </div>

                        <Form.Item label="Mô tả" name="description" className="mb-4">
                            <Input.TextArea rows={2} className="rounded-xl bg-slate-50 border-transparent hover:bg-white focus:bg-white transition-all font-medium" />
                        </Form.Item>

                        <div className="flex gap-3 pt-1">
                            <Button className="flex-1 h-10 rounded-xl font-semibold border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => setIsClassModalOpen(false)}>Hủy bỏ</Button>
                            <Button type="primary" htmlType="submit" loading={classSubmitting} className="flex-1 h-10 rounded-xl bg-[#0487e2] font-bold shadow-lg shadow-blue-200 border-none">
                                {editingClass ? "Lưu Thay Đổi" : "Tạo Lớp Mới"}
                            </Button>
                        </div>
                    </Form>
                </div>
            </Modal>
        </div>
    );
}