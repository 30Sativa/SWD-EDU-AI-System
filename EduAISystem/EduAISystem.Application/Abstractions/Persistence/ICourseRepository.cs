using EduAISystem.Application.Common.Models;
using EduAISystem.Domain.Entities;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface ICourseRepository
    {
        Task AddAsync(CourseDomain course, CancellationToken cancellationToken = default);
        Task<CourseDomain?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

        Task<PagedResult<CourseDomain>> GetTeacherCoursesPagedAsync(
            Guid teacherId,
            int page,
            int pageSize,
            string? searchTerm,
            string? statusFilter,
            CancellationToken cancellationToken = default);

        Task<PagedResult<CourseDomain>> GetCoursesPagedAsync(
            int page,
            int pageSize,
            string? searchTerm,
            string? statusFilter,
            Guid? subjectId,
            bool? isDeletedFilter,
            bool? isTemplate = null,
            bool? isActive = null,
            CancellationToken cancellationToken = default);

        Task UpdateAsync(CourseDomain course, CancellationToken cancellationToken = default);
        Task<bool> ExistsByCodeAsync(string code, CancellationToken cancellationToken = default);
        Task<CourseDomain?> GetTemplateWithDetailsAsync(Guid templateId, CancellationToken cancellationToken = default);
        Task AssignClassToCourseAsync(Guid courseId, Guid classId, CancellationToken cancellationToken = default);
    }
}

