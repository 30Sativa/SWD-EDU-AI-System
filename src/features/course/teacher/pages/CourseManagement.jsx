import React, { useState, useEffect, useCallback } from 'react';
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
  Trash2
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
import { getMyCourses, getCourseTemplates, createTeacherCourse, cloneTeacherCourse } from '../../api/courseApi';
import { getSubjects } from '../../../subject/api/subjectApi';

export default function CourseManagement() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createType, setCreateType] = useState('template'); // 'template' or 'scratch'
  const [templates, setTemplates] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyCourses();
      const data = res?.data?.items || res?.items || res?.data || res || [];
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách khóa học:', error);
      message.error('Không thể kết nối máy chủ để tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDependencies = async () => {
    try {
      const [templatesRes, subjectsRes] = await Promise.all([
        getCourseTemplates(),
        getSubjects()
      ]);
      setTemplates(templatesRes?.data?.items || templatesRes?.items || templatesRes?.data || []);
      setSubjects(subjectsRes?.data?.items || subjectsRes?.items || subjectsRes?.data || []);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu template/subject:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchDependencies();
  }, [fetchCourses]);

  const handleCreateSubmit = async (values) => {
    try {
      setSubmitting(true);
      if (createType === 'template') {
        const payload = { templateId: values.templateId };
        await cloneTeacherCourse(payload);
        message.success('Clone khóa học từ template thành công!');
      } else {
        const payload = {
          title: values.title,
          code: values.code,
          subjectId: values.subjectId,
          description: values.description || ""
        };
        await createTeacherCourse(payload);
        message.success('Tạo khóa học mới thành công!');
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchCourses();
    } catch (error) {
      console.error('Creation error:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo khóa học');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = (course.title || course.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const isActive = course.status === 'Active' || course.status === 'Published';
      if (statusFilter === 'active') matchesStatus = isActive;
      if (statusFilter === 'draft') matchesStatus = !isActive;
    }

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'KHÓA HỌC',
      key: 'course',
      width: 350,
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-blue-50 flex items-center justify-center text-[#0487e2] shrink-0 border border-slate-100 relative group/thumb">
            {record.thumbnail ? (
              <img src={record.thumbnail} alt={record.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <BookOpen size={24} />
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
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{record.code}</span>
          </div>
        </div>
      )
    },
    {
      title: 'PHÂN LOẠI',
      key: 'level',
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <Tag className="rounded font-bold border-none bg-blue-50 text-blue-600 px-2 py-0 text-[11px] w-fit">
            {record.level || 'Chưa định nghĩa'}
          </Tag>
          <span className="text-xs text-slate-500 font-medium px-1 flex items-center gap-1">
            <Layers size={12} className="text-[#0487e2]" />
            {record.subjectName || 'Khối lớp N/A'}
          </span>
        </div>
      )
    },
    {
      title: 'THỐNG KÊ',
      key: 'metrics',
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Users size={14} className="text-slate-400" />
              {record.enrollmentCount || 0}
            </div>
            <div className="text-xs font-bold text-amber-500 flex items-center gap-1">
              <CheckCircle2 size={14} fill="currentColor" className="text-amber-100" />
              {record.rating || '0.0'}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Clock size={12} />
            {record.totalLessons || 0} bài • {Math.floor(record.totalDuration / 60) || 0}h {(record.totalDuration % 60) || 0}m
          </div>
        </div>
      )
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => {
        const isActive = status === 'Active' || status === 'Published';
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${isActive
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
            : 'bg-slate-50 text-slate-500 border-slate-100'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {isActive ? 'Hoạt động' : 'Bản nháp'}
          </span>
        );
      }
    },
    {
      title: 'TÁC VỤ',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-2">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              shape="circle"
              icon={<Eye size={16} />}
              className="text-slate-400 hover:text-[#0487e2] hover:bg-blue-50"
              onClick={() => navigate(`/dashboard/teacher/courses/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              shape="circle"
              icon={<Edit size={16} />}
              className="text-slate-400 hover:text-[#0487e2] hover:bg-blue-50"
              onClick={() => navigate(`/dashboard/teacher/courses/${record.id}/edit`)}
            />
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
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

          {/* Toolbar */}
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

              <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                <Button type="text" className="h-8 w-8 !p-0 flex items-center justify-center rounded text-[#0487e2] bg-blue-50"><ListIcon size={16} /></Button>
                <Button type="text" className="h-8 w-8 !p-0 flex items-center justify-center rounded text-slate-400 hover:text-slate-600"><LayoutGrid size={16} /></Button>
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Spin size="large" />
              <p className="mt-4 text-slate-500 font-medium">Đang tải dữ liệu...</p>
            </div>
          ) : (
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
              locale={{
                emptyText: (
                  <div className="py-12 flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                      <BookOpen size={32} />
                    </div>
                    <Empty description={<span className="text-slate-400 font-medium">Không tìm thấy khóa học nào</span>} />
                  </div>
                )
              }}
              onRow={(record) => ({
                onClick: () => navigate(`/dashboard/teacher/courses/${record.id}`),
                className: "cursor-pointer hover:bg-slate-50 transition-colors"
              })}
            />
          )}
        </div>
      </div>

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
            <div className="w-12 h-12 bg-blue-50 text-[#0487e2] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <BookOpen size={24} />
            </div>
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
                  name="templateId"
                  label="Chọn Template Khóa Học"
                  rules={[{ required: true, message: 'Vui lòng chọn template!' }]}
                >
                  <Select
                    placeholder="Chọn template có sẵn..."
                    className="h-11"
                    showSearch
                    optionFilterProp="children"
                  >
                    {templates.map(t => (
                      <Select.Option key={t.id} value={t.id}>{t.title} ({t.code})</Select.Option>
                    ))}
                  </Select>
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

                <Form.Item name="description" label="Mô tả ngắn">
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
    </div>
  );
}
