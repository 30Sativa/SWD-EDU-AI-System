using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Domain.Entities;
using EduAISystem.Domain.Enums;
using EduAISystem.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly EduAiDbV5Context _context;

        public UserRepository(EduAiDbV5Context context)
        {
            _context = context;
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
    }
}
