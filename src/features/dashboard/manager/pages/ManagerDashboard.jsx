import React, { useEffect, useState } from 'react';
import {
  Plus,
  MoreVertical,
  FileText,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import { getSubjects } from '../../../subject/api/subjectApi';
import { getClasses } from '../../../classes/api/classApi';
import { getUsers } from '../../../user/api/userApi';
import { getGradeLevels } from '../../../grade/api/gradeApi';

// --- DATA ---
const subjectGrowthData = [{ v: 40 }, { v: 55 }, { v: 45 }, { v: 60 }, { v: 75 }, { v: 65 }, { v: 85 }];
const courseCloneData = [{ v: 20 }, { v: 35 }, { v: 50 }, { v: 45 }, { v: 60 }, { v: 80 }, { v: 95 }];
const questionBankData = [{ v: 45 }, { v: 50 }, { v: 48 }, { v: 55 }, { v: 52 }, { v: 65 }, { v: 70 }];
const teacherData = [{ v: 30 }, { v: 32 }, { v: 35 }, { v: 38 }, { v: 40 }, { v: 41 }, { v: 42 }];

const StatusBadge = ({ status, isActive }) => {
  // Map simplified status or isActive boolean to display style
  let displayStatus = 'Draft';

  if (status) {
    displayStatus = status;
  } else if (isActive === true) {
    displayStatus = 'Published';
  } else if (isActive === false) {
    displayStatus = 'Locked';
  }

  const styles = {
    Published: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    Draft: 'bg-slate-50 text-slate-600 ring-1 ring-slate-200',
    Locked: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  };

  const labels = {
    Published: 'Đã xuất bản',
    Draft: 'Bản nháp',
    Locked: 'Đã khóa'
  };

  // Fallback if status string doesn't match keys
  const statusKey = styles[displayStatus] ? displayStatus : (isActive ? 'Published' : 'Draft');

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${styles[statusKey]}`}>
      {labels[statusKey] || displayStatus}
    </span>
  );
};

// --- COMPONENT STAT CARD ---
const StatCard = ({ label, value, trend, change, data, color, bgBadge, index }) => {
  const gradientId = `gradient-chart-${index}`;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col justify-between h-[160px] group">

      {/* Header */}
      <div className="flex justify-between items-start z-10">
        <span className="text-sm font-medium text-slate-500 mb-2">{label}</span>

        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${bgBadge}`}>
          {trend === 'up' && <ArrowUpRight size={12} strokeWidth={3} />}
          {trend === 'down' && <ArrowDownRight size={12} strokeWidth={3} />}
          {trend === 'neutral' && <Minus size={12} strokeWidth={3} />}
          {change}
        </span>
      </div>

      {/* Value */}
      <div className="z-10 mb-6">
        <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
      </div>

      {/* Chart */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-50 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default function ManagerDashboard() {
  const [statsData, setStatsData] = useState({
    totalSubjects: 0,
    activeCourses: 0,
    publishedLessons: 0,
    teachers: 0
  });
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Execute calls in parallel
        // Note: Role 3 is 'Teacher' / 'Giáo viên'
        const [subjectsRes, classesRes, teachersRes, gradesRes] = await Promise.all([
          getSubjects(),
          getClasses(),
          getUsers({ RoleFilter: 3, PageSize: 100 }),
          getGradeLevels()
        ]);

        console.log('Dashboard Data Loaded:', { subjectsRes, classesRes, teachersRes, gradesRes });

        // Helpers to normalize data structure
        // Many APIs wrap arrays in { data: items } or { items: [] } or just return the array
        const extractList = (res) => {
          if (!res) return [];
          if (Array.isArray(res)) return res;
          if (Array.isArray(res.items)) return res.items;
          if (res.data && Array.isArray(res.data.items)) return res.data.items;
          if (res.data && Array.isArray(res.data)) return res.data;
          // Fallback checks
          if (res.result && Array.isArray(res.result)) return res.result;
          return [];
        };

        const rawSubjects = extractList(subjectsRes);
        const rawClasses = extractList(classesRes);
        const rawTeachers = extractList(teachersRes);
        const rawGrades = extractList(gradesRes);

        console.log('Extracted Arrays:', { rawSubjects, rawClasses, rawTeachers, rawGrades });

        // Grade Map: ID -> Name
        const gradeMap = {};
        rawGrades.forEach(g => {
          gradeMap[g.id] = g.name;
        });
        setGrades(gradeMap);

        // Calculate Stats
        const totalSubjects = rawSubjects.length;

        // Count active classes
        const activeCourses = rawClasses.filter(c => c.isActive !== false).length;

        // Approximate lessons/modules count
        // Check for common property names: modules, chaptersCount, lessonCount
        const publishedLessons = rawSubjects.reduce((acc, sub) => {
          const count = sub.modules || sub.chaptersCount || sub.lessonCount || 0;
          return acc + count;
        }, 0);

        // Teacher count
        // For getUsers, sometimes total is in the meta object, otherwise use array length
        let teacherCount = rawTeachers.length;
        if (teachersRes?.data?.total !== undefined) teacherCount = teachersRes.data.total;
        else if (teachersRes?.total !== undefined) teacherCount = teachersRes.total;

        setStatsData({
          totalSubjects,
          activeCourses,
          publishedLessons,
          teachers: teacherCount
        });

        // Update Subjects List (take top 5-10 for dashboard if needed, or all)
        setSubjects(rawSubjects.slice(0, 10));

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      label: 'Tổng Môn học',
      value: loading ? '...' : statsData.totalSubjects,
      change: '12%',
      trend: 'up',
      data: subjectGrowthData,
      color: '#0487e2', // Primary
      bgBadge: 'bg-[#e0f2fe] text-[#09b1ec]'
    },
    {
      label: 'Khóa học Đang hoạt động',
      value: loading ? '...' : statsData.activeCourses,
      change: '0%',
      trend: 'neutral',
      data: courseCloneData,
      color: '#10b981', // Emerald
      bgBadge: 'bg-gray-100 text-gray-500'
    },
    {
      label: 'Bài học Đã xuất bản',
      value: loading ? '...' : statsData.publishedLessons,
      change: '5%',
      trend: 'up',
      data: questionBankData,
      color: '#6366f1', // Indigo
      bgBadge: 'bg-green-50 text-green-600'
    },
    {
      label: 'Giáo viên',
      value: loading ? '...' : statsData.teachers,
      change: '2%',
      trend: 'down',
      data: teacherData,
      color: '#f59e0b', // Amber
      bgBadge: 'bg-red-50 text-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">

      {/* Header */}
      <header className="flex flex-row justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0463ca]">Quản lý Học thuật</h1>
          <p className="text-slate-500 text-sm mt-1">Tổng quan hệ thống và tài nguyên giảng dạy.</p>
        </div>

        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#0487e2] text-white font-semibold rounded-lg hover:bg-[#0463ca] transition-all shadow-md shadow-[#0487e2]/20">
          <Plus size={18} />
          <span>Tạo Môn học</span>
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} index={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Main Column */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-[#0463ca]">Danh sách Môn chuẩn</h2>
                <p className="text-xs text-slate-500 mt-1">Quản lý cấu trúc và nội dung gốc</p>
              </div>

              <div className="flex bg-[#f0f6fa] p-1 rounded-lg">
                <button className="px-4 py-1.5 text-xs font-semibold text-[#0463ca] bg-white rounded shadow-sm">Tất cả</button>
                <button className="px-4 py-1.5 text-xs font-medium text-slate-500 hover:text-[#0463ca]">Đã xuất bản</button>
                <button className="px-4 py-1.5 text-xs font-medium text-slate-500 hover:text-[#0463ca]">Bản nháp</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                  <tr>
                    <th className="px-6 py-4">Tên Môn học</th>
                    <th className="px-6 py-4">Khối lớp</th>
                    <th className="px-6 py-4">Lượt sử dụng</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-slate-400">
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : subjects.length > 0 ? (
                    subjects.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 text-sm">{sub.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {sub.modules || sub.chaptersCount || 0} chương mục
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                          {grades[sub.gradeId] || grades[sub.gradeLevelId] || `Khối ${sub.gradeId || '?'}`}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                          {sub.usageCount || 0} lớp
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={sub.status} isActive={sub.isActive} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100">
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                        Chưa có môn học nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100 text-center bg-[#f0f6fa]/50">
              <button className="text-sm font-semibold text-[#0487e2] hover:text-[#0463ca]">Xem tất cả danh sách</button>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-[#0463ca] mb-4">Tác vụ nhanh</h2>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-[#09b1ec] hover:bg-[#09b1ec]/5 transition-all text-left group">
                <div className="p-2 bg-[#e0f2fe] text-[#0487e2] rounded-md">
                  <FileText size={18} />
                </div>
                <div>
                  <span className="block font-semibold text-sm text-slate-900 group-hover:text-[#0487e2]">Nhập Giáo trình AI</span>
                  <span className="text-xs text-slate-500">Upload PDF để tạo cấu trúc</span>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-[#09b1ec] hover:bg-[#09b1ec]/5 transition-all text-left group">
                <div className="p-2 bg-[#e0f2fe] text-[#0487e2] rounded-md">
                  <HelpCircle size={18} />
                </div>
                <div>
                  <span className="block font-semibold text-sm text-slate-900 group-hover:text-[#0487e2]">Soạn Câu hỏi</span>
                  <span className="text-xs text-slate-500">Thêm vào ngân hàng đề</span>
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}