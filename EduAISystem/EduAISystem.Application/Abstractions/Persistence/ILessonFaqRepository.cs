using EduAISystem.Application.Features.Lessons.DTOs.Response;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface ILessonFaqRepository
    {
        Task<List<LessonFaqResponseDto>> GetByLessonIdAsync(Guid lessonId, CancellationToken cancellationToken = default);
        Task<LessonFaqResponseDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Guid> AddAsync(Guid lessonId, string? question, string? answer, int? sortOrder, CancellationToken cancellationToken = default);
        Task<bool> UpdateAsync(Guid id, string? question, string? answer, int? sortOrder, bool? isActive, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
        Task<bool> LessonExistsAsync(Guid lessonId, CancellationToken cancellationToken = default);
    }
}
