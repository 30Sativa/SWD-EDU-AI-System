using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Domain.Entities;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class TermRepository : ITermRepository
    {
        private readonly EduAiDbV5Context _context;

        public TermRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        public async Task<PagedResult<TermDomain>> GetTermsPagedAsync(
            int page,
            int pageSize,
            string? searchTerm,
            bool? isActiveFilter,
            DateOnly? fromStartDate,
            DateOnly? toEndDate,
            CancellationToken cancellationToken = default)
        {
            var query = _context.Terms.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.Trim();
                query = query.Where(t => t.Code.Contains(term) || t.Name.Contains(term));
            }

            if (isActiveFilter.HasValue)
            {
                query = query.Where(t => (t.IsActive ?? true) == isActiveFilter.Value);
            }

            if (fromStartDate.HasValue)
            {
                query = query.Where(t => t.StartDate >= fromStartDate.Value);
            }

            if (toEndDate.HasValue)
            {
                query = query.Where(t => t.EndDate <= toEndDate.Value);
            }

            // Sort newest first (common for admin screens)
            query = query.OrderByDescending(t => t.CreatedAt).ThenByDescending(t => t.StartDate);

            var totalCount = await query.CountAsync(cancellationToken);

            var entities = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var items = entities.Select(MapToDomain).ToList();

            return new PagedResult<TermDomain>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<TermDomain?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Terms
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

            return entity == null ? null : MapToDomain(entity);
        }

        public async Task<bool> CodeExistsAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default)
        {
            var query = _context.Terms
                .AsNoTracking()
                .Where(t => t.Code == code);

            if (excludeId.HasValue)
            {
                query = query.Where(t => t.Id != excludeId.Value);
            }

            return await query.AnyAsync(cancellationToken);
        }

        public async Task AddAsync(TermDomain term, CancellationToken cancellationToken = default)
        {
            var entity = new Term
            {
                Id = term.Id,
                Code = term.Code,
                Name = term.Name,
                StartDate = term.StartDate,
                EndDate = term.EndDate,
                IsActive = term.IsActive,
                CreatedAt = term.CreatedAt
            };

            _context.Terms.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task UpdateAsync(TermDomain term, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Terms
                .FirstOrDefaultAsync(t => t.Id == term.Id, cancellationToken);

            if (entity == null)
                return;

            entity.Name = term.Name;
            entity.StartDate = term.StartDate;
            entity.EndDate = term.EndDate;
            entity.IsActive = term.IsActive;

            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<bool> SetActiveStatusAsync(Guid id, bool isActive, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Terms
                .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

            if (entity == null)
                return false;

            entity.IsActive = isActive;
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Terms
                .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

            if (entity == null)
                return false;

            var hasAnyClass = await _context.Classes
                .AsNoTracking()
                .AnyAsync(c => c.TermId == id, cancellationToken);

            if (hasAnyClass)
            {
                // Caller should convert to ConflictException in handler layer
                throw new InvalidOperationException("Không thể xóa kỳ học vì còn lớp học đang thuộc kỳ học này.");
            }

            _context.Terms.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        private static TermDomain MapToDomain(Term t)
        {
            return TermDomain.Load(
                t.Id,
                t.Code,
                t.Name,
                t.StartDate,
                t.EndDate,
                t.IsActive ?? true,
                t.CreatedAt ?? DateTime.UtcNow);
        }
    }
}

