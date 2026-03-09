using System;

namespace EduAISystem.Domain.Entities
{
    public class RefreshTokenDomain
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Token { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
        public DateTime? RevokedAt { get; set; }
        public string? ReplacedByToken { get; set; }
        public DateTime? CreatedAt { get; set; }

        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
        public bool IsRevoked => RevokedAt != null;
        public bool IsActive => !IsRevoked && !IsExpired;

        // Constructor
        public RefreshTokenDomain(Guid userId, string token, DateTime expiresAt, DateTime createdAt)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            Token = token;
            ExpiresAt = expiresAt;
            CreatedAt = createdAt;
        }

        public RefreshTokenDomain(Guid id, Guid userId, string token, DateTime expiresAt, DateTime? revokedAt, string? replacedByToken, DateTime? createdAt)
        {
            Id = id;
            UserId = userId;
            Token = token;
            ExpiresAt = expiresAt;
            RevokedAt = revokedAt;
            ReplacedByToken = replacedByToken;
            CreatedAt = createdAt;
        }
    }
}
