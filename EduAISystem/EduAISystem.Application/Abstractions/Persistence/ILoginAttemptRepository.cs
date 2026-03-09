using EduAISystem.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface ILoginAttemptRepository
    {
        Task AddAsync(LoginAttemptDomain loginAttempt);
        Task<int> CountRecentFailedAttemptsAsync(string email, TimeSpan timeWindow);
        Task ClearFailedAttemptsAsync(string email);
    }
}
