using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Domain.Entities;
using EduAISystem.Domain.Enums;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class LessonRepository : ILessonRepository
    {
        private readonly EduAiDbV5Context _dbContext;

        public LessonRepository(EduAiDbV5Context dbContext)
        {
            _dbContext = dbContext;
        }

        // =========================
        // ADD
        // =========================
        public async Task AddAsync(LessonDomain lesson)
        {
            var entity = MapToEntity(lesson);

            _dbContext.Lessons.Add(entity);
            await _dbContext.SaveChangesAsync();
        }

        // =========================
        // ADD RANGE
        // =========================
        public async Task AddRangeAsync(
            IEnumerable<LessonDomain> lessons,
            CancellationToken cancellation = default)
        {
            var entities = lessons.Select(MapToEntity).ToList();

            await _dbContext.Lessons.AddRangeAsync(entities, cancellation);
            await _dbContext.SaveChangesAsync(cancellation);
        }

        // =========================
        // GET BY ID
        // =========================
        public async Task<LessonDomain?> GetByIdAsync(Guid id)
        {
            var entity = await _dbContext.Lessons
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            return entity == null ? null : MapToDomain(entity);
        }

        // =========================
        // GET BY SECTION ID
        // =========================
        public async Task<List<LessonDomain>> GetBySectionIdAsync(Guid sectionId)
        {
            var entities = await _dbContext.Lessons
                .AsNoTracking()
                .Where(x => x.SectionId == sectionId)
                .OrderBy(x => x.SortOrder)
                .ToListAsync();

            return entities.Select(MapToDomain).ToList();
        }

        // =========================
        // GET BY MULTIPLE SECTION IDS
        // =========================
        public async Task<List<LessonDomain>> GetBySectionIdAsync(
            IEnumerable<Guid> sectionIds,
            CancellationToken cancellation = default)
        {
            var ids = sectionIds.ToList();

            var entities = await _dbContext.Lessons
                .AsNoTracking()
                .Where(x => ids.Contains(x.SectionId))
                .OrderBy(x => x.SortOrder)
                .ToListAsync(cancellation);

            return entities.Select(MapToDomain).ToList();
        }

        // =========================
        // UPDATE
        // =========================
        public async Task UpdateAsync(LessonDomain lesson)
        {
            var entity = await _dbContext.Lessons
                .FirstOrDefaultAsync(x => x.Id == lesson.Id);

            if (entity == null)
                throw new Exception("Lesson không tồn tại");

            entity.Title = lesson.Title;
            entity.Slug = lesson.Slug;
            entity.VideoUrl = lesson.VideoUrl;
            entity.Content = lesson.Content;
            entity.SortOrder = lesson.SortOrder;
            entity.Duration = lesson.Duration;
            entity.Status = MapStatusToString(lesson.Status);
            entity.IsPreview = lesson.IsPreview;
            entity.IsActive = lesson.IsActive;
            entity.UpdatedAt = lesson.UpdatedAt;

            await _dbContext.SaveChangesAsync();
        }

        // =========================
        // DELETE (soft delete nếu có)
        // =========================
        public async Task DeleteAsync(LessonDomain lesson)
        {
            var entity = await _dbContext.Lessons
                .FirstOrDefaultAsync(x => x.Id == lesson.Id);

            if (entity == null)
                throw new Exception("Lesson không tồn tại");

            entity.IsActive = false;
            entity.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
        }

        // =========================
        // PRIVATE MAPPERS
        // =========================

        private static LessonDomain MapToDomain(Lesson entity)
        {
            return new LessonDomain(
                entity.Id,
                entity.SectionId,
                entity.Title,
                entity.Slug,
                entity.VideoUrl,
                entity.Content,
                entity.SortOrder,
                entity.Duration,
                MapStatusToEnum(entity.Status),
                entity.IsPreview,
                entity.IsActive,
                entity.CreatedAt,
                entity.UpdatedAt,
                entity.DeletedAt
            );
        }

        private static Lesson MapToEntity(LessonDomain d)
        {
            return new Lesson
            {
                Id = d.Id,
                SectionId = d.SectionId,
                Title = d.Title,
                Slug = d.Slug,
                VideoUrl = d.VideoUrl,
                Content = d.Content,
                SortOrder = d.SortOrder,
                Duration = d.Duration,
                Status = MapStatusToString(d.Status),
                IsPreview = d.IsPreview,
                IsActive = d.IsActive,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt,
                DeletedAt = d.DeletedAt
            };
        }

        private static LessonStatusDomain MapStatusToEnum(string? status)
        {
            return status switch
            {
                "Published" => LessonStatusDomain.Published,
                _ => LessonStatusDomain.Draft
            };
        }

        private static string MapStatusToString(LessonStatusDomain status)
        {
            return status switch
            {
                LessonStatusDomain.Published => "Published",
                _ => "Draft"
            };
        }
    }
}