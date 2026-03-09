using EduAISystem.Application.Common.Models;
using EduAISystem.Domain.Entities;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface ITermRepository
    {
        Task<PagedResult<TermDomain>> GetTermsPagedAsync(
            int page,
            int pageSize,
            string? searchTerm,
            bool? isActiveFilter,
            DateOnly? fromStartDate,
            DateOnly? toEndDate,
            CancellationToken cancellationToken = default);

        Task<TermDomain?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

        Task<bool> CodeExistsAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);

        Task AddAsync(TermDomain term, CancellationToken cancellationToken = default);

        Task UpdateAsync(TermDomain term, CancellationToken cancellationToken = default);

        Task<bool> SetActiveStatusAsync(Guid id, bool isActive, CancellationToken cancellationToken = default);

        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }
}

