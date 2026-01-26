import React, { useState } from 'react';
import {
    BookOpen,
    Clock,
    PlayCircle,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    FileText,
    MessageSquare,
    Ticket,
    Video,
    Download,
    Calendar,
    Lock
} from 'lucide-react';

export default function CourseDetail() {
    const [expandedSections, setExpandedSections] = useState([1, 2]);

    const toggleSection = (sectionId) => {
        if (expandedSections.includes(sectionId)) {
            setExpandedSections(expandedSections.filter(id => id !== sectionId));
        } else {
            setExpandedSections([...expandedSections, sectionId]);
        }
    };

    const courseInfo = {
        title: 'Advanced UI Design Principles',
        instructor: 'Prof. Sarah Jenkins',
        totalHours: 32,
        progress: 26,
        completedLessons: 12,
        totalLessons: 45,
        tag: 'DESIGN TRACK'
    };

    const sections = [
        {
            id: 1,
            title: 'Section 1: Foundations of UI',
            status: 'Currently enrolled',
            lessons: 3,
            duration: '3h 20m',
            items: [
                { id: 1, title: '1.1 Introduction to Design Thinking', duration: '15:20', completed: true },
                { id: 2, title: '1.2 Visual Hierarchy Basics', duration: '18:45', completed: true },
                { id: 3, title: '1.3 Understanding User Needs', duration: '22:10', completed: false }
            ]
        },
        {
            id: 2,
            title: 'Section 2: Typography & Color Theory',
            status: 'Currently enrolled',
            lessons: 10,
            duration: '4h 30m',
            items: [
                { id: 1, title: '2.3 Choosing the Right Typeface', duration: '12:30', completed: false, isNew: true },
                { id: 2, title: '2.4 Color Psychology in UI', duration: '19:25', completed: false },
                { id: 3, title: '2.5 Creating Accessible Palettes', duration: '16:15', completed: false }
            ]
        },
        {
            id: 3,
            title: 'Section 3: Grid Systems & Layouts',
            status: 'Locked',
            lessons: 8,
            duration: '5h 15m',
            items: []
        },
        {
            id: 4,
            title: 'Section 4: Final Capstone Project',
            status: 'Locked',
            lessons: 3,
            duration: '8h',
            items: []
        }
    ];

    const resources = [
        { id: 1, title: 'Course Assets (.fig, .pdf)', icon: Download },
        { id: 2, title: 'Student Discussion Board', icon: MessageSquare },
        { id: 3, title: 'Support Ticket', icon: Ticket }
    ];

    const liveSession = {
        title: 'Live Office Hours',
        description: 'Join Prof. Sarah for a live Q&A session',
        time: 'this Tuesday at 8:00 PM PST'
    };

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Content - Left Column (2/3) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Course Header */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100">
                            <div className="flex items-start gap-4 mb-5">
                                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                                    <BookOpen size={32} className="text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded mb-2">
                                        {courseInfo.tag}
                                    </span>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{courseInfo.title}</h1>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            👨‍🏫 {courseInfo.instructor}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={16} />
                                            {courseInfo.totalHours} hours total
                                        </span>
                                    </div>
                                </div>
                                <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
                                    <PlayCircle size={18} />
                                    Resume Lesson
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold text-gray-700">YOUR PROGRESS</span>
                                    <span className="text-sm text-gray-600">{courseInfo.completedLessons} of {courseInfo.totalLessons} lessons completed</span>
                                </div>
                                <div className="mb-2">
                                    <div className="text-2xl font-bold text-gray-900 mb-1">{courseInfo.progress}% Complete</div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${courseInfo.progress}%` }}></div>
                                    </div>
                                </div>
                                <p className="text-xs text-blue-600 flex items-center gap-1">
                                    <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                                    Next milestone: User Psychology (Lesson 15)
                                </p>
                            </div>
                        </div>

                        {/* Course Curriculum */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-lg font-bold text-gray-900">Course Curriculum</h2>
                                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                                    Expand All Sections
                                </button>
                            </div>

                            <div className="space-y-3">
                                {sections.map((section) => {
                                    const isExpanded = expandedSections.includes(section.id);
                                    const isLocked = section.status === 'Locked';

                                    return (
                                        <div key={section.id} className="border border-gray-100 rounded-lg overflow-hidden">
                                            {/* Section Header */}
                                            <button
                                                onClick={() => !isLocked && toggleSection(section.id)}
                                                className={`w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${isLocked ? 'cursor-not-allowed opacity-60' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isLocked ? 'bg-gray-100' : 'bg-blue-50'
                                                        }`}>
                                                        {isLocked ? (
                                                            <Lock size={20} className="text-gray-400" />
                                                        ) : (
                                                            <CheckCircle size={20} className="text-blue-600" />
                                                        )}
                                                    </div>
                                                    <div className="text-left">
                                                        <h3 className="font-bold text-sm text-gray-900">{section.title}</h3>
                                                        <p className="text-xs text-gray-500">
                                                            {section.status} • {section.lessons} lessons • {section.duration}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!isLocked && (
                                                    isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />
                                                )}
                                            </button>

                                            {/* Section Items */}
                                            {isExpanded && !isLocked && (
                                                <div className="border-t border-gray-100 bg-gray-50">
                                                    {section.items.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="px-4 py-3 flex items-center justify-between hover:bg-white transition-colors border-b border-gray-50 last:border-b-0"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.completed ? 'bg-green-100' : 'bg-gray-100'
                                                                    }`}>
                                                                    {item.completed ? (
                                                                        <CheckCircle size={16} className="text-green-600" />
                                                                    ) : (
                                                                        <PlayCircle size={16} className="text-gray-400" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`text-sm font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                                                                            }`}>
                                                                            {item.title}
                                                                        </span>
                                                                        {item.isNew && (
                                                                            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">
                                                                                NEW
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-xs text-gray-500">Video • {item.duration}</span>
                                                                </div>
                                                            </div>
                                                            <button className="text-blue-600 hover:text-blue-700">
                                                                <PlayCircle size={18} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Right Column (1/3) */}
                    <div className="space-y-6">

                        {/* Course Resources */}
                        <div className="bg-white rounded-xl p-5 border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Course Resources</h3>
                            <div className="space-y-2">
                                {resources.map((resource) => {
                                    const Icon = resource.icon;
                                    return (
                                        <button
                                            key={resource.id}
                                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                <Icon size={16} className="text-gray-600" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{resource.title}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Live Office Hours */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                                    <Video size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-1">{liveSession.title}</h3>
                                    <p className="text-xs text-gray-600 mb-1">{liveSession.description}</p>
                                    <p className="text-xs text-gray-600">{liveSession.time}</p>
                                </div>
                            </div>
                            <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
                                Add to Calendar
                            </button>
                            <p className="text-xs text-gray-500 text-center mt-3">
                                Need help? Contact our student support team at <br />
                                <a href="mailto:support@eduai.com" className="text-blue-600 hover:underline">support@eduai.com</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
