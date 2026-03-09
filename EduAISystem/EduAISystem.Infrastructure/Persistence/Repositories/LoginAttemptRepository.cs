using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Domain.Entities;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class LoginAttemptRepository : ILoginAttemptRepository
    {
        private readonly EduAiDbV5Context _context;

        public LoginAttemptRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        public async Task AddAsync(LoginAttemptDomain loginAttempt)
        {
            var entity = new LoginAttempt
            {
                Id = loginAttempt.Id,
                Email = loginAttempt.Email,
                UserId = loginAttempt.UserId,
                IpAddress = loginAttempt.IpAddress,
                IsSuccess = loginAttempt.IsSuccess,
                FailureReason = loginAttempt.FailureReason,
                AttemptAt = loginAttempt.AttemptAt
            };
            _context.LoginAttempts.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<int> CountRecentFailedAttemptsAsync(string email, TimeSpan timeWindow)
        {
            var thresholdTime = DateTime.UtcNow.Subtract(timeWindow);
            return await _context.LoginAttempts
                .Where(x => x.Email == email && !x.IsSuccess && x.AttemptAt >= thresholdTime)
                .CountAsync();
        }

        public async Task ClearFailedAttemptsAsync(string email)
        {
            var failedAttempts = await _context.LoginAttempts
                .Where(x => x.Email == email && !x.IsSuccess)
                .ToListAsync();

            if (failedAttempts.Any())
            {
                _context.LoginAttempts.RemoveRange(failedAttempts);
                await _context.SaveChangesAsync();
            }
        }
    }
}
