using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Domain.Entities;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class ClassRepository : IClassRepository
    {
        private readonly EduAiDbV5Context _context;

        public ClassRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        public async Task<PagedResult<ClassDomain>> GetClassesPagedAsync(
            int page,
            int pageSize,
            string? searchTerm,
            bool? isActiveFilter,
            Guid? termId,
            Guid? teacherId,
            Guid? gradeLevelId,
            CancellationToken cancellationToken = default)
        {
            var query = _context.Classes.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.Trim();
                query = query.Where(c => c.Code.Contains(term) || c.Name.Contains(term));
            }

            if (isActiveFilter.HasValue)
            {
                query = query.Where(c => (c.IsActive ?? true) == isActiveFilter.Value);
            }

            if (termId.HasValue)
            {
                query = query.Where(c => c.TermId == termId.Value);
            }

            if (teacherId.HasValue)
            {
                query = query.Where(c => c.TeacherId == teacherId.Value);
            }

            if (gradeLevelId.HasValue)
            {
                query = query.Where(c => c.GradeLevelId == gradeLevelId.Value);
            }

            query = query.OrderByDescending(c => c.CreatedAt).ThenBy(c => c.Name);

            var totalCount = await query.CountAsync(cancellationToken);

            var entities = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var items = entities.Select(MapToDomain).ToList();

            return new PagedResult<ClassDomain>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<ClassDomain?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Classes
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

            return entity == null ? null : MapToDomain(entity);
        }

        public async Task<bool> CodeExistsAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default)
        {
            var query = _context.Classes
                .AsNoTracking()
                .Where(c => c.Code == code);

            if (excludeId.HasValue)
            {
                query = query.Where(c => c.Id != excludeId.Value);
            }

            return await query.AnyAsync(cancellationToken);
        }

        public async Task AddAsync(ClassDomain classEntity, CancellationToken cancellationToken = default)
        {
            var entity = new Class
            {
                Id = classEntity.Id,
                Code = classEntity.Code,
                Name = classEntity.Name,
                Description = classEntity.Description,
                TeacherId = classEntity.TeacherId,
                TermId = classEntity.TermId,
                GradeLevelId = classEntity.GradeLevelId,
                MaxStudents = classEntity.MaxStudents,
                CurrentStudents = classEntity.CurrentStudents,
                IsActive = classEntity.IsActive,
                CreatedAt = classEntity.CreatedAt,
                UpdatedAt = classEntity.UpdatedAt
            };

            _context.Classes.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task UpdateAsync(ClassDomain classEntity, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Classes
                .FirstOrDefaultAsync(c => c.Id == classEntity.Id, cancellationToken);

            if (entity == null)
                return;

            entity.Name = classEntity.Name;
            entity.Description = classEntity.Description;
            entity.TeacherId = classEntity.TeacherId;
            entity.TermId = classEntity.TermId;
            entity.GradeLevelId = classEntity.GradeLevelId;
            entity.MaxStudents = classEntity.MaxStudents;
            entity.IsActive = classEntity.IsActive;
            entity.UpdatedAt = classEntity.UpdatedAt ?? DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<bool> SetActiveStatusAsync(Guid id, bool isActive, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Classes
                .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

            if (entity == null)
                return false;

            entity.IsActive = isActive;
            entity.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Classes
                .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

            if (entity == null)
                return false;

            var hasStudents = await _context.StudentClasses
                .AsNoTracking()
                .AnyAsync(sc => sc.ClassId == id, cancellationToken);

            if (hasStudents)
            {
                throw new InvalidOperationException("Không thể xóa lớp vì lớp đang có học sinh.");
            }

            var hasCourseBindings = await _context.CourseClasses
                .AsNoTracking()
                .AnyAsync(cc => cc.ClassId == id, cancellationToken);

            if (hasCourseBindings)
            {
                throw new InvalidOperationException("Không thể xóa lớp vì lớp đang được gán vào khóa học.");
            }

            _context.Classes.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        private static ClassDomain MapToDomain(Class c)
        {
            return ClassDomain.Load(
                c.Id,
                c.Code,
                c.Name,
                c.Description,
                c.TeacherId,
                c.TermId,
                c.GradeLevelId,
                c.MaxStudents ?? 50,
                c.CurrentStudents ?? 0,
                c.IsActive ?? true,
                c.CreatedAt ?? DateTime.UtcNow,
                c.UpdatedAt);
        }
    }
}

