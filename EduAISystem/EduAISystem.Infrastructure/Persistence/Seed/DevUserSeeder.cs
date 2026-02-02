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
                "user@gmail.com",
                "user",
                "123456",
                UserRoleDomain.User);

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

            context.Users.Add(new User
            {
                UserName = userName,
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                Role = (int)role
            });

            await context.SaveChangesAsync();
        }
    }
}
