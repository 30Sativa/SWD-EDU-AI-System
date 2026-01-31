using EduAISystem.Domain.Enums;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Infrastructure.Persistence.Seed
{
    public static class DbSeed
    {
        public static async Task SeedAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<EduAiDbV5Context>();

            // =========================
            // SEED USER
            // =========================
            if (!context.Users.Any(u => u.Email == "admin@gmail.com"))
            {
                context.Users.Add(new User
                {
                    UserName = "admin",
                    Email = "admin@gmail.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    Role = (int)UserRoleDomain.Admin   
                });
            }

            if (!context.Users.Any(u => u.Email == "user@gmail.com"))
            {
                context.Users.Add(new User
                {
                    UserName = "user",
                    Email = "user@gmail.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    Role = (int)UserRoleDomain.User
                });
            }

            if (!context.Users.Any(u => u.Email == "manager@gmail.com"))
            {
                context.Users.Add(new User
                {
                    UserName = "manager",
                    Email = "manager@gmail.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    Role = (int)UserRoleDomain.Manager
                });
            }

            await context.SaveChangesAsync();


        }
    }

}