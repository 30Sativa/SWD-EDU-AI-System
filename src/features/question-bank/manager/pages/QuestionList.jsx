import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Search,
    Filter,
    FileQuestion,
    CheckCircle2,
    XCircle,
    Info,
    BookOpen,
    SearchX,
    Layers,
    Clock,
    RefreshCw
} from 'lucide-react';
import {
    Button,
    Input,
    Tag,
    Empty,
    Spin,
    message,
    Tooltip,
    Select,
    Breadcrumb,
    Badge
} from 'antd';
import { getManagerQuestionsBank } from '../api/questionBankApi';
import dayjs from 'dayjs';

export default function QuestionList() {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');

    const fetchQuestions = useCallback(async () => {
        try {
            setLoading(true);
            // Try as courseId first
            let response = await getManagerQuestionsBank({ courseId: topicId });

            // If empty or lesson-based, try as lessonId
            if (!response.success || (response.data && response.data.length === 0)) {
                const fallback = await getManagerQuestionsBank({ lessonId: topicId });
                if (fallback.success) response = fallback;
            }

            if (response.success) {
                setQuestions(response.data || []);
            } else {
                message.error("Không thể tải danh sách câu hỏi");
            }
        } catch (error) {
            console.error("Error fetching questions:", error);
            message.error("Lỗi kết nối máy chủ");
        } finally {
            setLoading(false);
        }
    }, [topicId]);

    useEffect(() => {
        if (topicId) fetchQuestions();
    }, [fetchQuestions, topicId]);

    const filteredData = questions.filter(q => {
        const matchesSearch = (q.questionText || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || q.questionType === filterType;
        return matchesSearch && matchesType;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Spin size="large" />
                <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Đang truy xuất ngân hàng...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header & Breadcrumb */}
                <div className="flex flex-col gap-4 mb-2">
                    <Breadcrumb
                        items={[
                            { title: <span onClick={() => navigate('/manager/question-bank')} className="text-slate-400 hover:text-[#0463ca] cursor-pointer font-medium">Ngân hàng câu hỏi</span> },
                            { title: <span className="text-slate-600 font-bold">Chi tiết chủ đề</span> },
                        ]}
                        className="mb-2"
                    />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                icon={<ArrowLeft size={18} />}
                                onClick={() => navigate('/dashboard/manager/question-bank')}
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border-slate-200 text-slate-400 hover:text-[#0463ca] hover:border-blue-200 shadow-sm transition-all"
                            />
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                                    Nội dung Ngân hàng Câu hỏi
                                    <Tag color="blue" className="rounded-md border-none font-bold uppercase text-[10px] bg-blue-50 text-[#0487e2]">Manager View</Tag>
                                </h1>
                                <p className="text-slate-500 text-xs font-medium italic opacity-80 mt-1 flex items-center gap-2">
                                    <BookOpen size={14} className="text-slate-400" /> Giám sát nội dung từ các khóa học và bài học của giảng viên.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end pr-6 border-r border-slate-200">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">TỔNG CÂU HỎI</span>
                                <span className="text-2xl font-black text-slate-800">{filteredData.length} <span className="text-slate-300 font-light">/</span> {questions.length}</span>
                            </div>
                            <Button
                                icon={<RefreshCw size={18} />}
                                onClick={fetchQuestions}
                                className="h-11 px-5 rounded-xl font-bold border-slate-200 text-slate-500 hover:text-[#0463ca] hover:border-blue-200 flex items-center gap-2"
                            >
                                Làm mới
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-end mb-4">
                    <div className="flex-1 w-full">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">TÌM KIẾM NỘI DUNG</label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0463ca] transition-colors" size={18} />
                            <Input
                                placeholder="Nhập từ khóa cần tìm trong câu hỏi..."
                                className="h-12 pl-12 pr-4 bg-slate-50 border-none group-focus-within:bg-white group-focus-within:ring-1 group-focus-within:ring-blue-100 rounded-xl text-sm font-medium transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                allowClear
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto items-end">
                        <div className="w-full md:w-56">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">LOẠI CÂU HỎI</label>
                            <Select
                                value={filterType}
                                onChange={setFilterType}
                                className="w-full h-12 custom-select [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-none [&>.ant-select-selector]:!bg-slate-50 font-bold text-slate-600"
                                options={[
                                    { value: 'All', label: 'Tất cả các loại' },
                                    { value: 'MCQ', label: ' Trắc nghiệm (1)' },
                                    { value: 'MultipleChoice', label: ' Nhiều lựa chọn' },
                                    { value: 'TrueFalse', label: ' Đúng / Sai' },
                                    { value: 'ShortAnswer', label: ' Tự luận ngắn' }
                                ]}
                            />
                        </div>
                        <Tooltip title="Lọc theo độ khó">
                            <Button
                                icon={<Filter size={18} />}
                                className="h-12 w-12 rounded-xl bg-slate-50 border-none text-slate-400 flex items-center justify-center hover:text-[#0463ca] hover:bg-blue-50 transition-all"
                            />
                        </Tooltip>
                    </div>
                </div>

                {/* Questions List */}
                <div className="space-y-4 pb-12">
                    {filteredData.length > 0 ? (
                        filteredData.map((question, index) => (
                            <div
                                key={question.questionId}
                                className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0487e2] opacity-0 group-hover:opacity-100 transition-all" />

                                <div className="flex justify-between items-start gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#0487e2] flex items-center justify-center font-bold text-xs border border-blue-100">
                                                {index + 1}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Tag className="rounded-md font-bold text-[10px] uppercase px-2 py-0.5 border-none bg-slate-100 text-slate-500 tracking-wider">
                                                    {question.questionType}
                                                </Tag>
                                                <Tag className="rounded-md font-bold text-[10px] uppercase px-2 py-0.5 border-none bg-blue-50 text-blue-600 tracking-wider">
                                                    {question.points} ĐIỂM
                                                </Tag>
                                            </div>
                                        </div>

                                        <div className="text-slate-800 text-[17px] leading-relaxed font-bold group-hover:text-[#0463ca] transition-colors">
                                            {question.questionText}
                                        </div>

                                        {/* Options Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                                            {(question.options || []).map((opt, oIdx) => (
                                                <div key={oIdx} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${opt.isCorrect
                                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm'
                                                        : 'bg-slate-50/50 border-slate-100 text-slate-500'
                                                    }`}>
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className={`w-2 h-2 rounded-full ${opt.isCorrect ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                                        <span className="text-sm font-semibold truncate">{opt.optionText}</span>
                                                    </div>
                                                    {opt.isCorrect && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Explanation - Collapsible or always visible */}
                                        {question.explanation && (
                                            <div className="mt-6 p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100/50 text-indigo-700 flex gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm text-indigo-500">
                                                    <Info size={20} />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest block text-indigo-400">GIẢI THÍCH ĐÁP ÁN</span>
                                                    <p className="text-sm font-medium leading-relaxed italic">{question.explanation}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action column - Read-only version */}
                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                        <Tooltip title="Xem thông tin chi tiết (Read-only)">
                                            <Button
                                                type="text"
                                                icon={<Info size={18} />}
                                                className="h-10 w-10 flex items-center justify-center bg-white shadow-md border border-slate-100 text-slate-400 hover:text-[#0487e2] hover:bg-blue-50 rounded-xl"
                                            />
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-24 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center shadow-sm">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                                <SearchX size={48} />
                            </div>
                            <Empty description={
                                <div className="space-y-1">
                                    <p className="text-slate-700 font-bold text-lg">Không có dữ liệu câu hỏi</p>
                                    <p className="text-slate-400 text-sm font-medium italic opacity-80">Chủ đề này hiện chưa có nội dung nào được tạo.</p>
                                </div>
                            } />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
