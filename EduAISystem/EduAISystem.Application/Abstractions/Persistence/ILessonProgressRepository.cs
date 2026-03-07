using EduAISystem.Domain.Entities;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface ILessonProgressRepository
    {
        Task UpdateProgressAsync(Guid studentId, Guid lessonId, int watchedDuration, bool isCompleted, CancellationToken cancellationToken = default);
        Task UpdateCourseProgressAsync(Guid studentId, Guid courseId, CancellationToken cancellationToken = default);
    }
}
