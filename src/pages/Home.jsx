'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  return (
    <section className="relative py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-8 z-10 snap-start">
      <div
        className={`max-w-7xl mx-auto w-full grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-10 items-stretch transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
      >
        {/* Left content */}
        <div className="flex flex-col justify-between">
          <div className="space-y-5 md:space-y-6">
            <div className="inline-flex w-fit items-center gap-2 px-4 py-2 md:py-2.5 rounded-full bg-blue-50 text-xs md:text-sm font-medium text-blue-700 border border-blue-100">
              <span className="shrink-0 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="leading-tight pt-[2px]">Nền tảng học trực tuyến AI</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-blue-600 leading-tight">
              <span className="inline">Giáo dục</span>{' '}
              <span className="inline">Thông minh</span>
            </h1>

            <p className="text-sm md:text-base text-gray-600 max-w-xl">
              Nền tảng học trực tuyến hiện đại dành cho học sinh THPT, kết hợp phương pháp sư phạm chuẩn
              với công nghệ AI để chuẩn hóa nội dung và cá nhân hóa trải nghiệm học tập.
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={handleGetStarted}
                className="px-8 md:px-10 py-3 rounded-full bg-blue-600 text-white text-sm md:text-base font-semibold shadow-lg shadow-blue-500/40 hover:bg-blue-700 hover:shadow-xl transition-transform hover:-translate-y-0.5"
              >
                Bắt đầu ngay
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-md pt-6 md:pt-8">
              <div className="rounded-2xl border border-blue-50 bg-blue-50/60 px-3 py-3">
                <div className="text-xl md:text-2xl font-bold text-blue-700">100%</div>
                <p className="text-xs md:text-sm text-gray-600">Chuẩn Bộ GD</p>
              </div>
              <div className="rounded-2xl border border-blue-50 bg-blue-50/60 px-3 py-3">
                <div className="text-xl md:text-2xl font-bold text-blue-700">3x</div>
                <p className="text-xs md:text-sm text-gray-600">Nhanh hơn</p>
              </div>
              <div className="rounded-2xl border border-blue-50 bg-blue-50/60 px-3 py-3">
                <div className="text-xl md:text-2xl font-bold text-blue-700">24/7</div>
                <p className="text-xs md:text-sm text-gray-600">Hỗ trợ AI</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right image collage, layout giống Vintar */}
        <div className="relative h-full flex items-end">
          <div className="relative grid grid-cols-2 gap-3 md:gap-4 w-full h-full">
            {/* Main portrait, chiếm 2 hàng bên trái */}
            <div className="group relative rounded-3xl overflow-hidden row-span-2 h-full shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
              <img
                src="/assets/Screenshot 2026-02-04 201619.png"
                alt="Học sinh học trực tuyến cùng EDU-AI"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
              {/* Student quote overlay */}
              <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-2xl bg-white/95 shadow-lg px-4 py-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <p className="text-xs md:text-sm text-gray-700 mb-1">
                  “Nhờ lộ trình học tập rõ ràng trên EDU-AI, em đã tự tin hơn hẳn khi ôn thi học kì vừa rồi!”
                </p>
                <p className="text-xs md:text-sm font-semibold text-gray-900">
                  Minh Hương – Học sinh THPT
                </p>
              </div>
            </div>

            {/* Ảnh ngang phía trên bên phải */}
            <div className="rounded-3xl overflow-hidden h-28 md:h-32 lg:h-36 shadow-[0_16px_40px_rgba(15,23,42,0.18)]">
              <img
                src="/assets/Screenshot 2026-02-04 201642.png"
                alt="Không gian học tập"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Ảnh dọc phía dưới bên phải */}
            <div className="group relative rounded-3xl overflow-hidden h-40 md:h-52 lg:h-64 shadow-[0_16px_40px_rgba(15,23,42,0.18)] self-end">
              <img
                src="/assets/download.jpg"
                alt="Học sinh tương tác nội dung"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
              {/* Teacher quote overlay */}
              <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-2xl bg-white/95 shadow-lg px-4 py-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <p className="text-xs md:text-sm text-gray-700 mb-1">
                  “Nền tảng giúp học sinh dễ dàng theo sát tiến độ và nắm bắt được lực học của mình.”
                </p>
                <p className="text-xs md:text-sm font-semibold text-gray-900">
                  Không gian học tập – Bạn Minh Hương
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCardsCarousel() {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = useMemo(() => [
    {
      title: 'Tiết kiệm thời gian',
      desc: 'Giảm khối lượng soạn bài cho giáo viên'
    },
    {
      title: 'Học tập rõ ràng',
      desc: 'Nội dung mạch lạc, dễ theo dõi'
    },
    {
      title: 'Kiểm soát tiến độ',
      desc: 'Giáo viên & học sinh đều nắm được'
    },
  ], []);

  const nextFeature = useCallback(() => {
    setCurrentFeature((prev) => (prev + 1) % features.length);
  }, [features.length]);

  const prevFeature = useCallback(() => {
    setCurrentFeature((prev) => (prev - 1 + features.length) % features.length);
  }, [features.length]);

  useEffect(() => {
    const timer = setInterval(nextFeature, 5000);
    return () => clearInterval(timer);
  }, [nextFeature]);

  return (
    <div className="relative hidden lg:block">
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-1 shadow-2xl shadow-blue-500/25">
        <div className="bg-white rounded-2xl p-6 md:p-8">
          <div className="space-y-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentFeature(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setCurrentFeature(idx);
                  }
                }}
                className={`p-5 rounded-xl transition-all duration-500 cursor-pointer ${currentFeature === idx
                  ? 'bg-blue-50 shadow-md scale-105 border border-blue-200'
                  : 'bg-gray-50 hover:bg-blue-50/30'
                  }`}
                role="button"
                tabIndex={0}
                aria-label={`Tính năng: ${feature.title}`}
                aria-current={currentFeature === idx ? 'true' : 'false'}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${currentFeature === idx ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    aria-hidden="true"
                  />
                </div>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {features.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentFeature(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${currentFeature === idx ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                aria-label={`Chuyển đến slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-3xl opacity-40 bg-blue-600" aria-hidden="true" />
      <div className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full blur-3xl opacity-30 bg-blue-600" aria-hidden="true" />
    </div>
  );
}

function FeaturesSection() {
  const features = useMemo(() => [
    {
      num: '01',
      title: 'Chuẩn hóa nội dung dạy',
      desc: 'Xây dựng khóa học theo cấu trúc Concept → Example → Exercise → Reflection, đảm bảo chất lượng theo chương trình Bộ Giáo dục.',
      tags: ['Môn học', 'Khung chương trình'],
      image: '/assets/Screenshot 2026-02-04 203703.png',
    },
    {
      num: '02',
      title: 'AI hỗ trợ thông minh',
      desc: 'Công cụ AI tự động phân tích nội dung, gợi ý câu hỏi, giúp giáo viên tiết kiệm thời gian soạn bài.',
      tags: ['Gợi ý câu hỏi', 'Trợ lý AI'],
      image: '/assets/Screenshot 2026-02-04 203753.png',
    },
    {
      num: '03',
      title: 'Quản lý hiệu quả',
      desc: 'Theo dõi tiến độ học tập chi tiết, đánh giá kết quả một cách khoa học cho từng lớp học.',
      tags: ['Tiến độ', 'Phân tích'],
      image: '/assets/Screenshot 2026-02-04 203826.png',
    },
    {
      num: '04',
      title: 'Trải nghiệm học tập',
      desc: 'Giao diện thân thiện, dễ sử dụng cho mọi đối tượng, tối ưu cho việc học trực tuyến hiệu quả.',
      tags: ['Tương tác', 'Trắc nghiệm', 'Hỏi đáp'],
      image: '/assets/Screenshot 2026-02-04 203904.png',
    },
  ], []);

  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setIsInView(entry.isIntersecting);
      });
    }, {
      threshold: 0.25,
      rootMargin: '0px 0px -15% 0px',
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="py-12 md:py-16 px-4 md:px-6 lg:px-8 relative z-10 snap-start"
    >
      <div className={`max-w-7xl mx-auto transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        {/* Section header similar to "Services we provide" */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
          <div>
            <p className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-blue-500 mb-2">
              Tính năng chính
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
              Hỗ trợ dạy và học trong lớp học THPT
            </h2>
          </div>
        </div>

        {/* Feature cards in 4-column layout with images */}
        <div className="grid gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} feature={feature} index={idx} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, index, isInView }) {
  return (
    <div
      className={`group relative rounded-3xl shadow-md hover:shadow-2xl overflow-hidden border border-blue-100 bg-blue-50/40 flex flex-col transform transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      style={{ transitionDelay: isInView ? `${200 + index * 120}ms` : '0ms' }}
    >
      {/* Image */}
      <div className="relative h-36 md:h-40 lg:h-44 overflow-hidden">
        <img
          src={feature.image}
          alt={feature.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {feature.level && (
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 rounded-full bg-white/95 text-[11px] font-medium text-gray-800 shadow-sm">
              {feature.level}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col px-4 md:px-5 pb-4 md:pb-5 pt-4 gap-3">
        <div className="flex items-center justify-between text-xs text-blue-500 font-semibold tracking-[0.25em] uppercase">
          <span>{feature.num}</span>
        </div>
        <div>
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">
            {feature.title}
          </h3>
          <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
            {feature.desc}
          </p>
        </div>
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {feature.tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full text-[11px] font-medium bg-blue-100 text-blue-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AboutSection() {
  const stats = useMemo(() => [
    { label: 'Khóa học được chuẩn hóa', value: '98%' },
    { label: 'Giáo viên áp dụng EDU-AI', value: '500+' },
    { label: 'Trường sử dụng nền tảng', value: '25+' },
    { label: 'Tỉnh thành triển khai', value: '15+' },
  ], []);

  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Bật/tắt hiệu ứng mỗi lần section ra/vào viewport
        setIsInView(entry.isIntersecting);
      });
    }, {
      threshold: 0.25,
      rootMargin: '0px 0px -15% 0px',
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative z-10 snap-start py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto w-full grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start">
        <div
          className={`flex flex-col justify-center transform transition-all duration-1000 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
        >
          <p className="text-xs md:text-sm font-semibold tracking-[0.25em] uppercase text-blue-500 mb-3">
            Về EDU-AI Classroom
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 mb-4 leading-tight">
            <span className="block">Chuẩn hoá nội dung</span>
            <span className="block text-blue-600">giảng dạy bền vững</span>
          </h2>
          <p className="text-sm md:text-base text-gray-600 mb-6 max-w-xl">
            EDU-AI Classroom giúp đội ngũ học thuật và giáo viên biến giáo trình hiện có thành lộ trình học tập rõ ràng:
            từ Concept, Example, Exercise đến Reflection. Mọi Lesson đều bám cùng một khung sư phạm, giúp nội dung dễ
            chuẩn hóa, dễ tái sử dụng và mở rộng cho nhiều lớp học khác nhau.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-[url('/assets/desk-1.png')] bg-cover bg-center" />
              <div className="w-8 h-8 rounded-full border-2 border-white bg-[url('/assets/student-2.png')] bg-cover bg-center" />
              <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-[10px] font-semibold text-blue-700">
                +12
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-500">
              Được các trường, trung tâm và giáo viên tin dùng.
            </p>
          </div>
        </div>

        {/* Stats cards styled giống section categories */}
        <div className="grid grid-cols-2 gap-4 self-center">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-3xl bg-blue-50/80 px-4 py-5 md:px-6 md:py-7 flex flex-col justify-between shadow-sm hover:shadow-md transform transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              style={{ transitionDelay: isInView ? `${250 + idx * 150}ms` : '0ms' }}
            >
              <div className="text-lg md:text-2xl font-bold text-blue-700 mb-1">
                {item.value}
              </div>
              <p className="text-xs md:text-sm text-gray-500">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const steps = useMemo(() => [
    {
      num: '1',
      title: 'Quản lý tạo Subject chuẩn',
      desc: 'Upload nội dung theo chương trình Bộ GD. AI tự động phân tích và tạo cấu trúc khóa học',
      position: 'left',
    },
    {
      num: '2',
      title: 'Giáo viên tạo Course & Lesson',
      desc: 'Chọn Subject có sẵn, customize nội dung chi tiết và tạo Session theo lịch giảng dạy',
      position: 'right',
    },
    {
      num: '3',
      title: 'Học sinh học tập & làm bài',
      desc: 'Tham gia khóa học, học theo cấu trúc rõ ràng, làm quiz và nhận feedback từ hệ thống',
      position: 'left',
    },
  ], []);

  return (
    <section id="process" className="py-8 md:py-12 px-4 md:px-6 bg-white relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Quy trình{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              sử dụng
            </span>
          </h2>
        </div>

        <div className="relative">
          <div
            className="absolute left-1/2 top-0 bottom-0 w-1 hidden md:block transform -translate-x-1/2 bg-gradient-to-b from-blue-500 to-blue-700"
            aria-hidden="true"
          />

          <div className="space-y-8 md:space-y-10">
            {steps.map((step, idx) => (
              <ProcessStep key={idx} step={step} index={idx} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessStep({ step, index }) {
  return (
    <div
      className={`flex items-center gap-4 md:gap-6 ${step.position === 'right' ? 'md:flex-row-reverse' : ''
        }`}
      data-step={index + 1}
    >
      <div className={`flex-1 ${step.position === 'right' ? 'md:text-right' : ''}`}>
        <div
          className="bg-white rounded-xl md:rounded-2xl p-5 md:p-7 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 border border-blue-200"
        >
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
            {step.title}
          </h3>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            {step.desc}
          </p>
        </div>
      </div>

      <div className="relative flex-shrink-0">
        <div
          className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl transition-all hover:scale-110 bg-gradient-to-br from-blue-600 to-blue-800 shadow-blue-500/40"
        >
          <span className="text-4xl md:text-5xl font-bold text-white">
            {step.num}
          </span>
        </div>
        {index < 2 && (
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 md:hidden">
            <div className="w-0.5 h-8 bg-gradient-to-b from-blue-600 to-transparent" />
          </div>
        )}
      </div>

      <div className="flex-1 hidden md:block" />
    </div>
  );
}

function PortfolioSection() {
  const testimonials = useMemo(() => [
    {
      name: 'Minh Anh',
      role: 'HỌC SINH LỚP 11',
      quote:
        '“Em không còn bị mất gốc khi vào năm học mới. EDU-AI Classroom giúp em ôn lại kiến thức cũ và chuẩn bị bài mới rất rõ ràng.”',
      image: "/assets/대학생 기본소득 30만원 요구, 과연 공정한가_ – 사회주의 포퓰리즘.jpg",
    },
    {
      name: 'Thầy Nam',
      role: 'GIÁO VIÊN TOÁN THPT',
      quote:
        '“Nhờ hệ thống gợi ý câu hỏi và bài tập theo từng Concept, em có thêm thời gian để kèm từng nhóm học sinh yếu – khá rõ rệt sau 4 tuần.”',
      image: '/assets/z7500938741829_2e997fbacb7344cb93948a33107aaf98.jpg',
    },
    {
      name: 'Khánh Linh',
      role: 'HỌC SINH LỚP 10',
      quote:
        '“Các bài học được chia nhỏ, có ví dụ và bài tập kèm ngay sau đó nên em dễ theo kịp, không bị choáng như trước.”',
      image: '/assets/z7500938735703_b3bf2aa56ac25897cba7252c7ea8f9c1.jpg',
    },
    {
      name: 'Cô Hương',
      role: 'GIÁO VIÊN NGỮ VĂN',
      quote:
        '“EDU-AI Classroom giúp em chuẩn hóa giáo án cho nhiều lớp khác nhau mà vẫn giữ được phong cách dạy của mình.”',
      image: '/assets/z7500938719291_4d34016fd5bd3523ba4592bb3919894f.jpg',
    },
    {
      name: 'Tuấn Kiệt',
      role: 'HỌC SINH LỚP 12',
      quote:
        '“Khi ôn thi tốt nghiệp, em chỉ cần theo lộ trình trên hệ thống, biết rõ mỗi ngày phải làm gì nên đỡ lo lắng hơn rất nhiều.”',
      image: '/assets/z7500818977353_a5c6e9f8e5e4c0ae71c7213d6dfff0ff.jpg',
    },
    {
      name: 'Ban giám hiệu trường THPT',
      role: 'QUẢN LÝ CHUYÊN MÔN',
      quote:
        '“Chúng tôi dễ dàng theo dõi tiến độ của từng lớp, từng môn và có số liệu cụ thể để trao đổi với giáo viên.”',
      image: '/assets/z7500818966744_21c5ce9a3bd30d8c4227ad5d7a92df08.jpg',
    },
  ], []);

  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          }
        });
      },
      {
        threshold: 0.25,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="feedback"
      ref={sectionRef}
      className="py-12 md:py-16 px-4 md:px-6 lg:px-8 bg-blue-50/30 relative z-10 snap-start"
    >
      <div
        className={`max-w-7xl mx-auto transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
          <div>
            <p className="text-xs md:text-sm font-semibold tracking-[0.25em] uppercase text-blue-500 mb-2">
              Phản hồi & trải nghiệm
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
              Giáo viên và học sinh nói gì
            </h2>
          </div>
        </div>

        <div className="grid gap-5 md:gap-6 lg:gap-7 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, idx) => (
            <article
              key={item.name}
              className={`relative flex flex-col rounded-3xl bg-white/95 shadow-[0_18px_55px_rgba(15,23,42,0.08)] border border-slate-100/80 p-6 md:p-7 overflow-hidden transform transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_26px_70px_rgba(37,99,235,0.22)] hover:border-blue-200 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              style={{
                transitionDelay: isInView ? `${150 + idx * 70}ms` : '0ms',
              }}
            >
              <div
                className="pointer-events-none absolute -top-10 right-0 w-24 h-24 rounded-full bg-gradient-to-br from-blue-100/60 via-blue-50/0 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                aria-hidden="true"
              />
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-16 h-16 md:w-18 md:h-18 rounded-full overflow-hidden mb-3 shadow-md">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900">
                  {item.name}
                </h3>
                <p className="text-[11px] md:text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase">
                  {item.role}
                </p>
              </div>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                {item.quote}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BackgroundAnimations() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(30px, -30px) rotate(90deg); }
          50% { transform: translate(0, -60px) rotate(180deg); }
          75% { transform: translate(-30px, -30px) rotate(270deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
      `}</style>

      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute rounded-full blur-3xl bg-gradient-to-r from-blue-400/20 to-blue-600/20"
          style={{
            width: `${300 + i * 100}px`,
            height: `${300 + i * 100}px`,
            top: `${10 + i * 20}%`,
            left: `${-5 + i * 10}%`,
            animation: `float ${30 + i * 5}s ease-in-out infinite, pulse ${10 + i * 2}s ease-in-out infinite`,
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('userRole');

    if (token && role) {
      const lowerRole = String(role).toLowerCase();
      if (lowerRole.includes('admin')) navigate('/dashboard/admin');
      else if (lowerRole.includes('teacher')) navigate('/dashboard/teacher');
      else if (lowerRole.includes('manager')) navigate('/dashboard/manager');
      else if (lowerRole.includes('user') || lowerRole.includes('student')) navigate('/dashboard/student');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white">
      <BackgroundAnimations />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <PortfolioSection />
    </div>
  );
}