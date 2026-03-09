using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Domain.Entities;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class PasswordResetTokenRepository : IPasswordResetTokenRepository
    {
        private readonly EduAiDbV5Context _context;

        public PasswordResetTokenRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        public async Task AddAsync(PasswordResetTokenDomain token, CancellationToken cancellationToken = default)
        {
            var entity = new PasswordReset
            {
                Id = token.Id,
                UserId = token.UserId,
                Token = token.Token,
                ExpiresAt = token.ExpiresAt,
                IsUsed = token.IsUsed,
                UsedAt = token.UsedAt,
                CreatedAt = token.CreatedAt
            };
            _context.PasswordResets.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<PasswordResetTokenDomain?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
        {
            var entity = await _context.PasswordResets
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.Token == token, cancellationToken);

            if (entity == null) return null;

            return new PasswordResetTokenDomain(
                entity.Id,
                entity.UserId,
                entity.Token,
                entity.ExpiresAt,
                entity.IsUsed ?? false,
                entity.UsedAt,
                entity.CreatedAt ?? DateTime.UtcNow);
        }

        public async Task UpdateAsync(PasswordResetTokenDomain token, CancellationToken cancellationToken = default)
        {
            var entity = await _context.PasswordResets
                .FirstOrDefaultAsync(r => r.Id == token.Id, cancellationToken);

            if (entity == null) return;

            entity.IsUsed = token.IsUsed;
            entity.UsedAt = token.UsedAt;

            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task InvalidateAllByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var tokens = await _context.PasswordResets
                .Where(r => r.UserId == userId && (r.IsUsed == null || r.IsUsed == false))
                .ToListAsync(cancellationToken);

            foreach (var t in tokens)
            {
                t.IsUsed = true;
                t.UsedAt = DateTime.UtcNow;
            }

            if (tokens.Count > 0)
                await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
