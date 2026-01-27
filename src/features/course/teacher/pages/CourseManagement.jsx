import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  GripVertical,
} from 'lucide-react';

const CourseManagement = () => {
  const [expandedSections, setExpandedSections] = useState({
    1: true,
    2: false,
    3: true,
    4: false,
  });

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const sections = [
    {
      id: 1,
      title: 'Cơ bản về Đại số Tuyến tính',
      lessons: 6,
      duration: '2h 15m',
      lessonsList: [
        { id: 1, title: 'Giới thiệu về Ma trận', type: 'VIDEO', duration: '15:00' },
        { id: 2, title: 'Tiên đề Không gian Vectơ', type: 'ĐỌC', duration: '10 phút' },
      ],
    },
    {
      id: 2,
      title: 'Giải tích Nhiều biến',
      lessons: 8,
      duration: '3h 45m',
      lessonsList: [
        { id: 3, title: 'Đạo hàm Riêng', type: 'VIDEO', duration: '20:00' },
        { id: 4, title: 'Tích phân Kép', type: 'VIDEO', duration: '25:00' },
      ],
    },
    {
      id: 3,
      title: 'Phương trình Vi phân',
      lessons: 5,
      duration: '1h 50m',
      lessonsList: [
        { id: 5, title: 'Phương trình Bậc nhất', type: 'QUIZ', duration: '10 câu' },
      ],
    },
    {
      id: 4,
      title: 'Chủ đề Nâng cao',
      lessons: 5,
      duration: '2h 30m',
      lessonsList: [],
    },
  ];

  const otherCourses = [
    {
      title: 'Lập trình Cơ bản',
      subtitle: 'Python, JavaScript cơ bản',
      status: 'ĐANG HOẠT ĐỘNG',
      students: 42,
      color: 'bg-green-50 text-green-700',
    },
    {
      title: 'Văn học Anh',
      subtitle: 'Shakespeare, Thơ hiện đại',
      status: 'BẢN NHÁP',
      students: 0,
      color: 'bg-orange-50 text-orange-700',
    },
  ];

  // Helper tạo style cho Badge loại bài học
  const getBadgeStyle = (type) => {
    switch (type) {
      case 'VIDEO':
        return 'text-blue-700 bg-blue-50 border-blue-100';
      case 'ĐỌC':
        return 'text-purple-700 bg-purple-50 border-purple-100';
      case 'QUIZ':
        return 'text-orange-700 bg-orange-50 border-orange-100';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 border-b border-gray-200 pb-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Nội dung</h1>
              <p className="text-gray-500">Tổ chức chương trình khóa học và học liệu.</p>
            </div>
            <div className="flex gap-3">
              <button className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                Xem trước
              </button>
              <button className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow-sm">
                Tạo khóa học mới
              </button>
            </div>
          </div>
        </div>

        {/* Course Overview Card - Clean Text Style */}
        <div className="bg-white rounded border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">Toán học Nâng cao</h2>
                <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider text-green-700 bg-green-50 border border-green-100 rounded uppercase">
                  Đã xuất bản
                </span>
              </div>
              <p className="text-gray-600 mb-6 max-w-2xl">
                Hướng dẫn toàn diện về Đại số Tuyến tính, Giải tích Nhiều biến và Phương trình Vi phân dành cho bậc đại học.
              </p>
              
              {/* Stats - Text based */}
              <div className="flex items-center gap-8 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">Học viên</span>
                  <span className="font-semibold text-gray-900 text-lg">128</span>
                </div>
                <div className="w-px h-8 bg-gray-100"></div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">Bài học</span>
                  <span className="font-semibold text-gray-900 text-lg">24</span>
                </div>
                <div className="w-px h-8 bg-gray-100"></div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">Hoàn thành</span>
                  <span className="font-semibold text-gray-900 text-lg">82%</span>
                </div>
              </div>
            </div>
            
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
              Chỉnh sửa thông tin
            </button>
          </div>
        </div>

        {/* Curriculum Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Nội dung chi tiết</h3>
              <p className="text-sm text-gray-500">{sections.length} chương • Tổng thời lượng 10h 30m</p>
            </div>
            <button className="text-sm font-medium text-teal-600 hover:text-teal-700 bg-teal-50 px-4 py-2 rounded hover:bg-teal-100 transition-colors">
              + Thêm chương mới
            </button>
          </div>

          <div className="space-y-4">
            {sections.map((section, idx) => (
              <div key={section.id} className="bg-white border border-gray-200 rounded shadow-sm">
                {/* Section Header */}
                <div className="p-4 flex items-center gap-4 bg-gray-50/50 border-b border-gray-100">
                  <span className="text-gray-400 font-mono text-sm font-medium px-2">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{section.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {section.lessons} bài học • {section.duration}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-xs font-medium space-x-3 text-gray-400">
                      <button className="hover:text-blue-600 transition-colors">Sửa</button>
                      <button className="hover:text-red-600 transition-colors">Xóa</button>
                    </div>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {expandedSections[section.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Lessons List */}
                {expandedSections[section.id] && (
                  <div className="divide-y divide-gray-100">
                    {section.lessonsList.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group"
                      >
                        {/* Drag Handle (Only Icon kept for utility) */}
                        <div className="text-gray-300 cursor-move opacity-0 group-hover:opacity-100">
                          <GripVertical size={16} />
                        </div>

                        {/* Text Badge instead of Icon */}
                        <span className={`px-2 py-1 text-[10px] font-bold rounded border uppercase tracking-wider min-w-[60px] text-center ${getBadgeStyle(lesson.type)}`}>
                          {lesson.type}
                        </span>

                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">{lesson.title}</p>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <span className="text-xs text-gray-400 font-mono">{lesson.duration}</span>
                            
                            {/* Text Actions */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-3 text-xs font-medium">
                                <button className="text-blue-600 hover:underline">Sửa</button>
                                <span className="text-gray-300">|</span>
                                <button className="text-red-600 hover:underline">Xóa</button>
                            </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Lesson Button - Text only */}
                    <button className="w-full py-3 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors text-center border-t border-gray-100">
                      + Thêm bài học mới
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Other Active Courses - Grid Layout */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Các khóa học khác</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherCourses.map((course, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded border border-gray-200 hover:border-gray-300 transition-colors flex justify-between items-center"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{course.title}</h4>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${course.status === 'ĐANG HOẠT ĐỘNG' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {course.status === 'ĐANG HOẠT ĐỘNG' ? 'Active' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{course.subtitle}</p>
                  <p className="text-xs font-medium text-gray-900">{course.students} học viên</p>
                </div>
                <button className="text-xs font-medium text-gray-400 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">
                  Chi tiết
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;