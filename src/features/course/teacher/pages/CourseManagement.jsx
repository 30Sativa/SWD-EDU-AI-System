import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  BookOpen,
  Filter,
  LayoutGrid,
  List as ListIcon,
  Layers,
  CheckCircle2,
  Eye,
  Edit,
  Users,
  Clock,
  MoreVertical,
  Trash2,
  Rocket
} from 'lucide-react';
import {
  Table,
  Button,
  Input,
  Tag,
  message,
  Spin,
  Select,
  Empty,
  Tooltip,
  Popconfirm,
  Modal,
  Form,
  Radio
} from 'antd';
import { getMyCourses, getCourseTemplates, createTeacherCourse, cloneTeacherCourse, publishTeacherCourse, assignClassToCourse, getTeacherCourseDetail, updateTeacherCourse } from '../../api/courseApi';
import { getSubjects } from '../../../subject/api/subjectApi';
import { getCurrentUser } from '../../../user/api/userApi';
import { getGradeLevels } from '../../../grade/api/gradeApi';
import { getCourseCategories } from '../../../category/api/categoryApi';
import { getTeacherHomeroomClasses } from '../../../classes/api/classApi';

const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export default function CourseManagement() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userId, setUserId] = useState(null);

  // THÊM MỚI: State quản lý chế độ hiển thị (Grid/List)
  const [viewMode, setViewMode] = useState('grid');

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [assigningCourse, setAssigningCourse] = useState(null);
  const [createType, setCreateType] = useState('template');
  const [templates, setTemplates] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [categories, setCategories] = useState([]);
  const [classes, setClasses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [assignForm] = Form.useForm();

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyCourses();
      const data = res?.data?.items || res?.items || res?.data || res || [];
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      // message.error handle
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDependencies = async () => {
    try {
      const [templatesRes, subjectsRes, gradesRes, categoriesRes, classesRes] = await Promise.all([
        getCourseTemplates(),
        getSubjects(),
        getGradeLevels(),
        getCourseCategories({ pageSize: 100 }),
        getTeacherHomeroomClasses()
      ]);
      setTemplates(templatesRes?.data?.items || templatesRes?.items || templatesRes?.data || []);
      setSubjects(subjectsRes?.data?.items || subjectsRes?.items || subjectsRes?.data || []);
      setGrades(gradesRes?.data?.items || gradesRes?.items || gradesRes?.data || []);
      setCategories(categoriesRes?.data?.items || categoriesRes?.items || categoriesRes?.data || []);
      setClasses(classesRes?.data?.items || classesRes?.items || classesRes?.data || []);
    } catch (error) {
      // silence
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchDependencies();
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        const id = res?.id || res?.data?.id || localStorage.getItem('userId');
        if (id) setUserId(String(id));
      } catch (err) {
        const savedId = localStorage.getItem('userId');
        if (savedId) setUserId(String(savedId));
      }
    };
    fetchUser();
  }, [fetchCourses]);

  const handleCreateSubmit = async (values) => {
    try {
      setSubmitting(true);
      const currentUserId = userId || localStorage.getItem('userId');

      if (createType === 'template') {
        if (!currentUserId) {
          message.error('Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.');
          return;
        }
        const payload = {
          templateId: values.templateId,
          teacherId: currentUserId,
          newCode: values.newCode
        };
        await cloneTeacherCourse(payload);
        message.success('Clone khóa học từ template thành công!');
      } else {
        const payload = {
          title: values.title,
          slug: slugify(values.title),
          code: values.code,
          subjectId: values.subjectId,
          description: values.description || "",
          gradeLevelId: values.gradeLevelId,
          categoryId: values.categoryId,
          level: parseInt(values.level || 1),
          language: values.language || "vi",
          totalLessons: 0,
          totalDuration: 0
        };
        await createTeacherCourse(payload);
        message.success('Tạo khóa học mới thành công!');
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchCourses();
    } catch (error) {
      const errorData = error.response?.data;
      const errorMsg = errorData?.message || errorData?.Message || 'Có lỗi xảy ra khi tạo khóa học';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        title: values.title,
        code: values.code,
        subjectId: values.subjectId,
        gradeLevelId: values.gradeLevelId,
        categoryId: values.categoryId,
        description: values.description || "",
        thumbnail: editingCourse?.thumbnail || "",
        level: parseInt(values.level) || 1,
        language: values.language || "vi"
      };
      await updateTeacherCourse(editingCourse.id, payload);
      message.success('Cập nhật khóa học thành công!');
      setIsEditModalOpen(false);
      fetchCourses();
    } catch (error) {
      const errorData = error.response?.data;
      let errorMsg = errorData?.Message || errorData?.title || errorData?.message || 'Lỗi khi cập nhật thông tin khóa học';
      if (errorData?.errors) {
        const validationErrors = Object.values(errorData.errors).flat().join(", ");
        errorMsg = `${errorMsg}: ${validationErrors}`;
      }
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignSubmit = async (values) => {
    try {
      setSubmitting(true);
      await assignClassToCourse(assigningCourse.id, values.classId);
      message.success('Gán lớp vào khóa học thành công!');
      setIsAssignModalOpen(false);
      fetchCourses();
    } catch (error) {
      if (error.response?.status === 500) {
        message.error('Không thể gán. Hãy đảm bảo Lớp và Khóa học cùng khối, hoặc bạn đã được phân công dạy Lớp đó.');
      } else {
        message.error(error.response?.data?.message || error.response?.data?.Message || 'Lỗi khi gán lớp vào khóa học');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreviewTemplate = async () => {
    const templateId = form.getFieldValue('templateId');
    if (!templateId) {
      message.warning('Vui lòng chọn một template để xem trước');
      return;
    }
    try {
      setPreviewLoading(true);
      setIsPreviewModalOpen(true);
      const res = await getTeacherCourseDetail(templateId).catch(() => null);
      let data = res?.data || res;

      if (!data || !(data.sections || data.items || data.Sections)) {
        const { getCourseSections } = await import('../../api/courseApi');
        const sectionsRes = await getCourseSections(templateId).catch(() => null);
        const sections = sectionsRes?.data?.items || sectionsRes?.items || sectionsRes?.data || [];
        data = { ...data, sections };
      }
      setPreviewData(data);
    } catch {
      message.error('Không thể tải cấu trúc template');
    } finally {
      setPreviewLoading(false);
    }
  };

  const filteredCourses = useMemo(() => courses.filter(course => {
    const matchesSearch = (course.title || course.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code?.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const isActive = course.status === 'Active' || course.status === 'Published';
      if (statusFilter === 'active') matchesStatus = isActive;
      if (statusFilter === 'draft') matchesStatus = !isActive;
    }
    return matchesSearch && matchesStatus;
  }), [courses, searchTerm, statusFilter]);

  // Cột cho dạng Table (List View)
  const columns = [
    {
      title: 'KHÓA HỌC',
      key: 'course',
      width: 350,
      render: (_, record) => {
        const imgSrc = record.thumbnail || record.imageUrl || record.coverUrl || record.picture || record.image;
        return (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-blue-50 flex items-center justify-center text-[#0487e2] shrink-0 border border-slate-100 relative group/thumb">
              <BookOpen size={24} className="absolute z-0" />
              {imgSrc && (
                <img src={imgSrc} alt={record.title} className="absolute inset-0 z-10 w-full h-full object-cover text-[#0487e2]" onError={(e) => { e.target.style.display = 'none'; }} />
              )}
              {record.isFeatured && (
                <div className="absolute top-0 right-0 p-0.5">
                  <div className="w-2 h-2 bg-amber-400 rounded-full ring-1 ring-white" />
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 text-[15px] truncate">{record.title || record.name}</span>
                {record.isFeatured && (
                  <Tag color="gold" className="m-0 text-[10px] font-bold uppercase px-1 leading-tight rounded-sm border-none">VIP</Tag>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{record.code}</span>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      title: 'PHÂN LOẠI',
      key: 'level',
      render: (_, record) => {
        const difficultyMap = { 1: 'Cơ bản', 2: 'Trung bình', 3: 'Nâng cao' };
        const levelVal = record.level ?? record.Level ?? record.difficultyLevel ?? record.DifficultyLevel;
        const levelText = difficultyMap[Number(levelVal)] || record.levelName || record.LevelName || (levelVal ? `Cấp độ ${levelVal} ` : 'Chưa định nghĩa');

        const gradeId = record.gradeLevelId || record.GradeLevelId || record.gradeId || record.GradeId;
        const gradeName = record.gradeLevelName || record.GradeLevelName || record.gradeName || record.GradeName || grades.find(g => g.id === gradeId)?.name;

        const catId = record.categoryId || record.CategoryId;
        const categoryName = record.categoryName || record.CategoryName || categories.find(c => c.id === catId)?.name;

        const subId = record.subjectId || record.SubjectId;
        const subjectName = record.subjectName || record.SubjectName || subjects.find(s => s.id === subId)?.name;

        return (
          <div className="flex flex-col gap-1">
            <Tag className="rounded font-bold border-none bg-blue-50 text-blue-600 px-2 py-0 text-[11px] w-fit">
              {levelText}
            </Tag>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-slate-500 font-medium px-1 flex items-center gap-1">
                <Layers size={12} className="text-[#0487e2]" />
                {gradeName || categoryName || (gradeId || catId ? `Phân loại: ${String(gradeId || catId).substring(0, 8)}...` : 'Liên cấp / Khác')}
              </span>
              {subjectName && (
                <span className="text-[10px] text-slate-400 font-medium px-1 italic">
                  Môn: {subjectName}
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      title: 'THỐNG KÊ',
      key: 'metrics',
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="text-xs font-bold text-amber-500 flex items-center gap-1">
              <CheckCircle2 size={14} fill="currentColor" className="text-amber-100" />
              {record.rating ?? record.averageRating ?? '0.0'}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Clock size={12} />
            {record.totalLessons ?? record.lessonCount ?? 0} bài • {Math.floor((record.totalDuration ?? 0) / 60)}h {(record.totalDuration ?? 0) % 60}m
          </div>
        </div>
      )
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status, record) => {
        const rawStatus = (status ?? record.statusCode ?? record.statusTitle ?? '').toString().toLowerCase();
        const isActive = rawStatus === 'active' || rawStatus === 'published' || record.statusCode === 1;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${isActive
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
            : 'bg-slate-50 text-slate-500 border-slate-100'
            } `}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'} `} />
            {isActive ? 'Hoạt động' : 'Bản nháp'}
          </span>
        );
      }
    },
    {
      title: 'TÁC VỤ',
      key: 'action',
      align: 'right',
      render: (_, record) => {
        const rawStatus = (record.status ?? record.statusCode ?? record.statusTitle ?? '').toString().toLowerCase();
        const isPublished = rawStatus === 'active' || rawStatus === 'published' || record.statusCode === 1;
        return (
          <div className="flex items-center justify-end gap-2">
            {!isPublished && (
              <Tooltip title="Xuất bản">
                <Button
                  type="text"
                  shape="circle"
                  icon={<Rocket size={16} />}
                  className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!record.id) {
                      message.error("Course ID is missing from this record!");
                      return;
                    }
                    try {
                      await publishTeacherCourse(record.id);
                      message.success('Xuất bản khóa học thành công!');
                      fetchCourses();
                    } catch (error) {
                      const errorMsg = error.response?.data?.Message || error.response?.data?.message || 'Lỗi khi xuất bản khóa học';
                      if (errorMsg === "Course not ready.") {
                        message.error("Khóa học chưa sẵn sàng. Vui lòng cập nhật đầy đủ Tên khóa học, Mô tả và Ảnh bìa.");
                      } else {
                        message.error(errorMsg);
                      }
                    }
                  }}
                />
              </Tooltip>
            )}
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                shape="circle"
                icon={<Eye size={16} />}
                className="text-slate-400 hover:text-[#0487e2] hover:bg-blue-50"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/dashboard/teacher/courses/${record.id}`);
                }}
              />
            </Tooltip>

            {isPublished && (
              <Tooltip title="Gán vào lớp">
                <Button
                  type="text"
                  shape="circle"
                  icon={<Users size={16} />}
                  className="text-slate-400 hover:text-[#0487e2] hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAssigningCourse(record);
                    assignForm.resetFields();
                    setIsAssignModalOpen(true);
                  }}
                />
              </Tooltip>
            )}

            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                shape="circle"
                icon={<Edit size={16} />}
                className="text-slate-400 hover:text-[#0487e2] hover:bg-blue-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingCourse(record);
                  editForm.setFieldsValue({
                    title: record.title,
                    code: record.code,
                    subjectId: record.subjectId,
                    gradeLevelId: record.gradeLevelId,
                    categoryId: record.categoryId,
                    level: record.level || 1,
                    language: record.language || "vi",
                    description: record.description
                  });
                  setIsEditModalOpen(true);
                }}
              />
            </Tooltip>
          </div>
        );
      }
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* CẤU TRÚC HEADER ĐƯỢC GIỮ NGUYÊN */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Quản lý Khóa học</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Quản lý các khóa học và nội dung giảng dạy của bạn.</p>
          </div>

          <Button
            type="primary"
            icon={<Plus size={18} />}
            onClick={() => {
              form.resetFields();
              setCreateType('template');
              setIsModalOpen(true);
            }}
            className="bg-[#0487e2] hover:bg-[#0374c4] h-11 px-6 rounded-lg font-bold shadow-md border-none flex items-center"
          >
            Tạo Khóa học
          </Button>
        </header>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Toolbar - Cập nhật logic active cho icon chuyển view */}
          <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="text-sm font-medium text-slate-500">
              Hiển thị {filteredCourses.length} khóa học
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <Input
                placeholder="Tìm kiếm khóa học..."
                prefix={<Search size={16} className="text-slate-400" />}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="h-10 w-full md:w-64 rounded-lg border-slate-200 bg-white hover:border-[#0487e2] focus:border-[#0487e2]"
                allowClear
              />

              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-40 h-10 [&>.ant-select-selector]:!rounded-lg [&>.ant-select-selector]:!border-slate-200 [&>.ant-select-selector]:!h-10 [&>.ant-select-selector]:!flex [&>.ant-select-selector]:!items-center"
                options={[
                  { value: 'all', label: 'Tất cả trạng thái' },
                  { value: 'active', label: 'Hoạt động' },
                  { value: 'draft', label: 'Bản nháp' }
                ]}
              />

              {/* Nút chuyển đổi ViewMode */}
              <div className="flex bg-slate-100/70 rounded-lg border border-slate-200 p-1">
                <Button
                  type="text"
                  className={`h-8 w-8 !p-0 flex items-center justify-center rounded transition-all ${viewMode === 'list' ? 'bg-white text-[#0487e2] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  onClick={() => setViewMode('list')}
                >
                  <ListIcon size={16} />
                </Button>
                <Button
                  type="text"
                  className={`h-8 w-8 !p-0 flex items-center justify-center rounded transition-all ${viewMode === 'grid' ? 'bg-white text-[#0487e2] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid size={16} />
                </Button>
              </div>
            </div>
          </div>

          {/* KẾT QUẢ HIỂN THỊ DỰA THEO VIEW MODE */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Spin size="large" />
              <p className="mt-4 text-slate-500 font-medium">Đang tải dữ liệu...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-16 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <BookOpen size={32} />
              </div>
              <Empty description={<span className="text-slate-400 font-medium">Không tìm thấy khóa học nào</span>} />
            </div>
          ) : viewMode === 'grid' ? (
            /* --- GRID VIEW LÀM MỚI TẠI ĐÂY --- */
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 bg-slate-50/30">
              {filteredCourses.map(course => {
                const rawStatus = (course.status ?? course.statusCode ?? course.statusTitle ?? '').toString().toLowerCase();
                const isActive = rawStatus === 'active' || rawStatus === 'published' || course.statusCode === 1;

                const difficultyMap = { 1: 'Cơ bản', 2: 'Trung bình', 3: 'Nâng cao' };
                const levelVal = course.level ?? course.Level ?? course.difficultyLevel;
                const levelText = difficultyMap[Number(levelVal)] || course.levelName || (levelVal ? `Cấp độ ${levelVal}` : '');

                const gradeId = course.gradeLevelId || course.GradeLevelId || course.gradeId;
                const gradeName = course.gradeLevelName || grades.find(g => g.id === gradeId)?.name;
                const catId = course.categoryId || course.CategoryId;
                const categoryName = course.categoryName || categories.find(c => c.id === catId)?.name;
                const imgSrc = course.thumbnail || course.imageUrl || course.coverUrl || course.picture || course.image;

                return (
                  <div
                    key={course.id}
                    onClick={() => navigate(`/dashboard/teacher/courses/${course.id}`)}
                    className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full hover:border-blue-200"
                  >
                    {/* Card Image Area */}
                    <div className="h-40 relative bg-blue-50/50 flex items-center justify-center overflow-hidden">
                      <BookOpen size={48} className="absolute z-0 text-blue-200 group-hover:scale-110 transition-transform duration-500" />
                      {imgSrc && (
                        <img src={imgSrc} alt={course.title} className="absolute inset-0 z-10 w-full h-full object-cover group-hover:scale-105 transition-all duration-500" onError={(e) => { e.target.style.display = 'none'; }} />
                      )}

                      {/* Badges Over Image */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold shadow-sm backdrop-blur-md ${isActive ? 'bg-emerald-500/90 text-white' : 'bg-slate-600/90 text-white'} `}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-slate-300'} `} />
                          {isActive ? 'Hoạt động' : 'Bản nháp'}
                        </span>
                      </div>

                      {course.isFeatured && (
                        <div className="absolute top-3 right-3 shadow-sm">
                          <Tag color="gold" className="m-0 text-[10px] font-bold uppercase px-2 py-1 rounded-md border-none shadow-sm">VIP</Tag>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-slate-800 text-[15px] leading-tight line-clamp-2 group-hover:text-[#0487e2] transition-colors">
                          {course.title || course.name}
                        </h3>
                      </div>

                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                        {course.code}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                        {levelText && (
                          <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded">
                            {levelText}
                          </span>
                        )}
                        {(gradeName || categoryName) && (
                          <span className="bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-medium px-2 py-1 rounded flex items-center gap-1">
                            <Layers size={10} /> {gradeName || categoryName}
                          </span>
                        )}
                      </div>

                      {/* Divider & Metrics */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex gap-3">
                          <div className="text-xs font-bold text-amber-500 flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-amber-300" />
                            {course.rating ?? course.averageRating ?? '0.0'}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                            <Clock size={12} />
                            {course.totalLessons ?? course.lessonCount ?? 0} bài
                          </div>
                        </div>

                        {/* Card Actions (Mô phỏng lại Tác vụ trên Table) */}
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          {!isActive && (
                            <Tooltip title="Xuất bản">
                              <Button
                                type="text" shape="circle" size="small"
                                icon={<Rocket size={14} />}
                                className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await publishTeacherCourse(course.id);
                                    message.success('Xuất bản thành công!');
                                    fetchCourses();
                                  } catch (error) {
                                    message.error(error.response?.data?.Message || 'Lỗi khi xuất bản khóa học');
                                  }
                                }}
                              />
                            </Tooltip>
                          )}
                          {isActive && (
                            <Tooltip title="Gán vào lớp">
                              <Button
                                type="text" shape="circle" size="small"
                                icon={<Users size={14} />}
                                className="text-slate-400 hover:text-[#0487e2] hover:bg-blue-50 flex items-center justify-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAssigningCourse(course);
                                  assignForm.resetFields();
                                  setIsAssignModalOpen(true);
                                }}
                              />
                            </Tooltip>
                          )}
                          <Tooltip title="Chỉnh sửa">
                            <Button
                              type="text" shape="circle" size="small"
                              icon={<Edit size={14} />}
                              className="text-slate-400 hover:text-[#0487e2] hover:bg-blue-50 flex items-center justify-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCourse(course);
                                editForm.setFieldsValue({
                                  title: course.title,
                                  code: course.code,
                                  subjectId: course.subjectId,
                                  gradeLevelId: course.gradeLevelId,
                                  categoryId: course.categoryId,
                                  level: course.level || 1,
                                  language: course.language || "vi",
                                  description: course.description
                                });
                                setIsEditModalOpen(true);
                              }}
                            />
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* --- BẢNG LIST VIEW NHƯ CŨ CỦA BẠN --- */
            <Table
              columns={columns}
              dataSource={filteredCourses}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                className: "px-5 py-4"
              }}
              className="custom-table"
              onRow={(record) => ({
                onClick: () => navigate(`/dashboard/teacher/courses/${record.id}`),
                className: "cursor-pointer hover:bg-slate-50 transition-colors"
              })}
            />
          )}
        </div>
      </div>

      {/* TOÀN BỘ MODALS BÊN DƯỚI ĐƯỢC GIỮ NGUYÊN KHÔNG THAY ĐỔI */}
      {/* Create Course Modal */}
      <Modal
        title={null}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        width={500}
      >
        <div className="pt-4 px-2">
          <div className="mb-6 text-center">
            <h3 className="text-xl font-bold text-slate-800">Tạo Khóa Học Mới</h3>
            <p className="text-slate-500 text-sm mt-1">Khởi tạo nhanh khóa học để bắt đầu thiết kế bài giảng</p>
          </div>

          <div className="mb-6 bg-slate-50 p-2 rounded-xl flex justify-center">
            <Radio.Group
              value={createType}
              onChange={e => setCreateType(e.target.value)}
              buttonStyle="solid"
              className="w-full flex"
            >
              <Radio.Button value="template" className="flex-1 text-center h-10 leading-[38px] rounded-lg">Dùng Template</Radio.Button>
              <Radio.Button value="scratch" className="flex-1 text-center h-10 leading-[38px] rounded-lg">Tạo mới hoàn toàn</Radio.Button>
            </Radio.Group>
          </div>

          <Form form={form} layout="vertical" onFinish={handleCreateSubmit} className="space-y-4">
            {createType === 'template' ? (
              <>
                <Form.Item
                  label="Chọn Template Khóa Học"
                  required
                >
                  <div className="flex gap-2">
                    <Form.Item
                      name="templateId"
                      noStyle
                      rules={[{ required: true, message: 'Vui lòng chọn template!' }]}
                    >
                      <Select
                        placeholder="Chọn template có sẵn..."
                        className="h-11 flex-1"
                        showSearch
                        optionFilterProp="children"
                      >
                        {templates.map(t => (
                          <Select.Option key={t.id} value={t.id}>{t.title} ({t.code})</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Button
                      icon={<Eye size={16} />}
                      onClick={handlePreviewTemplate}
                      className="h-11 px-4 border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      Xem thử
                    </Button>
                  </div>
                </Form.Item>

                <Form.Item
                  name="newCode"
                  label="Mã Khóa Học Mới"
                  rules={[{ required: true, message: 'Vui lòng nhập mã khóa học mới!' }]}
                >
                  <Input
                    className="h-11 rounded-lg uppercase bg-slate-50 border-transparent hover:bg-white focus:bg-white"
                    placeholder="VD: ABC123"
                  />
                </Form.Item>

                <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-sm text-amber-700 flex gap-2">
                  Hệ thống sẽ clone toàn bộ khung sườn rỗng (Draft) sang khóa học mới của bạn.
                </div>
              </>
            ) : (
              <>
                <Form.Item name="title" label="Tên Khóa Học" rules={[{ required: true, message: 'Vui lòng nhập tên khóa học' }]}>
                  <Input className="h-11 rounded-lg bg-slate-50 border-transparent hover:bg-white focus:bg-white transition-all font-medium" placeholder="VD: Hóa hữu cơ 12" />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item name="code" label="Mã Khóa" rules={[{ required: true, message: 'Nhập mã khóa' }]}>
                    <Input className="h-11 rounded-lg uppercase bg-slate-50 border-transparent hover:bg-white focus:bg-white" placeholder="VD: HOA12" />
                  </Form.Item>
                  <Form.Item name="subjectId" label="Môn Học" rules={[{ required: true, message: 'Chọn môn học' }]}>
                    <Select placeholder="Chọn môn..." className="h-11 [&>.ant-select-selector]:!bg-slate-50 [&>.ant-select-selector]:!border-transparent hover:[&>.ant-select-selector]:!bg-white">
                      {subjects.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
                    </Select>
                  </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item name="gradeLevelId" label="Khối Lớp" rules={[{ required: true, message: 'Chọn khối lớp' }]}>
                    <Select placeholder="Chọn khối..." className="h-11 [&>.ant-select-selector]:!bg-slate-50 [&>.ant-select-selector]:!border-transparent hover:[&>.ant-select-selector]:!bg-white">
                      {grades.map(g => <Select.Option key={g.id} value={g.id}>{g.name}</Select.Option>)}
                    </Select>
                  </Form.Item>
                  <Form.Item name="categoryId" label="Danh Mục" rules={[{ required: true, message: 'Chọn danh mục' }]}>
                    <Select placeholder="Chọn loại..." className="h-11 [&>.ant-select-selector]:!bg-slate-50 [&>.ant-select-selector]:!border-transparent hover:[&>.ant-select-selector]:!bg-white">
                      {categories.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
                    </Select>
                  </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item name="level" label="Độ Khó" initialValue={1}>
                    <Select className="h-11 [&>.ant-select-selector]:!bg-slate-50 [&>.ant-select-selector]:!border-transparent hover:[&>.ant-select-selector]:!bg-white">
                      <Select.Option value={1}>Cơ bản</Select.Option>
                      <Select.Option value={2}>Trung bình</Select.Option>
                      <Select.Option value={3}>Nâng cao</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="language" label="Ngôn Ngữ" initialValue="vi">
                    <Select className="h-11 [&>.ant-select-selector]:!bg-slate-50 [&>.ant-select-selector]:!border-transparent hover:[&>.ant-select-selector]:!bg-white">
                      <Select.Option value="vi">Tiếng Việt</Select.Option>
                      <Select.Option value="en">Tiếng Anh</Select.Option>
                    </Select>
                  </Form.Item>
                </div>

                <Form.Item name="description" label="Mô tả">
                  <Input.TextArea rows={3} className="rounded-lg bg-slate-50 border-transparent hover:bg-white focus:bg-white" placeholder="Mô tả mục tiêu khóa học..." />
                </Form.Item>
              </>
            )}

            <div className="flex gap-3 pt-6 border-t border-slate-100 mt-2">
              <Button className="flex-1 h-11 rounded-xl font-semibold border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => setIsModalOpen(false)}>Hủy bỏ</Button>
              <Button type="primary" htmlType="submit" loading={submitting} className="flex-1 h-11 rounded-xl bg-[#0487e2] font-bold shadow-lg shadow-blue-200 border-none">
                {createType === 'template' ? 'Clone Khóa Học' : 'Khởi Tạo'}
              </Button>
            </div>
          </Form>
        </div>
      </Modal>

      {/* Quick Edit Modal */}
      <Modal
        title={<div className="flex items-center gap-2"><Edit size={20} className="text-[#0487e2]" /><span className="font-bold text-xl">Chỉnh sửa Khóa học</span></div>}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={600}
        centered
        className="rounded-2xl"
      >
        <div className="pt-4">
          <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
            <Form.Item name="title" label="Tên Khóa Học" rules={[{ required: true, message: 'Vui lòng nhập tên khóa học!' }]}>
              <Input className="h-11 rounded-lg" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="code" label="Mã Khóa" rules={[{ required: true, message: 'Vui lòng nhập mã khóa!' }]}>
                <Input className="h-11 rounded-lg uppercase" />
              </Form.Item>
              <Form.Item name="subjectId" label="Môn Học" rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}>
                <Select className="h-11">
                  {subjects.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="gradeLevelId" label="Khối Lớp" rules={[{ required: true, message: 'Vui lòng chọn khối lớp!' }]}>
                <Select className="h-11">
                  {grades.map(g => <Select.Option key={g.id} value={g.id}>{g.name}</Select.Option>)}
                </Select>
              </Form.Item>
              <Form.Item name="categoryId" label="Danh Mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}>
                <Select className="h-11">
                  {categories.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="level" label="Độ Khó">
                <Select className="h-11">
                  <Select.Option value={1}>Cơ bản</Select.Option>
                  <Select.Option value={2}>Trung bình</Select.Option>
                  <Select.Option value={3}>Nâng cao</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="language" label="Ngôn Ngữ">
                <Select className="h-11">
                  <Select.Option value="vi">Tiếng Việt</Select.Option>
                  <Select.Option value="en">Tiếng Anh</Select.Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item name="description" label="Mô tả">
              <Input.TextArea rows={3} className="rounded-lg" />
            </Form.Item>

            <div className="flex gap-3 pt-4">
              <Button className="flex-1 h-11 rounded-xl font-bold" onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting} className="flex-1 h-11 rounded-xl bg-[#0487e2] font-bold border-none">
                Lưu thay đổi
              </Button>
            </div>
          </Form>
        </div>
      </Modal>

      {/* Assign Class Modal */}
      <Modal
        title={<div className="flex items-center gap-2"><Users size={20} className="text-[#0487e2]" /><span className="font-bold text-xl">Gán Lớp vào Khóa Học</span></div>}
        open={isAssignModalOpen}
        onCancel={() => setIsAssignModalOpen(false)}
        footer={null}
        width={500}
        centered
        className="rounded-2xl"
      >
        <div className="pt-4 space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
            <p className="text-blue-700 text-sm font-medium mb-1">Khóa học đang gán:</p>
            <p className="text-blue-900 font-bold">{assigningCourse?.title}</p>
          </div>

          <Form form={assignForm} layout="vertical" onFinish={handleAssignSubmit}>
            <Form.Item
              name="classId"
              label="Chọn Lớp Học"
              rules={[{ required: true, message: 'Vui lòng chọn lớp học!' }]}
              extra="Chỉ hiển thị các lớp do bạn phụ trách và có cùng khối Lớp với Khóa học."
            >
              <Select placeholder="Tìm và chọn lớp..." className="h-11">
                {classes
                  .filter(c => {
                    const cGradeId = c.gradeLevelId || c.gradeId;
                    const courseGradeId = assigningCourse?.gradeLevelId || assigningCourse?.gradeId;
                    if (!courseGradeId || !cGradeId) return true;
                    return String(cGradeId) === String(courseGradeId);
                  })
                  .map(c => {
                    const gradeName = c.gradeName || grades.find(g => g.id === c.gradeLevelId || g.id === c.gradeId)?.name || 'Khối N/A';
                    return (
                      <Select.Option key={c.id} value={c.id}>
                        {c.name} - {gradeName}
                      </Select.Option>
                    );
                  })}
              </Select>
            </Form.Item>

            <div className="flex gap-3 pt-4">
              <Button className="flex-1 h-11 rounded-xl font-bold" onClick={() => setIsAssignModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting} className="flex-1 h-11 rounded-xl bg-[#0487e2] font-bold border-none">
                Gán Lớp Ngay
              </Button>
            </div>
          </Form>
        </div>
      </Modal>

      {/* Template Preview Modal */}
      <Modal
        title={<div className="flex items-center gap-2"><Eye size={20} className="text-[#0487e2]" /><span className="font-bold">Cấu trúc Template</span></div>}
        open={isPreviewModalOpen}
        onCancel={() => setIsPreviewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsPreviewModalOpen(false)}>Đóng</Button>
        ]}
        width={650}
        centered
      >
        {previewLoading ? (
          <div className="py-20 text-center">
            <Spin>
              <div className="pt-4 text-slate-500 font-medium">Đang tải cấu trúc...</div>
            </Spin>
          </div>
        ) : previewData ? (
          <div className="py-2 space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="font-bold text-slate-800 text-lg mb-1">{previewData.title || previewData.name}</h4>
              <p className="text-slate-500 text-sm">{previewData.description || 'Không có mô tả cho template này.'}</p>
            </div>

            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <h5 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Danh sách chương bài</h5>
              {(previewData.sections || previewData.items || previewData.Sections || []).length > 0 ? (
                <div className="space-y-3">
                  {(previewData.sections || previewData.items || previewData.Sections).map((sec, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter bg-blue-50 px-2 py-0.5 rounded mb-2 inline-block">Chương {idx + 1}</span>
                          <h6 className="font-bold text-slate-700">{sec.title || sec.Title || sec.name}</h6>
                          <p className="text-xs text-slate-400 mt-1">{sec.description || sec.Description || 'Không có mô tả.'}</p>
                        </div>
                        <div className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                          {(sec.lessons || sec.items || sec.Lessons || []).length} bài học
                        </div>
                      </div>

                      {/* Lessons list if available */}
                      {(sec.lessons || sec.items || sec.Lessons || []).length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                          {(sec.lessons || sec.items || sec.Lessons).slice(0, 3).map((lesson, lIdx) => (
                            <div key={lIdx} className="flex items-center gap-3 text-xs text-slate-500">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              <span className="flex-1 font-medium italic">{lesson.title || lesson.Title || lesson.name}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{lesson.type || lesson.Type || 'Video'}</span>
                            </div>
                          ))}
                          {(sec.lessons || sec.items || sec.Lessons).length > 3 && (
                            <div className="text-[10px] text-slate-400 italic pl-4 font-medium">...và {(sec.lessons || sec.items || sec.Lessons).length - 3} bài học khác</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="Template này hiện chưa có nội dung chương bài." className="py-10" />
              )}
            </div>
          </div>
        ) : (
          <Empty description="Không tìm thấy dữ liệu cấu trúc." />
        )}
      </Modal>
    </div>
  );
}