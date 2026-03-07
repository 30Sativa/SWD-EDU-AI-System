import React, { useState, useEffect, useCallback } from 'react';
import {
    Clock,
    CheckSquare,
    FileText,
    AlertCircle,
    CheckCircle2,
    Timer,
    ArrowRight,
    Search,
    Filter
} from 'lucide-react';
import { Tag, Spin, Empty, Button, message, Input, Select } from 'antd';
import dayjs from 'dayjs';
import { getStudentAssignmentsByCourse } from '../../api/assignmentApi';
import SubmitAssignmentModal from './SubmitAssignmentModal';

export default function StudentAssignmentsTab({ courseId }) {
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    const fetchAssignments = useCallback(async () => {
        if (!courseId) return;
        try {
            setLoading(true);
            const res = await getStudentAssignmentsByCourse(courseId);
            const data = res?.data?.items || res?.items || res?.data || (Array.isArray(res) ? res : []);

            // For each assignment, we might want to check if the student has submitted it
            // However, fetching one-by-one might be slow. 
            // If the backend doesn't provide it in the list, we show it as "View Details"

            setAssignments(data);
        } catch (error) {
            console.error("Không thể tải danh sách bài tập", error);
            message.error("Lỗi khi tải danh sách bài tập");
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    const filteredAssignments = assignments.filter(assignment => {
        const matchesSearch = (assignment.title || assignment.Title || "").toLowerCase().includes(searchQuery.toLowerCase());
        // For status filter, we'd need submission status which might need another API call per item or backend support
        return matchesSearch;
    });

    if (loading && assignments.length === 0) {
        return (
            <div className="py-20 flex flex-col items-center justify-center">
                <Spin size="large" />
                <p className="mt-4 text-slate-500 font-medium">Đang tải danh sách bài tập...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">Bài tập về nhà</h3>
                        <p className="text-xs text-slate-500 font-medium">{assignments.length} bài tập đã giao</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input
                            placeholder="Tìm kiếm bài tập..."
                            className="pl-10 h-10 w-full md:w-64 rounded-xl bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white transition-all shadow-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select
                        defaultValue="all"
                        className="h-10 w-32 [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!bg-slate-50 [&>.ant-select-selector]:!border-transparent"
                        onChange={setFilterStatus}
                    >
                        <Select.Option value="all">Tất cả</Select.Option>
                        <Select.Option value="pending">Chưa làm</Select.Option>
                        <Select.Option value="submitted">Đã nộp</Select.Option>
                    </Select>
                </div>
            </div>

            {/* Assignments List */}
            <div className="space-y-4">
                {filteredAssignments.length > 0 ? (
                    filteredAssignments.map((assignment, index) => {
                        const assignmentId = assignment.id || assignment.Id || assignment.assignmentId || assignment.AssignmentId || assignment.courseAssignmentId;
                        const dueDate = assignment.dueDate || assignment.DueDate;
                        const isOverdue = dueDate && dayjs().isAfter(dayjs(dueDate));

                        return (
                            <div
                                key={assignmentId}
                                className="bg-white border border-slate-100 rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center justify-between hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all group relative overflow-hidden"
                            >
                                <div className="flex items-start gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center font-bold text-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors border border-slate-100">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-bold text-slate-800 text-lg m-0 group-hover:text-indigo-600 transition-colors">
                                                {assignment.title || assignment.Title}
                                            </h4>
                                            {isOverdue && !assignment.isSubmitted && (
                                                <Tag color="error" className="rounded-full border-none px-3 text-[10px] font-black uppercase">QUÁ HẠN</Tag>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500 mb-4 line-clamp-2 max-w-xl">
                                            {assignment.description || assignment.Description || "Không có hướng dẫn bổ sung cho bài tập này."}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tight">
                                                <Clock size={14} className={isOverdue ? "text-rose-400" : "text-slate-300"} />
                                                <span>Hạn nộp:</span>
                                                <span className={isOverdue ? "text-rose-500" : "text-slate-600"}>
                                                    {dueDate ? dayjs(dueDate).format('DD/MM/YYYY, HH:mm') : "Không có hạn"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tight">
                                                <CheckSquare size={14} className="text-slate-300" />
                                                <span>Điểm tối đa:</span>
                                                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                                    {assignment.maxScore || assignment.MaxScore || 10}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 md:mt-0 flex items-center gap-3">
                                    <Button
                                        type="primary"
                                        onClick={() => {
                                            setSelectedAssignment(assignment);
                                            setIsSubmitModalOpen(true);
                                        }}
                                        className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 border-none font-bold text-sm shadow-lg shadow-indigo-100 flex items-center gap-2 group/btn"
                                    >
                                        Nộp bài assignment
                                        <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                                    </Button>
                                </div>

                                {/* Subtle background pattern */}
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-50/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-20 bg-white rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-200">
                            <FileText size={40} />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">Chưa có bài tập nào</h4>
                        <p className="text-slate-400 text-sm max-w-xs font-medium">
                            Giáo viên chưa giao bài tập cho khóa học này. Hãy tập trung hoàn thành các bài giảng nhé!
                        </p>
                    </div>
                )}
            </div>

            {/* Submission Modal */}
            <SubmitAssignmentModal
                visible={isSubmitModalOpen}
                onClose={() => setIsSubmitModalOpen(false)}
                assignment={selectedAssignment}
                onSuccess={fetchAssignments}
            />
        </div>
    );
}
