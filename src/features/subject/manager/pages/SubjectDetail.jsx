import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle,
    Edit,
    FileText
} from 'lucide-react';
import { getSubjectById, updateSubject } from '../../api/subjectApi';

export default function SubjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [isEditing, setIsEditing] = useState(location.state?.isEditing || false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [originalData, setOriginalData] = useState(null);

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

    useEffect(() => {
        fetchSubjectDetail();
    }, [id]);

    const fetchSubjectDetail = async (silent = false) => {
        try {
            !silent && setLoading(true);
            const response = await getSubjectById(id);
            const data = response.data || response;

            data ? (() => {
                const mappedData = {
                    code: data.code || '',
                    name: data.name || '',
                    nameEn: data.nameEn || '',
                    description: data.description || '',
                    iconUrl: data.iconUrl || '',
                    color: data.color || '#0487e2',
                    sortOrder: data.sortOrder || 0,
                    isActive: !!data.isActive
                };
                setFormData(mappedData);
                setOriginalData(mappedData);
            })() : setError("Không tìm thấy thông tin môn học.");
        } catch (err) {
            console.error("Failed to fetch subject details", err);
            setError("Không thể tải thông tin môn học. Vui lòng kiểm tra kết nối.");
        } finally {
            !silent && setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        try {
            setSaving(true);
            setSuccessMsg('');
            setError(null);

            const payload = {
                id: id,
                code: formData.code.trim(),
                name: formData.name.trim(),
                nameEn: formData.nameEn?.trim() || "",
                description: formData.description?.trim() || "",
                iconUrl: formData.iconUrl?.trim() || "",
                color: formData.color?.trim() || "#0487e2",
                sortOrder: parseInt(formData.sortOrder) || 0,
                isActive: !!formData.isActive
            };

            await updateSubject(id, payload);

            // Re-fetch server data after a tiny delay to ensure consistency
            setTimeout(async () => {
                await fetchSubjectDetail(true);
                setSuccessMsg("Cập nhật môn học thành công!");
                setTimeout(() => {
                    setIsEditing(false);
                    setSuccessMsg('');
                }, 3000);
            }, 500);

        } catch (err) {
            console.error("Failed to update subject", err);
            setError(err.response?.data?.message || "Máy chủ từ chối cập nhật trường này.");
        } finally {
            setSaving(false);
        }
    };

    const isDirty = originalData && Object.keys(formData).some(key => formData[key] !== originalData[key]);

    return loading ? (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="animate-spin text-[#0487e2]" size={40} />
        </div>
    ) : (
        <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
            {/* Top Navigation & Header */}
            <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center">
                <div>
                    <button
                        onClick={() => navigate('/dashboard/manager/subjects')}
                        className="flex items-center gap-2 text-slate-500 hover:text-[#0463ca] transition-colors mb-2 text-sm font-medium"
                    >
                        <ArrowLeft size={16} />
                        Quay lại danh sách
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isEditing ? 'Chỉnh sửa Môn học' : 'Chi tiết Môn học'}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">{formData.name} ({formData.code})</p>
                </div>

                <div className="flex items-center gap-4">
                    {successMsg && (
                        <div className="hidden md:flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-right-4">
                            <CheckCircle size={18} />
                            <span className="text-sm">{successMsg}</span>
                        </div>
                    )}

                    {!isEditing ? (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#0487e2] text-white font-bold rounded-xl hover:bg-[#0463ca] transition-all shadow-md shadow-blue-500/10 active:scale-95"
                        >
                            <Edit size={18} />
                            Chỉnh sửa
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    fetchSubjectDetail();
                                }}
                                className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-200/50 rounded-xl transition-all"
                            >
                                Hủy
                            </button>

                            {isDirty ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-[#0487e2] text-white font-bold rounded-xl hover:bg-[#0463ca] transition-all shadow-md active:scale-95 disabled:opacity-70"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Lưu thay đổi
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all font-bold"
                                >
                                    Thoát
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-5xl mx-auto">
                {error && (
                    <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl flex items-center gap-3 border border-rose-100 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={20} />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-left">
                    <div className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-left">
                            {/* Main Content Column */}
                            <div className="lg:col-span-2 space-y-10 text-left">
                                {/* Section 1: Basic Details */}
                                <div className="text-left">
                                    <h2 className="text-lg font-bold text-[#0463ca] mb-6 flex items-center gap-2">
                                        <FileText size={20} />
                                        Thông tin cơ bản
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-2 text-left">
                                            <label className="block text-sm font-bold text-slate-700">
                                                Tên Môn học (VN) <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0487e2]/20 focus:border-[#0487e2] transition-all font-medium disabled:bg-slate-50 disabled:text-slate-500"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="space-y-2 text-left">
                                            <label className="block text-sm font-bold text-slate-700">
                                                Tên Môn học (EN)
                                            </label>
                                            <input
                                                type="text"
                                                name="nameEn"
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0487e2]/20 focus:border-[#0487e2] transition-all font-medium disabled:bg-slate-50 disabled:text-slate-500"
                                                value={formData.nameEn}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="space-y-2 text-left">
                                            <label className="block text-sm font-bold text-slate-700">
                                                Mã Môn học <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="code"
                                                required
                                                disabled={true}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium uppercase text-slate-500 cursor-not-allowed"
                                                value={formData.code}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-left">
                                        <label className="block text-sm font-bold text-slate-700 font-bold">Mô tả</label>
                                        <textarea
                                            name="description"
                                            rows={4}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0487e2]/20 focus:border-[#0487e2] transition-all resize-none disabled:bg-slate-50 disabled:text-slate-500"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                {/* Section 2: Curriculum Structure - Removed as requested (Mock) */}
                            </div>

                            {/* Sidebar Column */}
                            <div className="space-y-8 text-left">
                                <div className="text-left">
                                    <h3 className="text-lg font-bold text-[#0463ca] mb-6 font-bold text-left">Cấu hình</h3>
                                    <div className="space-y-6 text-left">
                                        <div className="space-y-2 text-left">
                                            <label className="block text-sm font-bold text-slate-700 font-bold">Trạng thái hiện tại</label>
                                            <label className={`relative inline-flex items-center cursor-pointer w-full p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors ${!isEditing ? 'pointer-events-none opacity-80 bg-slate-50' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    name="isActive"
                                                    checked={formData.isActive}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    className="sr-only peer"
                                                />
                                                <div className="relative w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0487e2]"></div>
                                                <span className={`ml-3 text-sm font-bold ${formData.isActive ? 'text-[#0487e2]' : 'text-slate-500'}`}>
                                                    {formData.isActive ? 'Đã xuất bản' : 'Bản nháp'}
                                                </span>
                                            </label>
                                        </div>

                                        <div className="space-y-2 text-left">
                                            <label className="block text-sm font-bold text-slate-700">Màu sắc nhận diện</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    name="color"
                                                    disabled={!isEditing}
                                                    className="h-11 w-12 border-none rounded-xl cursor-pointer shadow-sm disabled:opacity-50"
                                                    value={formData.color}
                                                    onChange={handleInputChange}
                                                />
                                                <input
                                                    type="text"
                                                    name="color"
                                                    disabled={!isEditing}
                                                    className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0487e2]/20 focus:border-[#0487e2] text-sm font-mono uppercase disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                                                    value={formData.color}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-left">
                                            <label className="block text-sm font-bold text-slate-700">Thứ tự ưu tiên</label>
                                            <input
                                                type="number"
                                                name="sortOrder"
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0487e2]/20 focus:border-[#0487e2] transition-all disabled:bg-slate-50 disabled:text-slate-500 font-medium"
                                                value={formData.sortOrder}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50/50 px-8 py-4 border-t border-slate-100 flex items-center justify-center">
                        <p className="text-xs text-slate-400 font-medium italic">
                            {isEditing ? 'Đã bật chế độ chỉnh sửa' : 'Chế độ xem thông tin'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
