using EduAISystem.Application.Common.Models;
using EduAISystem.Domain.Entities;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface ICourseCategoryRepository
    {
        Task<PagedResult<CourseCategoryDomain>> GetCourseCategoriesPagedAsync(
            int page,
            int pageSize,
            string? searchTerm,
            bool? isActiveFilter,
            Guid? parentIdFilter,
            CancellationToken cancellationToken = default);

        Task<CourseCategoryDomain?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

        Task<bool> SlugExistsAsync(string slug, Guid? excludeId = null, CancellationToken cancellationToken = default);

        Task AddAsync(CourseCategoryDomain category, CancellationToken cancellationToken = default);

        Task UpdateAsync(CourseCategoryDomain category, CancellationToken cancellationToken = default);

        Task<bool> SetActiveStatusAsync(Guid id, bool isActive, CancellationToken cancellationToken = default);
    }
}

