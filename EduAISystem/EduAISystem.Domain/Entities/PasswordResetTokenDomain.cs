namespace EduAISystem.Domain.Entities
{
    /// <summary>
    /// Domain object đại diện cho một token reset mật khẩu.
    /// Token này được tạo khi user yêu cầu "Quên mật khẩu",
    /// lưu vào DB và gửi link về email dưới dạng:
    ///   https://domain.com/reset-password?token={Token}
    /// </summary>
    public class PasswordResetTokenDomain
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

        protected PasswordResetTokenDomain() { } // EF

        /// <summary>Tạo token mới (hết hạn sau 30 phút)</summary>
        public PasswordResetTokenDomain(Guid userId, int expiryMinutes = 30)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            Token = Guid.NewGuid().ToString("N"); // 32 ký tự hex, URL-safe
            ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);
            IsUsed = false;
            CreatedAt = DateTime.UtcNow;
        }

        /// <summary>Mapping constructor (Infrastructure only)</summary>
        internal PasswordResetTokenDomain(
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

        /// <summary>Đánh dấu token đã dùng sau khi reset password thành công</summary>
        public void MarkAsUsed()
        {
            IsUsed = true;
            UsedAt = DateTime.UtcNow;
        }
    }
}
