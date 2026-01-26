import React from 'react';
import {
  BookOpen,
  FileText,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  ArrowRight,
  PlayCircle,
} from 'lucide-react';

const summaryCards = [
  {
    label: 'Courses Enrolled',
    value: 5,
    change: '+2 this semester',
    positive: true,
    icon: BookOpen,
  },
  {
    label: 'Assignments Completed',
    value: 28,
    change: '12 pending',
    positive: false,
    icon: CheckCircle,
  },
  {
    label: 'Average Grade',
    value: '8.5',
    change: '+0.3 vs last month',
    positive: true,
    icon: Award,
  },
  {
    label: 'Upcoming Deadlines',
    value: 3,
    change: 'Next: 2 days',
    positive: false,
    icon: Clock,
  },
];

const enrolledCourses = [
  { 
    name: 'Mathematics 10A', 
    teacher: 'Mr. Nguyen Van A',
    progress: 65,
    lessons: 12,
    nextLesson: 'Lesson 8: Derivatives',
    status: 'active'
  },
  { 
    name: 'Physics 11B', 
    teacher: 'Ms. Tran Thi B',
    progress: 45,
    lessons: 8,
    nextLesson: 'Lesson 5: Wave Motion',
    status: 'active'
  },
  { 
    name: 'English Advanced', 
    teacher: 'Mrs. Le Thi C',
    progress: 80,
    lessons: 15,
    nextLesson: 'Lesson 12: Essay Writing',
    status: 'active'
  },
  { 
    name: 'Chemistry 10', 
    teacher: 'Dr. Pham Van D',
    progress: 30,
    lessons: 10,
    nextLesson: 'Lesson 4: Chemical Reactions',
    status: 'active'
  },
];

const upcomingAssignments = [
  { 
    name: 'Quadratic Equations Quiz', 
    course: 'Mathematics 10A',
    dueDate: 'Tomorrow, 11:59 PM',
    status: 'urgent',
    type: 'Quiz'
  },
  { 
    name: 'Physics Lab Report', 
    course: 'Physics 11B',
    dueDate: 'Jan 28, 2026',
    status: 'pending',
    type: 'Assignment'
  },
  { 
    name: 'English Essay Draft', 
    course: 'English Advanced',
    dueDate: 'Jan 30, 2026',
    status: 'pending',
    type: 'Essay'
  },
];

const recentGrades = [
  {
    assignment: 'Midterm Exam - Mathematics',
    course: 'Mathematics 10A',
    grade: '9.0',
    maxGrade: '10',
    date: '2 days ago',
    status: 'excellent',
  },
  {
    assignment: 'Lab Report #3',
    course: 'Physics 11B',
    grade: '8.5',
    maxGrade: '10',
    date: '5 days ago',
    status: 'good',
  },
  {
    assignment: 'Vocabulary Quiz',
    course: 'English Advanced',
    grade: '9.5',
    maxGrade: '10',
    date: '1 week ago',
    status: 'excellent',
  },
];

const recentActivity = [
  {
    type: 'Grade',
    text: 'Received grade 9.0/10 for Midterm Exam - Mathematics',
    course: 'Mathematics 10A',
    time: '2 days ago',
    icon: Award,
  },
  {
    type: 'Assignment',
    text: 'Submitted Physics Lab Report #3',
    course: 'Physics 11B',
    time: '3 days ago',
    icon: FileText,
  },
  {
    type: 'Lesson',
    text: 'Completed Lesson 7: Integration in Mathematics 10A',
    course: 'Mathematics 10A',
    time: '4 days ago',
    icon: PlayCircle,
  },
];

export default function StudentDashboard() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-gray-600">Welcome back, Student Nguyen</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <BookOpen size={18} />
          Browse Courses
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-600 font-medium text-sm rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
        >
          <FileText size={18} />
          View Assignments
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-600 font-medium text-sm rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Award size={18} />
          My Grades
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
            <h2 className="text-lg font-bold text-gray-900">My Courses</h2>
            <p className="text-sm text-gray-500">Continue your learning journey</p>
          </div>
          <button
            type="button"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            View All <ArrowRight size={14} />
          </button>
        </div>
        <div className="space-y-3">
          {enrolledCourses.map((course) => (
            <div
              key={course.name}
              className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 mb-1">{course.name}</p>
                  <p className="text-sm text-gray-500 mb-2">{course.teacher}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{course.lessons} lessons</span>
                    <span>•</span>
                    <span>Next: {course.nextLesson}</span>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  {course.status}
                </span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-600">Progress</span>
                  <span className="text-xs font-medium text-gray-900">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Upcoming Assignments</h2>
              <p className="text-sm text-gray-500">Don't miss any deadlines</p>
            </div>
            <button
              type="button"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {upcomingAssignments.map((assignment, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">{assignment.name}</p>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          assignment.status === 'urgent'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {assignment.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{assignment.course}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock size={14} />
                      <span>Due: {assignment.dueDate}</span>
                    </div>
                  </div>
                  {assignment.status === 'urgent' && (
                    <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                  )}
                </div>
                <button
                  type="button"
                  className="mt-3 w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Start Assignment
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Grades</h2>
            <p className="text-sm text-gray-500">Your latest performance</p>
          </div>
          <div className="space-y-3">
            {recentGrades.map((grade, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 mb-1">{grade.assignment}</p>
                    <p className="text-sm text-gray-500 mb-2">{grade.course}</p>
                    <p className="text-xs text-gray-500">{grade.date}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-2xl font-bold text-gray-900">{grade.grade}</span>
                      <span className="text-sm text-gray-500">/{grade.maxGrade}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${
                        grade.status === 'excellent'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {grade.status === 'excellent' ? 'Excellent' : 'Good'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-4 w-full py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            View All Grades
          </button>
        </section>
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          <p className="text-sm text-gray-500">Your learning progress and updates</p>
        </div>
        <div className="space-y-4">
          {recentActivity.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex flex-wrap items-start justify-between gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex gap-3 min-w-0 flex-1">
                  <Icon size={20} className="text-gray-500 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          item.type === 'Grade'
                            ? 'bg-green-100 text-green-700'
                            : item.type === 'Assignment'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-xs text-gray-500">{item.course}</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
