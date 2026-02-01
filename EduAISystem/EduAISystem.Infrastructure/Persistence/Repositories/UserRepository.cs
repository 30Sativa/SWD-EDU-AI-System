using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Domain.Entities;
using EduAISystem.Domain.Enums;
using EduAISystem.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly EduAiDbV5Context _context;

        public UserRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        public Task AddAsync(UserDomain? user)
        {
            var entity = new Infrastructure.Persistence.Entities.User
            {
                Id = user!.Id,
                Email = user.Email,
                UserName = user.UserName,
                PasswordHash = user.PasswordHash,
                IsActive = user.IsActive,
                Role = (int)user.Role,
                CreatedAt = user.CreatedAt
            };
            _context.Users.Add(entity);
            return _context.SaveChangesAsync();
        }

        public async Task<UserDomain?> GetByEmailAsync(string email)
        {
            var entity = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == email);
            return entity == null ? null : new UserDomain(
                entity.Id,
                entity.Email,
                entity.PasswordHash,
                entity.IsActive ?? false,
                (UserRoleDomain)entity.Role,
                entity.CreatedAt ?? DateTime.MinValue
            );
        }

        public async Task<PagedResult<UserDomain>> GetUsersPagedAsync(
            int page, 
            int pageSize, 
            string? searchTerm, 
            int? roleFilter, 
            bool? isActiveFilter, 
            CancellationToken cancellationToken = default)
        {
            var query = _context.Users
            .AsNoTracking()
            .Include(u => u.UserProfile)
            .Where(u => u.DeletedAt == null);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.Trim();
                query = query.Where(u =>
                    u.Email.Contains(term) ||
                    (u.UserName != null && u.UserName.Contains(term)) ||
                    (u.UserProfile != null && u.UserProfile.FullName.Contains(term)));
            }

            if (roleFilter.HasValue)
                query = query.Where(u => u.Role == roleFilter.Value);

            if (isActiveFilter.HasValue)
                query = query.Where(u => u.IsActive == isActiveFilter.Value);

            query = query.OrderByDescending(u => u.CreatedAt ?? DateTime.MinValue);

            var totalCount = await query.CountAsync(cancellationToken);

            var users = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new UserDomain(
                    u.Id,
                    u.Email,
                    u.PasswordHash,
                    u.IsActive ?? false,
                    (UserRoleDomain)u.Role,
                    u.CreatedAt ?? DateTime.MinValue
                ))
                .ToListAsync(cancellationToken);

            return new PagedResult<UserDomain>
            {
                Items = users,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }
    }
}
