using EduAISystem.Application.Common.Models;
using EduAISystem.Domain.Entities;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface IUserRepository
    {
        Task<UserDomain?> GetByEmailAsync(string email);
        Task AddAsync(UserDomain? user);
        Task<PagedResult<UserDomain>> GetUsersPagedAsync(
            int page,
            int pageSize,
            string? searchTerm,
            int? roleFilter,
            bool? isActiveFilter,
            CancellationToken cancellationToken = default);
    }
}
