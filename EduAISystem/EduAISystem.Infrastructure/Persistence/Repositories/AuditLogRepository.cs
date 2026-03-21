using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Domain.Entities;
using EduAISystem.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class AuditLogRepository : IAuditLogRepository
    {
        private readonly EduAiDbV5Context _context;

        public AuditLogRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        public async Task<(List<AuditLogDomain> Items, int TotalCount)> GetPagedListAsync(
            int pageNumber, 
            int pageSize, 
            string? action, 
            string? entity, 
            Guid? userId, 
            CancellationToken cancellationToken = default)
        {
            var query = _context.AuditLogs
                .Include(x => x.User)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(action))
                query = query.Where(x => x.Action.Contains(action));

            if (!string.IsNullOrWhiteSpace(entity))
                query = query.Where(x => x.Entity == entity);

            if (userId != null)
                query = query.Where(x => x.UserId == userId);

            int totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new AuditLogDomain
                {
                    Id = x.Id,
                    UserId = x.UserId,
                    Action = x.Action,
                    Entity = x.Entity,
                    EntityId = x.EntityId,
                    OldValues = x.OldValues,
                    NewValues = x.NewValues,
                    IpAddress = x.IpAddress,
                    UserAgent = x.UserAgent,
                    CreatedAt = x.CreatedAt,
                    UserEmail = x.User != null ? x.User.Email : "N/A"
                })
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }

        public async Task<List<AuditLogDomain>> GetRecentAsync(int count, CancellationToken cancellationToken = default)
        {
            return await _context.AuditLogs
                .Include(x => x.User)
                .OrderByDescending(x => x.CreatedAt)
                .Take(count)
                .Select(x => new AuditLogDomain
                {
                    Id = x.Id,
                    UserId = x.UserId,
                    Action = x.Action,
                    Entity = x.Entity,
                    EntityId = x.EntityId,
                    OldValues = x.OldValues,
                    NewValues = x.NewValues,
                    IpAddress = x.IpAddress,
                    UserAgent = x.UserAgent,
                    CreatedAt = x.CreatedAt,
                    UserEmail = x.User != null ? x.User.Email : "N/A"
                })
                .ToListAsync(cancellationToken);
        }
    }
}
