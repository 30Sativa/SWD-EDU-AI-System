'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <section className="relative pt-12 pb-12 px-4 md:px-6 z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 backdrop-blur rounded-full mb-6 border"
              style={{ borderColor: '#bfdbfe' }}
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: '#2563eb' }}
                aria-hidden="true"
              ></div>
              <span className="font-medium text-xs md:text-sm" style={{ color: '#0066CC' }}>
                Nền tảng học trực tuyến AI
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-5 leading-tight text-balance">
              <span className="text-gray-900">Giáo dục</span>
              <br />
              <span style={{ color: '#2563eb' }}>Thông minh</span>
            </h1>

            <p className="text-base md:text-lg text-gray-600 mb-6 leading-relaxed">
              Nền tảng học trực tuyến hiện đại dành cho học sinh THPT, kết hợp phương pháp sư phạm chuẩn với công nghệ AI
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={handleGetStarted}
                disabled={isLoading}
                className="px-8 py-3 text-white font-semibold rounded-lg transition-all duration-300 text-sm md:text-base hover:shadow-lg hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#2563eb' }}
                aria-label="Bắt đầu sử dụng EDU-AI ngay"
              >
                {isLoading ? 'Đang xử lý...' : 'Bắt đầu ngay'}
              </button>
              <span className="hidden sm:inline self-center text-gray-400 text-sm">hoặc</span>
              <button
                onClick={() => navigate('/dashboard/teacher')}
                className="px-6 py-3 bg-white font-semibold rounded-lg border-2 transition-all duration-300 text-sm md:text-base hover:shadow-lg hover:scale-105"
                style={{ borderColor: '#2563eb', color: '#2563eb' }}
                aria-label="Vào Dashboard giáo viên (tạm, chưa auth)"
              >
                Teacher
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {[
                { value: '100%', label: 'Chuẩn Bộ GD' },
                { value: '3x', label: 'Nhanh hơn' },
                { value: '24/7', label: 'Hỗ trợ AI' },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg backdrop-blur border transition-all hover:shadow-md"
                  style={{
                    backgroundColor: '#eff6ff',
                    borderColor: '#bfdbfe',
                  }}
                >
                  <div
                    className="text-2xl md:text-3xl font-bold mb-1"
                    style={{ color: '#2563eb' }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <FeatureCardsCarousel />
        </div>
      </div>
    </section>
  );
}

function FeatureCardsCarousel() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const features = [
    { title: 'Tiết kiệm thời gian', desc: 'Giảm khối lượng soạn bài cho giáo viên' },
    { title: 'Học tập rõ ràng', desc: 'Nội dung mạch lạc, dễ theo dõi' },
    { title: 'Kiểm soát tiến độ', desc: 'Giáo viên & học sinh đều nắm được' },
  ];


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [features.length]);

  return (
    <div className="relative hidden lg:block">
      <div
        className="relative bg-blue-600 rounded-2xl p-1 shadow-2xl"
        style={{ boxShadow: '0 25px 50px rgba(0, 153, 255, 0.25)' }}
      >
        <div className="bg-white rounded-2xl p-6 md:p-8">
          <div className="space-y-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentFeature(idx)}
                className={`p-5 rounded-xl transition-all duration-500 cursor-pointer ${currentFeature === idx
                    ? 'bg-blue-50 shadow-md scale-105 border'
                    : 'bg-gray-50 hover:bg-blue-50/30'
                  }`}
                style={{
                  borderColor: currentFeature === idx ? '#bfdbfe' : 'transparent',
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setCurrentFeature(idx);
                  }
                }}
                aria-label={`Tính năng: ${feature.title}`}
                aria-current={currentFeature === idx ? 'true' : 'false'}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{feature.title}</h3>
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${currentFeature === idx ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    aria-hidden="true"
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-3xl opacity-40"
        style={{ backgroundColor: '#2563eb' }}
        aria-hidden="true"
      ></div>
      <div
        className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: '#2563eb' }}
        aria-hidden="true"
      ></div>
    </div>
  );
}

function FeaturesSection() {
  const features = [
    {
      num: '01',
      title: 'Chuẩn hóa nội dung giảng dạy',
      desc: 'Xây dựng khóa học theo cấu trúc Concept → Example → Exercise → Reflection, đảm bảo chất lượng theo chương trình Bộ Giáo dục',
      tags: ['Subject', 'Syllabus', 'Template'],
    },
    {
      num: '02',
      title: 'AI hỗ trợ thông minh',
      desc: 'Công cụ AI tự động phân tích nội dung, gợi ý câu hỏi, giúp giáo viên tiết kiệm thời gian soạn bài',
      tags: ['Structuring', 'Quiz Gen', 'Assistant'],
    },
    {
      num: '03',
      title: 'Quản lý hiệu quả',
      desc: 'Theo dõi tiến độ học tập chi tiết, quản lý Session, đánh giá kết quả một cách khoa học',
      tags: ['Progress', 'Analytics', 'Dashboard'],
    },
    {
      num: '04',
      title: 'Trải nghiệm học tập',
      desc: 'Giao diện thân thiện, dễ sử dụng cho mọi đối tượng, tối ưu cho việc học trực tuyến hiệu quả',
      tags: ['Interactive', 'Quiz', 'Q&A'],
    },
  ];

  return (
    <section id="features" className="py-12 md:py-16 px-4 md:px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-balance">
            <span className="text-gray-900">Tại sao chọn </span>
            <span style={{ color: '#2563eb' }}>EDU-AI?</span>
          </h2>
          <p className="text-gray-600 text-base md:text-lg font-medium">
            Giải pháp toàn diện cho giáo viên và học sinh
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }) {
  return (
    <div
      className="group relative rounded-2xl p-5 md:p-7 shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden border"
      style={{
        backgroundColor: '#eff6ff',
        borderColor: '#bfdbfe',
      }}
    >
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500 opacity-40"
        style={{ backgroundColor: '#2563eb' }}
        aria-hidden="true"
      ></div>

      <div className="relative">
        <div className="text-5xl md:text-6xl font-black mb-2 opacity-30" style={{ color: '#2563eb' }}>
          {feature.num}
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{feature.title}</h3>
        <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4">
          {feature.desc}
        </p>
        <div className="flex flex-wrap gap-2">
          {feature.tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-md text-xs font-medium"
              style={{
                backgroundColor: '#dbeafe',
                color: '#0066CC',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProcessSection() {
  const steps = [
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
  ];

  return (
    <section id="process" className="py-8 md:py-12 px-4 md:px-6 bg-white relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Quy trình{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(to right, #2563eb, #1e40af)',
              }}
            >
              sử dụng
            </span>
          </h2>
        </div>

        <div className="relative">
          <div
            className="absolute left-1/2 top-0 bottom-0 w-1 hidden md:block transform -translate-x-1/2"
            style={{ backgroundColor: '#2563eb' }}
            aria-hidden="true"
          ></div>

          <div className="space-y-8 md:space-y-10">
            {steps.map((step, idx) => (
              <ProcessStep key={idx} step={step} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessStep({ step }) {
  return (
    <div
      className={`flex items-center gap-4 md:gap-6 ${step.position === 'right' ? 'md:flex-row-reverse' : ''
        }`}
    >
      <div className={`flex-1 ${step.position === 'right' ? 'md:text-right' : ''}`}>
        <div
          className="bg-white rounded-xl md:rounded-2xl p-5 md:p-7 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:translate-y-[-4px] border"
          style={{
            borderColor: '#bfdbfe',
          }}
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
          className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl transition-all hover:scale-110"
          style={{
            background: `linear-gradient(to bottom right, #2563eb, #1e40af)`,
            boxShadow: '0 25px 50px rgba(0, 153, 255, 0.4)',
          }}
        >
          <span className="text-4xl md:text-5xl font-bold text-white">
            {step.num}
          </span>
        </div>
      </div>

      <div className="flex-1 hidden md:block"></div>
    </div>
  );
}

function CTASection() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <section className="py-16 md:py-20 px-4 md:px-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div
          className="relative rounded-2xl md:rounded-3xl p-8 md:p-12 text-center overflow-hidden shadow-2xl"
          style={{ backgroundColor: '#2563eb' }}
        >
          <div className="absolute inset-0 opacity-10" aria-hidden="true">
            <div
              style={{
                backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px),
                                  radial-gradient(circle, rgba(255,255,255,0.5) 2px, transparent 2px)`,
                backgroundSize: '50px 50px',
              }}
            ></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-5 text-balance">
              Bắt đầu hành trình của bạn
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-blue-50 mb-6 md:mb-8 font-medium">
              Đăng nhập để trải nghiệm nền tảng học trực tuyến hiện đại nhất
            </p>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="px-8 md:px-12 py-3 md:py-4 bg-white font-bold rounded-lg md:rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed text-sm md:text-base"
              style={{ color: '#2563eb' }}
              aria-label="Đăng nhập vào EDU-AI"
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập ngay'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function BackgroundAnimations() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }
      `}</style>

      <div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{
          backgroundColor: '#2563eb',
          top: '5%',
          left: '-10%',
          animation: 'float 25s ease-in-out infinite',
        }}
        aria-hidden="true"
      ></div>

      <div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-8"
        style={{
          backgroundColor: '#2563eb',
          bottom: '5%',
          right: '-10%',
          animation: 'float 30s ease-in-out infinite',
        }}
        aria-hidden="true"
      ></div>

      <div
        className="absolute w-72 h-72 rounded-full blur-3xl opacity-8"
        style={{
          backgroundColor: '#2563eb',
          top: '50%',
          left: '50%',
          animation: 'float 35s ease-in-out infinite reverse',
        }}
        aria-hidden="true"
      ></div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <BackgroundAnimations />

      <HeroSection />
      <FeaturesSection />
      <ProcessSection />
      <CTASection />
    </div>
  );
}