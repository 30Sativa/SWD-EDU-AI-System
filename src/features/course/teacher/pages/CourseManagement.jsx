import React, { useState } from 'react';
import { Search, Plus, Filter, LayoutGrid, List, Users, BookOpen, Clock, ArrowRight, MoreVertical } from 'lucide-react';

const CourseList = () => {
  const [viewMode, setViewMode] = useState('grid');

  const courses = [
    {
      id: 1,
      title: 'Đại số Tuyến tính Nâng cao & Ứng dụng trong AI',
      category: 'Toán học',
      students: 128,
      lessons: 24,
      duration: '32h',
      status: 'published',
      lastUpdated: '2 giờ trước',
    },
    {
      id: 2,
      title: 'Master Python: Từ Zero đến Kỹ sư Phần mềm',
      category: 'CNTT',
      students: 450,
      lessons: 112,
      duration: '45h',
      status: 'published',
      lastUpdated: '1 ngày trước',
    },
    {
      id: 3,
      title: 'Văn học Anh: Phân tích tác phẩm Shakespeare',
      category: 'Văn học',
      students: 0,
      lessons: 5,
      duration: '8h',
      status: 'draft',
      lastUpdated: '5 phút trước',
    },
    {
      id: 4,
      title: 'Nguyên lý Kế toán Doanh nghiệp (GAAP)',
      category: 'Kinh tế',
      students: 85,
      lessons: 30,
      duration: '21h',
      status: 'archived',
      lastUpdated: '1 tháng trước',
    },
    {
      id: 5,
      title: 'Adobe Photoshop CC 2024 Masterclass',
      category: 'Thiết kế',
      students: 210,
      lessons: 18,
      duration: '15h',
      status: 'published',
      lastUpdated: '3 ngày trước',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-normal text-slate-900 tracking-tight">Khóa học</h1>
              <p className="text-slate-500 mt-2 text-lg">Quản lý và phát triển nội dung đào tạo của bạn.</p>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-700 shadow-sm hover:shadow-md transition-all active:scale-95">
              <Plus size={20} />
              Tạo khóa học mới
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <StatCard label="Tổng khóa học" value="12" subtext="2 bản nháp đang chờ" icon={<BookOpen className="text-blue-500" />} />
            <StatCard label="Tổng học viên" value="873" subtext="+24% so với tháng trước" icon={<Users className="text-emerald-500" />} />
            <StatCard label="Thời lượng nội dung" value="156h" subtext="Trung bình 13h/khóa" icon={<Clock className="text-purple-500" />} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm khóa học..." 
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-sm font-medium shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-100 rounded-xl text-sm font-semibold text-slate-600 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm">
              <Filter size={18} />
              Bộ lọc
            </button>
            
            <div className="flex bg-gray-100/80 p-1.5 rounded-xl items-center">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} viewMode={viewMode} />
          ))}
        </div>
        
         <div className="mt-10 text-center text-sm text-slate-500 font-medium">
            Hiển thị 5 trên 12 khóa học
         </div>

      </div>
    </div>
  );
};

const StatCard = ({ label, value, subtext, icon }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-sm font-semibold mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
      </div>
       <p className="text-xs text-slate-400 font-medium mt-1">{subtext}</p>
    </div>
    <div className="p-3 bg-gray-50 rounded-xl">
        {icon}
    </div>
  </div>
);

const CourseCard = ({ course, viewMode }) => {
  const isGrid = viewMode === 'grid';

  return (
    <div className={`bg-white rounded-[1.25rem] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden
      ${isGrid ? 'flex flex-col p-7' : 'flex items-center p-5 gap-6'}`
    }>
      
      {/* Accent Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${
        course.status === 'published' ? 'from-blue-500 to-blue-400' : 
        course.status === 'draft' ? 'from-amber-400 to-yellow-400' : 'from-gray-300 to-gray-200'
      }`}></div>
      
      {isGrid && (
        <>
          <div className="flex justify-between items-start mb-5 mt-2">
            <span className="text-[11px] font-extrabold text-blue-600/80 bg-blue-50/50 border border-blue-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
              {course.category}
            </span>
             <button className="text-gray-400 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-full">
                <MoreVertical size={20} />
            </button>
          </div>

          <div className="mb-8 flex-1">
            <h3 className="font-bold text-xl text-slate-900 mb-3 group-hover:text-blue-600 transition-colors cursor-pointer leading-snug">
              {course.title}
            </h3>
            <div className="flex items-center gap-5 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-1.5">
                <Users size={18} className="text-slate-400" />
                <span>{course.students}</span>
              </div>
               <div className="flex items-center gap-1.5">
                <BookOpen size={18} className="text-slate-400" />
                <span>{course.lessons} bài</span>
              </div>
               <div className="flex items-center gap-1.5">
                <Clock size={18} className="text-slate-400" />
                <span>{course.duration}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-gray-50">
            <div>
                <StatusBadge status={course.status} />
                <p className="text-xs text-gray-400 mt-2 font-medium">Cập nhật {course.lastUpdated}</p>
            </div>

            <button className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50/80 hover:bg-blue-100 pl-5 pr-3 py-2.5 rounded-full transition-all group/btn">
              Chi tiết
              <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform"/>
            </button>
          </div>
        </>
      )}

      {!isGrid && (
        <>
          <div className={`w-1.5 self-stretch rounded-full mr-2 ${
              course.status === 'published' ? 'bg-blue-500' : 
              course.status === 'draft' ? 'bg-amber-400' : 'bg-gray-300'
          }`}></div>

          <div className="flex-1 min-w-0 grid grid-cols-12 gap-6 items-center">
            <div className="col-span-5 pr-4">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{course.category}</span>
                    <StatusBadge status={course.status} small />
                </div>
                <h3 className="font-bold text-lg text-slate-900 truncate group-hover:text-blue-600 transition-colors">{course.title}</h3>
            </div>

            <div className="col-span-5 flex items-center gap-8 text-sm font-medium text-slate-600">
               <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 text-xs font-semibold uppercase">Học viên</span>
                  <div className="flex items-center gap-1.5"><Users size={16} className="text-slate-400"/> {course.students}</div>
              </div>
               <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 text-xs font-semibold uppercase">Bài học</span>
                  <div className="flex items-center gap-1.5"><BookOpen size={16} className="text-slate-400"/> {course.lessons}</div>
              </div>
              <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 text-xs font-semibold uppercase">Thời lượng</span>
                   <div className="flex items-center gap-1.5"><Clock size={16} className="text-slate-400"/> {course.duration}</div>
              </div>
            </div>

             <div className="col-span-2 text-right">
                <p className="text-xs text-gray-400 font-medium">{course.lastUpdated}</p>
             </div>
          </div>

          <div className="pl-4 border-l border-gray-100">
             <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                  <ArrowRight size={20} />
             </button>
          </div>
        </>
      )}
    </div>
  );
};

const StatusBadge = ({ status, small = false }) => {
  const styles = {
    published: 'text-emerald-700 bg-emerald-50 ring-1 ring-inset ring-emerald-600/20',
    draft: 'text-amber-700 bg-amber-50 ring-1 ring-inset ring-amber-600/20',
    archived: 'text-gray-600 bg-gray-50 ring-1 ring-inset ring-gray-500/20',
  };

  const labels = {
    published: 'Đã xuất bản',
    draft: 'Bản nháp',
    archived: 'Lưu trữ',
  };

  return (
    <span className={`inline-flex items-center rounded-md font-bold uppercase tracking-wider ${small ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]'} ${styles[status]}`}>
      <svg className={`h-1.5 w-1.5 mr-1.5 ${status === 'published' ? 'fill-emerald-500' : status === 'draft' ? 'fill-amber-500' : 'fill-gray-400'}`} viewBox="0 0 6 6" aria-hidden="true">
        <circle cx={3} cy={3} r={3} />
      </svg>
      {labels[status]}
    </span>
  );
};

export default CourseList;