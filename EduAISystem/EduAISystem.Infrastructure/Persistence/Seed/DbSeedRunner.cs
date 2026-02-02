using EduAISystem.Infrastructure.Persistence.Context;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Infrastructure.Persistence.Seed
{
    public static class DbSeedRunner
    {
        public static async Task RunAsync(
        IServiceProvider services,
        IWebHostEnvironment env,
        int retryCount = 10)
        {
            using var scope = services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<EduAiDbV5Context>();
            var logger = scope.ServiceProvider
                .GetRequiredService<ILoggerFactory>()
                .CreateLogger("DbSeed");

            //  Wait DB ready
            for (int i = 1; i <= retryCount; i++)
            {
                try
                {
                    await context.Database.OpenConnectionAsync();
                    await context.Database.CloseConnectionAsync();
                    break;
                }
                catch
                {
                    logger.LogWarning("DB not ready, retry {Attempt}", i);
                    await Task.Delay(3000);
                }
            }

            //  CHỈ DEV mới seed user test
            if (env.IsDevelopment())
            {
                var devSeeder = new DevUserSeeder();
                await devSeeder.SeedAsync(context);
            }

            logger.LogInformation("✅ Database seed completed");
        }
    }
}
