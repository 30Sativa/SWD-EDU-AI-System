using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Infrastructure.Services.FileStorage;
using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Repositories;
using EduAISystem.Infrastructure.Security;
using EduAISystem.Infrastructure.Services.Email;
using EduAISystem.Infrastructure.Services.Excel;
using EduAISystem.Infrastructure.Services.ExternalApis;
using EduAISystem.Infrastructure.Services.FileStorage;
using EduAISystem.Infrastructure.Services.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;


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

            services.AddHttpClient<ICourseAiService, CourseAiService>();
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
    }
}
