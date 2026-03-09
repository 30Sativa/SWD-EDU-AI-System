using EduAISystem.Application.Common.Models;
using EduAISystem.Domain.Entities;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface IGradeLevelRepository
    {
        Task<PagedResult<GradeLevelDomain>> GetGradeLevelsPagedAsync(
            int page,
            int pageSize,
            string? searchTerm,
            bool? isActiveFilter,
            CancellationToken cancellationToken = default);

        Task<GradeLevelDomain?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

        Task<bool> CodeExistsAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);

        Task AddAsync(GradeLevelDomain gradeLevel, CancellationToken cancellationToken = default);

        Task UpdateAsync(GradeLevelDomain gradeLevel, CancellationToken cancellationToken = default);

        Task<bool> SetActiveStatusAsync(Guid id, bool isActive, CancellationToken cancellationToken = default);
    }
}

