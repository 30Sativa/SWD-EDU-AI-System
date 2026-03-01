import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, LayoutGrid, List, Eye, Hash, Palette, LayoutList, Book } from 'lucide-react';
import { Table, Button, Input, Modal, Form, Tag, message, Spin, Tooltip, Empty, Select, Tabs } from 'antd';

import { getSubjects, createSubject } from '../../api/subjectApi';
import { getCourseCategories, createCourseCategory, updateCourseCategory } from '../../../category/api/categoryApi';

export default function SubjectManagement() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('1'); // '1': Subjects, '2': Categories

    // Shared state
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');

    // Subject state
    const [subjects, setSubjects] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [subjectStatusFilter, setSubjectStatusFilter] = useState('All');
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [subjectSubmitting, setSubjectSubmitting] = useState(false);
    const [subjectForm] = Form.useForm();

    // Category state
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isCategoryEditing, setIsCategoryEditing] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [categorySubmitting, setCategorySubmitting] = useState(false);
    const [categoryForm] = Form.useForm();

    const fetchSubjects = useCallback(async () => {
        try {
            setLoadingSubjects(true);
            const response = await getSubjects();
            const data = response?.data?.items || response?.items || response?.data || response || [];
            setSubjects(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Không thể tải danh sách môn học:', error);
            message.error('Không thể kết nối máy chủ để tải danh sách môn học');
        } finally {
            setLoadingSubjects(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            setLoadingCategories(true);
            const response = await getCourseCategories({ pageSize: 1000 });
            const data = response?.data?.items || response?.items || response?.data || response || [];
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Không thể tải danh sách danh mục:', error);
            message.error('Không thể tải tài nguyên từ máy chủ');
        } finally {
            setLoadingCategories(false);
        }
    }, []);

    useEffect(() => {
        fetchSubjects();
        fetchCategories();
    }, [fetchSubjects, fetchCategories]);

    // ===== SUBJECT HANDLERS =====
    const handleOpenSubjectModal = () => {
        subjectForm.resetFields();
        subjectForm.setFieldsValue({ color: '#0487e2', isActive: true, sortOrder: 0 });
        setIsSubjectModalOpen(true);
    };

    const handleCloseSubjectModal = () => {
        setIsSubjectModalOpen(false);
        subjectForm.resetFields();
    };

    const handleSubjectSubmit = async (values) => {
        try {
            setSubjectSubmitting(true);
            const payload = {
                ...values,
                code: values.code.toUpperCase()
            };
            await createSubject(payload);
            message.success('Tạo môn học mới thành công!');
            handleCloseSubjectModal();
            fetchSubjects();
        } catch (error) {
            console.error('Lỗi khi tạo môn học:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra trong quá trình xử lý');
        } finally {
            setSubjectSubmitting(false);
        }
    };

    // ===== CATEGORY HANDLERS =====
    const handleOpenCategoryModal = (record = null) => {
        if (record) {
            categoryForm.setFieldsValue({
                name: record.name,
                description: record.description,
            });
            setIsCategoryEditing(true);
            setEditingCategoryId(record.id);
        } else {
            categoryForm.resetFields();
            setIsCategoryEditing(false);
            setEditingCategoryId(null);
        }
        setIsCategoryModalOpen(true);
    };

    const handleCloseCategoryModal = () => {
        setIsCategoryModalOpen(false);
        categoryForm.resetFields();
    };

    const handleCategorySubmit = async (values) => {
        try {
            setCategorySubmitting(true);
            const payload = {
                name: values.name,
                description: values.description || ""
            };

            if (isCategoryEditing) {
                await updateCourseCategory(editingCategoryId, payload);
                message.success('Cập nhật danh mục thành công!');
            } else {
                await createCourseCategory(payload);
                message.success('Tạo danh mục mới thành công!');
            }

            handleCloseCategoryModal();
            fetchCategories();
        } catch (error) {
            console.error('Lỗi khi lưu danh mục:', error);
            message.error(error.response?.data?.message?.toString() || 'Có lỗi xảy ra trong quá trình xử lý');
        } finally {
            setCategorySubmitting(false);
        }
    };

    // ===== FILTERING =====
    const filteredSubjects = useMemo(() => subjects.filter(item => {
        const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.code?.toLowerCase().includes(searchTerm.toLowerCase());
        if (subjectStatusFilter === 'Public') return matchesSearch && item.isActive;
        if (subjectStatusFilter === 'Draft') return matchesSearch && !item.isActive;
        return matchesSearch;
    }), [subjects, searchTerm, subjectStatusFilter]);

    const filteredCategories = useMemo(() => categories.filter(item => {
        return item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    }), [categories, searchTerm]);

    // ===== COLUMNS =====
    const subjectColumns = [
        {
            title: 'Môn học',
            key: 'subject',
            render: (_, record) => (
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/dashboard/manager/subjects/${record.id}`)}>
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm shrink-0"
                        style={{ backgroundColor: record.color || '#0487e2' }}
                    >
                        {record.name?.charAt(0)}
                    </div>
                    <div className="min-w-0 text-left">
                        <div className="font-bold text-slate-700 hover:text-[#0487e2] transition-colors truncate">{record.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium truncate uppercase">{record.nameEn || 'N/A'}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'Mã môn',
            dataIndex: 'code',
            key: 'code',
            render: (code) => <Tag className="rounded-lg font-mono font-bold border-none bg-slate-100 text-slate-600">{code}</Tag>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Tag color={isActive ? 'success' : 'default'} className="rounded-full px-3 uppercase text-[10px] font-bold border-none">
                    {isActive ? 'Công khai' : 'Bản nháp'}
                </Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'right',
            render: (_, record) => (
                <div className="flex items-center justify-end gap-1">
                    <Tooltip title="Xem chi tiết">
                        <Button type="text" icon={<Eye size={16} />} onClick={() => navigate(`/dashboard/manager/subjects/${record.id}`)} className="text-slate-400 hover:text-[#0487e2]" />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<Edit size={16} />} onClick={() => navigate(`/dashboard/manager/subjects/${record.id}`, { state: { isEditing: true } })} className="text-slate-400 hover:text-[#0487e2]" />
                    </Tooltip>
                </div>
            )
        }
    ];

    const categoryColumns = [
        {
            title: 'Danh mục khóa học',
            key: 'category',
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#0487e2] bg-blue-50 font-bold shadow-sm shrink-0">
                        <LayoutList size={20} />
                    </div>
                    <div className="min-w-0 text-left">
                        <div className="font-bold text-slate-700 hover:text-[#0487e2] transition-colors truncate">{record.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium truncate">{record.description || 'Không có mô tả'}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'right',
            width: 100,
            render: (_, record) => (
                <div className="flex items-center justify-end gap-1">
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<Edit size={16} />} onClick={(e) => { e.stopPropagation(); handleOpenCategoryModal(record); }} className="text-slate-400 hover:text-[#0487e2]" />
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Quản lý Môn học & Danh mục</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Bố trí và cấu trúc chương trình đào tạo.</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<Plus size={18} />}
                        onClick={() => activeTab === '1' ? handleOpenSubjectModal() : handleOpenCategoryModal()}
                        className="bg-[#0487e2] hover:bg-[#0374c4] h-11 px-6 rounded-lg font-bold shadow-md border-none flex items-center"
                    >
                        {activeTab === '1' ? 'Tạo Môn học mới' : 'Tạo Danh mục mới'}
                    </Button>
                </header>

                {/* Main Content with Tabs */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 pt-2">
                        <Tabs
                            activeKey={activeTab}
                            onChange={(key) => {
                                setActiveTab(key);
                                setSearchTerm(''); // Reset search term when switching tab
                            }}
                            items={[
                                {
                                    key: '1',
                                    label: (
                                        <span className="flex items-center gap-2 px-1">
                                            <Book size={16} />
                                            Danh sách Môn học
                                        </span>
                                    ),
                                },
                                {
                                    key: '2',
                                    label: (
                                        <span className="flex items-center gap-2 px-1">
                                            <LayoutList size={16} />
                                            Danh mục Khóa học
                                        </span>
                                    ),
                                }
                            ]}
                        />
                    </div>

                    {/* Toolbar */}
                    <div className="px-4 py-3 bg-slate-50/50 border-t border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="text-sm font-medium text-slate-500 pl-2">
                            Hiển thị {activeTab === '1' ? filteredSubjects.length : filteredCategories.length} kết quả
                        </div>
                        <div className="flex flex-1 gap-3 w-full justify-end">
                            <Input
                                placeholder={activeTab === '1' ? "Tìm kiếm mã hoặc tên môn học..." : "Tìm kiếm tên danh mục..."}
                                prefix={<Search size={16} className="text-slate-400" />}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="h-10 w-full md:max-w-md rounded-lg border-slate-200 bg-white"
                                allowClear
                            />
                            {activeTab === '1' && (
                                <Select
                                    value={subjectStatusFilter}
                                    className="w-40 h-10 [&>.ant-select-selector]:!rounded-lg [&>.ant-select-selector]:!h-10 [&>.ant-select-selector]:!flex [&>.ant-select-selector]:!items-center"
                                    onChange={setSubjectStatusFilter}
                                    options={[
                                        { value: 'All', label: 'Tất cả trạng thái' },
                                        { value: 'Public', label: 'Đã công khai' },
                                        { value: 'Draft', label: 'Đang soạn thảo' },
                                    ]}
                                />
                            )}
                            <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg shrink-0">
                                <Button
                                    type="text"
                                    icon={<LayoutGrid size={16} />}
                                    onClick={() => setViewMode('grid')}
                                    className={`rounded-md h-8 w-8 flex items-center justify-center p-0 ${viewMode === 'grid' ? 'bg-blue-50 text-[#0487e2]' : 'text-slate-400'}`}
                                />
                                <Button
                                    type="text"
                                    icon={<List size={16} />}
                                    onClick={() => setViewMode('list')}
                                    className={`rounded-md h-8 w-8 flex items-center justify-center p-0 ${viewMode === 'list' ? 'bg-blue-50 text-[#0487e2]' : 'text-slate-400'}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Data Display */}
                    <div className="p-0">
                        {activeTab === '1' ? (
                            loadingSubjects ? (
                                <div className="flex flex-col items-center justify-center py-20"><Spin size="large" /></div>
                            ) : filteredSubjects.length === 0 ? (
                                <div className="py-20 text-center"><Empty description="Không tìm thấy môn học nào" /></div>
                            ) : viewMode === 'grid' ? (
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredSubjects.map((item) => (
                                        <div key={item.id} className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#0487e2] hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between h-full relative overflow-hidden" onClick={() => navigate(`/dashboard/manager/subjects/${item.id}`)}>
                                            <div className="relative z-10 w-full mb-auto pb-4 border-b border-slate-100/80 group-hover:border-blue-100 transition-colors">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-14 h-14 rounded-[14px] flex items-center justify-center text-white text-2xl font-black shadow-md shrink-0" style={{ backgroundColor: item.color || '#0487e2' }}>
                                                        {item.name?.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 min-w-0 pt-0.5">
                                                        <h3 className="text-base sm:text-lg font-bold text-slate-800 group-hover:text-[#0487e2] transition-colors leading-tight line-clamp-2">{item.name}</h3>
                                                        <p className="text-[11px] text-slate-400 font-semibold uppercase mt-1.5">{item.nameEn || 'Tên tiếng Anh N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative z-10 mt-4 flex items-center justify-between w-full">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">{item.code}</span>
                                                    <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1.5 ${item.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                        {item.isActive ? 'Công khai' : 'Bản nháp'}
                                                    </div>
                                                </div>
                                                <Button size="small" type="text" icon={<Edit size={16} />} onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/manager/subjects/${item.id}`, { state: { isEditing: true } }); }} className="text-slate-400 hover:text-[#0487e2] hover:bg-blue-50 shrink-0 w-8 h-8 rounded-lg ml-2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Table columns={subjectColumns} dataSource={filteredSubjects} rowKey="id" pagination={{ pageSize: 10, showSizeChanger: false }} className="custom-table" />
                            )
                        ) : (
                            loadingCategories ? (
                                <div className="flex flex-col items-center justify-center py-20"><Spin size="large" /></div>
                            ) : filteredCategories.length === 0 ? (
                                <div className="py-20 text-center"><Empty description="Không tìm thấy danh mục nào" /></div>
                            ) : viewMode === 'grid' ? (
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredCategories.map((item) => (
                                        <div key={item.id} className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#0487e2] hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
                                            <div className="relative z-10 w-full mb-auto pb-4 border-b border-slate-100/80 group-hover:border-blue-100 transition-colors">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-14 h-14 rounded-[14px] flex items-center justify-center text-[#0487e2] bg-blue-50/50 text-2xl font-black shadow-sm shrink-0">
                                                        <LayoutList size={24} />
                                                    </div>
                                                    <div className="flex-1 min-w-0 pt-0.5">
                                                        <h3 className="text-base sm:text-lg font-bold text-slate-800 group-hover:text-[#0487e2] transition-colors leading-tight line-clamp-2">{item.name}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative z-10 mt-4 flex items-center justify-between w-full">
                                                <p className="text-[11px] text-slate-400 font-semibold tracking-wide truncate w-full pr-4">{item.description || "Không có mô tả chi tiết."}</p>
                                                <Button size="small" type="text" icon={<Edit size={16} />} onClick={(e) => { e.stopPropagation(); handleOpenCategoryModal(item); }} className="text-slate-400 hover:text-[#0487e2] hover:bg-blue-50 shrink-0 w-8 h-8 rounded-lg" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Table columns={categoryColumns} dataSource={filteredCategories} rowKey="id" pagination={{ pageSize: 10, showSizeChanger: false }} className="custom-table" />
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* SUBJECT MODAL */}
            <Modal
                title={<div className="flex items-center gap-2 text-[#0463ca] uppercase text-xs font-black tracking-widest"><Plus size={16} /> Xác nhận khởi tạo môn học mới</div>}
                open={isSubjectModalOpen}
                onCancel={handleCloseSubjectModal}
                footer={null}
                centered
                width={600}
                className="custom-modal"
            >
                <Form form={subjectForm} layout="vertical" onFinish={handleSubjectSubmit} className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mã định danh (Code)</span>} name="code" rules={[{ required: true, message: 'Vui lòng nhập mã môn học' }]}>
                            <Input placeholder="VD: MAT10" className="h-11 rounded-lg font-bold uppercase" prefix={<Hash size={16} className="text-slate-400" />} />
                        </Form.Item>
                        <Form.Item label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Thứ tự ưu tiên</span>} name="sortOrder">
                            <Input type="number" placeholder="0" className="h-11 rounded-lg" />
                        </Form.Item>
                    </div>
                    <Form.Item label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tên Môn học (Tiếng Việt)</span>} name="name" rules={[{ required: true, message: 'Vui lòng nhập tên môn học' }]}>
                        <Input placeholder="VD: Toán học - Lớp 10" className="h-11 rounded-lg font-bold" />
                    </Form.Item>
                    <Form.Item label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tên Môn học (Tiếng Anh)</span>} name="nameEn">
                        <Input placeholder="VD: Mathematics Grade 10" className="h-11 rounded-lg" />
                    </Form.Item>
                    <Form.Item label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mô tả tóm tắt</span>} name="description">
                        <Input.TextArea rows={3} placeholder="Giới thiệu sơ lược nội dung môn học..." className="rounded-lg" />
                    </Form.Item>
                    <Form.Item label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Màu sắc thương hiệu</span>} name="color">
                        <div className="flex items-center gap-4">
                            <Input type="color" className="w-16 h-11 p-1 rounded-lg border-slate-200 cursor-pointer" onChange={(e) => subjectForm.setFieldsValue({ color: e.target.value })} />
                            <Input placeholder="#0487e2" className="h-11 rounded-lg font-mono uppercase" prefix={<Palette size={16} className="text-slate-400" />} />
                        </div>
                    </Form.Item>
                    <Form.Item name="isActive" valuePropName="checked">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                                <span className="text-sm font-bold text-slate-700 block">Xuất bản ngay</span>
                                <span className="text-[10px] text-slate-400 uppercase font-black">Cho phép sử dụng môn học này</span>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className={`w-10 h-6 rounded-full transition-all relative ${subjectForm.getFieldValue('isActive') ? 'bg-[#0487e2]' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${subjectForm.getFieldValue('isActive') ? 'left-5' : 'left-1'}`} />
                                </div>
                                <input type="checkbox" className="hidden" checked={subjectForm.getFieldValue('isActive')} onChange={e => subjectForm.setFieldsValue({ isActive: e.target.checked })} />
                            </label>
                        </div>
                    </Form.Item>
                    <div className="flex gap-3 pt-4">
                        <Button onClick={handleCloseSubjectModal} className="flex-1 rounded-lg h-11 font-bold text-slate-400 border-none bg-slate-100 hover:bg-slate-200">Hủy bỏ</Button>
                        <Button type="primary" htmlType="submit" loading={subjectSubmitting} className="flex-1 bg-[#0487e2] h-11 rounded-lg font-bold uppercase text-xs tracking-widest shadow-md border-none">Xác nhận khởi tạo</Button>
                    </div>
                </Form>
            </Modal>

            {/* CATEGORY MODAL */}
            <Modal
                title={<div className="flex items-center gap-2 text-[#0463ca] uppercase text-xs font-black tracking-widest"><LayoutList size={16} /> {isCategoryEditing ? 'Cập nhật Danh mục' : 'Tạo Danh mục mới'}</div>}
                open={isCategoryModalOpen}
                onCancel={handleCloseCategoryModal}
                footer={null}
                centered
                width={500}
                className="custom-modal"
            >
                <Form form={categoryForm} layout="vertical" onFinish={handleCategorySubmit} className="pt-6">
                    <Form.Item label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tên Danh mục</span>} name="name" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}>
                        <Input placeholder="VD: Lập trình Web" className="h-11 rounded-lg font-bold" />
                    </Form.Item>
                    <Form.Item label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mô tả</span>} name="description">
                        <Input.TextArea rows={4} placeholder="Thông tin chuyên sâu..." className="rounded-lg" />
                    </Form.Item>
                    <div className="flex gap-3 pt-4">
                        <Button onClick={handleCloseCategoryModal} className="flex-1 rounded-lg h-11 font-bold text-slate-400 border-none bg-slate-100 hover:bg-slate-200">Hủy bỏ</Button>
                        <Button type="primary" htmlType="submit" loading={categorySubmitting} className="flex-1 bg-[#0487e2] h-11 rounded-lg font-bold uppercase text-xs tracking-widest shadow-md border-none">{isCategoryEditing ? 'Lưu thay đổi' : 'Khởi tạo ngay'}</Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}