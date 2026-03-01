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

        public async Task AddAsync(UserDomain? user)
        {
            var entity = new Infrastructure.Persistence.Entities.User
            {
                Id = user!.Id,
                Email = user.Email,
                PasswordHash = user.PasswordHash,
                IsActive = user.IsActive,
                Role = (int)user.Role,
                CreatedAt = user.CreatedAt
            };
            _context.Users.Add(entity);

            if (user.Role == UserRoleDomain.Student)
            {
                var studentCode = "STU" + Guid.NewGuid().ToString("N")[..17];
                _context.Students.Add(new Infrastructure.Persistence.Entities.Student
                {
                    UserId = user.Id,
                    StudentCode = studentCode,
                    EnrollmentDate = DateTime.UtcNow
                });
            }
            else if (user.Role == UserRoleDomain.Teacher)
            {
                _context.Teachers.Add(new Infrastructure.Persistence.Entities.Teacher
                {
                    UserId = user.Id
                });
            }

            await _context.SaveChangesAsync();
        }

        public async Task UpdateProfileAsync(Guid userId, UserProfileDomain profile, CancellationToken cancellationToken = default)
        {
            var user = await _context.Users
                .Include(u => u.UserProfile)
                .FirstOrDefaultAsync(u => u.Id == userId && u.DeletedAt == null, cancellationToken);
            if (user == null)
                return;

            if (user.UserProfile == null)
            {
                var newProfile = new Infrastructure.Persistence.Entities.UserProfile
                {
                    UserId = userId,
                    FullName = profile.FullName,
                    AvatarUrl = profile.AvatarUrl,
                    PhoneNumber = profile.PhoneNumber,
                    DateOfBirth = profile.DateOfBirth,
                    Gender = profile.Gender,
                    Address = profile.Address,
                    Bio = profile.Bio
                };
                _context.UserProfiles.Add(newProfile);
            }
            else
            {
                user.UserProfile.FullName = profile.FullName;
                user.UserProfile.AvatarUrl = profile.AvatarUrl;
                user.UserProfile.PhoneNumber = profile.PhoneNumber;
                user.UserProfile.DateOfBirth = profile.DateOfBirth;
                user.UserProfile.Gender = profile.Gender;
                user.UserProfile.Address = profile.Address;
                user.UserProfile.Bio = profile.Bio;
            }

            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<bool> SoftDeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.DeletedAt == null, cancellationToken);
            if (entity == null)
                return false;
            entity.DeletedAt = DateTime.UtcNow;
            entity.IsActive = false; // Deactivate when soft deleted
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<UserDomain?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Users
                .AsNoTracking()
                .Include(u => u.UserProfile)
                .FirstOrDefaultAsync(u => u.Id == id && u.DeletedAt == null, cancellationToken);
            if (entity == null)
                return null;

            var domain = new UserDomain(
                entity.Id,
                entity.Email,
                entity.PasswordHash,
                entity.IsActive ?? false,
                (UserRoleDomain)entity.Role,
                entity.CreatedAt ?? DateTime.MinValue,
                entity.DeletedAt);
            if (entity.UserProfile != null)
                domain.UserProfile = UserProfileDomain.Load(
                    entity.UserProfile.UserId,
                    entity.UserProfile.FullName,
                    entity.UserProfile.AvatarUrl,
                    entity.UserProfile.PhoneNumber,
                    entity.UserProfile.DateOfBirth,
                    entity.UserProfile.Gender,
                    entity.UserProfile.Address,
                    entity.UserProfile.Bio);
            return domain;
        }

        public async Task<string?> GetFullNameByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var fullName = await _context.UserProfiles
                .AsNoTracking()
                .Where(p => p.UserId == id)
                .Select(p => p.FullName)
                .FirstOrDefaultAsync(cancellationToken);

            return string.IsNullOrWhiteSpace(fullName) ? null : fullName;
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
            bool? includeDeleted = false,
            CancellationToken cancellationToken = default)
        {
            var query = _context.Users
            .AsNoTracking()
            .Include(u => u.UserProfile)
            .AsQueryable();

            // Filter deleted users unless includeDeleted is true
            if (!includeDeleted.HasValue || !includeDeleted.Value)
            {
                query = query.Where(u => u.DeletedAt == null);
            }

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.Trim();
                query = query.Where(u =>
                    u.Email.Contains(term) ||
                    (u.UserProfile != null && u.UserProfile.FullName.Contains(term)));
            }

            if (roleFilter.HasValue)
                query = query.Where(u => u.Role == roleFilter.Value);

            if (isActiveFilter.HasValue)
                query = query.Where(u => u.IsActive == isActiveFilter.Value);

            query = query.OrderByDescending(u => u.CreatedAt ?? DateTime.MinValue);

            var totalCount = await query.CountAsync(cancellationToken);

            var entities = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var users = entities.Select(u =>
            {
                var domain = new UserDomain(
                    u.Id,
                    u.Email,
                    u.PasswordHash,
                    u.IsActive ?? false,
                    (UserRoleDomain)u.Role,
                    u.CreatedAt ?? DateTime.MinValue,
                    u.DeletedAt);
                if (u.UserProfile != null)
                    domain.UserProfile = UserProfileDomain.Load(
                        u.UserProfile.UserId,
                        u.UserProfile.FullName,
                        u.UserProfile.AvatarUrl,
                        u.UserProfile.PhoneNumber,
                        u.UserProfile.DateOfBirth,
                        u.UserProfile.Gender,
                        u.UserProfile.Address,
                        u.UserProfile.Bio);
                return domain;
            }).ToList();

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
