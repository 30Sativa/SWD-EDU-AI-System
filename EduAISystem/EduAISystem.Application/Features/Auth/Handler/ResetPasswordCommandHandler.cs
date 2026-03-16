using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Auth.Commands;
using MediatR;

namespace EduAISystem.Application.Features.Auth.Handler
{
    /// <summary>
    /// Xử lý Reset Password (sau khi click link email):
    /// 1. Lấy token từ DB
    /// 2. Kiểm tra IsValid (chưa dùng, chưa hết hạn)
    /// 3. Lấy user, đổi mật khẩu mới
    /// 4. Đánh dấu token đã dùng
    /// </summary>
    public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Unit>
    {
        private readonly IPasswordResetTokenRepository _resetTokens;
        private readonly IUserRepository _users;
        private readonly IPasswordHasher _hasher;
        private readonly IAuditService _auditService;

        public ResetPasswordCommandHandler(
            IPasswordResetTokenRepository resetTokens,
            IUserRepository users,
            IPasswordHasher hasher,
            IAuditService auditService)
        {
            _resetTokens = resetTokens;
            _users = users;
            _hasher = hasher;
            _auditService = auditService;
        }

        public async Task<Unit> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            // Validate confirm password
            if (request.Request.NewPassword != request.Request.ConfirmPassword)
            {
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    { "ConfirmPassword", new[] { "Mật khẩu nhập lại không khớp." } }
                });
            }

            // Lấy token
            var resetToken = await _resetTokens.GetByTokenAsync(request.Request.Token, cancellationToken)
                ?? throw new NotFoundException("Token không hợp lệ hoặc đã hết hạn.");

            if (!resetToken.IsValid)
                throw new ForbiddenException("Token đã được sử dụng hoặc đã hết hạn.");

            // Lấy user
            var user = await _users.GetByIdAsync(resetToken.UserId, cancellationToken)
                ?? throw new NotFoundException("Không tìm thấy người dùng.");

            // Đổi mật khẩu
            var newHash = _hasher.Hash(request.Request.NewPassword);
            user.ChangePassword(newHash);
            await _users.UpdateAsync(user, cancellationToken);

            // Đánh dấu token đã dùng
            resetToken.MarkAsUsed();
            await _resetTokens.UpdateAsync(resetToken, cancellationToken);

            _auditService.LogAction("RESET_PASSWORD", "User", user.Id);

            return Unit.Value;
        }
    }
}
