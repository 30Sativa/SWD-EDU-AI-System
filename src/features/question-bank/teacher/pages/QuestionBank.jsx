import React, { useState } from 'react';
import {
    Search,
    Plus,
    Filter,
    MoreHorizontal,
    FolderOpen,
    FileQuestion,
    BrainCircuit,
    PenTool,
    Trash2,
    ChevronRight,
    BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuestionBank() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('All');

    // Mock data for question folders (grouped by Lesson/Topic)
    const questionFolders = [
        {
            id: 1,
            title: 'Hàm số bậc hai',
            subject: 'Toán học',
            grade: 'Lớp 10',
            questionCount: 45,
            aiGenerated: 20,
            manual: 25,
            lastUpdated: '2 giờ trước',
            status: 'Active'
        },
        {
            id: 2,
            title: 'Phương trình lượng giác',
            subject: 'Toán học',
            grade: 'Lớp 11',
            questionCount: 32,
            aiGenerated: 15,
            manual: 17,
            lastUpdated: '1 ngày trước',
            status: 'Active'
        },
        {
            id: 3,
            title: 'Động lực học chất điểm',
            subject: 'Vật lý',
            grade: 'Lớp 10',
            questionCount: 28,
            aiGenerated: 28,
            manual: 0,
            lastUpdated: '3 ngày trước',
            status: 'Draft'
        },
        {
            id: 4,
            title: 'Di truyền học',
            subject: 'Sinh học',
            grade: 'Lớp 12',
            questionCount: 50,
            aiGenerated: 10,
            manual: 40,
            lastUpdated: '5 ngày trước',
            status: 'Active'
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ngân hàng câu hỏi</h1>
                    <p className="text-gray-500 mt-1">Quản lý kho câu hỏi theo chủ đề và bài học</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
                        Import / Export
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm shadow-blue-200">
                        <Plus size={18} />
                        Tạo chủ đề mới
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm chủ đề, bài học..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="relative w-full md:w-48">
                    <select
                        className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm cursor-pointer"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                        <option value="All">Tất cả môn học</option>
                        <option value="Math">Toán học</option>
                        <option value="Physics">Vật lý</option>
                        <option value="Bio">Sinh học</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {questionFolders.map((folder) => (
                    <div
                        key={folder.id}
                        onClick={() => navigate(`/dashboard/teacher/question-bank/${folder.id}`)}
                        className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="text-gray-400 hover:text-gray-600" />
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <FolderOpen size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{folder.title}</h3>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                    <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">{folder.subject}</span>
                                    <span>•</span>
                                    <span>{folder.grade}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1.5 text-gray-600">
                                <FileQuestion size={16} />
                                <span className="font-semibold">{folder.questionCount}</span> câu hỏi
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <div className="flex items-center gap-1 text-purple-600" title="Tạo bởi AI">
                                    <BrainCircuit size={14} /> {folder.aiGenerated}
                                </div>
                                <div className="flex items-center gap-1 text-gray-500" title="Tạo thủ công">
                                    <PenTool size={14} /> {folder.manual}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                            <span>Cập nhật {folder.lastUpdated}</span>
                            <span className={`px-2 py-0.5 rounded-full ${folder.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                {folder.status === 'Active' ? 'Đang sử dụng' : 'Bản nháp'}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Add New Card */}
                <button className="flex flex-col items-center justify-center gap-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-gray-400 hover:text-blue-600">
                    <div className="p-3 bg-white rounded-full shadow-sm">
                        <Plus size={24} />
                    </div>
                    <span className="font-medium">Tạo bộ câu hỏi mới</span>
                </button>
            </div>
        </div>
    );
}
