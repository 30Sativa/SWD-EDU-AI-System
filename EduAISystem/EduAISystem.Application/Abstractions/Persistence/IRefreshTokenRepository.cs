using EduAISystem.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface IRefreshTokenRepository
    {
        Task AddAsync(RefreshTokenDomain token);
        Task<RefreshTokenDomain?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
        Task UpdateAsync(RefreshTokenDomain token);
    }
}
