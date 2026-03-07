using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Domain.Entities;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class AilogRepository : IAilogRepository
    {
        private readonly EduAiDbV5Context _context;

        public AilogRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        public async Task AddAsync(AilogDomain logDomain, CancellationToken cancellationToken = default)
        {
            var entity = new Ailog
            {
                Id = logDomain.Id == Guid.Empty ? Guid.NewGuid() : logDomain.Id,
                UserId = logDomain.UserId,
                Feature = logDomain.Feature,
                InputText = logDomain.InputText,
                OutputText = logDomain.OutputText,
                TokensUsed = logDomain.TokensUsed,
                Cost = logDomain.Cost,
                CreatedAt = logDomain.CreatedAt ?? DateTime.UtcNow
            };

            await _context.Ailogs.AddAsync(entity, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<int> GetTotalCallsAsync(DateTime? from, DateTime? to, CancellationToken ct = default)
        {
            var query = ApplyDateFilter(_context.Ailogs.AsQueryable(), from, to);
            return await query.CountAsync(ct);
        }

        public async Task<int> GetTotalTokensAsync(DateTime? from, DateTime? to, CancellationToken ct = default)
        {
            var query = ApplyDateFilter(_context.Ailogs.AsQueryable(), from, to);
            return await query.SumAsync(x => x.TokensUsed ?? 0, ct);
        }

        public async Task<decimal> GetTotalCostAsync(DateTime? from, DateTime? to, CancellationToken ct = default)
        {
            var query = ApplyDateFilter(_context.Ailogs.AsQueryable(), from, to);
            return await query.SumAsync(x => x.Cost ?? 0m, ct);
        }

        public async Task<List<AiFeatureStatsDto>> GetStatsByFeatureAsync(DateTime? from, DateTime? to, CancellationToken ct = default)
        {
            var query = ApplyDateFilter(_context.Ailogs.AsQueryable(), from, to);

            return await query
                .GroupBy(x => x.Feature)
                .Select(g => new AiFeatureStatsDto
                {
                    Feature = g.Key ?? "Unknown",
                    TotalCalls = g.Count(),
                    TotalTokens = g.Sum(x => x.TokensUsed ?? 0),
                    TotalCost = g.Sum(x => x.Cost ?? 0m),
                    AvgTokensPerCall = g.Count() > 0
                        ? (decimal)g.Sum(x => x.TokensUsed ?? 0) / g.Count()
                        : 0
                })
                .OrderByDescending(x => x.TotalCalls)
                .ToListAsync(ct);
        }

        public async Task<List<AiDailyStatsDto>> GetDailyStatsAsync(DateTime? from, DateTime? to, CancellationToken ct = default)
        {
            var query = ApplyDateFilter(_context.Ailogs.AsQueryable(), from, to);

            return await query
                .GroupBy(x => x.CreatedAt!.Value.Date)
                .Select(g => new AiDailyStatsDto
                {
                    Date = g.Key,
                    TotalCalls = g.Count(),
                    TotalTokens = g.Sum(x => x.TokensUsed ?? 0),
                    TotalCost = g.Sum(x => x.Cost ?? 0m)
                })
                .OrderBy(x => x.Date)
                .ToListAsync(ct);
        }

        public async Task<(List<AilogDomain> Items, int TotalCount)> GetLogsPagedAsync(
            int page, int pageSize, string? feature, CancellationToken ct = default)
        {
            var query = _context.Ailogs.AsQueryable();

            if (!string.IsNullOrEmpty(feature))
                query = query.Where(x => x.Feature == feature);

            var totalCount = await query.CountAsync(ct);

            var items = await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new AilogDomain
                {
                    Id = x.Id,
                    UserId = x.UserId,
                    Feature = x.Feature,
                    InputText = x.InputText,
                    OutputText = x.OutputText,
                    TokensUsed = x.TokensUsed,
                    Cost = x.Cost,
                    CreatedAt = x.CreatedAt
                })
                .ToListAsync(ct);

            return (items, totalCount);
        }

        private static IQueryable<Ailog> ApplyDateFilter(IQueryable<Ailog> query, DateTime? from, DateTime? to)
        {
            if (from.HasValue)
                query = query.Where(x => x.CreatedAt >= from.Value);
            if (to.HasValue)
                query = query.Where(x => x.CreatedAt <= to.Value);
            return query;
        }
    }
}
