using EduAISystem.Domain.Enums;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Infrastructure.Persistence.Seed
{
    public class DevUserSeeder : IMasterSeeder
    {
        public async Task SeedAsync(EduAiDbV5Context context)
        {
            await SeedUserAsync(
                context,
                "admin@gmail.com",
                "admin",
                "123456",
                UserRoleDomain.Admin);

            await SeedUserAsync(
                context,
                "student@gmail.com",
                "student",
                "123456",
                UserRoleDomain.Student);

            await SeedUserAsync(
                context,
                "manager@gmail.com",
                "manager",
                "123456",
                UserRoleDomain.Manager);
        }

        private static async Task SeedUserAsync(
            EduAiDbV5Context context,
            string email,
            string userName,
            string password,
            UserRoleDomain role)
        {
            if (await context.Users.AnyAsync(u => u.Email == email))
                return;

            var userId = Guid.NewGuid();
            context.Users.Add(new User
            {
                Id = userId,
                UserName = userName,
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                Role = (int)role
            });

            if (role == UserRoleDomain.Student)
            {
                context.Students.Add(new Student
                {
                    UserId = userId,
                    StudentCode = "STU" + Guid.NewGuid().ToString("N")[..17],
                    EnrollmentDate = DateTime.UtcNow
                });
            }
            else if (role == UserRoleDomain.Teacher)
            {
                context.Teachers.Add(new Teacher { UserId = userId });
            }

            await context.SaveChangesAsync();
        }
    }
}
