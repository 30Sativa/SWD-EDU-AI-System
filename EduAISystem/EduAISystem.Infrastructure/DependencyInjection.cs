using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Infrastructure.Services.FileStorage;
using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Repositories;
using EduAISystem.Infrastructure.Security;
using EduAISystem.Infrastructure.Services.Cache;
using EduAISystem.Infrastructure.Services.Email;
using EduAISystem.Infrastructure.Services.Excel;
using EduAISystem.Infrastructure.Services.ExternalApis;
using EduAISystem.Infrastructure.Services.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Polly;
using Polly.Extensions.Http;


namespace EduAISystem.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
           this IServiceCollection services,
           IConfiguration configuration)
        {
            // 1. DbContext
            services.AddDbContext<EduAiDbV5Context>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection")));

            // 2. Repository
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<ISubjectRepository, SubjectRepository>();
            services.AddScoped<ICourseRepository, CourseRepository>();
            services.AddScoped<IGradeLevelRepository, GradeLevelRepository>();
            services.AddScoped<ICourseCategoryRepository, CourseCategoryRepository>();
            services.AddScoped<ILoginSessionRepository, LoginSessionRepository>();
            services.AddScoped<ITermRepository, TermRepository>();
            services.AddScoped<IClassRepository, ClassRepository>();
            services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
            services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
            services.AddScoped<IClientContext, ClientContext>();
            services.AddScoped<ISectionRepository, SectionRepository>();
            services.AddScoped<ILessonRepository, LessonRepository>();
            services.AddScoped<IFileTextExtractor, FileTextExtractor>();
            services.AddScoped<ICourseAiService, CourseAiService>();
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddScoped<IEnrollmentRepository, EnrollmentRepository>();
            services.AddScoped<IQuizRepository, QuizRepository>();
            services.AddScoped<IQuizAttemptRepository, QuizAttemptRepository>();
            services.AddScoped<ITeacherAssignmentRepository, TeacherAssignmentRepository>();
            services.AddScoped<INotificationRepository, NotificationRepository>();
            services.AddScoped<IAssignmentRepository, AssignmentRepository>();
            services.AddScoped<ISubmissionRepository, SubmissionRepository>();
            services.AddScoped<ILessonBlockRepository, LessonBlockRepository>();
            services.AddScoped<ILessonFaqRepository, LessonFaqRepository>();
            services.AddScoped<IAilogRepository, AilogRepository>();
            services.AddScoped<ILessonAiService, LessonAiService>();
            services.AddScoped<IStudentRepository, StudentRepository>();
            services.AddScoped<ILessonProgressRepository, LessonProgressRepository>();
            // 3. Auth Token Repositories
            services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();
            services.AddScoped<IEmailVerificationTokenRepository, EmailVerificationTokenRepository>();
            // 4. Google OAuth
            services.AddScoped<IGoogleTokenVerifier, GoogleTokenVerifier>();
            // 5. Services khác (nếu có)
            services.Configure<GeminiSettings>(
                    configuration.GetSection("Gemini"));

            // 6. File Storage (Cloudinary)
            services.Configure<CloudinarySettings>(
                    configuration.GetSection("Cloudinary"));
            services.AddScoped<IFileStorageService, CloudinaryFileStorageService>();

            // 7. HttpClient + Polly Resilience cho AI Services
            services.AddHttpClient<ICourseAiService, CourseAiService>();

            // ===== LessonAiService: Retry 3 lần + Circuit Breaker =====
            services.AddHttpClient<ILessonAiService, LessonAiService>()
                .AddPolicyHandler(GetRetryPolicy())
                .AddPolicyHandler(GetCircuitBreakerPolicy());

            // 8. MemoryCache cho AI Preview
            services.AddMemoryCache();
            services.AddSingleton<IAiPreviewCacheService, AiPreviewCacheService>();

            // services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IExcelUserParser, ExcelUserParser>();
            services.AddScoped<IEmailService, EmailService>();

            services.AddHttpContextAccessor();
            services.AddScoped<IClientContext, ClientContext>();
            services.Configure<JwtSettings>(
                    configuration.GetSection("Jwt"));

            services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
            return services;
        }

        /// <summary>
        /// Retry Policy: 3 lần, exponential backoff (1s → 2s → 4s).
        /// Chỉ retry cho transient errors (5xx, 408, network errors).
        /// </summary>
        private static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
        {
            return HttpPolicyExtensions
                .HandleTransientHttpError() // 5xx, 408, HttpRequestException
                .OrResult(msg => msg.StatusCode == System.Net.HttpStatusCode.TooManyRequests) // 429
                .WaitAndRetryAsync(
                    retryCount: 3,
                    sleepDurationProvider: retryAttempt =>
                        TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)), // 2s, 4s, 8s
                    onRetry: (outcome, timespan, retryAttempt, context) =>
                    {
                        // Log sẽ tự hiển thị qua ILogger nếu cấu hình Polly logging
                        Console.WriteLine(
                            $"[Polly] 🔄 Retry #{retryAttempt} sau {timespan.TotalSeconds}s " +
                            $"• Status: {outcome.Result?.StatusCode} " +
                            $"• Error: {outcome.Exception?.Message}");
                    });
        }

        /// <summary>
        /// Circuit Breaker: mở circuit sau 5 lỗi liên tiếp, break 30s.
        /// Ngăn chặn cascade failure khi Gemini API sập.
        /// </summary>
        private static IAsyncPolicy<HttpResponseMessage> GetCircuitBreakerPolicy()
        {
            return HttpPolicyExtensions
                .HandleTransientHttpError()
                .CircuitBreakerAsync(
                    handledEventsAllowedBeforeBreaking: 5,
                    durationOfBreak: TimeSpan.FromSeconds(30),
                    onBreak: (outcome, breakDelay) =>
                    {
                        Console.WriteLine(
                            $"[Polly] 🔴 Circuit OPEN – break {breakDelay.TotalSeconds}s " +
                            $"• Status: {outcome.Result?.StatusCode} " +
                            $"• Error: {outcome.Exception?.Message}");
                    },
                    onReset: () =>
                    {
                        Console.WriteLine("[Polly] 🟢 Circuit CLOSED – Gemini API hoạt động lại");
                    },
                    onHalfOpen: () =>
                    {
                        Console.WriteLine("[Polly] 🟡 Circuit HALF-OPEN – đang test lại Gemini API...");
                    });
        }
    }
}
