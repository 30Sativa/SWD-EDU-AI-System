using EduAISystem.Application.Common.Models;
using EduAISystem.Domain.Entities;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface IUserRepository
    {
        Task<UserDomain?> GetByEmailAsync(string email);
        Task<UserDomain?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<string?> GetFullNameByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task AddAsync(UserDomain? user);
        Task UpdateProfileAsync(Guid userId, UserProfileDomain profile, CancellationToken cancellationToken = default);
        Task<bool> SoftDeleteAsync(Guid id, CancellationToken cancellationToken = default);
        Task<PagedResult<UserDomain>> GetUsersPagedAsync(
            int page,
            int pageSize,
            string? searchTerm,
            int? roleFilter,
            bool? isActiveFilter,
            CancellationToken cancellationToken = default);
    }
}
