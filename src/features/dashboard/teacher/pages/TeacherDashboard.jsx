import React, { useState } from 'react';
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

const studentActivityData = [
  { name: 'T2', value: 40 },
  { name: 'T3', value: 30 },
  { name: 'T4', value: 65 },
  { name: 'T5', value: 50 },
  { name: 'T6', value: 84 },
  { name: 'T7', value: 60 },
  { name: 'CN', value: 70 },
];

const courseDistributionData = [
  { name: 'Đang hoạt động', value: 3, color: '#10b981' },
  { name: 'Đã xuất bản', value: 35, color: '#6366f1' },
  { name: 'Bản nháp', value: 2, color: '#f59e0b' },
];

const sparklineData1 = [{ v: 10 }, { v: 15 }, { v: 12 }, { v: 20 }, { v: 25 }, { v: 22 }, { v: 30 }];
const sparklineData2 = [{ v: 20 }, { v: 20 }, { v: 20 }, { v: 20 }, { v: 20 }, { v: 20 }, { v: 20 }];
const sparklineData3 = [{ v: 10 }, { v: 12 }, { v: 15 }, { v: 20 }, { v: 22 }, { v: 28 }, { v: 35 }];

const summaryCards = [
  {
    label: 'Tổng Học sinh',
    value: 84,
    change: '12%',
    trend: 'up',
    data: sparklineData1,
    color: '#0487e2' // Primary Blue
  },
  {
    label: 'Khóa học Đang hoạt động',
    value: 3,
    change: '0%',
    trend: 'neutral',
    data: sparklineData2,
    color: '#10b981'
  },
  {
    label: 'Bài học Đã xuất bản',
    value: 35,
    change: '5%',
    trend: 'up',
    data: sparklineData3,
    color: '#6366f1'
  },
];

const activeCourses = [
  { name: 'Toán học 10A', students: 32, lessons: 12, category: 'Lớp 10', progress: 75 },
  { name: 'Vật lý 11B', students: 28, lessons: 8, category: 'Lớp 11', progress: 45 },
  { name: 'Tiếng Anh Nâng cao', students: 24, lessons: 15, category: 'Ngôn ngữ', progress: 90 },
];

const recentActivity = [
  {
    user: 'Nguyễn Văn A',
    type: 'Câu hỏi',
    text: 'Đã hỏi về phương trình bậc hai trong Bài 5',
    time: '10 phút trước',
    action: 'Trả lời',
  },
  {
    user: 'Bạn',
    type: 'Chỉnh sửa',
    text: 'Đã cập nhật nội dung bài học trong Bài 8: Đạo hàm',
    time: '2 giờ trước',
    action: null,
  },
];

export default function TeacherDashboard() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
                <button className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
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
              <ResponsiveContainer width="100%" height="100%">
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
              <ResponsiveContainer width="100%" height="100%">
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

          {/* Active Courses List */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#0463ca]">Khóa học Đang hoạt động</h2>
              <button className="text-sm text-[#0487e2] font-semibold hover:text-[#0463ca]">Xem tất cả</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-50">
                    <th className="px-6 py-4">Tên khóa học</th>
                    <th className="px-6 py-4">Học sinh</th>
                    <th className="px-6 py-4">Tiến độ bài học</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeCourses.map((course) => (
                    <tr key={course.name} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{course.name}</div>
                        <div className="text-xs text-slate-500">{course.category}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-2 overflow-hidden">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className={`inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500`}>
                              {String.fromCharCode(65 + i)}
                            </div>
                          ))}
                          <div className="h-6 w-6 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">+{course.students - 3}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 w-1/3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#0487e2] rounded-full" style={{ width: `${course.progress}%` }}></div>
                          </div>
                          <span className="text-xs font-medium text-slate-600">{course.lessons} bài</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-300 hover:text-slate-600">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

          {/* Distribution Pie Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-[#0463ca] mb-6">Trạng thái nội dung</h2>
            <div className="h-[220px] relative">
              <ResponsiveContainer width="100%" height="100%">
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
                  <span className="block text-2xl font-bold text-slate-900">40</span>
                  <span className="text-xs text-slate-400 font-medium uppercase">Tổng mục</span>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {courseDistributionData.map((item) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-[#0463ca] mb-6">Hoạt động mới nhất</h2>
            <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pl-6 py-2">
              {recentActivity.map((item, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white ${item.action ? 'bg-[#0487e2]' : 'bg-slate-300'}`}></div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-900">{item.user}</span>
                      <span className="text-[10px] font-medium text-slate-400">{item.time}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-snug">
                      {item.text}
                    </p>
                    {item.action && (
                      <button className="mt-2 text-xs font-bold text-[#0487e2] bg-[#e0f2fe] hover:bg-[#b0d6f5] px-3 py-1.5 rounded-md w-fit transition-colors">
                        {item.action}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}