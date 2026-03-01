import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Button, message, Tag, Descriptions, Form, Select, Card, Empty } from 'antd';
import { ArrowLeft, BookOpen, Users, UserPlus, ShieldPlus } from 'lucide-react';
import { getClassDetail, assignSubjectTeacher } from '../../../classes/api/classApi';
import { getGradeLevels } from '../../api/gradeApi';
import { getUsers, ROLE_ENUM } from '../../../user/api/userApi';
import { getTerms } from '../../../term/api/termApi';
import { getSubjects } from '../../../subject/api/subjectApi';

export default function ClassDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [classData, setClassData] = useState(null);

    const [grades, setGrades] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [terms, setTerms] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [assignForm] = Form.useForm();
    const [assignSubmitting, setAssignSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [classRes, gradeRes, teacherRes, termRes, subjectRes] = await Promise.all([
                getClassDetail(id),
                getGradeLevels(),
                getUsers({ RoleFilter: ROLE_ENUM.TEACHER, PageSize: 100 }),
                getTerms().catch(() => ({ data: [] })),
                getSubjects().catch(() => ({ data: [] }))
            ]);

            setClassData(classRes.data || classRes);

            const gradeData = gradeRes?.data?.items || gradeRes?.items || gradeRes?.data || gradeRes || [];
            const teacherItems = teacherRes?.data?.items || teacherRes?.items || teacherRes?.data || teacherRes || [];
            const termItems = termRes?.data?.items || termRes?.items || termRes?.data || termRes || [];
            const subjectItems = subjectRes?.data?.items || subjectRes?.items || subjectRes?.data || subjectRes || [];

            setGrades(Array.isArray(gradeData) ? gradeData : []);
            setTeachers(Array.isArray(teacherItems) ? teacherItems : []);
            setTerms(Array.isArray(termItems) ? termItems : []);
            setSubjects(Array.isArray(subjectItems) ? subjectItems : []);

        } catch (error) {
            console.error(error);
            message.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAssignSubmit = async (values) => {
        try {
            setAssignSubmitting(true);
            await assignSubjectTeacher(id, {
                subjectId: values.subjectId,
                teacherId: values.teacherId
            });
            message.success('Phân công giáo viên bộ môn thành công!');
            assignForm.resetFields();
            fetchData(); // Refresh to potentially show added teachers if API supports it
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || 'Lỗi phân công giáo viên bộ môn');
        } finally {
            setAssignSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-slate-50">
                <Spin size="large" />
                <p className="mt-4 text-slate-500 font-medium">Đang tải thông tin lớp học...</p>
            </div>
        );
    }

    if (!classData) {
        return (
            <div className="p-8 bg-slate-50 min-h-screen">
                <Empty description="Không tìm thấy thông tin lớp học" />
            </div>
        );
    }

    const termName = terms.find(t => t.id === classData.termId)?.name || classData.termName || '--';
    const gradeName = grades.find(g => g.id === classData.gradeLevelId || g.id === classData.gradeId)?.name || classData.gradeName || '--';
    const headTeacherObj = teachers.find(t => t.id === classData.teacherId);
    const headTeacherName = classData.homeroomTeacherName || classData.teacherName || headTeacherObj?.fullName || 'Chưa phân công';

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <Button
                            icon={<ArrowLeft size={20} />}
                            onClick={() => navigate('/dashboard/manager/grades')}
                            className="flex items-center justify-center h-12 w-12 p-0 rounded-full bg-slate-50 border-slate-200 text-slate-500 hover:bg-[#0463ca] hover:text-white hover:border-[#0463ca] shadow-sm transition-all"
                        />
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                                Chi tiết Lớp học: <span className="text-[#0463ca]">{classData.name}</span>
                            </h1>
                            <p className="text-slate-500 text-sm mt-1 font-medium flex items-center gap-2">
                                <BookOpen size={14} className="text-slate-400" /> Mã lớp: {classData.code || '--'}
                            </p>
                        </div>
                    </div>
                    <div>
                        <Tag color={classData.isActive ? "success" : "default"} className="font-bold border-0 px-4 py-1.5 text-[13px] rounded-lg shadow-sm">
                            {classData.isActive ? "Đang hoạt động" : "Ngưng hoạt động"}
                        </Tag>
                    </div>
                </header>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: General Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card variant="borderless" className="shadow-sm rounded-2xl overflow-hidden [&>.ant-card-head]:border-b-slate-100" title={<span className="text-lg font-bold text-slate-700 flex items-center gap-2"><BookOpen size={20} className="text-[#0463ca]" />Thông tin Khái quát</span>}>
                            <Descriptions column={2} className="mb-0 custom-descriptions" styles={{ label: { color: '#64748b', fontWeight: 600, paddingBottom: 4, display: 'block' }, content: { fontWeight: 700, color: '#1e293b', fontSize: '15px' } }}>
                                <Descriptions.Item label="Học Kỳ">
                                    <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 inline-block">{termName}</div>
                                </Descriptions.Item>
                                <Descriptions.Item label="Khối Lớp">
                                    <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 inline-block">{gradeName}</div>
                                </Descriptions.Item>
                                <Descriptions.Item label="Sĩ số">
                                    <span className="text-emerald-600">
                                        {classData.studentCount || 0} / {classData.maxStudents || classData.maxStudent || 40} học viên
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Thuộc trường">
                                    SWD EDU
                                </Descriptions.Item>
                                <Descriptions.Item label="Giáo viên chủ nhiệm" span={2}>
                                    <div className="flex items-center gap-3 bg-teal-50/50 p-3 rounded-xl border border-teal-100/50 inline-flex w-full md:w-auto">
                                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-base font-bold shadow-sm">
                                            {headTeacherName.charAt(0)}
                                        </div>
                                        <span className="font-bold text-slate-700 text-base">{headTeacherName}</span>
                                    </div>
                                </Descriptions.Item>
                                <Descriptions.Item label="Mô tả chi tiết" span={2} className="pb-0">
                                    <div className="bg-slate-50/80 p-4 rounded-xl text-slate-600 border border-slate-100 min-h-[80px] whitespace-pre-wrap leading-relaxed shadow-inner">
                                        {classData.description || <span className="text-slate-400 italic font-medium">Không có mô tả cho lớp học này.</span>}
                                    </div>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Subject Teachers List */}
                        <Card variant="borderless" className="shadow-sm rounded-2xl [&>.ant-card-head]:border-b-slate-100" title={<span className="text-lg font-bold text-slate-700 flex items-center gap-2"><Users size={20} className="text-emerald-500" />Giáo viên Bộ môn hiện tại</span>}>
                            <div className="text-center py-10 bg-slate-50/50 rounded-xl border-2 border-slate-100 border-dashed">
                                <ShieldPlus size={40} className="mx-auto text-slate-300 mb-3" />
                                <p className="text-slate-500 font-medium text-base">Tính năng danh sách đang được cập nhật</p>
                                <p className="text-slate-400 text-sm mt-1">Các giáo viên bộ môn được phân công sẽ xuất hiện tại đây.</p>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Actions */}
                    <div className="space-y-6 lg:sticky top-6">
                        <Card variant="borderless" className="shadow-sm rounded-2xl bg-indigo-50/20 border border-indigo-100/30" title={<span className="text-lg font-bold text-indigo-700 flex items-center gap-2"><UserPlus size={20} />Phân công Thêm</span>}>
                            <Form form={assignForm} layout="vertical" onFinish={handleAssignSubmit} className="space-y-5">
                                <Form.Item label={<span className="font-semibold text-slate-600 text-[13px] uppercase tracking-wide">Môn Học</span>} name="subjectId" rules={[{ required: true, message: 'Vui lòng chọn môn học' }]} className="mb-0 w-full">
                                    <Select
                                        placeholder="Chọn môn học"
                                        showSearch
                                        optionFilterProp="children"
                                        className="w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!bg-white [&>.ant-select-selector]:!border-slate-200 h-12 [&>.ant-select-selector]:!h-12 [&>.ant-select-selector]:!flex [&>.ant-select-selector]:!items-center font-medium shadow-sm"
                                    >
                                        {subjects.map(s => (
                                            <Select.Option key={s.id} value={s.id}>
                                                <div className="flex items-center gap-2 truncate py-1">
                                                    {s.name} <span className="text-slate-400 text-xs">({s.code})</span>
                                                </div>
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item label={<span className="font-semibold text-slate-600 text-[13px] uppercase tracking-wide">Giáo viên phụ trách</span>} name="teacherId" rules={[{ required: true, message: 'Vui lòng chọn giáo viên' }]} className="mb-2">
                                    <Select
                                        placeholder="Chọn giáo viên"
                                        showSearch
                                        optionFilterProp="children"
                                        className="w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!bg-white [&>.ant-select-selector]:!border-slate-200 h-12 [&>.ant-select-selector]:!h-12 [&>.ant-select-selector]:!flex [&>.ant-select-selector]:!items-center font-medium shadow-sm"
                                    >
                                        {teachers.map(t => (
                                            <Select.Option key={t.id} value={t.id}>
                                                <div className="flex items-center gap-3 truncate py-1">
                                                    <div className="w-6 h-6 flex-shrink-0 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-bold text-wrap">
                                                        {t.fullName?.charAt(0)}
                                                    </div>
                                                    <span className="truncate">{t.fullName}</span>
                                                </div>
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Button type="primary" htmlType="submit" loading={assignSubmitting} block size="large" className="h-12 rounded-xl bg-indigo-600 hover:!bg-indigo-500 font-bold shadow-lg shadow-indigo-200/50 border-none text-[15px] mt-2">
                                    Xác nhận Phân Công
                                </Button>
                            </Form>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}
