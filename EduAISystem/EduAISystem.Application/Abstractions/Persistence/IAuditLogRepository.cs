using EduAISystem.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface IAuditLogRepository
    {
        Task<(List<AuditLogDomain> Items, int TotalCount)> GetPagedListAsync(
            int pageNumber, 
            int pageSize, 
            string? action, 
            string? entity, 
            Guid? userId, 
            CancellationToken cancellationToken = default);

        Task<List<AuditLogDomain>> GetRecentAsync(int count, CancellationToken cancellationToken = default);
    }
}
