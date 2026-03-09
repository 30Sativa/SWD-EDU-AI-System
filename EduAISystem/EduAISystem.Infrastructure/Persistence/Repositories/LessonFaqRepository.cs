using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Lessons.DTOs.Response;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class LessonFaqRepository : ILessonFaqRepository
    {
        private readonly EduAiDbV5Context _context;

        public LessonFaqRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        public async Task<bool> LessonExistsAsync(Guid lessonId, CancellationToken cancellationToken = default)
            => await _context.Lessons.AnyAsync(l => l.Id == lessonId, cancellationToken);

        public async Task<List<LessonFaqResponseDto>> GetByLessonIdAsync(Guid lessonId, CancellationToken cancellationToken = default)
        {
            return await _context.LessonFaqs
                .AsNoTracking()
                .Where(f => f.LessonId == lessonId && (f.IsActive ?? true))
                .OrderBy(f => f.SortOrder)
                .Select(f => new LessonFaqResponseDto
                {
                    Id = f.Id,
                    LessonId = f.LessonId,
                    Question = f.Question,
                    Answer = f.Answer,
                    SortOrder = f.SortOrder ?? 0,
                    IsActive = f.IsActive ?? true,
                    CreatedAt = f.CreatedAt
                })
                .ToListAsync(cancellationToken);
        }

        public async Task<LessonFaqResponseDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.LessonFaqs
                .AsNoTracking()
                .Where(f => f.Id == id)
                .Select(f => new LessonFaqResponseDto
                {
                    Id = f.Id,
                    LessonId = f.LessonId,
                    Question = f.Question,
                    Answer = f.Answer,
                    SortOrder = f.SortOrder ?? 0,
                    IsActive = f.IsActive ?? true,
                    CreatedAt = f.CreatedAt
                })
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<Guid> AddAsync(
            Guid lessonId,
            string? question,
            string? answer,
            int? sortOrder,
            CancellationToken cancellationToken = default)
        {
            var entity = new LessonFaq
            {
                Id = Guid.NewGuid(),
                LessonId = lessonId,
                Question = question,
                Answer = answer,
                SortOrder = sortOrder ?? 0,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.LessonFaqs.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);
            return entity.Id;
        }

        public async Task<bool> UpdateAsync(
            Guid id,
            string? question,
            string? answer,
            int? sortOrder,
            bool? isActive,
            CancellationToken cancellationToken = default)
        {
            var entity = await _context.LessonFaqs
                .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);

            if (entity == null) return false;

            if (question != null) entity.Question = question;
            if (answer != null) entity.Answer = answer;
            if (sortOrder.HasValue) entity.SortOrder = sortOrder.Value;
            if (isActive.HasValue) entity.IsActive = isActive.Value;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _context.LessonFaqs
                .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);

            if (entity == null) return false;

            _context.LessonFaqs.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
