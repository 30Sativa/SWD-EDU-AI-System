import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft,
    Search,
    Filter,
    FolderOpen,
    FileQuestion,
    Edit3,
    Trash2,
    Plus,
    CheckCircle2,
    Zap,
    BookOpen,
    ChevronRight,
    SearchX
} from 'lucide-react';
import {
    Button,
    Input,
    Tag,
    Select,
    Empty,
    Spin,
    message,
    Tooltip,
    Breadcrumb
} from 'antd';
import { getQuestionsBank } from '../../../quiz/teacher/api/quizApi';

export default function QuestionList() {
    const { folderId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');
    
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All'); // All, MCQ, TrueFalse, ShortAnswer, MultipleChoice

    const fetchQuestions = useCallback(async () => {
        try {
            setLoading(true);
            const params = type === 'lesson' ? { lessonId: folderId } : { courseId: folderId };
            const resp = await getQuestionsBank(params);
            const data = resp.data || resp;
            setQuestions(Array.isArray(data) ? data : (data.items || []));
        } catch (error) {
            console.error("Lỗi khi tải danh sách câu hỏi:", error);
            message.error("Không thể tải danh sách câu hỏi");
        } finally {
            setLoading(false);
        }
    }, [folderId, type]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const filteredData = questions.filter(q => {
        const matchesSearch = (q.questionText || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || q.questionType === filterType;
        return matchesSearch && matchesType;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Spin size="large" />
                <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Đang tải danh sách câu hỏi...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header & Breadcrumb */}
                <div className="flex flex-col gap-4 mb-4">
                    <Breadcrumb 
                        items={[
                            { title: <span onClick={() => navigate('/dashboard/teacher/question-bank')} className="text-slate-400 hover:text-[#0463ca] cursor-pointer font-medium">Ngân hàng</span> },
                            { title: <span className="text-slate-600 font-bold">Danh sách câu hỏi</span> },
                        ]}
                    />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                icon={<ArrowLeft size={18} />}
                                onClick={() => navigate('/dashboard/teacher/question-bank')}
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border-slate-200 text-slate-400 hover:text-[#0463ca] hover:border-blue-200 shadow-sm"
                            />
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Chi tiết Kho câu hỏi</h1>
                                <p className="text-slate-500 text-xs font-medium italic opacity-80 mt-1 flex items-center gap-2">
                                    <BookOpen size={14} className="text-slate-400" /> {type === 'lesson' ? 'Lesson' : 'Course'} ID: {folderId}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end pr-4 border-r border-slate-200">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">HIỂN THỊ</span>
                                <span className="text-lg font-bold text-slate-800">{filteredData.length} <span className="text-slate-300">/</span> {questions.length}</span>
                            </div>
                            <Button
                                type="primary"
                                icon={<Plus size={18} />}
                                className="bg-[#0487e2] hover:bg-[#0374c4] h-12 px-6 rounded-xl font-bold shadow-md border-none active:scale-95 transition-all"
                            >
                                THÊM MỚI
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-end mb-8">
                    <div className="flex-1 w-full">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">TÌM KIẾM CÂU HỎI</label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0463ca] transition-colors" size={18} />
                            <Input
                                placeholder="Tìm kiếm nhanh nội dung câu hỏi..."
                                className="h-12 pl-12 pr-4 bg-white border-slate-200 rounded-xl text-sm font-medium transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                allowClear
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-4 w-full md:w-auto items-end">
                        <div className="w-full md:w-56">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">PHÂN LOẠI</label>
                            <Select
                                value={filterType}
                                onChange={setFilterType}
                                className="w-full h-12 custom-select [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-slate-200 font-bold text-slate-600"
                                options={[
                                    { value: 'All', label: 'Tất cả các loại' },
                                    { value: 'MCQ', label: '⭐ Một đáp án' },
                                    { value: 'MultipleChoice', label: '✨ Nhiều đáp án' },
                                    { value: 'TrueFalse', label: '✅ Đúng / Sai' },
                                    { value: 'ShortAnswer', label: '✍️ Trả lời ngắn' }
                                ]}
                            />
                        </div>
                        <Tooltip title="Lọc nâng cao">
                            <Button
                                icon={<Filter size={18} />}
                                className="h-12 w-12 rounded-xl border-slate-200 text-slate-400 flex items-center justify-center hover:text-[#0463ca] hover:border-[#0463ca] transition-all shadow-sm"
                            />
                        </Tooltip>
                    </div>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                    {filteredData.length > 0 ? (
                        filteredData.map((question, index) => (
                            <div 
                                key={question.id || question.questionId} 
                                className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0487e2] opacity-0 group-hover:opacity-100 transition-all" />
                                
                                <div className="flex justify-between items-start gap-6">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#0487e2] flex items-center justify-center font-bold text-xs border border-blue-100">
                                                {index + 1}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Tag className="rounded-md font-bold text-[10px] uppercase px-2 py-0.5 border-none bg-slate-100 text-slate-500 tracking-wider">
                                                    {question.questionType}
                                                </Tag>
                                                <Tag className={`rounded-md font-bold text-[10px] uppercase px-2 py-0.5 border-none tracking-wider ${
                                                    question.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' :
                                                    question.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                                }`}>
                                                    {question.difficulty || 'Normal'}
                                                </Tag>
                                            </div>
                                        </div>

                                        <div className="text-slate-800 text-base leading-relaxed font-bold group-hover:text-[#0487e2] transition-colors">
                                            {question.questionText}
                                        </div>

                                        {/* Options Preview */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                                            {(question.options || question.questionOptions || []).map((opt, oIdx) => (
                                                <div key={oIdx} className={`p-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-between ${
                                                    opt.isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400'
                                                }`}>
                                                    <span className="truncate">{opt.optionText}</span>
                                                    {opt.isCorrect && <CheckCircle2 size={12} />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                        <Tooltip title="Chỉnh sửa câu hỏi">
                                            <Button 
                                                type="text" 
                                                icon={<Edit3 size={18} />} 
                                                className="h-10 w-10 flex items-center justify-center bg-white shadow-md border border-slate-100 text-slate-400 hover:text-[#0487e2] hover:bg-blue-50 rounded-xl"
                                            />
                                        </Tooltip>
                                        <Tooltip title="Xóa câu hỏi">
                                            <Button 
                                                type="text" 
                                                danger 
                                                icon={<Trash2 size={18} />} 
                                                className="h-10 w-10 flex items-center justify-center bg-white shadow-md border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                                            />
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-24 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center shadow-sm">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                                <SearchX size={48} />
                            </div>
                            <Empty description={
                                <div className="space-y-1">
                                    <p className="text-slate-700 font-bold text-lg">Không tìm thấy câu hỏi nào</p>
                                    <p className="text-slate-400 text-sm font-medium italic opacity-80">Bạn có thể thêm câu hỏi mới hoặc điều chỉnh bộ lọc</p>
                                </div>
                            } />
                            <Button 
                                type="primary" 
                                icon={<Plus size={18} />}
                                className="mt-8 bg-[#0487e2] hover:bg-[#0374c4] h-12 px-8 rounded-xl font-bold border-none shadow-md transition-all active:scale-95"
                            >
                                Tạo câu hỏi đầu tiên
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
