using EduAISystem.Application.Common.Models;
using EduAISystem.Domain.Entities;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface IClassRepository
    {
        Task<PagedResult<ClassDomain>> GetClassesPagedAsync(
            int page,
            int pageSize,
            string? searchTerm,
            bool? isActiveFilter,
            Guid? termId,
            Guid? teacherId,
            Guid? gradeLevelId,
            CancellationToken cancellationToken = default);

        Task<ClassDomain?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

        Task<bool> CodeExistsAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);

        Task AddAsync(ClassDomain classEntity, CancellationToken cancellationToken = default);

        Task UpdateAsync(ClassDomain classEntity, CancellationToken cancellationToken = default);

        Task<bool> SetActiveStatusAsync(Guid id, bool isActive, CancellationToken cancellationToken = default);

        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }
}

