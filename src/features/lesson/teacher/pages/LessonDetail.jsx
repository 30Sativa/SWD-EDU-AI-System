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
    BarChart3,
    Settings2,
    Clock,
    BookOpen,
    Eye,
    Users,
    MessageSquare,
    MoreVertical,
    Share2,
    Calendar,
    ChevronRight,
    ExternalLink,
    FileVideo
} from 'lucide-react';
import {
    Tag,
    Button,
    Tabs,
    Switch,
    Progress,
    Avatar,
    Tooltip,
    Breadcrumb,
    Spin,
    message,
    Empty
} from 'antd';
import { getLessonDetail, getLessonBlocks } from '../../api/lessonApi';
import axiosClient from '../../../../lib/axiosClient';

const { TabPane } = Tabs;

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Spin size="large" />
                    <p className="text-slate-500 font-medium">Đang tải chi tiết bài học...</p>
                </div>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <Empty description="Không tìm thấy bài học">
                    <Button type="primary" onClick={() => navigate(-1)}>Quay lại</Button>
                </Empty>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
            {/* Header / Breadcrumbs */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-[1400px] mx-auto px-6 py-4">
                    <Breadcrumb
                        className="text-xs font-medium mb-3"
                        items={[
                            { title: <a onClick={() => navigate('/dashboard/teacher/courses')}>Bài giảng</a> },
                            { title: 'Chi tiết bài học' },
                        ]}
                    />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <Tag color="success" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold px-2 rounded">
                                    ĐÃ XUẤT BẢN
                                </Tag>
                                <span className="text-[11px] font-bold text-slate-400">ID: {lesson.id || 'LH-2023-089'}</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-[#1e293b] tracking-tight">
                                {lesson.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
                                <span className="flex items-center gap-2">Môn: <span className="text-slate-900">{lesson.subjectName || 'Lịch sử'}</span></span>
                                <span className="flex items-center gap-2">Khối: <span className="text-slate-900">{lesson.gradeName || '12'}</span></span>
                                <span className="flex items-center gap-2">Thời lượng dự kiến: <span className="text-slate-900">{lesson.duration || 45} phút</span></span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                type="text"
                                icon={<ArrowLeft size={18} />}
                                onClick={() => navigate(-1)}
                                className="h-10 px-4 font-bold text-slate-600 hover:bg-slate-100"
                            >
                                Quay lại
                            </Button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mt-6 -mb-4">
                        <Tabs
                            defaultActiveKey="1"
                            className="teacher-lesson-tabs"
                            items={[
                                { key: '1', label: 'Nội dung' },
                                { key: '2', label: 'Tài liệu đính kèm' },
                                { key: '3', label: 'Thống kê học tập' },
                                { key: '4', label: 'Cài đặt' },
                            ]}
                        />
                    </div>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Main Content (Left) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Video Preview */}
                        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 group relative">
                            <div className="aspect-video bg-slate-900 relative flex items-center justify-center">
                                {/* Substitute for actual video player */}
                                {lesson.type === 'Video' ? (
                                    <>
                                        <img
                                            src="https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=2076&auto=format&fit=crop"
                                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                                            alt="Video preview"
                                        />
                                        <div className="relative z-10 flex flex-col items-center gap-4">
                                            <button className="w-16 h-16 bg-[#0066ff] hover:bg-[#0052cc] text-white rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 group/play">
                                                <Play size={28} fill="currentColor" className="ml-1" />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-6 left-6 z-10">
                                            <h3 className="text-white font-bold text-lg drop-shadow-md">Video bài giảng: {lesson.title}</h3>
                                            <p className="text-white/80 text-xs font-medium">{lesson.duration || 15}:24 • Định dạng HD</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-3 text-slate-400">
                                        <FileText size={64} />
                                        <p className="font-bold">Bài giảng dạng tài liệu</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Summary Section */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                Tóm tắt nội dung
                            </h2>
                            <div className="prose prose-slate max-w-none">
                                <p className="text-slate-600 leading-relaxed font-medium">
                                    {lesson.content || 'Nội dung tóm tắt của bài học sẽ được hiển thị tại đây. Giáo viên có thể cập nhật chi tiết các ý chính của bài giảng để học sinh dễ dàng nắm bắt kiến thức.'}
                                </p>
                                <ul className="mt-6 space-y-4">
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-[#0066ff] mt-2 group-hover:scale-125 transition-transform" />
                                        <span className="text-slate-700 font-semibold">Tóm tắt các mốc sự kiện quan trọng.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-[#0066ff] mt-2" />
                                        <span className="text-slate-700 font-semibold">Phân tích ý nghĩa lịch sử của giai đoạn.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-[#0066ff] mt-2" />
                                        <span className="text-slate-700 font-semibold">Rút ra bài học kinh nghiệm cho hôm nay.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Materials Section */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black text-slate-900">
                                    Tài liệu học tập
                                </h2>
                                <Button
                                    type="text"
                                    icon={<Plus size={16} />}
                                    className="text-[#0066ff] font-bold hover:bg-blue-50 flex items-center gap-1"
                                >
                                    Thêm tài liệu
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { name: 'Giao_an_chi_tiet.pdf', size: '2.4 MB', pages: '12 trang', type: 'pdf' },
                                    { name: 'Bai_giang_PowerPoint.pptx', size: '15.8 MB', pages: '35 slide', type: 'powerpoint' }
                                ].map((doc, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group/item">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.type === 'pdf' ? 'bg-rose-50 text-rose-500' : 'bg-orange-50 text-orange-500'}`}>
                                                {doc.type === 'pdf' ? <FileText size={24} /> : <FileVideo size={24} />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 group-hover/item:text-[#0066ff] transition-colors">{doc.name}</div>
                                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{doc.size} • {doc.pages}</div>
                                            </div>
                                        </div>
                                        <button className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-white rounded-lg transition-all shadow-sm">
                                            <Download size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area (Right) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Class Statistics */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="p-2 bg-blue-50 text-[#0066ff] rounded-xl"><BarChart3 size={20} /></span>
                                Thống kê lớp học
                            </h3>

                            <div className="space-y-8">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="text-center flex-1">
                                        <div className="text-3xl font-black text-[#0066ff]">85%</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tỷ lệ xem bài</div>
                                    </div>
                                    <div className="w-px h-10 bg-slate-100" />
                                    <div className="text-center flex-1">
                                        <div className="text-3xl font-black text-slate-900">42/50</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Học sinh đã học</div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Progress
                                        percent={84}
                                        showInfo={false}
                                        strokeColor="#0066ff"
                                        trailColor="#f1f5f9"
                                        strokeWidth={10}
                                        className="m-0"
                                    />
                                    <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase">
                                        <span>Tiến độ chung</span>
                                        <span>84%</span>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-50">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Điểm trung bình bài tập</span>
                                        <span className="font-black text-slate-900">7.8 / 10</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Thời gian học TB</span>
                                        <span className="font-black text-slate-900">32 phút</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Số câu hỏi thảo luận</span>
                                        <span className="font-black text-slate-900">12 câu</span>
                                    </div>
                                </div>

                                <Button
                                    block
                                    className="h-12 bg-slate-50 border-none hover:bg-slate-100 text-slate-600 font-bold text-sm rounded-2xl"
                                >
                                    Xem chi tiết học sinh
                                </Button>
                            </div>
                        </div>

                        {/* Lesson Configuration */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                            <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
                                <span className="p-2 bg-slate-50 text-slate-600 rounded-xl"><Settings2 size={20} /></span>
                                Cấu hình bài giảng
                            </h3>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm">Công khai bài giảng</div>
                                        <div className="text-[11px] text-slate-400 font-medium">Học sinh có thể truy cập</div>
                                    </div>
                                    <Switch defaultChecked className="bg-slate-200" />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm">Cho phép tải tài liệu</div>
                                        <div className="text-[11px] text-slate-400 font-medium">PDF, Slides, Tài liệu mẫu</div>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="space-y-3 pt-4">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Lịch phát hành</label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100/50 text-slate-600 text-sm font-bold">
                                        <Calendar size={18} className="text-slate-400" />
                                        08:00, 25 Tháng 10, 2023
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Giao cho lớp</label>
                                    <div className="flex flex-wrap gap-2">
                                        <Tag className="m-0 px-3 py-1 bg-blue-50 text-[#0066ff] border-blue-100 font-bold rounded-lg cursor-pointer">12A1</Tag>
                                        <Tag className="m-0 px-3 py-1 bg-blue-50 text-[#0066ff] border-blue-100 font-bold rounded-lg cursor-pointer">12A3</Tag>
                                        <button className="flex items-center gap-1.5 px-3 py-1 text-slate-400 hover:text-slate-600 font-bold text-xs">
                                            <Plus size={14} /> Thêm lớp
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <style>{`
                .teacher-lesson-tabs .ant-tabs-nav {
                    margin-bottom: 0;
                }
                .teacher-lesson-tabs .ant-tabs-tab {
                    padding: 12px 0 16px 0;
                    margin: 0 40px 0 0;
                }
                .teacher-lesson-tabs .ant-tabs-tab-btn {
                    font-size: 14px;
                    font-weight: 800;
                    color: #64748b;
                    transition: all 0.3s;
                }
                .teacher-lesson-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
                    color: #0066ff !react-important;
                }
                .teacher-lesson-tabs .ant-tabs-ink-bar {
                    height: 4px;
                    border-radius: 4px 4px 0 0;
                    background: #0066ff;
                }
            `}</style>
        </div>
    );
}
