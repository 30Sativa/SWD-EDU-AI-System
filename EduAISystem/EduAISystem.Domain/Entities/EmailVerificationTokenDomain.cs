namespace EduAISystem.Domain.Entities
{
    /// <summary>
    /// Token xác nhận email khi đăng ký tài khoản.
    /// Sau khi user đăng ký, hệ thống tạo token này, lưu DB, gửi link về email:
    ///   https://domain.com/verify-email?token={Token}
    /// User click link → email được verify → có thể đăng nhập.
    /// </summary>
    public class EmailVerificationTokenDomain
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }

        /// <summary>Raw token (GUID dạng string, URL-safe)</summary>
        public string Token { get; private set; } = string.Empty;

        public DateTime ExpiresAt { get; private set; }
        public bool IsUsed { get; private set; }
        public DateTime? UsedAt { get; private set; }
        public DateTime CreatedAt { get; private set; }

        public bool IsExpired => DateTime.UtcNow > ExpiresAt;
        public bool IsValid => !IsUsed && !IsExpired;

        protected EmailVerificationTokenDomain() { } // EF

        /// <summary>Tạo token xác nhận email mới (hết hạn sau 24 giờ)</summary>
        public EmailVerificationTokenDomain(Guid userId, int expiryHours = 24)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            Token = Guid.NewGuid().ToString("N");
            ExpiresAt = DateTime.UtcNow.AddHours(expiryHours);
            IsUsed = false;
            CreatedAt = DateTime.UtcNow;
        }

        /// <summary>Mapping constructor (Infrastructure only)</summary>
        internal EmailVerificationTokenDomain(
            Guid id,
            Guid userId,
            string token,
            DateTime expiresAt,
            bool isUsed,
            DateTime? usedAt,
            DateTime createdAt)
        {
            Id = id;
            UserId = userId;
            Token = token;
            ExpiresAt = expiresAt;
            IsUsed = isUsed;
            UsedAt = usedAt;
            CreatedAt = createdAt;
        }

        /// <summary>Đánh dấu đã dùng sau khi email verify thành công</summary>
        public void MarkAsUsed()
        {
            IsUsed = true;
            UsedAt = DateTime.UtcNow;
        }
    }
}
