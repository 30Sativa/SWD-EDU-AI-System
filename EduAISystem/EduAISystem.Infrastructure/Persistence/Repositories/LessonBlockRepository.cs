using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Lessons.DTOs.Response;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class LessonBlockRepository : ILessonBlockRepository
    {
        private readonly EduAiDbV5Context _context;

        public LessonBlockRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        public async Task<bool> LessonExistsAsync(Guid lessonId, CancellationToken cancellationToken = default)
            => await _context.Lessons.AnyAsync(l => l.Id == lessonId, cancellationToken);

        public async Task<List<LessonBlockResponseDto>> GetByLessonIdAsync(Guid lessonId, CancellationToken cancellationToken = default)
        {
            return await _context.LessonBlocks
                .AsNoTracking()
                .Where(b => b.LessonId == lessonId)
                .OrderBy(b => b.SortOrder)
                .Select(b => new LessonBlockResponseDto
                {
                    Id = b.Id,
                    LessonId = b.LessonId,
                    BlockType = b.BlockType,
                    Content = b.Content,
                    SortOrder = b.SortOrder,
                    IsRequired = b.IsRequired ?? true,
                    EstimatedMinutes = b.EstimatedMinutes
                })
                .ToListAsync(cancellationToken);
        }

        public async Task<LessonBlockResponseDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.LessonBlocks
                .AsNoTracking()
                .Where(b => b.Id == id)
                .Select(b => new LessonBlockResponseDto
                {
                    Id = b.Id,
                    LessonId = b.LessonId,
                    BlockType = b.BlockType,
                    Content = b.Content,
                    SortOrder = b.SortOrder,
                    IsRequired = b.IsRequired ?? true,
                    EstimatedMinutes = b.EstimatedMinutes
                })
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<Guid> AddAsync(
            Guid lessonId,
            string blockType,
            string content,
            int sortOrder,
            bool? isRequired,
            int? estimatedMinutes,
            CancellationToken cancellationToken = default)
        {
            var entity = new LessonBlock
            {
                Id = Guid.NewGuid(),
                LessonId = lessonId,
                BlockType = blockType,
                Content = content,
                SortOrder = sortOrder,
                IsRequired = isRequired ?? true,
                EstimatedMinutes = estimatedMinutes
            };

            _context.LessonBlocks.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);
            return entity.Id;
        }

        public async Task<bool> UpdateAsync(
            Guid id,
            string blockType,
            string content,
            int sortOrder,
            bool? isRequired,
            int? estimatedMinutes,
            CancellationToken cancellationToken = default)
        {
            var entity = await _context.LessonBlocks
                .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

            if (entity == null) return false;

            entity.BlockType = blockType;
            entity.Content = content;
            entity.SortOrder = sortOrder;
            entity.IsRequired = isRequired;
            entity.EstimatedMinutes = estimatedMinutes;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _context.LessonBlocks
                .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

            if (entity == null) return false;

            _context.LessonBlocks.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
