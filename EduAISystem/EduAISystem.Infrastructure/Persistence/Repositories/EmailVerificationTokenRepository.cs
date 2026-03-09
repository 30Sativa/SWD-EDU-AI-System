using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Domain.Entities;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class EmailVerificationTokenRepository : IEmailVerificationTokenRepository
    {
        private readonly EduAiDbV5Context _context;

        public EmailVerificationTokenRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        public async Task AddAsync(EmailVerificationTokenDomain token, CancellationToken cancellationToken = default)
        {
            var entity = new EmailVerificationToken
            {
                Id = token.Id,
                UserId = token.UserId,
                Token = token.Token,
                ExpiresAt = token.ExpiresAt,
                IsUsed = token.IsUsed,
                UsedAt = token.UsedAt,
                CreatedAt = token.CreatedAt
            };
            _context.EmailVerificationTokens.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<EmailVerificationTokenDomain?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
        {
            var entity = await _context.EmailVerificationTokens
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Token == token, cancellationToken);

            if (entity == null) return null;

            return new EmailVerificationTokenDomain(
                entity.Id,
                entity.UserId,
                entity.Token,
                entity.ExpiresAt,
                entity.IsUsed,
                entity.UsedAt,
                entity.CreatedAt ?? DateTime.UtcNow);
        }

        public async Task UpdateAsync(EmailVerificationTokenDomain token, CancellationToken cancellationToken = default)
        {
            var entity = await _context.EmailVerificationTokens
                .FirstOrDefaultAsync(t => t.Id == token.Id, cancellationToken);

            if (entity == null) return;

            entity.IsUsed = token.IsUsed;
            entity.UsedAt = token.UsedAt;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
