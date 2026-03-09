using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Domain.Entities;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly EduAiDbV5Context _context;

        public RefreshTokenRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        public async Task AddAsync(RefreshTokenDomain token)
        {
            var entity = new RefreshToken
            {
                Id = token.Id,
                UserId = token.UserId,
                Token = token.Token,
                ExpiresAt = token.ExpiresAt,
                RevokedAt = token.RevokedAt,
                ReplacedByToken = token.ReplacedByToken,
                CreatedAt = token.CreatedAt
            };

            await _context.RefreshTokens.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<RefreshTokenDomain?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
        {
            var entity = await _context.RefreshTokens
                .FirstOrDefaultAsync(t => t.Token == token, cancellationToken);

            if (entity == null)
            {
                return null;
            }

            return new RefreshTokenDomain(
                entity.Id,
                entity.UserId,
                entity.Token,
                entity.ExpiresAt,
                entity.RevokedAt,
                entity.ReplacedByToken,
                entity.CreatedAt
            );
        }

        public async Task UpdateAsync(RefreshTokenDomain token)
        {
            var entity = await _context.RefreshTokens.FindAsync(token.Id);
            if (entity != null)
            {
                entity.RevokedAt = token.RevokedAt;
                entity.ReplacedByToken = token.ReplacedByToken;
                
                _context.RefreshTokens.Update(entity);
                await _context.SaveChangesAsync();
            }
        }
    }
}
