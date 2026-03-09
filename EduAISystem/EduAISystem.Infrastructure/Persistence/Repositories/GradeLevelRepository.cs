using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Domain.Entities;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class GradeLevelRepository : IGradeLevelRepository
    {
        private readonly EduAiDbV5Context _context;

        public GradeLevelRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        public async Task<PagedResult<GradeLevelDomain>> GetGradeLevelsPagedAsync(
            int page,
            int pageSize,
            string? searchTerm,
            bool? isActiveFilter,
            CancellationToken cancellationToken = default)
        {
            var query = _context.GradeLevels.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.Trim();
                query = query.Where(g => g.Code.Contains(term) || g.Name.Contains(term));
            }

            if (isActiveFilter.HasValue)
            {
                query = query.Where(g => (g.IsActive ?? true) == isActiveFilter.Value);
            }

            query = query.OrderBy(g => g.SortOrder).ThenBy(g => g.Name);

            var totalCount = await query.CountAsync(cancellationToken);

            var entities = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var items = entities.Select(MapToDomain).ToList();

            return new PagedResult<GradeLevelDomain>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<GradeLevelDomain?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _context.GradeLevels
                .AsNoTracking()
                .FirstOrDefaultAsync(g => g.Id == id, cancellationToken);

            return entity == null ? null : MapToDomain(entity);
        }

        public async Task<bool> CodeExistsAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default)
        {
            var query = _context.GradeLevels
                .AsNoTracking()
                .Where(g => g.Code == code);

            if (excludeId.HasValue)
            {
                query = query.Where(g => g.Id != excludeId.Value);
            }

            return await query.AnyAsync(cancellationToken);
        }

        public async Task AddAsync(GradeLevelDomain gradeLevel, CancellationToken cancellationToken = default)
        {
            var entity = new GradeLevel
            {
                Id = gradeLevel.Id,
                Code = gradeLevel.Code,
                Name = gradeLevel.Name,
                SortOrder = gradeLevel.SortOrder,
                IsActive = gradeLevel.IsActive,
                CreatedAt = gradeLevel.CreatedAt
            };

            _context.GradeLevels.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task UpdateAsync(GradeLevelDomain gradeLevel, CancellationToken cancellationToken = default)
        {
            var entity = await _context.GradeLevels
                .FirstOrDefaultAsync(g => g.Id == gradeLevel.Id, cancellationToken);

            if (entity == null)
                return;

            entity.Name = gradeLevel.Name;
            entity.SortOrder = gradeLevel.SortOrder;
            entity.IsActive = gradeLevel.IsActive;

            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<bool> SetActiveStatusAsync(Guid id, bool isActive, CancellationToken cancellationToken = default)
        {
            var entity = await _context.GradeLevels
                .FirstOrDefaultAsync(g => g.Id == id, cancellationToken);

            if (entity == null)
                return false;

            entity.IsActive = isActive;
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        private static GradeLevelDomain MapToDomain(GradeLevel g)
        {
            return GradeLevelDomain.Load(
                g.Id,
                g.Code,
                g.Name,
                g.SortOrder,
                g.IsActive ?? true,
                g.CreatedAt ?? DateTime.UtcNow);
        }
    }
}

