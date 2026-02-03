using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Domain.Entities;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class CourseCategoryRepository : ICourseCategoryRepository
    {
        private readonly EduAiDbV5Context _context;

        public CourseCategoryRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        public async Task<PagedResult<CourseCategoryDomain>> GetCourseCategoriesPagedAsync(
            int page,
            int pageSize,
            string? searchTerm,
            bool? isActiveFilter,
            Guid? parentIdFilter,
            CancellationToken cancellationToken = default)
        {
            var query = _context.CourseCategories
                .AsNoTracking()
                .Include(c => c.Parent)
                .Where(c => c.DeletedAt == null);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.Trim();
                query = query.Where(c =>
                    c.Name.Contains(term) ||
                    c.Slug.Contains(term) ||
                    (c.Description != null && c.Description.Contains(term)));
            }

            if (isActiveFilter.HasValue)
            {
                query = query.Where(c => (c.IsActive ?? true) == isActiveFilter.Value);
            }

            if (parentIdFilter.HasValue)
            {
                query = query.Where(c => c.ParentId == parentIdFilter.Value);
            }

            query = query
                .OrderBy(c => c.SortOrder ?? 0)
                .ThenBy(c => c.Name);

            var totalCount = await query.CountAsync(cancellationToken);

            var entities = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var items = entities.Select(MapToDomain).ToList();

            return new PagedResult<CourseCategoryDomain>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<CourseCategoryDomain?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _context.CourseCategories
                .AsNoTracking()
                .Include(c => c.Parent)
                .FirstOrDefaultAsync(c => c.Id == id && c.DeletedAt == null, cancellationToken);

            return entity == null ? null : MapToDomain(entity);
        }

        public async Task<bool> SlugExistsAsync(string slug, Guid? excludeId = null, CancellationToken cancellationToken = default)
        {
            var query = _context.CourseCategories
                .AsNoTracking()
                .Where(c => c.Slug == slug && c.DeletedAt == null);

            if (excludeId.HasValue)
            {
                query = query.Where(c => c.Id != excludeId.Value);
            }

            return await query.AnyAsync(cancellationToken);
        }

        public async Task AddAsync(CourseCategoryDomain category, CancellationToken cancellationToken = default)
        {
            var entity = new CourseCategory
            {
                Id = category.Id,
                Name = category.Name,
                Slug = category.Slug,
                Description = category.Description,
                ParentId = category.ParentId,
                IconUrl = category.IconUrl,
                SortOrder = category.SortOrder,
                IsActive = category.IsActive,
                CreatedAt = category.CreatedAt,
                UpdatedAt = category.UpdatedAt,
                DeletedAt = category.DeletedAt
            };

            _context.CourseCategories.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task UpdateAsync(CourseCategoryDomain category, CancellationToken cancellationToken = default)
        {
            var entity = await _context.CourseCategories
                .FirstOrDefaultAsync(c => c.Id == category.Id && c.DeletedAt == null, cancellationToken);

            if (entity == null)
                return;

            entity.Name = category.Name;
            entity.Slug = category.Slug;
            entity.Description = category.Description;
            entity.ParentId = category.ParentId;
            entity.IconUrl = category.IconUrl;
            entity.SortOrder = category.SortOrder;
            entity.IsActive = category.IsActive;
            entity.UpdatedAt = category.UpdatedAt;

            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<bool> SetActiveStatusAsync(Guid id, bool isActive, CancellationToken cancellationToken = default)
        {
            var entity = await _context.CourseCategories
                .FirstOrDefaultAsync(c => c.Id == id && c.DeletedAt == null, cancellationToken);

            if (entity == null)
                return false;

            entity.IsActive = isActive;
            entity.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        private static CourseCategoryDomain MapToDomain(CourseCategory c)
        {
            return CourseCategoryDomain.Load(
                c.Id,
                c.Name,
                c.Slug,
                c.Description,
                c.ParentId,
                c.Parent?.Name,
                c.IconUrl,
                c.SortOrder ?? 0,
                c.IsActive ?? true,
                c.CreatedAt ?? DateTime.UtcNow,
                c.UpdatedAt,
                c.DeletedAt);
        }
    }
}

