using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Auth.Commands;
using EduAISystem.Domain.Entities;
using MediatR;
using Microsoft.Extensions.Configuration;

namespace EduAISystem.Application.Features.Auth.Handler
{
    /// <summary>
    /// Xử lý Forgot Password:
    /// 1. Tìm user theo email (nếu không tìm thấy → vẫn trả OK để không lộ thông tin)
    /// 2. Vô hiệu hóa các token reset cũ
    /// 3. Tạo token mới → lưu DB
    /// 4. Gửi link về email user
    /// </summary>
    public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, Unit>
    {
        private readonly IUserRepository _users;
        private readonly IPasswordResetTokenRepository _resetTokens;
        private readonly IEmailService _email;
        private readonly IConfiguration _config;

        public ForgotPasswordCommandHandler(
            IUserRepository users,
            IPasswordResetTokenRepository resetTokens,
            IEmailService email,
            IConfiguration config)
        {
            _users = users;
            _resetTokens = resetTokens;
            _email = email;
            _config = config;
        }

        public async Task<Unit> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
        {
            var user = await _users.GetByEmailAsync(request.Request.Email);

            // Luôn trả OK để tránh enumeration attack (không lộ email có tồn tại không)
            if (user == null)
                return Unit.Value;

            // Vô hiệu hóa các token cũ
            await _resetTokens.InvalidateAllByUserIdAsync(user.Id, cancellationToken);

            // Tạo token mới (hết hạn 30 phút)
            var token = new PasswordResetTokenDomain(user.Id, expiryMinutes: 30);
            await _resetTokens.AddAsync(token, cancellationToken);

            // Tạo link reset
            var frontendUrl = _config["FrontendUrl"] ?? "http://localhost:3000";
            var resetLink = $"{frontendUrl}/reset-password?token={token.Token}";

            // Lấy tên thân thiện
            var fullName = user.UserProfile?.FullName ?? user.Email;

            // Gửi email
            await _email.SendForgotPasswordEmailAsync(user.Email, fullName, resetLink);

            return Unit.Value;
        }
    }
}
