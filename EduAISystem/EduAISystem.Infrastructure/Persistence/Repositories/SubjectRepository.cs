using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Domain.Entities;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class SubjectRepository : ISubjectRepository
    {
        private readonly EduAiDbV5Context _context;

        public SubjectRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        public async Task<PagedResult<SubjectDomain>> GetSubjectsPagedAsync(
            int page,
            int pageSize,
            string? searchTerm,
            bool? isActiveFilter,
            CancellationToken cancellationToken = default)
        {
            var query = _context.Subjects
                .AsNoTracking()
                .Where(s => s.DeletedAt == null);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.Trim();
                query = query.Where(s =>
                    s.Code.Contains(term) ||
                    s.Name.Contains(term) ||
                    (s.NameEn != null && s.NameEn.Contains(term)));
            }

            if (isActiveFilter.HasValue)
            {
                query = query.Where(s => s.IsActive == isActiveFilter.Value);
            }

            query = query.OrderBy(s => s.SortOrder).ThenBy(s => s.Name);

            var totalCount = await query.CountAsync(cancellationToken);

            var entities = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var items = entities.Select(MapToDomain).ToList();

            return new PagedResult<SubjectDomain>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<SubjectDomain?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Subjects
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id && s.DeletedAt == null, cancellationToken);

            return entity == null ? null : MapToDomain(entity);
        }

        public async Task<bool> CodeExistsAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default)
        {
            var query = _context.Subjects
                .AsNoTracking()
                .Where(s => s.Code == code && s.DeletedAt == null);

            if (excludeId.HasValue)
            {
                query = query.Where(s => s.Id != excludeId.Value);
            }

            return await query.AnyAsync(cancellationToken);
        }

        public async Task AddAsync(SubjectDomain subject, CancellationToken cancellationToken = default)
        {
            var entity = new Subject
            {
                Id = subject.Id,
                Code = subject.Code,
                Name = subject.Name,
                NameEn = subject.NameEn,
                Description = subject.Description,
                IconUrl = subject.IconUrl,
                Color = subject.Color,
                SortOrder = subject.SortOrder,
                IsActive = subject.IsActive
            };

            _context.Subjects.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task UpdateAsync(SubjectDomain subject, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Subjects
                .FirstOrDefaultAsync(s => s.Id == subject.Id && s.DeletedAt == null, cancellationToken);

            if (entity == null)
                return;

            entity.Name = subject.Name;
            entity.NameEn = subject.NameEn;
            entity.Description = subject.Description;
            entity.IconUrl = subject.IconUrl;
            entity.Color = subject.Color;
            entity.SortOrder = subject.SortOrder;
            entity.IsActive = subject.IsActive;

            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<bool> SetActiveStatusAsync(Guid id, bool isActive, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Subjects
                .FirstOrDefaultAsync(s => s.Id == id && s.DeletedAt == null, cancellationToken);

            if (entity == null)
                return false;

            entity.IsActive = isActive;
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        private static SubjectDomain MapToDomain(Subject s)
        {
            return SubjectDomain.Load(
                s.Id,
                s.Code,
                s.Name,
                s.NameEn,
                s.Description,
                s.IconUrl,
                s.Color,
                s.SortOrder ?? 0,
                s.IsActive ?? true);
        }
    }
}

