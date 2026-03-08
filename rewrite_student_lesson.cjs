const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', 'SWD', 'SWD-EDU-AI-System', 'src', 'features', 'lesson', 'student', 'pages', 'LessonDetail.jsx');

let originalCode = fs.readFileSync(filePath, 'utf-8');
let prefix = originalCode.split('    return (')[0];

const newReturn = `    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800 pb-12">
            <style>
                {\`
               .hide-scrollbar::-webkit-scrollbar {
                  display: none;
               }
               .hide-scrollbar {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
               }
               .custom-scrollbar::-webkit-scrollbar {
                   width: 6px;
               }
               .custom-scrollbar::-webkit-scrollbar-track {
                   background: transparent;
               }
               .custom-scrollbar::-webkit-scrollbar-thumb {
                   background-color: #cbd5e1;
                   border-radius: 20px;
               }
            \`}
            </style>
            
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* 1. Header Navigation Bar */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                        <Link to={\`/dashboard/student/courses/\${lessonInfo.courseId}\`} className="hover:text-blue-600 flex items-center gap-1 transition-colors">
                            <ArrowLeft size={16} /> Quay lại khóa học
                        </Link>
                        <span>/</span>
                        <span className="text-slate-800 font-bold">{lessonInfo.lessonTitle}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-200">
                        <div className="space-y-1">
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0463ca] m-0 leading-tight">
                                {lessonInfo.lessonTitle}
                            </h1>
                            <p className="text-sm font-medium text-slate-500">{lessonInfo.lessonSubtitle}</p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiến độ</span>
                                <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: \`\${lessonInfo.progress}%\` }}></div>
                                </div>
                                <span className="text-sm font-bold text-slate-800">{lessonInfo.progress}%</span>
                            </div>
                            {!lessonData?.isCompleted && (
                                <button
                                    onClick={() => handleUpdateProgress(true)}
                                    className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors font-bold text-sm shadow-sm"
                                >
                                    <CheckCircle size={18} />
                                    Đánh dấu hoàn thành
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Main Workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    
                    {/* Left Column (span 2) */}
                    <div className="lg:col-span-2 space-y-6 flex flex-col min-w-0">
                        
                        {/* Video Player Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="group relative bg-slate-900 aspect-video overflow-hidden border-b-[6px] border-slate-800">
                                {lessonData?.videoUrl ? (
                                    <div className="w-full h-full relative group/video">
                                        <video
                                            ref={videoRef}
                                            src={lessonData.videoUrl}
                                            className="w-full h-full object-contain"
                                            controls={false}
                                            onPlay={() => setIsPlaying(true)}
                                            onPause={() => setIsPlaying(false)}
                                            onEnded={() => {
                                                setIsPlaying(false);
                                                handleUpdateProgress(true);
                                            }}
                                        />

                                        {/* Premium Overlay Play Button */}
                                        {!isPlaying && (
                                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center transition-all duration-300 pointer-events-none">
                                                <button
                                                    onClick={() => {
                                                        setIsPlaying(true);
                                                        videoRef.current?.play();
                                                    }}
                                                    className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-500 pointer-events-auto hover:scale-110 shadow-[0_0_40px_rgba(255,255,255,0.1)] group/btn"
                                                >
                                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 relative group-hover/btn:bg-blue-600">
                                                        <Play className="text-slate-900 group-hover/btn:text-white fill-current transition-all pl-1.5" size={24} />
                                                    </div>
                                                </button>
                                            </div>
                                        )}

                                        {/* Progress Tracking Bar - Mini */}
                                        <div className="absolute top-0 inset-x-0 h-1 w-full bg-white/10 z-20">
                                            <div
                                                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300"
                                                style={{ width: videoRef.current ? \`\${(videoRef.current.currentTime / videoRef.current.duration) * 100}%\` : '0%' }}
                                            />
                                        </div>

                                        {/* Controls Bar */}
                                        <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 pointer-events-auto">
                                            <div className="flex items-center gap-6 text-white group/controls">
                                                <button onClick={() => {
                                                    if (isPlaying) {
                                                        videoRef.current?.pause();
                                                    } else {
                                                        videoRef.current?.play();
                                                    }
                                                    setIsPlaying(!isPlaying);
                                                }} className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white hover:text-slate-900 rounded-xl transition-all duration-300">
                                                    {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current pl-1" />}
                                                </button>

                                                <div className="flex-1 flex flex-col gap-2">
                                                    <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-white/50 px-1">
                                                        <span>{Math.floor(watchedTime / 60)}:{(watchedTime % 60).toString().padStart(2, '0')}</span>
                                                    </div>
                                                    <div className="relative group/slider h-1.5 w-full bg-white/20 rounded-full cursor-pointer hover:h-2 transition-all">
                                                        <div
                                                            className="h-full bg-blue-500 rounded-full relative shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                            style={{ width: videoRef.current ? \`\${(videoRef.current.currentTime / videoRef.current.duration) * 100}%\` : '0%' }}
                                                        >
                                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] scale-0 group-hover/slider:scale-100 transition-all duration-300"></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                                                        <Volume2 size={18} />
                                                    </button>
                                                    <button className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 rounded-xl transition-all">
                                                        <Maximize size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center gap-4">
                                        <div className="w-20 h-20 rounded-3xl bg-slate-700/50 flex items-center justify-center border border-white/5 shadow-inner">
                                            <PlayCircle size={40} className="text-slate-500" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-slate-400 font-bold tracking-wide uppercase text-xs">Video đang được cập nhật</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                            <div className="flex border-b border-slate-100 px-2 pt-2 overflow-x-auto hide-scrollbar bg-slate-50/50">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={\`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-[3px] transition-all whitespace-nowrap flex-shrink-0 \${isActive
                                                ? 'border-[#0487e2] text-[#0487e2] bg-white rounded-t-lg shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]'
                                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
                                                }\`}
                                        >
                                            <Icon size={16} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Tab Panels */}
                            <div className="p-6 md:p-8">
                                {activeTab === 'content' && (
                                    <div className="space-y-10 animate-fade-in">
                                        {lessonBlocks && lessonBlocks.length > 0 ? (
                                            <div className="space-y-8">
                                                {lessonBlocks.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((block, idx) => {
                                                    const blockThemes = {
                                                        'Concept': { label: 'Khái niệm', color: 'blue', icon: <BookOpen size={18} />, bg: 'bg-blue-50/30' },
                                                        'Example': { label: 'Ví dụ', color: 'emerald', icon: <Lightbulb size={18} />, bg: 'bg-emerald-50/30' },
                                                        'Exercise': { label: 'Thực hành', color: 'amber', icon: <Settings size={18} />, bg: 'bg-amber-50/30' },
                                                        'Reflection': { label: 'Củng cố', color: 'indigo', icon: <Bot size={18} />, bg: 'bg-indigo-50/30' }
                                                    };
                                                    const theme = blockThemes[block.blockType || block.type] || blockThemes['Concept'];

                                                    return (
                                                        <div key={block.id || idx} className="group/block relative duration-500 animate-slide-up bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                                            <div className={\`p-5 flex items-center gap-4 border-b border-slate-100 \${theme.bg}\`}>
                                                                <div className={\`w-10 h-10 rounded-xl bg-white border border-slate-200 text-\${theme.color}-600 flex items-center justify-center shadow-sm\`}>
                                                                    {theme.icon}
                                                                </div>
                                                                <div>
                                                                    <span className={\`text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5 block\`}>
                                                                        Phần {idx + 1}
                                                                    </span>
                                                                    <h3 className="text-lg font-bold text-slate-800 leading-tight">
                                                                        {block.title}
                                                                    </h3>
                                                                </div>
                                                            </div>

                                                            <div className="p-6 md:p-8">
                                                                <div className="prose prose-slate prose-sm text-slate-700 leading-relaxed max-w-none break-words overflow-hidden w-full">
                                                                    {block.content && (
                                                                        <div dangerouslySetInnerHTML={{ __html: block.content.includes('<') ? block.content : block.content.replace(/\\n/g, '<br/>') }} />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : lessonData.content ? (
                                            <div
                                                className="prose prose-slate max-w-none text-slate-600 leading-7 text-sm bg-white p-6 rounded-2xl border border-slate-100 shadow-sm break-words overflow-hidden w-full"
                                                dangerouslySetInnerHTML={{ __html: lessonData.content }}
                                            />
                                        ) : (
                                            <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                                <FileText className="mx-auto text-slate-300 mb-4" size={40} />
                                                <p className="text-slate-500 font-medium text-sm">Nội dung bài học đang được chuẩn bị...</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'qa' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                <MessageSquare size={20} className="text-[#0487e2]" />
                                                Câu hỏi thường gặp
                                            </h3>
                                        </div>

                                        {lessonFaqs.length > 0 ? (
                                            <div className="space-y-4">
                                                {lessonFaqs.map((faq, idx) => (
                                                    <div key={faq.id || idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                                                        <h4 className="font-bold text-slate-800 mb-3 flex items-start gap-2 text-sm">
                                                            <span className="text-blue-600 mt-0.5">Q:</span>
                                                            <span className="flex-1">{faq.question}</span>
                                                        </h4>
                                                        <div className="pl-6 text-slate-600 text-sm leading-relaxed flex items-start gap-2">
                                                            <span className="text-emerald-500 font-bold shrink-0 mt-0.5">A:</span>
                                                            <div className="flex-1" dangerouslySetInnerHTML={{ __html: faq.answer?.replace(/\\n/g, '<br/>') }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                                <MessageSquare className="mx-auto text-slate-300 mb-4" size={40} />
                                                <p className="text-slate-500 font-medium text-sm">Chưa có câu hỏi thường gặp cho bài này.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {activeTab === 'exercises' && (
                                    <div className="space-y-6 animate-fade-in">
                                        {quizData ? (
                                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                                <div className="p-8 text-center bg-blue-50/30">
                                                    <div className="w-16 h-16 bg-white border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                                        <ListChecks size={28} className="text-[#0487e2]" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800 mb-2">{quizData.title || 'Bài tập rèn luyện'}</h3>
                                                    <p className="text-slate-500 text-sm mb-6">Kiểm tra lại kiến thức vừa học qua bài quiz nhanh nhé!</p>

                                                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                                                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Số câu hỏi</p>
                                                            <p className="text-sm font-bold text-slate-800">{quizData.totalQuestions || 0} câu</p>
                                                        </div>
                                                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Thời gian</p>
                                                            <p className="text-sm font-bold text-slate-800">{quizData.duration || 15} phút</p>
                                                        </div>
                                                    </div>

                                                    <Link
                                                        to={\`/dashboard/student/quizzes/\${quizData.id || quizData.quizId}\`}
                                                        className="inline-flex items-center gap-2 px-8 py-3 bg-[#0487e2] hover:bg-[#0374c4] text-white font-bold rounded-xl shadow-md transition-all"
                                                    >
                                                        Bắt đầu làm bài
                                                        <ChevronRight size={18} />
                                                    </Link>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                                <div className="w-16 h-16 bg-white border border-slate-100 shadow-sm text-slate-300 rounded-2xl flex items-center justify-center mb-6">
                                                    <ListChecks size={28} />
                                                </div>
                                                <h3 className="text-slate-800 font-bold text-base mb-2">Chưa có bài tập</h3>
                                                <p className="text-slate-500 text-sm">Giảng viên chưa cập nhật bài tập cho bài học này.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {activeTab !== 'content' && activeTab !== 'exercises' && activeTab !== 'qa' && (
                                    <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                        <div className="w-16 h-16 bg-white border border-slate-100 shadow-sm text-slate-400 rounded-2xl flex items-center justify-center mb-6">
                                            <Settings size={28} />
                                        </div>
                                        <h3 className="text-slate-800 font-bold text-base mb-2">Đang cập nhật</h3>
                                        <p className="text-slate-500 text-sm">Nội dung {activeTab} sẽ sớm được bổ sung.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column (span 1) */}
                    <div className="lg:col-span-1 space-y-6 flex flex-col min-w-0">
                        {/* Course Curriculum list */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col max-h-[450px]">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-2xl">
                                <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                                    <BookOpen size={16} className="text-[#0487e2]"/>
                                    Danh sách bài học
                                </h2>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/50">
                                {mappedCourseSections.map((section) => (
                                    <div key={section.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                        <button
                                            onClick={() => !section.isLocked && toggleSection(section.id)}
                                            className={\`w-full p-3 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors \${section.isLocked ? 'opacity-60 cursor-not-allowed' : ''}\`}
                                        >
                                            <span className="font-bold text-[13px] text-slate-700 uppercase tracking-wide truncate flex-1 text-left">
                                                {section.title}
                                            </span>
                                            {!section.isLocked && (
                                                expandedSections.includes(section.id) ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />
                                            )}
                                        </button>

                                        {expandedSections.includes(section.id) && !section.isLocked && (
                                            <div className="bg-slate-50/50 border-t border-slate-100 p-2">
                                                {section.lessons.map((lesson) => {
                                                    const isQuiz = lesson.type === 'quiz';
                                                    return (
                                                        <Link
                                                            key={lesson.id}
                                                            to={isQuiz
                                                                ? \`/dashboard/student/quizzes/\${lesson.id}\`
                                                                : \`/dashboard/student/courses/\${courseId}/lessons/\${lesson.id}\`
                                                            }
                                                            className={\`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 border border-transparent \${lesson.isCurrent || lessonId === lesson.id
                                                                ? 'bg-[#0487e2]/5 border-[#0487e2]/20 shadow-sm shadow-[#0487e2]/5'
                                                                : 'hover:bg-white hover:border-slate-200 hover:shadow-sm'
                                                                }\`}
                                                        >
                                                            <div className="mt-0.5 flex-shrink-0">
                                                                {lesson.completed ? (
                                                                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                                                                        <CheckCircle size={14} className="text-emerald-500" />
                                                                    </div>
                                                                ) : (lesson.isCurrent || lessonId === lesson.id) ? (
                                                                    <div className="w-5 h-5 bg-[#0487e2] rounded-full flex items-center justify-center shadow-md shadow-blue-200">
                                                                        <PlayCircle size={14} className="text-white fill-current" />
                                                                    </div>
                                                                ) : isQuiz ? (
                                                                    <div className="w-5 h-5 bg-amber-50 rounded-full flex items-center justify-center border border-amber-200">
                                                                        <ListChecks size={12} className="text-amber-500" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center border border-slate-300">
                                                                        <Circle size={10} className="text-slate-300" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={\`text-xs leading-snug line-clamp-2 mb-1 \${lesson.isCurrent || lessonId === lesson.id ? 'font-bold text-[#0487e2]' : 'font-semibold text-slate-700'}\`}>
                                                                    {lesson.title}
                                                                </p>
                                                                <div className="flex items-center gap-2">
                                                                    <Clock size={10} className="text-slate-400" />
                                                                    <span className="text-[10px] font-semibold text-slate-400">{lesson.duration || '0 phút'}</span>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Assistant Box */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 max-h-[500px]">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0487e2] to-indigo-600 flex items-center justify-center text-white shadow-sm">
                                        <Bot size={18} />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-slate-800 text-sm">Trợ Lý AI</h2>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Online</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 custom-scrollbar">
                                {chatMessages.map((msg) => (
                                    <div key={msg.id} className={\`flex gap-3 \${msg.type === 'user' ? 'flex-row-reverse' : ''} animate-fade-in\`}>
                                        <div className={\`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border border-slate-200 shadow-sm \${msg.type === 'user' ? 'bg-white' : 'bg-white'}\`}>
                                            {msg.type === 'user' ? <span className="text-[10px] font-bold text-slate-600">You</span> : <Bot size={14} className="text-[#0487e2]" />}
                                        </div>
                                        <div className={\`max-w-[85%] space-y-2 \${msg.type === 'user' ? 'items-end' : 'items-start'}\`}>
                                            <div className={\`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm \${msg.type === 'user'
                                                ? 'bg-[#0487e2] text-white rounded-tr-sm'
                                                : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm'
                                                }\`}>
                                                {msg.text}
                                            </div>
                                            {msg.suggestions && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {msg.suggestions.map((sug, i) => (
                                                        <button key={i} className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 px-2.5 py-1.5 rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm text-left">
                                                            {sug}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl">
                                <div className="relative shadow-sm rounded-xl">
                                    <textarea
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder="Hỏi gì đó đi..."
                                        className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0487e2]/20 focus:border-[#0487e2] transition-colors text-[13px] resize-none custom-scrollbar"
                                        rows="1"
                                        style={{ minHeight: '44px', maxHeight: '100px' }}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!inputMessage.trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#0487e2] disabled:bg-slate-300 disabled:text-white text-white rounded-lg hover:bg-[#0374c4] transition-colors shadow-sm"
                                    >
                                        <Send size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
`;

fs.writeFileSync(filePath, prefix + newReturn, 'utf-8');
console.log('Successfully rewrote LessonDetail.jsx');
