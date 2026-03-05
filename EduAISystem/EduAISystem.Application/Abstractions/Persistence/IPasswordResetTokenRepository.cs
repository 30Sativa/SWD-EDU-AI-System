using EduAISystem.Domain.Entities;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface IPasswordResetTokenRepository
    {
        /// <summary>Lưu token mới vào DB</summary>
        Task AddAsync(PasswordResetTokenDomain token, CancellationToken cancellationToken = default);

        /// <summary>Lấy token theo raw token string</summary>
        Task<PasswordResetTokenDomain?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);

        /// <summary>Cập nhật token (đánh dấu IsUsed)</summary>
        Task UpdateAsync(PasswordResetTokenDomain token, CancellationToken cancellationToken = default);

        /// <summary>Vô hiệu hóa tất cả các token cũ của user (trước khi tạo token mới)</summary>
        Task InvalidateAllByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}
