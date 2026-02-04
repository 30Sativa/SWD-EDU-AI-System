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
            CancellationToken cancellationToken = default);

        Task UpdateAsync(CourseDomain course, CancellationToken cancellationToken = default);
    }
}

