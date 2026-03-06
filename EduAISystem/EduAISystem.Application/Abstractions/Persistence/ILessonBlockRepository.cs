using EduAISystem.Application.Features.Lessons.DTOs.Response;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface ILessonBlockRepository
    {
        Task<List<LessonBlockResponseDto>> GetByLessonIdAsync(Guid lessonId, CancellationToken cancellationToken = default);
        Task<LessonBlockResponseDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Guid> AddAsync(Guid lessonId, string blockType, string content, int sortOrder, bool? isRequired, int? estimatedMinutes, CancellationToken cancellationToken = default);
        Task<bool> UpdateAsync(Guid id, string blockType, string content, int sortOrder, bool? isRequired, int? estimatedMinutes, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
        Task<bool> LessonExistsAsync(Guid lessonId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Thêm một batch blocks do AI sinh ra, đánh dấu IsAiGenerated = true.
        /// </summary>
        Task<List<Guid>> AddAiGeneratedBatchAsync(
            Guid lessonId,
            List<(string BlockType, string Content, int SortOrder, int? EstimatedMinutes)> blocks,
            string aiSourceType,
            CancellationToken cancellationToken = default);
    }
}

