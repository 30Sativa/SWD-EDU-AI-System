import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { getCurrentUser } from '../../../user/api/userApi';
import { getStudentMyCourses } from '../../../course/api/courseApi';
import { getStudentAssignmentsByCourse } from '../../../assignment/api/assignmentApi';
import { getCourseQuizzes } from '../../../quiz/student/api/quizApi';
import {
  ArrowRight,
  Calendar,
  BookOpen,
  Clock,
  CheckCircle,
  TrendingUp,
  LayoutGrid,
  Zap,
  ChevronRight,
  Bell,
  Star,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
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
  Cell
} from 'recharts';

const studyData = [
  { day: 'T2', hours: 1.5 },
  { day: 'T3', hours: 2.2 },
  { day: 'T4', hours: 1.2 },
  { day: 'T5', hours: 2.8 },
  { day: 'T6', hours: 1.5 },
  { day: 'T7', hours: 3.5 },
  { day: 'CN', hours: 2.5 },
];

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: localStorage.getItem('userFullName') || 'Bạn', role: 'Học sinh' });
  const [courses, setCourses] = useState([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch User Info
        const userRes = await getCurrentUser();
        const userData = userRes?.data || userRes;

        // Extract studentId (it might be 'id' or 'studentId' in the profile)
        const currentStudentId = userData?.id || userData?.studentId;
        if (currentStudentId) {
          localStorage.setItem('studentId', currentStudentId);
        }

        // Ưu tiên hiển thị fullName (từ root hoặc profile), fallback về userName hoặc 'Bạn'
        const displayName = userData?.fullName || userData?.profile?.fullName || userData?.userName || 'Bạn';

        setUser({ name: displayName, role: 'Học sinh' });
        localStorage.setItem('userFullName', displayName);

        // Fetch My Courses
        const courseRes = await getStudentMyCourses(currentStudentId, { page: 1, limit: 10 });
        const coursesInfo = courseRes?.data || courseRes;

        let enrolledList = [];
        if (coursesInfo?.items || Array.isArray(coursesInfo)) {
          enrolledList = coursesInfo.items || coursesInfo;
          setCourses(enrolledList.slice(0, 3)); // Display top 3
          setTotalCourses(coursesInfo.totalItems || enrolledList.length);
        }

        // Fetch Deadlines
        if (enrolledList.length > 0) {
          const assignmentPromises = enrolledList.map(c => getStudentAssignmentsByCourse(c.id).then(res => ({ course: c, data: res.data || res.items || res })).catch(() => null));
          const quizPromises = enrolledList.map(c => getCourseQuizzes(c.id).then(res => ({ course: c, data: res.data || res.items || res })).catch(() => null));
          
          const allRes = await Promise.all([...assignmentPromises, ...quizPromises]);
          let tasks = [];
          
          allRes.forEach((result, idx) => {
              if(!result || !result.data) return;
              const isQuiz = idx >= assignmentPromises.length;
              const courseName = result.course.title || result.course.name || 'Khóa học';
              const items = Array.isArray(result.data) ? result.data : (result.data.items || []);
              
              items.forEach(item => {
                  if (item.isSubmitted || item.isCompleted || item.status === 'submitted') return;
                  
                  const deadline = item.dueDate || item.endDate || item.endTime;
                  if (deadline && dayjs(deadline).isAfter(dayjs())) {
                      tasks.push({
                          id: item.id || item.quizId,
                          title: item.title || item.name || (isQuiz ? 'Bài Quiz' : 'Bài tập'),
                          course: courseName,
                          dateObj: dayjs(deadline),
                          date: dayjs(deadline).format('DD/MM/YYYY, HH:mm'),
                          type: isQuiz ? 'Quiz' : 'Assignment',
                          color: isQuiz ? '#ef4444' : '#f59e0b',
                          url: isQuiz ? `/dashboard/student/quizzes/${item.id || item.quizId}` : `/dashboard/student/courses/${result.course.id}`,
                          courseId: result.course.id
                      });
                  }
              });
          });
          
          tasks.sort((a, b) => a.dateObj.valueOf() - b.dateObj.valueOf());
          setUpcomingDeadlines(tasks.slice(0, 5));
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu Dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#0487e2] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Đang cá nhân hóa trải nghiệm của bạn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans text-slate-800">

      {/* --- TOP SECTION: WELCOME --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            Chào quay trở lại, <span className="text-[#0463ca]">{user.name}</span>! 👋
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <Calendar size={16} className="text-[#0487e2]" />
            Hôm nay là {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}. Chúc bạn một ngày học tập hiệu quả!
          </p>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          label="Khóa học đang học"
          value={totalCourses}
          icon={BookOpen}
          color="blue"
          trend="+1 mới"
        />
        <StatCard
          label="Thời lượng học"
          value="18.5h"
          icon={Clock}
          color="orange"
          trend="Tuần này"
        />
        <StatCard
          label="Hoàn thành"
          value="85%"
          icon={CheckCircle}
          color="emerald"
          trend="Mục tiêu tuần"
        />
        <StatCard
          label="Điểm trung bình"
          value="8.4"
          icon={Star}
          color="indigo"
          trend="Học kỳ này"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* --- LEFT COLUMN: DATA VIZ & ACTIVE COURSES --- */}
        <div className="lg:col-span-2 space-y-10">

          {/* Activity Chart */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <TrendingUp size={20} className="text-[#0487e2]" />
                  Phân tích học tập
                </h3>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Thời gian tập trung trong 7 ngày qua</p>
              </div>
              <select className="bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-600 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer">
                <option>Tuần này</option>
                <option>Tuần trước</option>
              </select>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height={280} minWidth={0} minHeight={0}>
                <AreaChart data={studyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0487e2" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0487e2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#0487e2"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorHours)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#0463ca' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Continue Learning List */}
          <section className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <BookOpen size={24} className="text-[#0487e2]" />
                Tiếp tục học tập
              </h2>
              <Link
                to="/dashboard/student/courses"
                className="text-sm font-bold text-[#0487e2] hover:text-[#0463ca] flex items-center gap-1 transition-all group"
              >
                Tất cả khóa học
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="space-y-4">
              {courses.length > 0 ? (
                courses.map((item, idx) => (
                  <CourseCard key={item.id || idx} item={item} />
                ))
              ) : (
                <div className="bg-white rounded-3xl p-10 border border-dashed border-slate-200 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <LayoutGrid size={32} className="text-slate-300" />
                  </div>
                  <h4 className="text-slate-900 font-bold mb-1">Bạn chưa tham gia khóa học nào</h4>
                  <p className="text-slate-500 text-sm mb-6">Hãy khám phá các khóa học hấp dẫn để bắt đầu hành trình!</p>
                  <Link to="/courses" className="px-6 py-2.5 bg-[#0487e2] text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:scale-105 active:scale-95 transition-all text-sm inline-block">Khám phá ngay</Link>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* --- RIGHT COLUMN: SIDEBAR --- */}
        <div className="space-y-8">

          {/* Upcoming Schedule */}
          <div className="bg-white rounded-[2.5rem] p-7 border border-slate-50 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.15em] mb-6 mb-8 flex items-center justify-between">
              <span>Hạn sắp tới</span>
              <Bell size={18} className="text-blue-500" />
            </h3>

            <div className="space-y-4">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((item, idx) => (
                  <Link to={item.url} key={idx} className="block group p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-white transition-all cursor-pointer shadow-sm hover:shadow-md">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-1.5 h-10 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 leading-tight mb-1 group-hover:text-[#0487e2] transition-all truncate">{item.title}</p>
                        <p className="text-[11px] text-slate-500 font-semibold truncate">{item.course}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 pl-4 uppercase tracking-wider">
                      <Clock size={12} className={item.dateObj.diff(dayjs(), 'hours') < 24 ? "text-red-500" : ""} />
                      <span className={item.dateObj.diff(dayjs(), 'hours') < 24 ? "text-red-500" : ""}>{item.date}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 font-medium text-sm">
                  Không có hạn chót nào sắp tới.
                </div>
              )}
            </div>

            <button className="w-full mt-8 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2">
              Xem toàn bộ lịch
              <ChevronRight size={14} />
            </button>
          </div>



          {/* Goal Banner */}
          <div className="bg-gradient-to-br from-[#0487e2] to-[#1d4ed8] rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col h-full justify-between gap-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-blue-100 mb-4">Mục tiêu tuần</h3>
                <h4 className="text-2xl font-bold leading-tight">Hoàn thành 5/6 bài giảng tuần này</h4>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-blue-100">Tiến độ 85%</span>
                  <span>4.5 / 5h</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-1000 group-hover:bg-yellow-300" style={{ width: '85%' }}></div>
                </div>
              </div>

              <button className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-2xl text-xs transition-all backdrop-blur-md">
                Theo dõi tiến độ
              </button>
            </div>

            {/* Background elements */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ label, value, icon: Icon, color, trend }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100'
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5 transition-all hover:-translate-y-1 hover:shadow-md">
      <div className={`w-14 h-14 rounded-2xl ${colors[color]} flex items-center justify-center flex-shrink-0 border shadow-sm`}>
        <Icon size={26} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 leading-none mb-1">{value}</p>
        <p className={`text-[10px] font-bold ${color === 'blue' ? 'text-blue-600' : 'text-slate-400'}`}>{trend}</p>
      </div>
    </div>
  );
}

function CourseCard({ item }) {
  const progress = item.progress || Math.floor(Math.random() * 60) + 10;
  const title = item.title || item.name || 'Khóa học chưa đặt tên';
  const subject = item.subjectName || item.courseCategoryName || item.level || 'Khóa học';
  const duration = item.totalDuration ? `${Math.floor(item.totalDuration / 60)}h ${item.totalDuration % 60}m` : '0h học';
  const image = item.thumbnail || item.thumbnailUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=400';

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm group transition-all hover:shadow-xl hover:border-blue-100">
      <div className="flex flex-col sm:flex-row h-full">
        <div className="w-full sm:w-48 h-40 flex-shrink-0 overflow-hidden relative">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-black text-[#0487e2] uppercase tracking-wider">
            {subject}
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col justify-between">
          <div className="mb-4">
            <div className="flex justify-between items-start gap-4 mb-2">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0463ca] transition-colors line-clamp-1">
                {title}
              </h3>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 whitespace-nowrap">
                <Clock size={12} /> {duration}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Bắt đầu học bài tiếp theo để duy trì chuỗi tiến độ của bạn.</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xl font-black text-[#0463ca]">{progress}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">Hoàn thành</span>
              </div>
              <Link
                to={`/dashboard/student/courses/${item.id}`}
                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all transform group-hover:translate-x-1"
              >
                <ArrowRight size={18} />
              </Link>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0487e2] to-[#1d4ed8] rounded-full transition-all duration-1000 ease-out shadow-sm shadow-blue-100"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}