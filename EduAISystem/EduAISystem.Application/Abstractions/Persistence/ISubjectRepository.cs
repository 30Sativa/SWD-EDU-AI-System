using EduAISystem.Application.Common.Models;
using EduAISystem.Domain.Entities;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface ISubjectRepository
    {
        Task<PagedResult<SubjectDomain>> GetSubjectsPagedAsync(
            int page,
            int pageSize,
            string? searchTerm,
            bool? isActiveFilter,
            CancellationToken cancellationToken = default);

        Task<SubjectDomain?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

        Task<bool> CodeExistsAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);

        Task AddAsync(SubjectDomain subject, CancellationToken cancellationToken = default);

        Task UpdateAsync(SubjectDomain subject, CancellationToken cancellationToken = default);

        Task<bool> SetActiveStatusAsync(Guid id, bool isActive, CancellationToken cancellationToken = default);
    }
}

