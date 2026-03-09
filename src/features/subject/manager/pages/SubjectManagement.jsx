import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Loader2,
    AlertCircle,
    Book,
    MoreVertical,
    Filter,
    X,
    Edit,
    Eye,
    LayoutGrid,
    List,
    ChevronDown,
    Grid3X3,
    Save,
    Hash
} from 'lucide-react';
import { getSubjects, createSubject, updateSubject } from '../../api/subjectApi';

export default function SubjectManagement() {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [statusFilter, setStatusFilter] = useState('All');

    const [editingSubject, setEditingSubject] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        nameEn: '',
        description: '',
        iconUrl: '',
        color: '#0487e2',
        sortOrder: 0,
        isActive: false
    });

    const fetchSubjects = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getSubjects();
            const subjectList = (response.data?.items) || (response.items) || (response.data) || [];

            setSubjects(subjectList);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch subjects", err);
            setError("Không thể tải danh sách môn học. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    const resetForm = useCallback(() => {
        setFormData({
            code: '',
            name: '',
            nameEn: '',
            description: '',
            iconUrl: '',
            color: '#0487e2',
            sortOrder: 0,
            isActive: false
        });
        setEditingSubject(null);
    }, []);

    const handleOpenModal = useCallback((subject = null) => {
        subject ? setFormData({
            code: subject.code || '',
            name: subject.name || '',
            nameEn: subject.nameEn || '',
            description: subject.description || '',
            iconUrl: subject.iconUrl || '',
            color: subject.color || '#0487e2',
            sortOrder: subject.sortOrder || 0,
            isActive: !!subject.isActive
        }) : resetForm();
        subject && setEditingSubject(subject);
        setIsModalOpen(true);
    }, [resetForm]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        resetForm();
    }, [resetForm]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        const isValid = formData.name.trim() && formData.code.trim();
        !isValid && alert("Vui lòng nhập đầy đủ Tên và Mã môn học.");
        if (!isValid) return;

        try {
            setSubmitting(true);
            const payload = {
                name: formData.name.trim(),
                code: formData.code.trim(),
                description: formData.description.trim(),
                sortOrder: parseInt(formData.sortOrder) || 0,
                isActive: !!formData.isActive,
                ...(formData.nameEn?.trim() && { nameEn: formData.nameEn.trim() }),
                ...(formData.iconUrl?.trim() && { iconUrl: formData.iconUrl.trim() }),
                ...(formData.color?.trim() && { color: formData.color.trim() })
            };

            editingSubject
                ? await updateSubject(editingSubject.id, payload)
                : await createSubject(payload);

            await fetchSubjects();
            handleCloseModal();
        } catch (err) {
            console.error("Failed to save subject", err);
            const errorMessage = err.response?.data?.message || err.message || "Có lỗi xảy ra.";
            alert(`Lỗi: ${errorMessage}`);
        } finally {
            setSubmitting(false);
        }
    }, [formData, editingSubject, fetchSubjects, handleCloseModal]);

    const filteredData = useMemo(() => subjects.filter(item => {
        const matchesSearch = (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.code?.toLowerCase().includes(searchTerm.toLowerCase()));

        return statusFilter === 'Public' ? (matchesSearch && item.isActive) :
            statusFilter === 'Draft' ? (matchesSearch && !item.isActive) :
                matchesSearch;
    }), [subjects, searchTerm, statusFilter]);

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
            {/* Header Section */}
            <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Quản lý Kho Môn học</h1>
                    <p className="text-slate-500 text-sm mt-1">Quản lý danh sách môn học, mã môn và thông tin mô tả chi tiết.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#0487e2] text-white font-bold rounded-xl hover:bg-[#0463ca] transition-all shadow-md shadow-blue-500/20 active:scale-95"
                    >
                        <Plus size={18} />
                        <span>Tạo Môn học mới</span>
                    </button>
                </div>
            </header>

            {/* Filter & Toolbar Bar */}
            <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] mb-8 flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, mã hoặc ID môn học..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0487e2]/20 focus:border-[#0487e2] transition-all text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Trạng thái</span>
                        <select
                            className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">Tất cả</option>
                            <option value="Public">Công khai</option>
                            <option value="Draft">Bản nháp</option>
                        </select>
                    </div>

                    <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden xl:block"></div>

                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-[#0487e2] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-[#0487e2] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Content Section */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <Loader2 className="animate-spin text-[#0487e2] mb-4" size={40} />
                        <p className="text-slate-500 font-medium font-sans">Đang tải dữ liệu môn học...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-rose-100 shadow-sm text-center px-6">
                        <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-4">
                            <AlertCircle size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Đã xảy ra lỗi</h3>
                        <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">{error}</p>
                        <button onClick={fetchSubjects} className="px-6 py-2.5 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-all shadow-md active:scale-95">
                            Thử lại ngay
                        </button>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm text-center px-6">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                            <Book size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Không tìm thấy môn học nào</h3>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">Hãy thử thay đổi bộ lọc hoặc tạo môn học mới.</p>
                        <button onClick={() => handleOpenModal()} className="px-6 py-2.5 bg-[#0487e2] text-white font-bold rounded-xl hover:bg-[#0463ca] transition-all shadow-md active:scale-95">
                            Tạo môn học đầu tiên
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    /* Grid View - Synchronized Design */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredData.map((item, index) => (
                            <div
                                key={item.id || index}
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#0487e2]/30 transition-all p-6 relative group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-5">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm`} style={{ backgroundColor: item.color || '#0487e2' }}>
                                            {item.iconUrl ? (
                                                <img src={item.iconUrl} alt={item.name} className="w-7 h-7 object-contain" />
                                            ) : (
                                                <Grid3X3 size={24} strokeWidth={2} />
                                            )}
                                        </div>
                                    </div>

                                    <div className="cursor-pointer" onClick={() => navigate(`/dashboard/manager/subjects/${item.id}`)}>
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0487e2] transition-colors">{item.name}</h3>
                                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{item.code || 'NO-CODE'}</p>
                                    </div>

                                    <div className="flex items-center gap-2 mt-5">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${item.isActive
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-1 ring-emerald-100/50'
                                            : 'bg-amber-50 text-amber-700 border-amber-100 ring-1 ring-amber-100/50'
                                            }`}>
                                            {item.isActive ? 'Công khai' : 'Bản nháp'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center text-slate-400">
                                    <div className="flex items-center gap-1.5 text-xs font-bold">
                                        <Grid3X3 size={14} className="text-slate-300" />
                                        <span>{item.code}</span>
                                    </div>
                                </div>

                                {/* Hover Actions */}
                                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/manager/subjects/${item.id}`, { state: { isEditing: true } }); }}
                                        className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-[#0487e2] hover:border-[#0487e2] rounded-xl shadow-sm transition-all"
                                        title="Sửa nhanh"
                                    >
                                        <Edit size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* List View - Re-synchronized Table */
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200 tracking-widest">
                                <tr>
                                    <th className="px-8 py-4">Môn học</th>
                                    <th className="px-8 py-4">Mã môn</th>
                                    <th className="px-6 py-4 text-center">Trạng thái</th>
                                    <th className="px-8 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredData.map((item, index) => (
                                    <tr key={item.id || index} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm" style={{ backgroundColor: item.color || '#0487e2' }}>
                                                    {item.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 group-hover:text-[#0487e2] transition-colors">{item.name}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.code || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-bold text-slate-600 uppercase">{item.code}</span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${item.isActive
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-1 ring-emerald-100/50'
                                                : 'bg-amber-50 text-amber-700 border-amber-100 ring-1 ring-amber-100/50'
                                                }`}>
                                                {item.isActive ? 'Công khai' : 'Bản nháp'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => navigate(`/dashboard/manager/subjects/${item.id}`)}
                                                className="p-2 text-slate-400 hover:text-[#0487e2] hover:bg-blue-50 rounded-xl transition-all"
                                            >
                                                <Eye size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Footer */}
                <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-6 pb-10">
                    <div className="text-sm font-medium text-slate-400">
                        Hiển thị <span className="text-slate-900 font-bold">1</span> - <span className="text-slate-900 font-bold">{filteredData.length}</span> của <span className="text-slate-900 font-bold">{filteredData.length}</span> môn học
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-xl border border-slate-200 text-slate-400 opacity-30 cursor-not-allowed">
                            <ChevronDown className="rotate-90" size={16} />
                        </button>
                        <button className="w-10 h-10 rounded-xl bg-[#0487e2] text-white font-bold text-sm shadow-md shadow-blue-500/20 active:scale-95">1</button>
                        <button className="p-2 rounded-xl border border-slate-200 text-slate-400 opacity-30 cursor-not-allowed">
                            <ChevronDown className="-rotate-90" size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-[#0463ca]">{editingSubject ? 'Cập nhật Môn học' : 'Tạo Môn học mới'}</h3>
                                <p className="text-xs text-slate-500 mt-1">{editingSubject ? 'Chỉnh sửa thông tin môn học hiện có.' : 'Thiết lập thông tin cơ bản cho môn học mới.'}</p>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-all active:scale-95"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700">Mã Môn học <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ví dụ: MATH10"
                                            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0487e2]/20 focus:border-[#0487e2] transition-all font-bold uppercase"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        />
                                        <Hash size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700">Tên Môn (VN) <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ví dụ: Toán học"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0487e2]/20 focus:border-[#0487e2] transition-all font-medium"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700">Tên Môn (EN)</label>
                                    <input
                                        type="text"
                                        placeholder="Example: Mathematics"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0487e2]/20 focus:border-[#0487e2] transition-all font-medium"
                                        value={formData.nameEn}
                                        onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700">Thứ tự hiển thị</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0487e2]/20 focus:border-[#0487e2] transition-all font-medium"
                                        value={formData.sortOrder}
                                        onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="col-span-1 md:col-span-2 space-y-2">
                                    <label className="block text-sm font-bold text-slate-700">Mô tả</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0487e2]/20 focus:border-[#0487e2] transition-all resize-none font-medium"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Nhập mô tả ngắn cho môn học..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700">Màu sắc nhận diện</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            className="h-10 w-12 border-none rounded-lg cursor-pointer shadow-sm"
                                            value={formData.color || '#0487e2'}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-sm font-mono uppercase"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-8">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        />
                                        <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0487e2]"></div>
                                        <span className="ml-3 text-sm font-bold text-slate-700 uppercase tracking-widest">Công khai</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-all active:scale-95"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-8 py-2.5 bg-[#0487e2] text-white font-bold rounded-xl hover:bg-[#0463ca] transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 active:scale-95 disabled:opacity-70"
                                >
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : (editingSubject ? <Save size={18} /> : <Plus size={18} />)}
                                    <span>{editingSubject ? 'Lưu thay đổi' : 'Tạo Môn học ngay'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
