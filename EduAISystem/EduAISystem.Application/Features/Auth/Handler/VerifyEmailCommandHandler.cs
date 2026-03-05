using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Auth.Commands;
using MediatR;

namespace EduAISystem.Application.Features.Auth.Handler
{
    /// <summary>
    /// Xử lý Verify Email (sau khi click link trong email đăng ký):
    /// 1. Lấy email verification token từ DB
    /// 2. Kiểm tra IsValid
    /// 3. Gọi user.VerifyEmail() → IsEmailVerified = true
    /// 4. Đánh dấu token đã dùng
    /// Sau bước này user có thể đăng nhập bình thường.
    /// </summary>
    public class VerifyEmailCommandHandler : IRequestHandler<VerifyEmailCommand, Unit>
    {
        private readonly IEmailVerificationTokenRepository _verifyTokens;
        private readonly IUserRepository _users;

        public VerifyEmailCommandHandler(
            IEmailVerificationTokenRepository verifyTokens,
            IUserRepository users)
        {
            _verifyTokens = verifyTokens;
            _users = users;
        }

        public async Task<Unit> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
        {
            var verifyToken = await _verifyTokens.GetByTokenAsync(request.Request.Token, cancellationToken)
                ?? throw new NotFoundException("Token xác nhận không hợp lệ hoặc đã hết hạn.");

            if (!verifyToken.IsValid)
                throw new ForbiddenException("Token đã được sử dụng hoặc đã hết hạn. Vui lòng đăng ký lại.");

            var user = await _users.GetByIdAsync(verifyToken.UserId, cancellationToken)
                ?? throw new NotFoundException("Không tìm thấy người dùng.");

            // Kích hoạt email verified
            user.VerifyEmail();
            await _users.UpdateAsync(user, cancellationToken);

            // Đánh dấu token đã dùng (one-time)
            verifyToken.MarkAsUsed();
            await _verifyTokens.UpdateAsync(verifyToken, cancellationToken);

            return Unit.Value;
        }
    }
}
