import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Search,
    Filter,
    BrainCircuit,
    PenTool,
    MoreVertical,
    Edit3,
    Trash2,
    Plus,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

export default function QuestionList() {
    const { folderId } = useParams();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All'); // All, AI, Manual

    // Mock data for questions
    const questions = [
        {
            id: 1,
            content: 'Trong mặt phẳng tọa độ Oxy, cho parabol (P): y = ax² + bx + c đi qua điểm A(1; 0) và có đỉnh I(–1; –4). Tính giá trị của biểu thức S = a + b + c.',
            type: 'Multiple Choice',
            level: 'Medium',
            source: 'AI Generated', // or 'Manual'
            tags: ['Hàm số bậc hai', 'Parabol'],
            createdAt: '2024-03-10'
        },
        {
            id: 2,
            content: 'Tìm tập xác định D của hàm số y = √(2x - 4) + 1/(x - 5).',
            type: 'Multiple Choice',
            level: 'Easy',
            source: 'Manual',
            tags: ['Tập xác định'],
            createdAt: '2024-03-09'
        },
        {
            id: 3,
            content: 'Giải thích ý nghĩa hình học của hệ số a trong phương trình y = ax² + bx + c.',
            type: 'Essay',
            level: 'Hard',
            source: 'AI Generated',
            tags: ['Lý thuyết', 'Hàm số'],
            createdAt: '2024-03-08'
        },
        {
            id: 4,
            content: 'Cho hàm số y = f(x) có bảng biến thiên như hình vẽ. Hàm số đồng biến trên khoảng nào?',
            type: 'Multiple Choice',
            level: 'Easy',
            source: 'Manual',
            tags: ['Đơn điệu'],
            createdAt: '2024-03-05'
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard/teacher/question-bank')}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Danh sách câu hỏi</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Chủ đề: Hàm số bậc hai • Lớp 10</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm nội dung câu hỏi..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <button className="h-full px-3 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto justify-end">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setFilterType('All')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterType === 'All' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setFilterType('AI')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterType === 'AI' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-purple-600'}`}
                        >
                            <BrainCircuit size={14} /> AI
                        </button>
                        <button
                            onClick={() => setFilterType('Manual')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterType === 'Manual' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-blue-600'}`}
                        >
                            <PenTool size={14} /> Thủ công
                        </button>
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm">
                        <Plus size={18} /> Thêm câu hỏi
                    </button>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                {questions
                    .filter(q => filterType === 'All' || (filterType === 'AI' && q.source === 'AI Generated') || (filterType === 'Manual' && q.source === 'Manual'))
                    .map((question) => (
                        <div key={question.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all group">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${question.source === 'AI Generated'
                                                ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                : 'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                            {question.source === 'AI Generated' ? <><BrainCircuit size={10} className="inline mr-1" /> AI Generated</> : <><PenTool size={10} className="inline mr-1" /> Thủ công</>}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${question.level === 'Easy' ? 'bg-green-50 text-green-700 border-green-100' :
                                                question.level === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    'bg-red-50 text-red-700 border-red-100'
                                            }`}>
                                            {question.level}
                                        </span>
                                        <span className="text-xs text-gray-400">• {question.type}</span>
                                    </div>

                                    <div className="text-gray-900 text-sm leading-relaxed font-medium">
                                        {question.content}
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {question.tags.map((tag, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border border-gray-100">#{tag}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Edit3 size={18} />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}
