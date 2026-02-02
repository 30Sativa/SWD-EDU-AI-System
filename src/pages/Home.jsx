'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const stats = useMemo(() => [
    { value: '100%', label: 'Chuẩn Bộ GD' },
    { value: '3x', label: 'Nhanh hơn' },
    { value: '24/7', label: 'Hỗ trợ AI' },
  ], []);


  return (
    <section className="relative pt-12 pb-12 px-4 md:px-6 z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 backdrop-blur rounded-full mb-6 border border-blue-200"
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse bg-blue-600"
                aria-hidden="true"
              />
              <span className="font-medium text-xs md:text-sm text-blue-700">
                Nền tảng học trực tuyến AI
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-black mb-5 leading-tight text-balance">
              <span className="text-gray-900">Giáo dục</span>
              <br />
              <span className="text-blue-600">Thông minh</span>
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg text-gray-600 mb-6 leading-relaxed">
              Nền tảng học trực tuyến hiện đại dành cho học sinh THPT, kết hợp phương pháp sư phạm chuẩn với công nghệ AI
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={handleGetStarted}
                disabled={isLoading}
                className="px-8 py-3 text-white font-semibold rounded-lg transition-all duration-300 text-sm md:text-base hover:shadow-lg hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700"
                aria-label={isLoading ? 'Đang xử lý...' : 'Bắt đầu sử dụng EDU-AI ngay'}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xử lý...
                  </span>
                ) : 'Bắt đầu ngay'}
              </button>


            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg backdrop-blur border transition-all hover:shadow-md bg-blue-50 border-blue-200"
                >
                  <div className="text-2xl md:text-3xl font-bold mb-1 text-blue-600">
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
  ], []);

  return (
    <section id="features" className="py-12 md:py-16 px-4 md:px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-balance">
            <span className="text-gray-900">Tại sao chọn </span>
            <span className="text-blue-600">EDU-AI?</span>
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
      className="group relative rounded-2xl p-5 md:p-7 shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden border bg-blue-50 border-blue-200"
    >
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500 opacity-40 bg-blue-600"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="text-5xl md:text-6xl font-black mb-2 opacity-30 text-blue-600">
          {feature.num}
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          {feature.title}
        </h3>
        <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4">
          {feature.desc}
        </p>
        <div className="flex flex-wrap gap-2">
          {feature.tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700"
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

function CTASection() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  return (
    <section className="py-16 md:py-20 px-4 md:px-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div
          className="relative rounded-2xl md:rounded-3xl p-8 md:p-12 text-center overflow-hidden shadow-2xl bg-gradient-to-br from-blue-600 to-blue-800"
        >
          <div className="absolute inset-0 opacity-10" aria-hidden="true">
            <div className="absolute inset-0 bg-grid-white/20" />
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-5 text-balance">
              Bắt đầu hành trình của bạn
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-blue-100 mb-6 md:mb-8 font-medium">
              Đăng nhập để trải nghiệm nền tảng học trực tuyến hiện đại nhất
            </p>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="px-8 md:px-12 py-3 md:py-4 bg-white font-bold rounded-lg md:rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed text-sm md:text-base text-blue-600 hover:bg-blue-50"
              aria-label={isLoading ? 'Đang xử lý đăng nhập...' : 'Đăng nhập vào EDU-AI'}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  Đang xử lý...
                </span>
              ) : 'Đăng nhập ngay'}
            </button>
          </div>
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