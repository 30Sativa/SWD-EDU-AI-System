using EduAISystem.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
                    configuration.GetConnectionString("DBDefault")));

            // 2. Repository
            //services.AddScoped<IUserRepository, UserRepository>();
            //services.AddScoped<ICourseRepository, CourseRepository>();

            // 3. Services khác (nếu có)
            // services.AddScoped<IEmailService, EmailService>();

            return services;
        }
    }
}
