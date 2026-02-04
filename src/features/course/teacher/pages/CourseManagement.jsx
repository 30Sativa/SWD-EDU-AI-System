import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  BookOpen,
  LayoutGrid,
  List as ListIcon,
  Users,
  Clock,
  ArrowRight,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  GraduationCap
} from 'lucide-react';
import {
  Table,
  Button,
  Input,
  message,
  Tooltip,
  Empty,
  Select,
  Tag,
  Dropdown,
  Space,
  Spin
} from 'antd';
import { getCourses, getMyCourses } from '../../api/courseApi';

// --- Shared Components (Clean Admin Style) ---

const StatCard = ({ label, value, subtext, icon: Icon, color }) => {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    purple: 'text-purple-600 bg-purple-50',
    amber: 'text-amber-600 bg-amber-50',
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${colorMap[color] || colorMap.blue}`}>
        <Icon size={24} />
      </div>
      <div className="text-left">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-0.5">{label}</p>
        <div className="text-2xl font-bold text-slate-800 leading-none">{value}</div>
        <p className="text-[10px] text-slate-400 font-bold mt-1.5 italic hidden md:block">{subtext}</p>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const isActive = status === 'published' || status === 'active' || status === 'Active';
  return (
    <Tag color={isActive ? 'success' : 'default'} className="border-0 m-0 font-semibold px-2 py-0.5 rounded-md">
      {isActive ? 'Hoạt động' : 'Bản nháp'}
    </Tag>
  );
};

// Renamed prop to 'data' to avoid any 'course' naming confusion in higher scopes
const CourseCard = ({ data, navigate, isTemplate = false }) => {
  const status = data.status?.toLowerCase() || (data.isActive ? 'active' : 'draft');

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group relative overflow-hidden flex flex-col cursor-pointer"
      onClick={() => !isTemplate ? navigate(`/dashboard/teacher/courses/${data.id}`) : null}
    >
      <div className="h-40 overflow-hidden bg-slate-100 relative">
        {data.thumbnail ? (
          <img src={data.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300"><BookOpen size={32} /></div>
        )}
        <div className="absolute top-3 right-3">
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <span className="text-[10px] font-bold text-[#0487e2] bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider">
            {data.subject?.name || data.subjectName || data.category || 'Hệ thống'}
          </span>
        </div>

        <h3 className="font-bold text-base text-slate-800 mb-2 group-hover:text-[#0487e2] transition-colors line-clamp-2 min-h-[3rem]">
          {data.title || data.name}
        </h3>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-slate-400" />
            <span>{data.enrollmentCount || 0} HV</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-slate-400" />
            <span>{Math.floor((data.totalDuration || 0) / 60)}h {(data.totalDuration || 0) % 60}m</span>
          </div>
        </div>

        {isTemplate && (
          <div className="pt-4 mt-2">
            <Button
              block
              type="dashed"
              className="text-emerald-600 border-emerald-200 hover:text-emerald-700 hover:border-emerald-400 font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dashboard/teacher/courses/create?templateId=${data.id}`);
              }}
            >
              <Copy size={16} className="mr-2" /> Sử dụng mẫu này
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CourseManagement() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [activeTab, setActiveTab] = useState('my'); // 'my' or 'templates'

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      let res;
      if (activeTab === 'my') {
        res = await getMyCourses();
      } else {
        res = await getCourses({ Status: 'Active' });
      }
      const data = res?.data?.items || res?.items || res?.data || res || [];
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách khóa học:', error);
      // message.error('Không thể kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const filteredCourses = courses.filter(item =>
    (item.title || item.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Columns for List View ---
  const columns = [
    {
      title: 'KHÓA HỌC',
      key: 'courseName', // Unique key
      width: 400,
      render: (_, record) => (
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/dashboard/teacher/courses/${record.id}`)}>
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
            {record.thumbnail ? (
              <img src={record.thumbnail} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400"><BookOpen size={16} /></div>
            )}
          </div>
          <div>
            <div className="font-bold text-slate-700 text-sm group-hover:text-[#0487e2] transition-colors">{record.title || record.name}</div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{record.code}</div>
          </div>
        </div>
      )
    },
    {
      title: 'THỐNG KÊ',
      key: 'stats',
      render: (_, record) => (
        <div className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5"><Users size={14} className="text-slate-400" /> {record.enrollmentCount || 0} học viên</div>
          <div className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> {Math.floor((record.totalDuration || 0) / 60)}h {(record.totalDuration || 0) % 60}m</div>
        </div>
      )
    },
    {
      title: 'PHÂN LOẠI',
      key: 'category',
      render: (_, record) => (
        <Tag className="rounded-md border-0 bg-slate-100 text-slate-600 font-semibold">
          {record.subject?.name || record.subjectName || 'Hệ thống'}
        </Tag>
      )
    },
    {
      title: 'TRẠNG THÁI',
      key: 'status',
      align: 'center',
      render: (_, record) => <StatusBadge status={record.status || (record.isActive ? 'Active' : 'Draft')} />
    },
    {
      title: 'TÁC VỤ',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <div className="flex justify-end gap-1">
          {activeTab === 'templates' ? (
            <Button
              type="text"
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-medium text-xs flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dashboard/teacher/courses/create?templateId=${record.id}`);
              }}
            >
              <Copy size={16} className="mr-2" /> Dùng mẫu
            </Button>
          ) : (
            <>
              <Tooltip title="Chi tiết">
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
                  className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/teacher/courses/edit/${record.id}`);
                  }}
                />
              </Tooltip>
            </>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spin size="large" />
      </div>
    );
  }

  // Normalize status for UI
  const status = course.status?.toLowerCase() || 'draft';
  const displayStatus = status === 'active' || status === 'published' ? 'published' : status;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Quản lý Khóa học</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Soạn thảo giáo án và theo dõi tiến độ giảng dạy</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="primary"
              icon={<Plus size={18} />}
              onClick={() => navigate('/dashboard/teacher/courses/create')}
              className="bg-[#0487e2] hover:bg-[#0374c4] h-11 px-6 rounded-lg font-bold shadow-sm border-none flex items-center gap-2"
            >
              Soạn khóa học mới
            </Button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Tổng khóa học" value={courses.length} subtext={activeTab === 'my' ? "Khóa học của tôi" : "Khóa học mẫu có sẵn"} icon={BookOpen} color="blue" />
          <StatCard label="Tổng học viên" value={courses.reduce((acc, c) => acc + (c.enrollmentCount || 0), 0)} subtext="Đang theo học" icon={Users} color="emerald" />
          <StatCard label="Tổng thời lượng" value={`${Math.floor(courses.reduce((acc, c) => acc + (c.totalDuration || 0), 0) / 60)}h`} subtext="Nội dung giảng dạy" icon={Clock} color="purple" />
        </div>

        {/* Tabs & Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-4">
          {/* Custom Tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('my')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'my' ? 'bg-white text-[#0487e2] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Khóa học của tôi
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'templates' ? 'bg-white text-[#0487e2] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Kho khóa học mẫu
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <Input
              placeholder="Tìm kiếm khóa học..."
              prefix={<Search size={18} className="text-slate-400" />}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="h-10 rounded-lg border-slate-200 max-w-sm"
            />
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#0487e2]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ListIcon size={18} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#0487e2]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-24 text-center">
              <Empty description="Không tìm thấy dữ liệu" />
            </div>
          ) : (
            viewMode === 'grid' ? (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map(item => (
                  <CourseCard key={item.id} data={item} navigate={navigate} isTemplate={activeTab === 'templates'} />
                ))}
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={filteredCourses}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: false,
                  className: "px-6 py-4"
                }}
                rowClassName="hover:bg-slate-50 transition-colors"
              />
            )
          )}
        </div>

      </div>
    </div>
  );
}