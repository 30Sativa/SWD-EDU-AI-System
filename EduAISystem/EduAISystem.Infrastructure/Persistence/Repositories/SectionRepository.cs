using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Domain.Entities;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class SectionRepository : ISectionRepository
    {
        private readonly EduAiDbV5Context _dbContext;

        public SectionRepository(EduAiDbV5Context dbContext)
        {
            _dbContext = dbContext;
        }
        public Task AddAsync(SectionDomain section, CancellationToken cancellationToken = default)
        {
            var entity = new Section
            {
                Id = section.Id,
                CourseId = section.CourseId,
                Title = section.Title,
                Description = section.Description,
                SortOrder = section.SortOrder,
                IsActive = section.IsActive,
                CreatedAt = section.CreatedAt,
                UpdatedAt = section.UpdatedAt
            };
            _dbContext.Sections.Add(entity);
            return _dbContext.SaveChangesAsync(cancellationToken);
        }

        public Task DeleteAsync(SectionDomain section)
        {
            throw new NotImplementedException();
        }

        public async Task<List<SectionDomain>> GetByCourseIdAsync(Guid courseId)
        {
            var entities = await _dbContext.Sections
           .AsNoTracking()
           .Where(x => x.CourseId == courseId)
           .OrderBy(x => x.SortOrder)
           .ToListAsync();
            return entities.Select(entity => new SectionDomain(
                entity.Id,
                entity.CourseId,
                entity.Title,
                entity.Description,
                entity.SortOrder,
                entity.IsActive ?? true,
                entity.CreatedAt ?? DateTime.UtcNow,
                entity.UpdatedAt ?? DateTime.UtcNow
                )).ToList();
        }

        public async Task<SectionDomain?> GetByIdAsync(Guid id)
        {
            var entity = await _dbContext.Sections
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

            if (entity == null)
                return null;
            return new SectionDomain(
                entity.Id,
                entity.CourseId,
                entity.Title,
                entity.Description,
                entity.SortOrder,
                entity.IsActive ?? true,
                entity.CreatedAt ?? DateTime.UtcNow,
                entity.UpdatedAt ?? DateTime.UtcNow
                );
        }

        public async Task UpdateAsync(SectionDomain section)
        {
            var entity = await _dbContext.Sections
            .FirstOrDefaultAsync(x => x.Id == section.Id);

            if (entity == null)
                throw new Exception("Section không tồn tại");

            entity.Title = section.Title;
            entity.Description = section.Description;
            entity.SortOrder = section.SortOrder;
            entity.IsActive = section.IsActive;
            entity.UpdatedAt = section.UpdatedAt;

            await _dbContext.SaveChangesAsync();
        }
    }
}
