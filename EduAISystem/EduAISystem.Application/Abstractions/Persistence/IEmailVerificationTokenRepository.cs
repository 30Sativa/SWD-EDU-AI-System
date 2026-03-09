using EduAISystem.Domain.Entities;

namespace EduAISystem.Application.Abstractions.Persistence
{
    public interface IEmailVerificationTokenRepository
    {
        /// <summary>Lưu token xác nhận email mới</summary>
        Task AddAsync(EmailVerificationTokenDomain token, CancellationToken cancellationToken = default);

        /// <summary>Lấy token theo raw token string</summary>
        Task<EmailVerificationTokenDomain?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);

        /// <summary>Cập nhật token (đánh dấu IsUsed)</summary>
        Task UpdateAsync(EmailVerificationTokenDomain token, CancellationToken cancellationToken = default);
    }
}
