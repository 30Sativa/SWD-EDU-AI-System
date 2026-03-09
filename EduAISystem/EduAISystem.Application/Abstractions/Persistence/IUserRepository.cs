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
            bool? includeDeleted = false,
            CancellationToken cancellationToken = default);

        /// <summary>Lấy user theo GoogleId (cho Google OAuth login)</summary>
        Task<UserDomain?> GetByGoogleIdAsync(string googleId, CancellationToken cancellationToken = default);

        /// <summary>Cập nhật toàn bộ user (IsEmailVerified, GoogleId, PasswordHash, IsActive...)</summary>
        Task UpdateAsync(UserDomain user, CancellationToken cancellationToken = default);
    }
}
