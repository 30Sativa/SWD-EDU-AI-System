import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Video,
    FileText,
    CheckSquare,
    Play,
    Download,
    Plus,
    Settings2,
    Clock,
    BookOpen,
    Users,
    Calendar,
    FileVideo,
    Layers,
    AlignLeft
} from 'lucide-react';
import {
    Tag,
    Button,
    Tabs,
    Switch,
    Breadcrumb,
    Spin,
    message,
    Empty,
    Tooltip
} from 'antd';
import { getLessonDetail, getLessonBlocks, updateLesson } from '../../api/lessonApi';
// import axiosClient from '../../../../lib/axiosClient'; // Bỏ comment nếu cần dùng

export default function LessonDetail() {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [lesson, setLesson] = useState(null);
    const [blocks, setBlocks] = useState([]);

    useEffect(() => {
        const fetchLessonData = async () => {
            try {
                setLoading(true);
                const [lessonRes, blocksRes] = await Promise.all([
                    getLessonDetail(lessonId),
                    getLessonBlocks(lessonId)
                ]);

                setLesson(lessonRes?.data || lessonRes);
                setBlocks(blocksRes?.data?.items || blocksRes?.items || blocksRes?.data || []);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu bài học:", error);
                message.error("Không thể tải thông tin bài học");
            } finally {
                setLoading(false);
            }
        };

        if (lessonId) {
            fetchLessonData();
        }
    }, [lessonId]);

    const handleTogglePublish = async (checked) => {
        try {
            await updateLesson(lessonId, { ...lesson, isPublished: checked });
            setLesson(prev => ({ ...prev, isPublished: checked }));
            message.success(checked ? "Đã công khai bài giảng" : "Đã chuyển thành bản nháp");
        } catch (error) {
            message.error("Lỗi khi cập nhật trạng thái bài giảng");
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Spin size="large" />
                <p className="mt-4 text-slate-500 font-medium">Đang tải chi tiết bài học...</p>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <Empty description={<span className="text-slate-500 font-medium">Không tìm thấy bài học</span>}>
                    <Button type="primary" onClick={() => navigate(-1)} className="bg-[#0487e2]">Quay lại</Button>
                </Empty>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800 pb-12">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header & Breadcrumb */}
                <div className="flex flex-col gap-4">
                    <Breadcrumb
                        className="text-xs font-medium"
                        items={[
                            { title: <a onClick={() => navigate('/dashboard/teacher/courses')} className="text-slate-400 hover:text-[#0487e2]">Quản lý Khóa học</a> },
                            { title: <span className="text-slate-400 cursor-pointer hover:text-[#0487e2]" onClick={() => navigate(-1)}>Chi tiết khóa</span> },
                            { title: <span className="text-slate-600 font-bold">{lesson.title}</span> },
                        ]}
                    />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <Button
                                    type="text"
                                    icon={<ArrowLeft size={18} />}
                                    onClick={() => navigate(-1)}
                                    className="h-8 w-8 !p-0 flex items-center justify-center text-slate-400 hover:text-[#0487e2] hover:bg-blue-50 -ml-2"
                                />
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0463ca] m-0">
                                    {lesson.title}
                                </h1>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-[13px]">
                                {lesson.isPublished ? (
                                    <Tag className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold px-2.5 py-0.5 rounded-md m-0">ĐÃ XUẤT BẢN</Tag>
                                ) : (
                                    <Tag className="bg-slate-100 text-slate-500 border-slate-200 font-bold px-2.5 py-0.5 rounded-md m-0">BẢN NHÁP</Tag>
                                )}
                                <span className="text-slate-400 font-bold">ID: {lesson.code || lesson.id || 'N/A'}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="flex items-center gap-1 text-slate-500 font-medium">
                                    <Layers size={14} className="text-[#0487e2]" />
                                    Môn: <span className="text-slate-700 font-bold">{lesson.subjectName || 'N/A'}</span>
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="flex items-center gap-1 text-slate-500 font-medium">
                                    <Clock size={14} className="text-amber-500" />
                                    Thời lượng: <span className="text-slate-700 font-bold">{lesson.duration || 0} phút</span>
                                </span>
                            </div>
                        </div>

                        {/* Top Actions */}
                        <div className="flex items-center gap-3">
                            <Button className="h-10 rounded-lg font-semibold border-slate-200 text-slate-600 hover:border-[#0487e2] hover:text-[#0487e2]">
                                Xem thử (Preview)
                            </Button>
                            <Button type="primary" className="bg-[#0487e2] hover:bg-[#0374c4] h-10 px-5 rounded-lg font-bold shadow-md border-none flex items-center">
                                Lưu thay đổi
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="bg-white px-5 rounded-xl border border-slate-200 shadow-sm mt-4">
                    <Tabs
                        defaultActiveKey="1"
                        className="custom-tabs"
                        items={[
                            { key: '1', label: 'Nội dung bài giảng' },
                            { key: '2', label: 'Tài liệu đính kèm' },
                            { key: '3', label: 'Bài tập & Quiz' },
                            { key: '4', label: 'Thống kê học tập' },
                        ]}
                    />
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Video & Blocks (Chiếm 2/3) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Video Preview Container */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="aspect-video bg-slate-900 relative flex items-center justify-center group">
                                {lesson.type === 'Video' || !lesson.type ? (
                                    <>
                                        <img
                                            src={lesson.thumbnail || "https://images.unsplash.com/photo-1610484826967-09c5720778c7?q=80&w=2070&auto=format&fit=crop"}
                                            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity duration-300"
                                            alt="Video preview"
                                        />
                                        <div className="relative z-10">
                                            <button className="w-16 h-16 bg-[#0487e2]/90 hover:bg-[#0487e2] text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/20">
                                                <Play size={28} fill="currentColor" className="ml-1" />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10">
                                            <div>
                                                <Tag className="bg-blue-500/80 text-white border-none font-bold backdrop-blur-md mb-2">VIDEO CHÍNH</Tag>
                                                <h3 className="text-white font-bold text-lg drop-shadow-md line-clamp-1">{lesson.title}</h3>
                                            </div>
                                            <div className="bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded text-xs font-bold">
                                                {lesson.duration || '00:00'}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-3 text-slate-400">
                                        {(lesson.type === 'Document' || lesson.type === 'Text') ? <FileText size={48} /> : <CheckSquare size={48} />}
                                        <p className="font-bold">Bài giảng dạng: {lesson.type}</p>
                                    </div>
                                )}
                            </div>
                            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-medium">Bạn có thể thay đổi hoặc tải lên video mới trong phần Cài đặt.</span>
                                <Button type="text" size="small" className="text-[#0487e2] font-semibold hover:bg-blue-50">Đổi Video</Button>
                            </div>
                        </div>

                        {/* Blocks/Content Editor Section */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <AlignLeft size={18} className="text-[#0487e2]" />
                                    Nội dung & Khối kiến thức
                                </h2>
                                <Button
                                    type="dashed"
                                    icon={<Plus size={16} />}
                                    className="border-slate-300 text-[#0487e2] font-semibold hover:border-[#0487e2] hover:text-[#0487e2] flex items-center"
                                >
                                    Thêm nội dung
                                </Button>
                            </div>

                            <div className="p-6">
                                {/* Description */}
                                <div className="mb-8">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Mô tả bài học</h3>
                                    {lesson.content ? (
                                        <div className="p-4 bg-slate-50 rounded-xl text-slate-700 leading-relaxed font-medium text-[15px] border border-slate-100 whitespace-pre-wrap">
                                            {lesson.content}
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 font-medium italic text-sm">
                                            Chưa có mô tả tổng quan cho bài học này.
                                        </div>
                                    )}
                                </div>

                                {/* Blocks List */}
                                <div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Các khối kiến thức (Blocks)</h3>
                                    {blocks && blocks.length > 0 ? (
                                        <div className="space-y-4">
                                            {blocks.sort((a, b) => a.sortOrder - b.sortOrder).map((block, idx) => (
                                                <div key={block.id} className="group flex gap-4 p-5 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-md transition-all">
                                                    <div className="w-8 h-8 shrink-0 bg-blue-50 text-[#0487e2] rounded-lg flex items-center justify-center font-bold text-sm">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h4 className="text-base font-bold text-slate-800 truncate">{block.title || `Khối kiến thức ${idx + 1}`}</h4>
                                                            <Tag className="m-0 font-bold uppercase text-[10px] rounded" color={block.type === 'Video' ? 'blue' : (block.type === 'Image' ? 'green' : 'default')}>
                                                                {block.type || 'Text'}
                                                            </Tag>
                                                        </div>
                                                        <div className="text-slate-500 font-medium text-sm whitespace-pre-wrap line-clamp-3">
                                                            {block.content}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-300 mb-3">
                                                <Layers size={20} />
                                            </div>
                                            <p className="text-slate-500 font-medium mb-1">Chưa có khối nội dung nào.</p>
                                            <p className="text-slate-400 text-xs">Hãy thêm các phần diễn giải, hình ảnh hoặc ví dụ chi tiết.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Settings & Resources (Chiếm 1/3) */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Status & Visibility Card */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                                <Settings2 size={18} className="text-[#0487e2]" />
                                <h3 className="font-bold text-slate-800">Cấu hình hiển thị</h3>
                            </div>

                            <div className="p-5 space-y-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-slate-800 text-[14px]">Công khai bài giảng</div>
                                        <div className="text-xs text-slate-500 mt-0.5">Học sinh có thể xem nội dung</div>
                                    </div>
                                    <Switch checked={lesson.isPublished} onChange={handleTogglePublish} className={lesson.isPublished ? 'bg-emerald-500' : ''} />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-slate-800 text-[14px]">Cho phép tải tài liệu</div>
                                        <div className="text-xs text-slate-500 mt-0.5">Quyền tải PDF, Slides...</div>
                                    </div>
                                    <Switch defaultChecked className="bg-[#0487e2]" />
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Gán cho lớp học</label>
                                    <div className="flex flex-wrap gap-2">
                                        <Tag className="m-0 px-2.5 py-1 bg-blue-50 text-[#0487e2] border-none font-bold rounded-md">12A1</Tag>
                                        <Tag className="m-0 px-2.5 py-1 bg-blue-50 text-[#0487e2] border-none font-bold rounded-md">12A3</Tag>
                                        <Tooltip title="Chỉnh sửa danh sách lớp">
                                            <button className="flex items-center justify-center w-7 h-7 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-md transition-colors">
                                                <Plus size={14} />
                                            </button>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Materials Section */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <BookOpen size={18} className="text-[#0487e2]" />
                                    <h3 className="font-bold text-slate-800">Tài liệu học tập</h3>
                                </div>
                                <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0487e2] text-xs font-bold flex items-center justify-center">2</span>
                            </div>

                            <div className="p-5 space-y-3">
                                {[
                                    { name: 'Giao_an_chi_tiet.pdf', size: '2.4 MB', type: 'pdf' },
                                    { name: 'Bai_giang_Slide.pptx', size: '15.8 MB', type: 'powerpoint' }
                                ].map((doc, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group/item">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${doc.type === 'pdf' ? 'bg-rose-50 text-rose-500' : 'bg-orange-50 text-orange-500'}`}>
                                            {doc.type === 'pdf' ? <FileText size={20} /> : <FileVideo size={20} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-[13px] text-slate-700 group-hover/item:text-[#0487e2] transition-colors truncate">{doc.name}</div>
                                            <div className="text-[11px] font-semibold text-slate-400 mt-0.5">{doc.size}</div>
                                        </div>
                                        <button className="w-8 h-8 shrink-0 flex items-center justify-center text-slate-300 hover:text-[#0487e2] hover:bg-white rounded-md transition-all">
                                            <Download size={16} />
                                        </button>
                                    </div>
                                ))}

                                <Button
                                    type="dashed"
                                    block
                                    className="mt-2 h-10 border-slate-300 text-slate-500 font-semibold hover:border-[#0487e2] hover:text-[#0487e2]"
                                    icon={<Plus size={16} />}
                                >
                                    Tải lên tài liệu
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Antd Style Overrides to match EduStruct theme */}
            <style>{`
                .custom-tabs .ant-tabs-nav {
                    margin-bottom: 0 !important;
                }
                .custom-tabs .ant-tabs-tab {
                    padding: 16px 0;
                    margin: 0 32px 0 0;
                }
                .custom-tabs .ant-tabs-tab-btn {
                    font-size: 14px;
                    font-weight: 700;
                    color: #64748b;
                }
                .custom-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
                    color: #0487e2 !important;
                }
                .custom-tabs .ant-tabs-ink-bar {
                    background: #0487e2 !important;
                    height: 3px !important;
                    border-radius: 3px 3px 0 0;
                }
            `}</style>
        </div>
    );
}