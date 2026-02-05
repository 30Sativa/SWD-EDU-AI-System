import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  ArrowUpRight,
  MoreHorizontal,
  ChevronDown,
  BookOpen,
  FileText,
  HelpCircle,
  Bot,
  PenTool,
  CheckSquare,
  BarChart2,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { getMyCourses } from '../../../course/api/courseApi';
import { getClasses } from '../../../classes/api/classApi';
import { Spin } from 'antd';

// Fallback data when API chưa trả đủ / cho biểu đồ
const defaultSparkline = [{ v: 10 }, { v: 15 }, { v: 12 }, { v: 20 }, { v: 25 }, { v: 22 }, { v: 30 }];
const defaultBarData = [
  { name: 'T2', value: 0 },
  { name: 'T3', value: 0 },
  { name: 'T4', value: 0 },
  { name: 'T5', value: 0 },
  { name: 'T6', value: 0 },
  { name: 'T7', value: 0 },
  { name: 'CN', value: 0 },
];

function extractList(res) {
  if (!res) return [];
  const raw = res?.data?.items ?? res?.items ?? res?.data ?? res;
  return Array.isArray(raw) ? raw : [];
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);

  // Flow 19: GET /api/courses/my + GET /api/manager/classes
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [coursesRes, classesRes] = await Promise.all([
          getMyCourses(),
          getClasses()
        ]);
        setCourses(extractList(coursesRes));
        setClasses(extractList(classesRes));
      } catch (err) {
        console.error('Dashboard load error:', err);
        setCourses([]);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount ?? c.enrollmentCount ?? 0), 0);
  const activeCoursesList = courses.filter(c => (c.status ?? c.statusCode ?? '').toString().toLowerCase() !== 'draft');
  const publishedCount = courses.filter(c => (c.status ?? c.statusCode ?? '').toString().toLowerCase() === 'published').length;
  const draftCount = courses.filter(c => (c.status ?? c.statusCode ?? '').toString().toLowerCase() === 'draft').length;
  const totalLessons = courses.reduce((sum, c) => sum + (c.totalLessons ?? c.sectionCount ?? 0), 0);

  const summaryCards = [
    {
      label: 'Tổng Học sinh',
      value: totalStudents,
      change: '—',
      trend: 'neutral',
      data: defaultSparkline,
      color: '#0487e2'
    },
    {
      label: 'Khóa học Đang hoạt động',
      value: activeCoursesList.length,
      change: '—',
      trend: 'neutral',
      data: defaultSparkline,
      color: '#10b981'
    },
    {
      label: 'Bài học / Section',
      value: totalLessons,
      change: '—',
      trend: 'neutral',
      data: defaultSparkline,
      color: '#6366f1'
    },
  ];

  const courseDistributionData = [
    { name: 'Đang hoạt động', value: activeCoursesList.length, color: '#10b981' },
    { name: 'Đã xuất bản', value: publishedCount, color: '#6366f1' },
    { name: 'Bản nháp', value: draftCount, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  const studentActivityData = defaultBarData;
  const recentActivity = []; // TODO: API hoạt động gần đây khi có

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Spin size="large" />
          <p className="text-slate-500 mt-4">Đang tải tổng quan lớp được phân công...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-800">

      {/* Top Navigation / Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Bảng điều khiển</h1>
          <p className="text-slate-500 text-sm mt-1">Chào mừng trở lại, đây là tổng quan lớp học của bạn.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto relative">
          <div className="relative">
            <button
              onClick={() => setIsCreateOpen(!isCreateOpen)}
              className="flex items-center gap-2 bg-[#0487e2] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0463ca] shadow-lg shadow-[#0487e2]/20 transition-all"
            >
              <Plus size={16} />
              <span>Tạo mới</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${isCreateOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCreateOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => { setIsCreateOpen(false); navigate('/dashboard/teacher/courses/create'); }}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                >
                  <BookOpen size={16} className="text-[#0487e2]" />
                  <span>Tạo khóa học</span>
                </button>
                <button className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                  <FileText size={16} className="text-[#0487e2]" />
                  <span>Tạo bài học</span>
                </button>
                <button className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                  <HelpCircle size={16} className="text-[#0487e2]" />
                  <span>Tạo bài kiểm tra</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Stats Grid with Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {summaryCards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between h-40 relative overflow-hidden group">
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-2">{card.label}</p>
                <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{card.value}</h3>
              </div>
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${card.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'}`}>
                {card.trend === 'up' && <ArrowUpRight size={12} />}
                {card.change}
              </span>
            </div>

            {/* Mini Sparkline Chart */}
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-50 transition-opacity">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={card.data}>
                  <defs>
                    <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={card.color} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={card.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={card.color}
                    strokeWidth={2}
                    fill={`url(#gradient-${index})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

        {/* Left Column: Big Chart & Active Courses */}
        <div className="lg:col-span-2 space-y-8">

          {/* Main Analytics Chart */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#0463ca]">Hoạt động truy cập</h2>
                <p className="text-sm text-slate-500">Số lượng học sinh tương tác trong tuần qua</p>
              </div>
              <select className="bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 rounded-lg px-3 py-1.5 focus:outline-none">
                <option>Tuần này</option>
                <option>Tháng này</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={studentActivityData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#0487e2" radius={[4, 4, 0, 0]}>
                    {studentActivityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 4 ? '#0487e2' : '#e2e8f0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Courses List - Flow 19: từ GET /api/courses/my */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#0463ca]">Khóa học / Lớp được phân công</h2>
              <button
                onClick={() => navigate('/dashboard/teacher/courses')}
                className="text-sm text-[#0487e2] font-semibold hover:text-[#0463ca]"
              >
                Xem tất cả
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-50">
                    <th className="px-6 py-4">Tên khóa học</th>
                    <th className="px-6 py-4">Học sinh</th>
                    <th className="px-6 py-4">Bài học / Section</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(activeCoursesList.length ? activeCoursesList.slice(0, 5) : courses.slice(0, 5)).map((course) => {
                    const name = course.title ?? course.name ?? course.courseName ?? '—';
                    const students = course.enrollmentCount ?? course.studentCount ?? 0;
                    const lessons = course.totalLessons ?? course.sectionCount ?? 0;
                    const progress = course.progress ?? 0;
                    return (
                      <tr
                        key={course.id ?? course.name}
                        onClick={() => course.id && navigate(`/dashboard/teacher/courses/${course.id}`)}
                        className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{name}</div>
                          <div className="text-xs text-slate-500">{course.gradeName ?? course.subjectName ?? ''}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-700">{students}</span>
                        </td>
                        <td className="px-6 py-4 w-1/3">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#0487e2] rounded-full" style={{ width: `${Math.min(100, progress)}%` }} />
                            </div>
                            <span className="text-xs font-medium text-slate-600">{lessons} bài</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-300 hover:text-slate-600" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {courses.length === 0 && !loading && (
                <div className="px-6 py-8 text-center text-slate-500 text-sm">
                  Chưa có khóa học nào. <button type="button" onClick={() => navigate('/dashboard/teacher/courses/create')} className="text-[#0487e2] font-medium hover:underline">Tạo khóa học</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Assistant & Other Widgets */}
        <div className="space-y-8">

          {/* AI Teaching Assistant Card (Smaller, Blue Theme, Right Column) */}
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-md">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  AI Teaching Assistant
                </h2>
                <p className="text-blue-100 text-xs mt-1">Cần trợ giúp giảng dạy? Hãy để AI hỗ trợ!</p>
              </div>
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Bot size={20} className="text-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/5 backdrop-blur-sm transition-all group text-left">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white/20 rounded-lg"><HelpCircle size={16} /></div>
                  <span className="font-medium text-sm">Tạo Đề thi</span>
                </div>
                <ArrowRight size={16} className="opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
              </button>

              <button className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/5 backdrop-blur-sm transition-all group text-left">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white/20 rounded-lg"><CheckSquare size={16} /></div>
                  <span className="font-medium text-sm">Chấm bài Tự động</span>
                </div>
                <ArrowRight size={16} className="opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
              </button>

              <button className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/5 backdrop-blur-sm transition-all group text-left">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white/20 rounded-lg"><PenTool size={16} /></div>
                  <span className="font-medium text-sm">Soạn Giáo án</span>
                </div>
                <ArrowRight size={16} className="opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
              </button>

              <button className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/5 backdrop-blur-sm transition-all group text-left">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white/20 rounded-lg"><BarChart2 size={16} /></div>
                  <span className="font-medium text-sm">Phân tích Học sinh</span>
                </div>
                <ArrowRight size={16} className="opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
              </button>
            </div>
          </div>

          {/* Distribution Pie Chart - từ courses (GET /api/courses/my) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-[#0463ca] mb-6">Trạng thái nội dung</h2>
            <div className="h-[220px] relative">
              {courseDistributionData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                      <Pie
                        data={courseDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {courseDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <span className="block text-2xl font-bold text-slate-900">{courses.length}</span>
                      <span className="text-xs text-slate-400 font-medium uppercase">Tổng khóa</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-slate-400 text-sm">Chưa có dữ liệu</div>
                </div>
              )}
            </div>
            <div className="mt-4 space-y-3">
              {courseDistributionData.length > 0 ? courseDistributionData.map((item) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.value}</span>
                </div>
              )) : (
                <div className="text-slate-400 text-sm">Chưa có khóa học</div>
              )}
            </div>
          </div>

          {/* Recent Activity - TODO: API khi có */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-[#0463ca] mb-6">Hoạt động mới nhất</h2>
            <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pl-6 py-2">
              {recentActivity.length > 0 ? recentActivity.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white ${item.action ? 'bg-[#0487e2]' : 'bg-slate-300'}`} />
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-900">{item.user}</span>
                      <span className="text-[10px] font-medium text-slate-400">{item.time}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-snug">{item.text}</p>
                    {item.action && (
                      <button type="button" className="mt-2 text-xs font-bold text-[#0487e2] bg-[#e0f2fe] hover:bg-[#b0d6f5] px-3 py-1.5 rounded-md w-fit transition-colors">
                        {item.action}
                      </button>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-slate-400 text-sm py-2">Chưa có hoạt động gần đây.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}