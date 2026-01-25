import React from 'react';
import {
  Plus,
  BookOpen,
  FileText,
  ClipboardList,
  Users,
  FileEdit,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';

const summaryCards = [
  {
    label: 'Total Students',
    value: 84,
    change: '+12% vs last week',
    positive: true,
    icon: Users,
  },
  {
    label: 'Active Courses',
    value: 3,
    change: null,
    icon: BookOpen,
  },
  {
    label: 'Lessons Published',
    value: 35,
    change: '+5% vs last week',
    positive: true,
    icon: FileText,
  },
  {
    label: 'Drafts',
    value: 2,
    change: 'Awaiting review',
    positive: false,
    icon: ClipboardList,
  },
];

const activeCourses = [
  { name: 'Mathematics 10A', students: 32, lessons: 12 },
  { name: 'Physics 11B', students: 28, lessons: 8 },
  { name: 'English Advanced', students: 24, lessons: 15 },
];

const draftLessons = [
  { name: 'Introduction to Calculus', course: 'Mathematics 10A', time: 'Yesterday' },
  { name: 'Wave Motion', course: 'Physics 11B', time: '2 days ago' },
];

const recentActivity = [
  {
    user: 'N Nguyen Van A',
    type: 'Question',
    text: 'Asked about quadratic equations in Lesson 5: Quadratic Functions',
    time: '10 minutes ago',
    action: 'Reply',
    icon: MessageCircle,
  },
  {
    user: 'You',
    type: 'Edit',
    text: 'Updated lesson content in Lesson 8: Derivatives',
    time: '2 hours ago',
    action: null,
    icon: FileEdit,
  },
];

export default function Dashboard() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-gray-600">Welcome back, Teacher Nguyen</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Create Course
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-600 font-medium text-sm rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Plus size={18} />
          Create Lesson
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-600 font-medium text-sm rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Plus size={18} />
          Create Quiz
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-600">{card.label}</span>
                <Icon size={20} className="text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
              {card.change && (
                <p
                  className={`text-xs font-medium ${
                    card.positive ? 'text-green-600' : 'text-amber-600'
                  }`}
                >
                  {card.positive && '↑ '}
                  {card.change}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Active Courses</h2>
            <p className="text-sm text-gray-500">Your current teaching assignments</p>
          </div>
          <a
            href="#"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            View All <ArrowRight size={14} />
          </a>
        </div>
        <div className="space-y-3">
          {activeCourses.map((course) => (
            <div
              key={course.name}
              className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">{course.name}</p>
                <p className="text-sm text-gray-500">
                  {course.students} students • {course.lessons} lessons
                </p>
              </div>
              <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                active
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">Draft Lessons</h2>
          <p className="text-sm text-gray-500">Continue working on these</p>
        </div>
        <div className="space-y-3 mb-4">
          {draftLessons.map((draft) => (
            <div
              key={draft.name}
              className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">{draft.name}</p>
                <p className="text-sm text-gray-500">
                  {draft.course} • {draft.time}
                </p>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="w-full py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          View All Drafts
        </button>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          <p className="text-sm text-gray-500">Student questions and updates</p>
        </div>
        <div className="space-y-4">
          {recentActivity.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex flex-wrap items-start justify-between gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex gap-3 min-w-0">
                  <Icon size={20} className="text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{item.user}</span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          item.type === 'Question'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{item.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                  </div>
                </div>
                {item.action && (
                  <button
                    type="button"
                    className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    {item.action}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
